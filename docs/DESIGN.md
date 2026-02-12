# E-Commerce Platform - Design Document

## Problem Statement

Build a production-ready e-commerce platform using Domain-Driven Design (DDD) principles with proper bounded contexts, demonstrating separation of concerns and domain modeling for Level 3.

**Core Requirements**:
- Product catalog with categories and search
- Shopping cart and checkout flow
- Order management with state transitions
- Payment processing integration
- User authentication and profiles
- Admin dashboard for inventory management

## Architecture

### DDD Bounded Contexts

```
┌─────────────────────────────────────────────────────────┐
│                    API Gateway / Web UI                  │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
   │ Catalog │      │ Orders  │      │Identity │
   │ Context │      │ Context │      │ Context │
   └─────────┘      └─────────┘      └─────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                  ┌───────▼────────┐
                  │  Shared Kernel │
                  │ (Domain Events)│
                  └────────────────┘
```

### Bounded Contexts Details

#### 1. Catalog Context
**Responsibility**: Product discovery and browsing

**Entities**:
- Product (aggregate root)
- Category
- ProductVariant (size, color)
- Inventory

**Value Objects**:
- Price (amount, currency)
- SKU
- ProductImage

**Domain Events**:
- ProductCreated
- ProductUpdated
- InventoryChanged

**Repository Pattern**:
```typescript
interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findByCategory(categoryId: string): Promise<Product[]>;
  search(query: string): Promise<Product[]>;
  save(product: Product): Promise<void>;
}
```

#### 2. Orders Context
**Responsibility**: Order lifecycle management

**Entities**:
- Order (aggregate root)
- OrderItem
- ShippingAddress

**Value Objects**:
- OrderStatus (pending, confirmed, shipped, delivered, cancelled)
- Money
- Address

**Domain Events**:
- OrderCreated
- OrderConfirmed
- OrderShipped
- OrderCancelled

**State Machine**:
```
pending → confirmed → processing → shipped → delivered
   │          │
   └──────────┴─→ cancelled
```

#### 3. Identity Context
**Responsibility**: User authentication and authorization

**Entities**:
- User (aggregate root)
- UserProfile
- Address

**Value Objects**:
- Email
- Role (customer, admin, staff)

**Domain Events**:
- UserRegistered
- UserProfileUpdated

### Hexagonal Architecture (Ports & Adapters)

```
┌────────────────────────────────────────┐
│         Application Layer              │
│  (Use Cases / Application Services)    │
└────────────────────────────────────────┘
              │           ▲
              │ Ports     │
              ▼           │
┌────────────────────────────────────────┐
│          Domain Layer                  │
│  (Entities, Value Objects, Services)   │
└────────────────────────────────────────┘
              │           ▲
              │ Ports     │
              ▼           │
┌────────────────────────────────────────┐
│      Infrastructure Layer              │
│  (DB, Cache, External APIs, Events)    │
└────────────────────────────────────────┘
```

### Technology Stack

**Frontend**:
- Next.js 15 (App Router, RSC)
- TypeScript strict mode
- Tailwind CSS 4
- shadcn/ui components
- React Hook Form + Zod validation

**Backend**:
- Next.js Server Actions (application layer)
- Drizzle ORM (persistence)
- Better-Auth (identity)
- PostgreSQL 17 (primary database)
- Redis 7 (cache + event bus)

**Infrastructure**:
- Docker Compose (Level 3 - single node)
- K3s preparation for Level 4
- Nginx reverse proxy
- MinIO (product images)

**Observability** (Level 3 requirement):
- Prometheus (metrics)
- Grafana (dashboards)
- Structured logging (Pino)
- OpenTelemetry traces

## Data Model

### Catalog Context Schema

```sql
-- Products aggregate
CREATE TABLE catalog_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price_amount DECIMAL(10,2) NOT NULL,
  price_currency VARCHAR(3) DEFAULT 'EUR',
  category_id UUID REFERENCES catalog_categories(id),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE catalog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  parent_id UUID REFERENCES catalog_categories(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE catalog_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES catalog_products(id),
  quantity INT NOT NULL DEFAULT 0,
  reserved INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT positive_quantity CHECK (quantity >= 0)
);

CREATE TABLE catalog_product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES catalog_products(id),
  url TEXT NOT NULL,
  alt_text TEXT,
  position INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Orders Context Schema

```sql
-- Orders aggregate
CREATE TABLE orders_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- FK to identity.users
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  subtotal_amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL,
  shipping_amount DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL, -- Reference to catalog, not FK
  product_name VARCHAR(255) NOT NULL, -- Snapshot
  product_sku VARCHAR(50) NOT NULL, -- Snapshot
  quantity INT NOT NULL,
  unit_price_amount DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders_shipping_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders_orders(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(2) NOT NULL,
  phone VARCHAR(20)
);

