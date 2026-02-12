# E-Commerce Platform - Roadmap

## Milestone 1: Project Setup (30 min)
- [x] Create design documents
- [ ] Initialize Git repository
- [ ] Setup Next.js 15 + TypeScript
- [ ] Configure ESLint, Prettier, Husky
- [ ] Create Dockerfile + docker-compose.yml
- [ ] Setup folder structure (DDD layers)

## Milestone 2: Infrastructure (45 min)
- [ ] PostgreSQL + Redis + MinIO services
- [ ] Drizzle ORM setup with schema
- [ ] Better-Auth configuration
- [ ] Redis cache wrapper
- [ ] Domain events infrastructure
- [ ] Logging setup (Pino)

## Milestone 3: Catalog Context - Domain Layer (1h)
- [ ] Product entity (aggregate root)
- [ ] Category entity
- [ ] Inventory entity
- [ ] Price value object
- [ ] SKU value object
- [ ] Domain events (ProductCreated, InventoryChanged)
- [ ] Product repository interface

## Milestone 4: Catalog Context - Application Layer (1h)
- [ ] Product repository implementation (Drizzle)
- [ ] CreateProduct use case
- [ ] UpdateProduct use case
- [ ] SearchProducts use case
- [ ] GetProductBySlug use case
- [ ] Category management use cases

## Milestone 5: Catalog Context - UI (1h 30m)
- [ ] Product listing page (/products)
- [ ] Product detail page (/products/[slug])
- [ ] Category filter sidebar
- [ ] Search functionality
- [ ] Product images (MinIO integration)
- [ ] Add to cart button

## Milestone 6: Orders Context - Domain Layer (1h)
- [ ] Order entity (aggregate root)
- [ ] OrderItem entity
- [ ] ShippingAddress value object
- [ ] OrderStatus value object
- [ ] Order state machine
- [ ] Domain events (OrderCreated, OrderConfirmed)
- [ ] Order repository interface

## Milestone 7: Orders Context - Application Layer (1h)
- [ ] Order repository implementation
- [ ] CreateOrder use case
- [ ] ConfirmOrder use case
- [ ] CancelOrder use case
- [ ] GetUserOrders use case
- [ ] GetOrderById use case

## Milestone 8: Shopping Cart (1h)
- [ ] Cart session management (Redis)
- [ ] Add item to cart
- [ ] Update item quantity
- [ ] Remove item from cart
- [ ] Cart UI (/cart)
- [ ] Cart summary component

## Milestone 9: Checkout Flow (1h 30m)
- [ ] Checkout page (/checkout)
- [ ] Shipping address form
- [ ] Order summary component
- [ ] Place order logic
- [ ] Inventory reservation
- [ ] Order confirmation page
- [ ] Email simulation (log)

## Milestone 10: Identity Context (45 min)
- [ ] Better-Auth setup (reuse Level 2 pattern)
- [ ] User profile management
- [ ] Address book (save/edit addresses)
- [ ] User orders history (/orders)
- [ ] Order detail page (/orders/[id])

## Milestone 11: Admin Dashboard (2h)
- [ ] Admin layout with sidebar
- [ ] Dashboard overview (/admin)
- [ ] Product management (/admin/products)
  - List products
  - Create product form
  - Edit product form
  - Delete product
- [ ] Order management (/admin/orders)
  - List orders
  - Update order status
  - View order details
- [ ] Category management (/admin/categories)

## Milestone 12: Domain Events (1h)
- [ ] Event store (database table)
- [ ] Event dispatcher
- [ ] Event handlers registry
- [ ] OrderCreated → ReserveInventory handler
- [ ] OrderCancelled → ReleaseInventory handler
- [ ] Event processing background job

## Milestone 13: Observability (1h)
- [ ] Prometheus metrics endpoint
- [ ] Custom metrics (orders_total, products_created)
- [ ] Grafana dashboard JSON
- [ ] Structured logging with Pino
- [ ] Error tracking
- [ ] Performance monitoring

## Milestone 14: Testing (1h 30m)
- [ ] Domain layer unit tests
- [ ] Use case integration tests
- [ ] API endpoint tests
- [ ] Cart logic tests
- [ ] Order state machine tests
- [ ] Repository tests with test DB

## Milestone 15: Deployment (1h)
- [ ] Build Docker images
- [ ] docker-compose.yml (6 services)
- [ ] Nginx configuration
- [ ] Cloudflare DNS (shop.davidfdzmorilla.dev)
- [ ] Deploy to VPS
- [ ] Seed sample products
- [ ] Verification checklist
- [ ] Documentation

## Total Estimated Time: 16-18 hours

## Success Metrics
- All 15 milestones complete
- 100+ commits with Conventional Commits
- TypeScript strict mode: 0 errors
- ESLint: 0 warnings
- Test coverage: ≥ 80%
- Lighthouse: ≥ 90 all categories
- E2E checkout flow working
- Domain events flowing correctly
- Admin dashboard functional
