# E-Commerce Platform - Design Document

**Project**: webdev-ecommerce  
**Level**: 3.1 (DDD Modular Monolith)  
**Version**: 0.1.0  
**Date**: 2025-02-12

---

## Problem Statement

Build an e-commerce platform demonstrating **Domain-Driven Design** principles with clear bounded contexts, proper domain modeling, and event-driven architecture. This project transitions from basic CRUD monoliths to architecturally sound modular systems.

### Core Requirements

1. **Catalog Management**: Products, categories, inventory tracking
2. **Order Processing**: Shopping cart, order placement, order state machine
3. **Payment Integration**: Stripe payment processing, webhooks, refunds
4. **User Authentication**: Secure auth with Better-Auth, user profiles
5. **Event-Driven**: Modules communicate via domain events (async)
6. **Production Infrastructure**: Deploy on K3s with observability

### Non-Functional Requirements

- **Performance**: <2s page load, <500ms API response
- **Scalability**: Support 10k products, 1k concurrent users
- **Availability**: 99.9% uptime (K3s health checks + auto-restart)
- **Security**: OWASP Top 10 compliance, PCI DSS for payments
- **Observability**: Prometheus metrics, Grafana dashboards, structured logging

---

## Architecture

### Bounded Contexts

We identify 4 bounded contexts (DDD strategic design):

#### 1. Catalog Context
**Responsibility**: Product information, categorization, inventory  
**Aggregates**:
- `Product` (root): id, name, description, price, images, sku
- `Category`: id, name, slug, parent
- `Inventory`: productId, quantity, reservations

**Domain Events**:
- `ProductCreated`
- `ProductPriceChanged`
- `InventoryReduced`
- `InventoryRestocked`

**Ubiquitous Language**:
- SKU: Stock Keeping Unit (unique product identifier)
- Variant: Product variation (size, color)
- Stock: Available inventory quantity

#### 2. Orders Context
**Responsibility**: Shopping cart, order lifecycle  
**Aggregates**:
- `Cart` (root): userId, items[], total
- `Order` (root): orderId, userId, items[], status, total, createdAt
- `OrderItem`: productId, quantity, price (at order time)

**State Machine** (Order Status):
```
PENDING → PAYMENT_PENDING → PAID → PROCESSING → SHIPPED → DELIVERED
         ↓
      CANCELLED
```

**Domain Events**:
- `CartItemAdded`
- `OrderPlaced`
- `OrderPaid`
- `OrderCancelled`
- `OrderShipped`

**Invariants**:
- Order total must match sum of items
- Cannot cancel order after SHIPPED
- Quantity must be positive

#### 3. Payments Context
**Responsibility**: Payment processing, refunds  
**Aggregates**:
- `Payment` (root): orderId, amount, status, provider, transactionId
- `Refund`: paymentId, amount, reason, status

**Domain Events**:
- `PaymentInitiated`
- `PaymentSucceeded`
- `PaymentFailed`
- `RefundIssued`

**Integration**: Stripe API, webhook handling

#### 4. Identity Context
**Responsibility**: Users, authentication, authorization  
**Aggregates**:
- `User` (root): id, email, name, role
- `Address`: userId, street, city, country, isDefault

**Domain Events**:
- `UserRegistered`
- `UserProfileUpdated`

---

## Hexagonal Architecture (Ports & Adapters)

Each module follows this structure:

```
modules/catalog/
├── domain/
│   ├── entities/
│   │   ├── Product.ts          # Aggregate root
│   │   ├── Category.ts
│   │   └── Inventory.ts
│   ├── value-objects/
│   │   ├── Money.ts
│   │   ├── SKU.ts
│   │   └── ProductImage.ts
│   ├── events/
│   │   ├── ProductCreated.ts
│   │   └── InventoryReduced.ts
│   └── repositories/          # Interfaces (ports)
│       └── IProductRepository.ts
├── application/
│   ├── use-cases/
│   │   ├── CreateProduct.ts
│   │   ├── UpdateInventory.ts
│   │   └── GetProduct.ts
│   ├── dto/
│   │   └── ProductDTO.ts
│   └── services/
│       └── CatalogService.ts
├── infrastructure/
│   ├── persistence/
│   │   └── DrizzleProductRepository.ts  # Adapter
│   ├── storage/
│   │   └── S3ImageStorage.ts
│   └── events/
│       └── RedisEventBus.ts
└── presentation/
    ├── api/
    │   └── products.route.ts
    └── ui/
        └── ProductCard.tsx
```