CREATE INDEX idx_orders_user ON orders_orders(user_id);
CREATE INDEX idx_orders_status ON orders_orders(status);
CREATE INDEX idx_order_items_order ON orders_items(order_id);
```

### Identity Context Schema

```sql
-- Users (Better-Auth)
-- Reuse Better-Auth schema from Level 2

CREATE TABLE identity_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE identity_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id),
  label VARCHAR(50), -- 'home', 'work', 'billing'
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(2) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Domain Events Schema

```sql
CREATE TABLE domain_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_id UUID NOT NULL,
  aggregate_type VARCHAR(100) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,
  occurred_at TIMESTAMP DEFAULT NOW(),
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP
);

CREATE INDEX idx_events_aggregate ON domain_events(aggregate_id);
CREATE INDEX idx_events_type ON domain_events(event_type);
CREATE INDEX idx_events_unprocessed ON domain_events(processed) WHERE NOT processed;
```

## API Design

### Public API (Next.js App Router)

**Routes**:
```
GET  /                    → Homepage
GET  /products            → Product listing
GET  /products/[slug]     → Product detail
GET  /categories/[slug]   → Category products
GET  /cart                → Shopping cart
POST /checkout            → Begin checkout
GET  /orders              → User orders
GET  /orders/[id]         → Order detail

-- Admin
GET  /admin               → Dashboard
GET  /admin/products      → Product management
POST /admin/products      → Create product
GET  /admin/orders        → Order management
```

### Server Actions (Application Layer)

```typescript
// Catalog
export async function searchProducts(query: string): Promise<Product[]>;
export async function getProductBySlug(slug: string): Promise<Product | null>;
export async function getProductsByCategory(slug: string): Promise<Product[]>;

// Orders
export async function createOrder(input: CreateOrderInput): Promise<Result<Order>>;
export async function getUserOrders(userId: string): Promise<Order[]>;
export async function getOrderById(id: string): Promise<Order | null>;

// Admin
export async function createProduct(input: CreateProductInput): Promise<Result<Product>>;
export async function updateProduct(id: string, input: UpdateProductInput): Promise<Result<Product>>;
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Result<void>>;
```

## Domain Events Flow

### Example: Place Order

```
1. User clicks "Place Order"
   ↓
2. Orders.createOrder() → OrderCreated event
   ↓
3. Event Handler → Catalog.reserveInventory()
   ↓
4. Catalog emits → InventoryReserved event
   ↓
5. Payment processing (future)
   ↓
6. Orders.confirmOrder() → OrderConfirmed event
   ↓
7. Event Handler → Notification sent
```

## Key Patterns

### Result Type (Railway Oriented Programming)

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Usage
const result = await createOrder(input);
if (!result.success) {
  return { error: result.error };
}
return { data: result.data };
```

### Domain Events

```typescript
interface DomainEvent {
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  eventData: unknown;
  occurredAt: Date;
}

class Product extends AggregateRoot {
  updatePrice(newPrice: Price): Result<void> {
    // Business logic
    this.price = newPrice;
    
    // Emit event
    this.addDomainEvent({
      aggregateId: this.id,
      aggregateType: 'Product',
      eventType: 'ProductPriceChanged',
      eventData: { oldPrice, newPrice },
      occurredAt: new Date(),
    });
    
    return { success: true };
  }
}
```

### Value Objects

```typescript
class Price {
  constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {
    if (amount < 0) throw new Error('Price cannot be negative');
    if (!['EUR', 'USD', 'GBP'].includes(currency)) {
      throw new Error('Invalid currency');
    }
  }
  
  equals(other: Price): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}
```

## Security

- HTTPS only (Cloudflare + Let's Encrypt)
- Better-Auth session management
- CSRF protection (Next.js built-in)
- XSS protection (React escaping)
- SQL injection protection (Drizzle parameterized queries)
- Rate limiting on checkout endpoints
- Admin routes protected by role middleware

## Performance Goals

- Homepage load: < 1s
- Product search: < 200ms (with Redis cache)
- Checkout flow: < 3s end-to-end
- 95th percentile API response: < 500ms
- Database queries: indexed, N+1 avoided

## Success Criteria

✅ All bounded contexts implemented with clear boundaries
✅ Domain events flowing between contexts
✅ Hexagonal architecture with ports/adapters
✅ Complete checkout flow functional
✅ Admin dashboard for product/order management
✅ Redis caching effective (cache hit rate > 80%)
✅ Prometheus metrics + Grafana dashboard
✅ Lighthouse score ≥ 90 all categories
✅ Zero TypeScript errors, zero ESLint warnings
✅ Deployed at https://shop.davidfdzmorilla.dev

## Future Enhancements (Level 4)

- Payment gateway integration (Stripe)
- Email notifications (order confirmations)
- Product reviews and ratings
- Wishlist functionality
- Advanced search with filters
- Recommendation engine
- Multi-currency support
