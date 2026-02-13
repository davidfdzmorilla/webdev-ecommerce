# E-Commerce Platform - Roadmap

**Project**: webdev-ecommerce  
**Level**: 3.1 (DDD Modular Monolith)  
**Start Date**: 2025-02-12  
**Status**: In Progress

---

## Phase 1: Planning & Scaffolding (2-3 hours)

### Task 1.1: GitHub Repository Setup
- [ ] Create GitHub repo: `davidfdzmorilla/webdev-ecommerce`
- [ ] Initialize git with main branch
- [ ] Create branch structure: main → develop → feature/*
- [ ] Add .gitignore (node_modules, .env, dist)

### Task 1.2: Project Scaffolding
- [ ] Initialize Next.js 15 with TypeScript
- [ ] Configure TypeScript strict mode
- [ ] Setup ESLint 9 (flat config) + Prettier
- [ ] Install Husky + lint-staged + commitlint
- [ ] Create project structure (modules, shared, docs)

### Task 1.3: Infrastructure Setup
- [ ] Dockerfile (multi-stage: deps → build → production)
- [ ] docker-compose.yml (app, postgres, redis, minio)
- [ ] Makefile (dev, build, test, lint, deploy)
- [ ] Environment variables template (.env.example)

### Task 1.4: Documentation
- [ ] README.md (follow standard template)
- [ ] DESIGN.md (already created)
- [ ] ROADMAP.md (this file)
- [ ] docs/CONTEXT-MAP.md (bounded contexts diagram)
- [ ] docs/UBIQUITOUS-LANGUAGE.md (glossary)

### Task 1.5: Development Environment
- [ ] Drizzle ORM setup (schema, migrate, push)
- [ ] Better-Auth configuration
- [ ] Redis client setup
- [ ] MinIO S3 client setup

---

## Phase 2: DDD Foundation (3-4 hours)

### Task 2.1: Shared Kernel
- [ ] Create `shared/kernel/` directory
- [ ] Implement `Result<T, E>` type (error handling)
- [ ] Implement `Entity<T>` base class (identity, equality)
- [ ] Implement `ValueObject<T>` base class (value equality)
- [ ] Implement `AggregateRoot<T>` (domain events)
- [ ] Implement `DomainEvent` interface
- [ ] Unit tests for kernel

### Task 2.2: Event Bus Infrastructure
- [ ] Create `shared/domain-events/` directory
- [ ] Implement `IEventBus` interface
- [ ] Implement `RedisEventBus` (pub/sub)
- [ ] Implement `InMemoryEventBus` (testing)
- [ ] Event handler registration system
- [ ] Event persistence (domain_events table)
- [ ] Dead letter queue for failed events

### Task 2.3: Catalog Domain Layer
- [ ] `modules/catalog/domain/entities/Product.ts` (aggregate root)
- [ ] `modules/catalog/domain/entities/Category.ts`
- [ ] `modules/catalog/domain/entities/Inventory.ts`
- [ ] `modules/catalog/domain/value-objects/Money.ts`
- [ ] `modules/catalog/domain/value-objects/SKU.ts`
- [ ] `modules/catalog/domain/value-objects/ProductImage.ts`
- [ ] `modules/catalog/domain/events/ProductCreated.ts`
- [ ] `modules/catalog/domain/events/InventoryReduced.ts`
- [ ] `modules/catalog/domain/repositories/IProductRepository.ts`
- [ ] Unit tests for Product aggregate (invariants)

### Task 2.4: Orders Domain Layer
- [ ] `modules/orders/domain/entities/Cart.ts`
- [ ] `modules/orders/domain/entities/Order.ts` (aggregate root)
- [ ] `modules/orders/domain/entities/OrderItem.ts`
- [ ] `modules/orders/domain/value-objects/OrderStatus.ts` (enum)
- [ ] `modules/orders/domain/events/OrderPlaced.ts`
- [ ] `modules/orders/domain/events/OrderPaid.ts`
- [ ] `modules/orders/domain/repositories/IOrderRepository.ts`
- [ ] Order state machine implementation
- [ ] Unit tests for Order aggregate

### Task 2.5: Payments Domain Layer
- [ ] `modules/payments/domain/entities/Payment.ts` (aggregate root)
- [ ] `modules/payments/domain/entities/Refund.ts`
- [ ] `modules/payments/domain/value-objects/PaymentStatus.ts`
- [ ] `modules/payments/domain/events/PaymentSucceeded.ts`
- [ ] `modules/payments/domain/events/PaymentFailed.ts`
- [ ] `modules/payments/domain/repositories/IPaymentRepository.ts`
- [ ] Unit tests for Payment aggregate

### Task 2.6: Identity Domain Layer
- [ ] `modules/identity/domain/entities/User.ts` (aggregate root)
- [ ] `modules/identity/domain/entities/Address.ts`
- [ ] `modules/identity/domain/value-objects/Email.ts`
- [ ] `modules/identity/domain/events/UserRegistered.ts`
- [ ] Unit tests for User aggregate

---

## Phase 3: Application Layer (4-5 hours)

### Task 3.1: Catalog Use Cases
- [ ] `CreateProduct` use case
- [ ] `UpdateProduct` use case
- [ ] `DeleteProduct` use case
- [ ] `GetProduct` use case (by id, sku)
- [ ] `ListProducts` use case (pagination, filters)
- [ ] `UpdateInventory` use case
- [ ] `CheckInventory` use case
- [ ] DTOs (ProductDTO, CategoryDTO, InventoryDTO)
- [ ] Unit tests for use cases

### Task 3.2: Orders Use Cases
- [ ] `AddToCart` use case
- [ ] `RemoveFromCart` use case
- [ ] `GetCart` use case
- [ ] `PlaceOrder` use case (validates inventory, creates order)
- [ ] `CancelOrder` use case (compensating transaction)
- [ ] `GetOrder` use case
- [ ] `ListOrders` use case
- [ ] DTOs (CartDTO, OrderDTO)
- [ ] Unit tests for use cases

### Task 3.3: Payments Use Cases
- [ ] `CreatePaymentIntent` use case (Stripe)
- [ ] `ProcessPayment` use case (webhook handler)
- [ ] `IssueRefund` use case
- [ ] `GetPayment` use case
- [ ] DTOs (PaymentDTO, RefundDTO)
- [ ] Unit tests for use cases

### Task 3.4: Identity Use Cases
- [ ] `RegisterUser` use case
- [ ] `UpdateProfile` use case
- [ ] `AddAddress` use case
- [ ] `GetUser` use case
- [ ] DTOs (UserDTO, AddressDTO)
- [ ] Unit tests for use cases

---

## Phase 4: Infrastructure Layer (5-6 hours)

### Task 4.1: Database Schema
- [ ] Drizzle schema for all tables
- [ ] Migration files
- [ ] Seed data (sample products, categories)
- [ ] Indexes (performance optimization)

### Task 4.2: Catalog Infrastructure
- [ ] `DrizzleProductRepository` (implements IProductRepository)
- [ ] `DrizzleCategoryRepository`
- [ ] `DrizzleInventoryRepository`
- [ ] `S3ImageStorage` (MinIO integration)
- [ ] Integration tests for repositories

### Task 4.3: Orders Infrastructure
- [ ] `DrizzleCartRepository`
- [ ] `DrizzleOrderRepository`
- [ ] Integration tests

### Task 4.4: Payments Infrastructure
- [ ] `DrizzlePaymentRepository`
- [ ] `StripePaymentGateway` (API integration)
- [ ] Webhook signature verification
- [ ] Integration tests

### Task 4.5: Identity Infrastructure
- [ ] Better-Auth setup (session, user, account tables)
- [ ] `DrizzleUserRepository`
- [ ] `DrizzleAddressRepository`
- [ ] Integration tests

### Task 4.6: Event Handlers
- [ ] `OrderPlaced` → `ReduceInventory` handler
- [ ] `OrderPlaced` → `CreatePaymentIntent` handler
- [ ] `PaymentSucceeded` → `UpdateOrderStatus` handler
- [ ] `OrderCancelled` → `RestockInventory` handler
- [ ] Integration tests (event flow)

---

## Phase 5: Presentation Layer (6-7 hours)

### Task 5.1: API Routes (Next.js App Router)
- [ ] `/api/catalog/products` (GET, POST)
- [ ] `/api/catalog/products/[id]` (GET, PATCH, DELETE)
- [ ] `/api/catalog/categories` (GET, POST)
- [ ] `/api/cart` (GET, POST, DELETE)
- [ ] `/api/orders` (GET, POST)
- [ ] `/api/orders/[id]` (GET, PATCH)
- [ ] `/api/payments/create-intent` (POST)
- [ ] `/api/payments/webhook` (POST, Stripe)
- [ ] `/api/auth/*` (Better-Auth routes)
- [ ] `/api/users/me` (GET, PATCH)
- [ ] `/api/users/me/addresses` (GET, POST)
- [ ] Error handling middleware
- [ ] Request validation (Zod schemas)
- [ ] Rate limiting middleware

### Task 5.2: UI Components (shadcn/ui)
- [ ] `ProductCard` component
- [ ] `ProductGrid` component
- [ ] `ProductDetail` component
- [ ] `CategoryNav` component
- [ ] `CartSidebar` component
- [ ] `CheckoutForm` component
- [ ] `OrderSummary` component
- [ ] `AddressForm` component
- [ ] `PaymentForm` (Stripe Elements)
- [ ] `OrderHistory` component

### Task 5.3: Pages (Next.js)
- [ ] `/` (homepage with featured products)
- [ ] `/products` (product listing with filters)
- [ ] `/products/[slug]` (product detail)
- [ ] `/categories/[slug]` (category page)
- [ ] `/cart` (shopping cart)
- [ ] `/checkout` (checkout flow)
- [ ] `/orders` (order history)
- [ ] `/orders/[id]` (order detail)
- [ ] `/admin/products` (product management)
- [ ] `/admin/orders` (order management)
- [ ] `/auth/sign-in` (login)
- [ ] `/auth/sign-up` (registration)
- [ ] `/profile` (user profile)

### Task 5.4: State Management
- [ ] Zustand store for cart state
- [ ] TanStack Query for server state
- [ ] Optimistic updates for cart
- [ ] Real-time order status updates (polling or SSE)

### Task 5.5: Styling
- [ ] Tailwind CSS 4 setup
- [ ] Design system (colors, typography, spacing)
- [ ] Responsive layouts (mobile-first)
- [ ] Dark mode support
- [ ] Accessibility (ARIA labels, keyboard nav)

---

## Phase 6: Testing (4-5 hours)

### Task 6.1: Unit Tests
- [ ] Domain entities (>90% coverage)
- [ ] Value objects (edge cases)
- [ ] Use cases (business logic)
- [ ] Event handlers

### Task 6.2: Integration Tests
- [ ] Repository implementations
- [ ] API endpoints (supertest)
- [ ] Event bus (publish/subscribe)
- [ ] Database transactions

### Task 6.3: E2E Tests (Playwright)
- [ ] User flow: Browse → Add to cart → Checkout → Payment
- [ ] User flow: Admin create product → Upload image
- [ ] User flow: Order cancellation → Inventory restock
- [ ] Edge cases (out of stock, payment failure)

### Task 6.4: Performance Tests
- [ ] Load test: 1000 concurrent users (k6)
- [ ] Stress test: Find breaking point
- [ ] Database query optimization
- [ ] API response time benchmarks

---

## Phase 7: Observability (3-4 hours)

### Task 7.1: Metrics
- [ ] Prometheus client setup
- [ ] `/metrics` endpoint
- [ ] Custom metrics (orders/sec, cart abandonment rate)
- [ ] System metrics (CPU, memory, request latency)

### Task 7.2: Dashboards
- [ ] Grafana setup
- [ ] Business KPIs dashboard (sales, conversion rate)
- [ ] System health dashboard (uptime, error rate)
- [ ] Database performance dashboard

### Task 7.3: Logging
- [ ] Structured JSON logging (pino)
- [ ] Log levels (error, warn, info, debug)
- [ ] Correlation IDs (trace requests)
- [ ] Loki integration (log aggregation)

### Task 7.4: Alerts
- [ ] CPU usage >80%
- [ ] Error rate >1%
- [ ] Payment failure spike
- [ ] Database connection pool exhausted

---

## Phase 8: K3s Deployment (4-5 hours)

### Task 8.1: Helm Chart Creation
- [ ] `charts/webdev-ecommerce/Chart.yaml`
- [ ] `values.yaml` (config, secrets)
- [ ] `templates/deployment.yaml`
- [ ] `templates/service.yaml`
- [ ] `templates/ingress.yaml`
- [ ] `templates/configmap.yaml`
- [ ] `templates/secret.yaml`
- [ ] `templates/postgres-statefulset.yaml`
- [ ] `templates/redis-deployment.yaml`
- [ ] `templates/minio-deployment.yaml`

### Task 8.2: K3s Setup
- [ ] Install K3s on VPS
- [ ] Configure kubectl context
- [ ] Install Helm
- [ ] Install Prometheus operator
- [ ] Install Grafana

### Task 8.3: Deployment
- [ ] Build Docker image
- [ ] Push to Docker Hub / GitHub Container Registry
- [ ] Deploy with Helm
- [ ] Configure ingress (Traefik)
- [ ] SSL certificate (Let's Encrypt)

### Task 8.4: Cloudflare DNS
- [ ] Create A record: `ecommerce.davidfdzmorilla.dev`
- [ ] Enable proxy (CDN + DDoS protection)
- [ ] Verify DNS resolution

---

## Phase 9: Verification & Documentation (2-3 hours)

### Task 9.1: Verification Checklist
- [ ] DNS resolves correctly
- [ ] HTTPS works (valid SSL)
- [ ] All routes return 200
- [ ] No broken links
- [ ] No missing assets
- [ ] Lighthouse Performance ≥90
- [ ] Lighthouse Accessibility ≥90
- [ ] Container running and healthy
- [ ] Clean logs (no errors)
- [ ] End-to-end flow works (browse → checkout → payment)
- [ ] Prometheus metrics accessible
- [ ] Grafana dashboards visible

### Task 9.2: Documentation
- [ ] Complete README.md
- [ ] Create docs/VERIFICATION.md (report)
- [ ] Create docs/DEPLOYMENT.md (runbook)
- [ ] Create docs/TROUBLESHOOTING.md
- [ ] Update portfolio with new project
- [ ] GitHub repo description and tags

### Task 9.3: ADRs
- [ ] ADR-005: Why Next.js over Remix?
- [ ] ADR-006: Why Better-Auth over NextAuth?
- [ ] ADR-007: Why Stripe over PayPal?

---

## Phase 10: Portfolio Update

### Task 10.1: Add to Portfolio
- [ ] Open webdev-portfolio project
- [ ] Add ecommerce project to projects section
- [ ] Include: name, description, tech stack, URL, GitHub, screenshot
- [ ] Commit: `feat(projects): add ecommerce platform to portfolio`
- [ ] Build, deploy, verify portfolio updated

---

## Success Criteria (Checklist)

- [ ] All 4 bounded contexts implemented
- [ ] Hexagonal architecture (domain independent)
- [ ] Event-driven communication works end-to-end
- [ ] Domain invariants enforced
- [ ] Repository pattern with interface/implementation split
- [ ] Test coverage: >90% domain, >80% integration, all e2e flows
- [ ] Deployed on K3s with Helm
- [ ] Prometheus + Grafana operational
- [ ] Lighthouse ≥90
- [ ] Page load <2s, API response <500ms
- [ ] All verification steps pass
- [ ] Portfolio updated

---

## Timeline Estimate

- **Phase 1**: 2-3 hours (scaffolding)
- **Phase 2**: 3-4 hours (DDD foundation)
- **Phase 3**: 4-5 hours (application layer)
- **Phase 4**: 5-6 hours (infrastructure)
- **Phase 5**: 6-7 hours (presentation)
- **Phase 6**: 4-5 hours (testing)
- **Phase 7**: 3-4 hours (observability)
- **Phase 8**: 4-5 hours (K3s deployment)
- **Phase 9**: 2-3 hours (verification)
- **Phase 10**: 1 hour (portfolio update)

**Total**: 34-43 hours

---

## Current Status

**Phase**: 1 (Planning & Scaffolding)  
**Current Task**: Task 1.1 (GitHub repo setup)  
**Completion**: 0%

---

**Next Action**: Create GitHub repository and initialize project structure