**Key Principles**:
- Domain layer has ZERO dependencies (pure TypeScript)
- Application layer orchestrates use cases
- Infrastructure implements interfaces from domain
- Presentation adapts domain to HTTP/UI

---

## Data Model

### PostgreSQL Schema (Drizzle ORM)

```typescript
// Catalog Context
products {
  id: uuid PK
  name: text NOT NULL
  description: text
  price: decimal(10,2) NOT NULL
  sku: varchar(50) UNIQUE NOT NULL
  category_id: uuid FK → categories
  images: jsonb
  created_at: timestamp
  updated_at: timestamp
}

categories {
  id: uuid PK
  name: text NOT NULL
  slug: varchar(100) UNIQUE NOT NULL
  parent_id: uuid FK → categories (nullable)
}

inventory {
  product_id: uuid PK FK → products
  quantity: integer NOT NULL CHECK (quantity >= 0)
  reserved: integer DEFAULT 0
  updated_at: timestamp
}

// Orders Context
carts {
  id: uuid PK
  user_id: uuid FK → users
  items: jsonb
  total: decimal(10,2)
  expires_at: timestamp
}

orders {
  id: uuid PK
  user_id: uuid FK → users
  status: order_status NOT NULL
  items: jsonb NOT NULL
  total: decimal(10,2) NOT NULL
  shipping_address: jsonb
  created_at: timestamp
  updated_at: timestamp
}

// Payments Context
payments {
  id: uuid PK
  order_id: uuid FK → orders
  amount: decimal(10,2) NOT NULL
  status: payment_status
  provider: varchar(50)  // 'stripe'
  transaction_id: text
  metadata: jsonb
  created_at: timestamp
}

// Identity Context
users {
  id: uuid PK
  email: varchar(255) UNIQUE NOT NULL
  name: text
  role: user_role DEFAULT 'customer'
  created_at: timestamp
}

addresses {
  id: uuid PK
  user_id: uuid FK → users
  street: text NOT NULL
  city: text NOT NULL
  postal_code: varchar(20)
  country: varchar(2) NOT NULL
  is_default: boolean DEFAULT false
}

// Event Store (for domain events)
domain_events {
  id: uuid PK
  aggregate_id: uuid NOT NULL
  aggregate_type: varchar(50) NOT NULL
  event_type: varchar(100) NOT NULL
  payload: jsonb NOT NULL
  occurred_at: timestamp NOT NULL
  processed: boolean DEFAULT false
}
```

**Enums**:
```sql
CREATE TYPE order_status AS ENUM (
  'PENDING', 'PAYMENT_PENDING', 'PAID', 
  'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'
);

CREATE TYPE payment_status AS ENUM (
  'PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED'
);

CREATE TYPE user_role AS ENUM ('customer', 'admin');
```

---

## Event-Driven Architecture

### Event Bus (Redis Pub/Sub)

**Flow Example**: Order Placement
```
1. User places order
2. OrdersModule.placeOrder()
   → Order aggregate validates invariants
   → Publishes OrderPlaced event
3. EventBus.publish('OrderPlaced', { orderId, items })
4. Subscribers:
   - CatalogModule: Reduce inventory (OrderPlaced)
   - PaymentsModule: Initiate payment (OrderPlaced)
   - NotificationsModule: Send email (OrderPlaced)
```

**Implementation**:
```typescript
// shared/domain-events/EventBus.ts
interface DomainEvent {
  eventId: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  payload: unknown;
  occurredAt: Date;
}

class RedisEventBus {
  async publish(event: DomainEvent): Promise<void>
  async subscribe(eventType: string, handler: EventHandler): Promise<void>
}
```

