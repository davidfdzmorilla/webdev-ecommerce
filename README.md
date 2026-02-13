# E-Commerce Platform — DDD Modular Monolith

**Level 3.1**: Domain-Driven Design with Hexagonal Architecture and Event-Driven Communication

**🌐 Live**: [https://ecommerce.davidfdzmorilla.dev](https://ecommerce.davidfdzmorilla.dev) (pending deployment)  
**📦 Repo**: [github.com/davidfdzmorilla/webdev-ecommerce](https://github.com/davidfdzmorilla/webdev-ecommerce)

## Overview

This project demonstrates advanced software architecture patterns for building scalable, maintainable applications:

- **Domain-Driven Design (DDD)**: Four bounded contexts with clear separation
- **Hexagonal Architecture**: Domain independent of infrastructure (Ports & Adapters)
- **Event-Driven Architecture**: Asynchronous inter-module communication
- **CQRS-lite**: Separate read/write models for optimized queries
- **Repository Pattern**: Clean abstraction over data persistence

## Tech Stack

### Core
- **Framework**: Next.js 15 (App Router, React Server Components)
- **Language**: TypeScript 5.7 (strict mode)
- **Database**: PostgreSQL 17
- **ORM**: Drizzle ORM 0.41.0
- **Auth**: Better-Auth 1.x
- **Cache**: Redis 7
- **Event Bus**: Redis Pub/Sub (InMemoryEventBus for development)

### Infrastructure
- **Container**: Docker multi-stage build
- **Orchestration**: K3s (Kubernetes, pending deployment)
- **Deployment**: Helm chart (pending)
- **Reverse Proxy**: Nginx/Traefik
- **Observability**: Prometheus + Grafana (pending)

### Frontend
- **UI**: Tailwind CSS 4
- **Forms**: React Hook Form + Zod
- **State**: TanStack Query (server state)

## Architecture

### Bounded Contexts (DDD Strategic Design)

#### 1. Catalog Context
**Responsibility**: Product management, categorization, inventory tracking

**Aggregates**:
- `Product` (root): SKU, name, price, description, images
- `Category`: Hierarchical categorization
- `Inventory`: Stock tracking with reservations

**Domain Events**:
- `ProductCreated`, `ProductPriceChanged`, `InventoryReduced`, `InventoryRestocked`

#### 2. Orders Context
**Responsibility**: Shopping cart, order lifecycle management

**Aggregates**:
- `Cart` (root): User cart with items, expiration
- `Order` (root): Order with state machine (PENDING → PAID → PROCESSING → SHIPPED → DELIVERED)
- `OrderItem`: Line items with price at order time

**Domain Events**:
- `OrderCreated`, `OrderPlaced`, `OrderPaid`, `OrderCancelled`, `OrderShipped`

**State Machine**:
```
PENDING → PAYMENT_PENDING → PAID → PROCESSING → SHIPPED → DELIVERED
         ↓
      CANCELLED
```

#### 3. Payments Context
**Responsibility**: Payment processing, refunds (Stripe integration)

**Aggregates**:
- `Payment` (root): Payment with status transitions
- `Refund`: Refund tracking

**Domain Events**:
- `PaymentInitiated`, `PaymentSucceeded`, `PaymentFailed`, `PaymentRefunded`

#### 4. Identity Context
**Responsibility**: User management, authentication, addresses

**Aggregates**:
- `User` (root): Email, name, role (customer/admin)
- `Address`: Shipping/billing addresses with ISO country codes

**Domain Events**:
- `UserRegistered`, `UserProfileUpdated`, `UserRoleChanged`

### Hexagonal Architecture (Tactical Design)

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                     │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │  API Routes    │  │  UI Components │  │    Pages     │  │
│  │  (Next.js)     │  │  (React)       │  │  (Next.js)   │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                    APPLICATION LAYER                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               Use Cases (Orchestration)              │   │
│  │  CreateProduct, AddToCart, PlaceOrder, ProcessPayment│  │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                       DTOs                           │   │
│  │   ProductDTO, CartDTO, OrderDTO, PaymentDTO          │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │ (depends on)
┌───────────────────────────┴─────────────────────────────────┐
│                      DOMAIN LAYER (Pure)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Aggregates: Product, Order, Payment, User           │   │
│  │  Value Objects: SKU, Email, OrderStatus              │   │
│  │  Domain Events: OrderPlaced, PaymentSucceeded        │   │
│  │  Repository Interfaces (Ports)                       │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │ (implemented by)
┌───────────────────────────┴─────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Repository Adapters (Drizzle implementations)       │   │
│  │  Event Bus (Redis Pub/Sub)                           │   │
│  │  Database (PostgreSQL)                               │   │
│  │  External APIs (Stripe)                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Key Principles**:
- Domain layer has **ZERO** dependencies (pure TypeScript)
- Application layer depends only on domain interfaces
- Infrastructure implements domain interfaces (adapters)
- Presentation adapts domain to HTTP/UI

### Event-Driven Communication

Modules communicate via domain events (no direct coupling):

**Example Flow**: Order Placement
```
1. User places order (POST /api/orders)
2. PlaceOrderUseCase creates Order aggregate
3. Order.create() publishes OrderPlaced event
4. Event Bus distributes event
5. Event Handlers:
   - CatalogModule: ReduceInventory (reserve stock)
   - PaymentsModule: CreatePaymentIntent (Stripe)
   - NotificationsModule: SendOrderConfirmation (future)
```

**Event Handler Registration** (`EventHandlerRegistry`):
```typescript
// OrderPlaced → ReduceInventory (Catalog module)
eventBus.subscribe('OrderPlaced', orderPlacedHandler);

// PaymentSucceeded → UpdateOrderStatus (Orders module)
eventBus.subscribe('PaymentSucceeded', paymentSucceededHandler);
```

## Project Structure

```
src/
├── app/                              # Next.js App Router
│   ├── api/                          # REST API routes
│   │   ├── catalog/products/         # GET/POST /api/catalog/products
│   │   ├── cart/                     # GET/POST /api/cart
│   │   ├── orders/                   # GET/POST /api/orders
│   │   └── payments/webhook/         # POST /api/payments/webhook
│   ├── products/                     # Product pages
│   ├── cart/                         # Cart page
│   ├── checkout/                     # Checkout page
│   └── orders/                       # Order history
│
├── modules/                          # Bounded Contexts
│   ├── catalog/
│   │   ├── domain/                   # Pure domain logic
│   │   │   ├── entities/             # Product, Category, Inventory
│   │   │   ├── value-objects/        # SKU, Price
│   │   │   ├── events/               # ProductCreated, InventoryReduced
│   │   │   └── repositories/         # IProductRepository (interface)
│   │   ├── application/              # Use cases + DTOs
│   │   │   ├── use-cases/            # CreateProduct, ListProducts
│   │   │   └── dto/                  # ProductDTO
│   │   └── infrastructure/           # Adapters
│   │       ├── DrizzleProductRepository.ts
│   │       └── event-handlers/       # OrderPlaced → ReduceInventory
│   │
│   ├── orders/                       # Same structure
│   ├── payments/                     # Same structure
│   └── identity/                     # Same structure
│
└── shared/
    ├── kernel/                       # DDD base classes
    │   ├── Entity.ts                 # Identity-based equality
    │   ├── ValueObject.ts            # Value-based equality
    │   ├── AggregateRoot.ts          # Domain events management
    │   └── Result.ts                 # Functional error handling
    ├── domain-events/                # Event bus infrastructure
    │   ├── IEventBus.ts              # Interface (port)
    │   ├── InMemoryEventBus.ts       # In-memory implementation
    │   └── RedisEventBus.ts          # Redis Pub/Sub implementation
    └── infrastructure/
        ├── db/schema.ts              # Drizzle schema (all contexts)
        └── events/EventHandlerRegistry.ts
```

## API Endpoints

### Catalog
```
GET    /api/catalog/products          # List products (pagination, search, filters)
POST   /api/catalog/products          # Create product (admin)
GET    /api/catalog/products/:id      # Get product by ID
```

### Cart
```
GET    /api/cart                      # Get current user's cart
POST   /api/cart                      # Add item to cart
```

### Orders
```
GET    /api/orders                    # List user's orders
POST   /api/orders                    # Place new order
```

### Payments
```
POST   /api/payments/webhook          # Stripe webhook (payment events)
```

## Getting Started

### Prerequisites
- Node.js 22+
- pnpm
- PostgreSQL 17
- Redis 7 (optional, InMemoryEventBus works for development)
- Docker (for production deployment)

### Development

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce

# Redis (optional for development)
REDIS_URL=redis://localhost:6379

# Better-Auth
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Production (Docker)

```bash
# Build
docker build -t webdev-ecommerce:1.0.0 .

# Run with docker-compose
docker compose up -d
```

## Testing Strategy

### Unit Tests (Domain Layer)
```bash
pnpm test:unit
```

Test domain logic in isolation:
- Aggregate invariants (e.g., Order cannot be cancelled after SHIPPED)
- Value object validation (e.g., Email format, SKU uniqueness)
- State machine transitions (e.g., OrderStatus)

### Integration Tests (Infrastructure Layer)
```bash
pnpm test:integration
```

Test repository implementations:
- Database persistence
- Event publishing
- Query correctness

### E2E Tests (Presentation Layer)
```bash
pnpm test:e2e
```

Test complete user flows:
- Browse products → Add to cart → Checkout → Payment

## Deployment

### K3s + Helm (Pending)

```bash
# Install K3s
curl -sfL https://get.k3s.io | sh -

# Deploy with Helm
helm install ecommerce ./charts/webdev-ecommerce \
  --set image.tag=1.0.0 \
  --set ingress.host=ecommerce.davidfdzmorilla.dev
```

### Cloudflare DNS

```bash
# Create A record
curl -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"type":"A","name":"ecommerce","content":"'${SERVER_IP}'","proxied":true}'
```

## Documentation

- [Design Document](docs/DESIGN.md) — Complete architecture breakdown
- [Roadmap](docs/ROADMAP.md) — Development plan and milestones
- [Context Map](docs/CONTEXT-MAP.md) — Bounded context relationships (pending)
- [ADRs](docs/ADRs/) — Architectural Decision Records (pending)

## Key Learnings

### DDD Patterns Implemented

- ✅ **Bounded Contexts**: 4 independent modules with clear responsibilities
- ✅ **Aggregates**: Order, Product, Payment, User (with invariant enforcement)
- ✅ **Value Objects**: Email, SKU, OrderStatus (immutable, value-based equality)
- ✅ **Domain Events**: 10+ events for inter-module communication
- ✅ **Repository Pattern**: Interfaces in domain, implementations in infrastructure
- ✅ **Hexagonal Architecture**: Domain has ZERO infrastructure dependencies

### Event-Driven Patterns

- ✅ **Pub/Sub**: Redis-based event bus (with in-memory fallback)
- ✅ **Event Handlers**: Decoupled modules listening to domain events
- ✅ **Event Sourcing-ready**: `domain_events` table persists all events
- ✅ **Saga Foundation**: Compensating transactions ready (e.g., OrderCancelled → RestockInventory)

### Clean Architecture Benefits

- ✅ **Testability**: Domain logic testable without database/HTTP
- ✅ **Maintainability**: Clear separation of concerns
- ✅ **Flexibility**: Swap infrastructure without touching domain (e.g., Prisma → Drizzle)
- ✅ **Scalability**: Modules can be extracted to microservices later

## License

MIT

---

**Part of**: [WebDev Agent Progression](https://webdev.davidfdzmorilla.dev) — Level 3 (DDD Modular Monolith)  
**Next Level**: Microservices with CQRS + Event Sourcing
