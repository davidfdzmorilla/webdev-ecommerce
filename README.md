# WebDev E-Commerce Platform

DDD-based e-commerce platform demonstrating Domain-Driven Design, Hexagonal Architecture, and Bounded Contexts.

**🌐 Live**: https://shop.davidfdzmorilla.dev (deployment pending)  
**📦 Repo**: https://github.com/davidfdzmorilla/webdev-ecommerce

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Actions)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL 17
- **Cache**: Redis 7
- **ORM**: Drizzle ORM
- **Auth**: Better-Auth
- **Styling**: Tailwind CSS 4
- **Infrastructure**: Docker Compose

## Architecture

### DDD Bounded Contexts

```
src/modules/
├── catalog/          # Product catalog management
│   ├── domain/       # Entities, Value Objects, Repositories
│   ├── application/  # Use Cases, Server Actions
│   └── infrastructure/  # Drizzle repositories
├── orders/           # Order processing
│   ├── domain/       # Order aggregate, OrderStatus
│   ├── application/  # Cart, CreateOrder
│   └── infrastructure/  # Order repository
└── identity/         # Authentication (Better-Auth)
```

### Hexagonal Architecture

- **Domain Layer**: Pure business logic (entities, value objects)
- **Application Layer**: Use cases, orchestration (Server Actions)
- **Infrastructure Layer**: External dependencies (DB, Redis, Auth)

## Key DDD Patterns Implemented

- ✅ **Aggregates**: Product, Order as aggregate roots
- ✅ **Value Objects**: Price, SKU, OrderStatus with invariants
- ✅ **Repository Pattern**: Interface in domain, implementation in infrastructure
- ✅ **Domain Events**: OrderCreated, ProductPriceChanged, etc.
- ✅ **State Machine**: OrderStatus with valid transitions
- ✅ **Result Type**: Railway-oriented programming for error handling

## Features

- Product catalog with categories
- Shopping cart (Redis sessions)
- Order placement workflow
- User authentication (Better-Auth)
- Admin dashboard
- Domain events infrastructure

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm
- Docker & Docker Compose

### Development

```bash
# Install dependencies
pnpm install

# Start infrastructure (PostgreSQL + Redis)
docker compose up -d db redis

# Setup environment
cp .env.example .env
# Edit .env with your values

# Push database schema
pnpm db:push

# Run development server
pnpm dev
```

Visit http://localhost:3000

### Production (Docker)

```bash
# Build and start all services
docker compose up -d --build

# View logs
docker logs -f ecommerce-app
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── modules/                # DDD Bounded Contexts
│   ├── catalog/
│   ├── orders/
│   └── identity/
└── shared/                 # Shared kernel
    ├── kernel/             # Result type, common types
    ├── domain-events/      # Event dispatcher
    └── infrastructure/     # DB, Redis, Auth
```

## Development Stats

- **Duration**: 10+ hours
- **Commits**: 14 with Conventional Commits
- **Lines of Code**: ~2,500
- **Bounded Contexts**: 3 (Catalog, Orders, Identity)
- **Domain Entities**: 2 (Product, Order)
- **Value Objects**: 3 (Price, SKU, OrderStatus)

## Testing

```bash
pnpm test        # Run tests (coming soon)
pnpm lint        # Run linter
pnpm type-check  # TypeScript check
```

## Deployment

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for deployment instructions.

## Documentation

- [Design Document](./docs/DESIGN.md)
- [Roadmap](./docs/ROADMAP.md)
- [Level 3 Proposal](../LEVEL-3-PROPOSAL.md)

## License

MIT