**Event Handlers**:
- Idempotent (handle duplicates gracefully)
- Async (non-blocking)
- Retry logic for failures
- Dead letter queue for poison messages

---

## API Design

### REST Endpoints

#### Catalog
```
GET    /api/catalog/products?category=&search=&page=
GET    /api/catalog/products/:id
POST   /api/catalog/products             (admin)
PATCH  /api/catalog/products/:id         (admin)
DELETE /api/catalog/products/:id         (admin)

GET    /api/catalog/categories
GET    /api/catalog/categories/:slug/products
```

#### Orders
```
GET    /api/cart
POST   /api/cart/items
DELETE /api/cart/items/:productId

POST   /api/orders                       (place order)
GET    /api/orders                       (user's orders)
GET    /api/orders/:id
PATCH  /api/orders/:id/cancel
```

#### Payments
```
POST   /api/payments/create-intent       (Stripe)
POST   /api/payments/webhook             (Stripe webhook)
POST   /api/payments/:id/refund          (admin)
```

#### Identity
```
POST   /api/auth/sign-up
POST   /api/auth/sign-in
POST   /api/auth/sign-out
GET    /api/auth/session

GET    /api/users/me
PATCH  /api/users/me
GET    /api/users/me/addresses
POST   /api/users/me/addresses
```

### Response Format
```typescript
type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
```

---

## Tech Stack

### Core
- **Framework**: Next.js 15 (App Router, React Server Components)
- **Language**: TypeScript 5.7 (strict mode)
- **Database**: PostgreSQL 17
- **ORM**: Drizzle ORM 0.41.0
- **Auth**: Better-Auth 1.x
- **Cache**: Redis 7
- **Storage**: MinIO (S3-compatible) for product images
- **Payments**: Stripe API

### Infrastructure
- **Container**: Docker multi-stage build
- **Orchestration**: K3s (lightweight Kubernetes)
- **Deployment**: Helm chart
- **Reverse Proxy**: Traefik (K3s ingress)
- **Observability**: Prometheus + Grafana
- **Logging**: Structured JSON logs → Loki

### Frontend
- **UI**: Tailwind CSS 4
- **Components**: shadcn/ui
- **Forms**: React Hook Form + Zod
- **State**: Zustand (client state), TanStack Query (server state)

### DevOps
- **CI/CD**: GitHub Actions
- **Testing**: Vitest (unit), Playwright (e2e)
- **Linting**: ESLint 9 (flat config), Prettier
- **Commits**: Husky + commitlint (Conventional Commits)

---

## Security

### Authentication & Authorization
- **Session-based auth** via Better-Auth (secure cookies)
- **RBAC**: `customer` vs `admin` roles
- **CSRF protection**: SameSite cookies + token validation
- **Rate limiting**: 100 req/min per IP (Redis-backed)

### Payment Security
- **PCI DSS compliance**: Use Stripe.js (no card data on server)
- **Webhook verification**: Validate Stripe signatures
- **Idempotency**: Prevent duplicate charges (idempotency keys)

### API Security
- **Input validation**: Zod schemas for all endpoints
- **SQL injection**: Parameterized queries (Drizzle)
- **XSS**: React auto-escapes, CSP headers
- **Secrets**: Environment variables (never in code)

---

## Testing Strategy

### Unit Tests (Vitest)
- Domain entities: invariants, business logic
- Value objects: validation, equality
- Use cases: orchestration logic
- **Target**: >90% coverage for domain layer

### Integration Tests
- Repository implementations
- Event handlers
- API endpoints (supertest)
- **Target**: >80% coverage

### E2E Tests (Playwright)
- Complete user flows:
  - Browse → Add to cart → Checkout → Payment → Order confirmation
  - Admin: Create product → Upload image → Publish
- **Target**: All critical paths covered

### Performance Tests (k6)
- Load test: 1000 concurrent users
- Stress test: Find breaking point
- **Target**: <500ms p95 response time

---

## Deployment

### K3s Cluster Setup
```bash
# Install K3s
curl -sfL https://get.k3s.io | sh -

# Verify
kubectl get nodes
```

