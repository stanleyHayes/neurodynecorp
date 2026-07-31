# NeuroDyne Corp — Architecture Overview

## Philosophy

NeuroDyne is a **productized software-engineering platform** built as a polyglot monorepo. The backend follows **Clean Architecture** (ports-and-adapters) so that infrastructure concerns — databases, message brokers, email gateways, payment providers — can be swapped without touching domain logic.

---

## Repository Layout

```
├── apps/
│   ├── web/          # Marketing site (React + Vite + MUI)
│   ├── client/       # Client dashboard (React + Vite + MUI)
│   ├── admin/        # Admin back-office (React + Vite + MUI)
│   ├── mobile/       # React Native mobile app (Expo)
│   ├── server/       # Primary Node.js API (Express + TS + tsx)
│   └── api/          # Go gRPC/HTTP gateway (protobuf + segmentio/kafka-go)
├── packages/
│   └── shared/       # Workspace-shared types, constants, and API client
├── infra/
│   └── prometheus.yml
├── docker-compose.yml          # Local infrastructure stack
├── docker-compose.prod.yml     # Production Docker blueprint
├── render.yaml                 # Render.com deployment blueprint
└── .github/workflows/          # CI/CD pipelines
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Web Frontends** | React 19, Vite, MUI v7, Framer Motion, React Router v7 |
| **Mobile** | React Native 0.84, Expo 55, React Navigation v7 |
| **Primary Server** | Node.js 20, Express 5, TypeScript 5/6, tsx (runtime) |
| **Go API** | Go 1.23, gRPC, protobuf, MongoDB driver, kafka-go |
| **Shared Package** | TypeScript (types-only, no emit) |
| **Databases** | MongoDB 7 (primary datastore), Redis 7 (cache / sessions) |
| **Messaging** | Kafka 3 (Confluent 7.7) via KafkaJS (TS) / kafka-go (Go) |
| **Real-time** | WebSocket (ws) + Socket.IO 4 |
| **Payments** | Stripe + Paystack (configurable provider) |
| **File Storage** | Cloudinary |
| **Email** | Resend |
| **Auth** | JWT (access + refresh), bcryptjs, RBAC with permissions |
| **Observability** | Prometheus metrics, Pino structured logging |
| **Package Manager** | pnpm 9 workspaces |

---

## Application Architecture

### Clean Architecture (Ports & Adapters)

`apps/server` follows a layered (hexagonal) structure:

```
┌─────────────────────────────────────────┐
│  Driving Adapters  (HTTP / gRPC / WS)   │
├─────────────────────────────────────────┤
│  Application Layer (services, workflows)│
├─────────────────────────────────────────┤
│  Domain Layer      (entities, values)   │
├─────────────────────────────────────────┤
│  Driven Adapters   (DB, cache, email)   │
└─────────────────────────────────────────┘
```

**Driving adapters** convert external protocols into domain calls.  
**Driven adapters** implement repository and service interfaces (ports) defined in the domain layer.

This means:
- MongoDB can be replaced with Postgres by writing a new driven adapter.
- Kafka can be disabled in dev; the server falls back to no-op stubs automatically.
- Redis is optional; missing Redis results in an in-memory no-op cache.

---

## Communication Patterns

### Primary Server (`apps/server`)
- **REST API** — `/api/v1/*` (auth, projects, specs, tasks, invoices, content, etc.)
- **WebSocket** — native `ws` hub for low-latency broadcasts
- **Socket.IO** — room-based real-time messaging & notifications
- **Metrics** — Prometheus scrape endpoint on `/metrics` (port 9090)
- **Public feeds** — RSS (`/feed.xml`) and sitemap (`/sitemap.xml`)


### Frontend → Backend
- `packages/shared` exports a typed `ApiClient` used by `web`, `client`, and `admin`.
- Socket.IO client connects for real-time notifications and messages.
- Mobile uses the same REST API via `api/client.ts`.

---

## Infrastructure (Local)

Run the full local stack with Docker Compose:

```bash
docker compose up -d
```

| Service | Host Port | Container Port | Purpose |
|---------|-----------|----------------|---------|
| MongoDB | 27018 | 27017 | Primary database |
| Redis | 6380 | 6379 | Cache / session store |
| Zookeeper | — | 2181 | Kafka coordination |
| Kafka | 9092 | 9092 | Event streaming |
| Prometheus | 9091 | 9090 | Metrics collection |
| Grafana | 3001 | 3000 | Metrics dashboards |

---

## Configuration

All apps use **environment variables** (no secrets in code). The Node server uses a typed `loadConfig()` helper with sensible dev fallbacks:

```bash
# Core
NEURODYNE_PORT=4000
NEURODYNE_HOST=0.0.0.0
NEURODYNE_ENV=development

# Datastores
NEURODYNE_MONGODB_URI=mongodb://localhost:27017
NEURODYNE_MONGODB_DATABASE=neurodyne
NEURODYNE_REDIS_HOST=localhost
NEURODYNE_REDIS_PORT=6379

# Auth
NEURODYNE_JWT_ACCESS_SECRET=...
NEURODYNE_JWT_REFRESH_SECRET=...

# External
NEURODYNE_RESEND_API_KEY=...
NEURODYNE_CLOUDINARY_CLOUD_NAME=...
NEURODYNE_STRIPE_SECRET_KEY=...
```

The Go API reads `config.yaml` locally but also supports env overrides for containerized deployments.

---

## Deployment

### Render (Recommended)

A `render.yaml` blueprint is provided for one-click deployment:

- **Node Server** — Docker service built from `apps/server/Dockerfile`
- **MongoDB** — Managed MongoDB (Render) or Docker service
- **Redis** — Managed Redis (Render) or Docker service

See `render.yaml` and `docker-compose.prod.yml` for details.

### Self-Hosted (Docker Compose)

```bash
docker compose -f docker-compose.prod.yml up -d
```

Production compose runs:
- Node server (port 4000)
- Go API (ports 8080, 50051)
- MongoDB + Redis
- Nginx reverse proxy (optional)

---

## CI/CD

GitHub Actions workflows cover:

1. **Server CI** — lint, typecheck, test (with MongoDB + Redis services), build
2. **Web CI** — lint, typecheck, build for `web`, `client`, and `admin`
3. **API CI** — Go lint, test (with MongoDB + Redis), build
4. **Deploy** — unified workflow that triggers Render deploy hooks on `main` merges

All workflows use `pnpm/action-setup@v4` with Node 20 and pnpm 9.

---

## Development Commands

```bash
# Install everything
pnpm install

# Start infrastructure
docker compose up -d

# Start all apps in parallel
pnpm dev

# Or individually
pnpm dev:server
pnpm dev:web
pnpm dev:client
pnpm dev:admin

# Lint / typecheck / test
pnpm lint
pnpm typecheck
pnpm --filter @neurodyne/server test

# Go API
```

---

## Notable Patterns

- **Graceful shutdown** — SIGINT/SIGTERM handlers close MongoDB, Kafka, WebSocket, and HTTP connections in order.
- **Health checks** — `/health` (liveness) and `/readiness` (MongoDB connectivity) for orchestrators.
- **Feature flags via env** — Kafka, Redis, and email are all optional and degrade gracefully.
- **RBAC** — Roles + fine-grained permissions (`resource:action`) enforced at middleware level.
- **Event-driven workflows** — `WorkflowEngine` listens to Kafka topics to trigger notifications and state transitions.