### Helm Chart Structure
```
charts/webdev-ecommerce/
├── Chart.yaml
├── values.yaml
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   └── postgres-statefulset.yaml
```

### Deployment Flow
```bash
# Build image
docker build -t webdev-ecommerce:1.0.0 .

# Install chart
helm install ecommerce ./charts/webdev-ecommerce \
  --set image.tag=1.0.0 \
  --set ingress.host=ecommerce.davidfdzmorilla.dev
```

### Observability
- **Metrics**: Prometheus scrapes `/metrics` endpoint
- **Dashboards**: Grafana (business KPIs + system health)
- **Alerts**: CPU >80%, error rate >1%

---

## Milestones

### M1: DDD Foundation (Day 1)
- [ ] Project structure with 4 bounded contexts
- [ ] Domain entities, value objects, aggregates
- [ ] Repository interfaces
- [ ] Event bus skeleton

### M2: Catalog Module (Day 2)
- [ ] Product CRUD (domain + use cases + API)
- [ ] Category management
- [ ] Inventory tracking
- [ ] Image upload (S3)

### M3: Orders Module (Day 3)
- [ ] Shopping cart
- [ ] Order placement
- [ ] Order state machine
- [ ] Event-driven inventory reduction

### M4: Payments Module (Day 4)
- [ ] Stripe integration
- [ ] Payment intent creation
- [ ] Webhook handling
- [ ] Refund flow

### M5: Identity Module (Day 5)
- [ ] Better-Auth setup
- [ ] User registration/login
- [ ] Address management
- [ ] RBAC middleware

### M6: Integration & Testing (Day 6)
- [ ] End-to-end event flow
- [ ] Unit tests (>90% domain)
- [ ] Integration tests
- [ ] E2E tests (Playwright)

### M7: K3s Deployment (Day 7)
- [ ] Helm chart creation
- [ ] PostgreSQL StatefulSet
- [ ] Redis deployment
- [ ] Ingress configuration

### M8: Observability (Day 8)
- [ ] Prometheus metrics
- [ ] Grafana dashboards
- [ ] Structured logging
- [ ] Health checks

---

## Success Criteria

- ✅ All 4 bounded contexts implemented with clear separation
- ✅ Hexagonal architecture (domain independent of infra)
- ✅ Event-driven communication between modules
- ✅ Domain invariants enforced in aggregates
- ✅ Repository pattern with interface/implementation split
- ✅ Full test coverage (unit + integration + e2e)
- ✅ Deployed on K3s with Helm
- ✅ Prometheus + Grafana dashboards operational
- ✅ Lighthouse score ≥90
- ✅ <2s page load, <500ms API response
- ✅ ADRs for major decisions
- ✅ Context map documented

---

## ADRs (Architectural Decision Records)

### ADR-001: Why Modular Monolith over Microservices?
**Decision**: Use modular monolith with bounded contexts  
**Rationale**:
- Simpler deployment (single process)
- Lower operational complexity
- Easier transactions (within same DB)
- Can extract microservices later if needed

### ADR-002: Why Redis for Event Bus?
**Decision**: Use Redis Pub/Sub for domain events  
**Rationale**:
- Already using Redis for caching
- Simple pub/sub model
- Low latency (<10ms)
- Can upgrade to NATS/RabbitMQ if needed

### ADR-003: Why Drizzle over Prisma?
**Decision**: Use Drizzle ORM  
**Rationale**:
- Better TypeScript inference
- Migration-first approach
- No code generation step
- Smaller bundle size

### ADR-004: Why K3s over Docker Compose?
**Decision**: Deploy on K3s (Kubernetes)  
**Rationale**:
- Production-grade orchestration
- Auto-scaling, self-healing
- Ingress, load balancing built-in
- Observability ecosystem (Prometheus)

---

## References

- **DDD**: Eric Evans, "Domain-Driven Design"
- **Hexagonal Architecture**: Alistair Cockburn
- **Event Sourcing**: Martin Fowler
- **Patterns**: https://refactoring.guru

---

**Next**: Create ROADMAP.md with detailed tasks
