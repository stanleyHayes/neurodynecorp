# NeuroDyne Corp

Full-stack project management platform built with a TypeScript/Go monorepo. Handles project intake via adaptive questionnaires, specification generation, sprint/task tracking, invoicing, real-time messaging, and file management.

## Architecture

```
apps/
  web/        Next.js marketing site
  admin/      React + MUI admin dashboard
  client/     React client portal
  mobile/     React Native (Expo) mobile app
  server/     Express.js API (TypeScript, hexagonal architecture)
  api/        Go gRPC + HTTP API (alternative backend)
packages/
  shared/     Shared types, constants, API client
infra/        Prometheus config
```

### Tech Stack

| Layer          | Technology                                                |
| -------------- | --------------------------------------------------------- |
| Frontend       | React, Next.js, React Native (Expo), MUI, TailwindCSS    |
| Backend (TS)   | Express.js, Zod validation, Pino logging                  |
| Backend (Go)   | gRPC + HTTP, Viper config                                 |
| Database       | MongoDB 7                                                 |
| Cache          | Redis 7                                                   |
| Events         | Apache Kafka (Confluent 7.7)                              |
| Auth           | JWT (access + refresh tokens), bcrypt                     |
| File Storage   | Cloudinary                                                |
| Email          | Resend                                                    |
| Payments       | Stripe / Paystack (configurable)                          |
| Monitoring     | Prometheus + Grafana                                      |

### Hexagonal Architecture (Server)

```
server/src/
  domain/          Entities and port interfaces
  app/             Application services (business logic)
  adapter/
    driving/       HTTP routes, WebSocket hub
    driven/        MongoDB repos, Redis, Kafka, email, auth
  middleware/      Auth, error handling, RBAC
```

## Prerequisites

- Node.js 20+ (see `.nvmrc`)
- pnpm 9+
- Go 1.22+ (for `apps/api`)
- Docker & Docker Compose

## Quick Start

```bash
# 1. Install dependencies
make install

# 2. Start infrastructure (MongoDB, Redis, Kafka, Prometheus, Grafana)
make infra

# 3. Copy and configure environment
cp apps/server/.env.example apps/server/.env

# 4. Start all services (infra + all apps)
make dev
```

### Individual Services

```bash
make server       # TypeScript API server    (port 4000)
make api          # Go API server            (port 8080 HTTP, 50051 gRPC)
make web          # Marketing site           (port 3000)
make client       # Client dashboard         (port 5173)
make admin        # Admin dashboard          (port 5174)
make mobile       # React Native / Expo
```

## Infrastructure

Docker Compose provides:

| Service     | Port  | Credentials       |
| ----------- | ----- | ----------------- |
| MongoDB     | 27017 | No auth (local)   |
| Redis       | 6379  | No password       |
| Kafka       | 9092  | -                 |
| Zookeeper   | 2181  | -                 |
| Prometheus  | 9091  | -                 |
| Grafana     | 3001  | admin / admin     |

```bash
make infra          # Start all containers
make infra-down     # Stop containers
make infra-clean    # Stop and remove volumes
```

## Environment Variables

All variables use the `NEURODYNE_` prefix. See [apps/server/.env.example](apps/server/.env.example) for the full list.

Key variables:

| Variable                        | Default                   | Description            |
| ------------------------------- | ------------------------- | ---------------------- |
| `NEURODYNE_PORT`                | `4000`                    | API server port        |
| `NEURODYNE_MONGODB_URI`         | `mongodb://localhost:27017` | MongoDB connection   |
| `NEURODYNE_MONGODB_DATABASE`    | `neurodyne`               | Database name          |
| `NEURODYNE_JWT_ACCESS_SECRET`   | `change-me-access-secret` | JWT signing secret     |
| `NEURODYNE_JWT_REFRESH_SECRET`  | `change-me-refresh-secret`| Refresh token secret   |
| `NEURODYNE_PAYMENT_PROVIDER`    | `paystack`                | `stripe` or `paystack` |

## Seed Data

The server auto-seeds development data on first run. All seeded accounts share the password **`Password123!`**.

See [credentials.txt](credentials.txt) for the full list of accounts and infrastructure credentials.

### Quick Login

| Role             | Email                              |
| ---------------- | ---------------------------------- |
| Admin            | admin@neurodynecorp.com            |
| Project Manager  | sarah.chen@neurodynecorp.com       |
| Developer        | maria.gonzalez@neurodynecorp.com   |
| QA               | priya.sharma@neurodynecorp.com     |
| Client           | david.kim@acmecorp.com             |

## API Documentation

- **OpenAPI 3.0 Spec**: [docs/openapi.yaml](docs/openapi.yaml)
- **Postman Collection**: [docs/neurodyne-api.postman_collection.json](docs/neurodyne-api.postman_collection.json)

### Swagger UI

To browse the API interactively, run Swagger UI with Docker:

```bash
docker run -p 8888:8080 \
  -e SWAGGER_JSON=/spec/openapi.yaml \
  -v $(pwd)/docs:/spec \
  swaggerapi/swagger-ui
```

Then open http://localhost:8888 in your browser.

### Base URL

```
http://localhost:4000/api/v1
```

### Authentication

Most endpoints require a Bearer token. Obtain one via login:

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@neurodynecorp.com","password":"Password123!"}'
```

Use the returned `accessToken` in subsequent requests:

```bash
curl http://localhost:4000/api/v1/projects \
  -H "Authorization: Bearer <accessToken>"
```

### API Endpoints

| Method   | Path                                        | Auth     | Roles                     |
| -------- | ------------------------------------------- | -------- | ------------------------- |
| `POST`   | `/auth/register`                            | Public   | -                         |
| `POST`   | `/auth/login`                               | Public   | -                         |
| `POST`   | `/auth/refresh`                             | Public   | -                         |
| `GET`    | `/auth/profile`                             | Bearer   | Any                       |
| `GET`    | `/users`                                    | Bearer   | admin                     |
| `GET`    | `/users/:id`                                | Bearer   | admin                     |
| `PATCH`  | `/users/:id`                                | Bearer   | admin                     |
| `DELETE` | `/users/:id`                                | Bearer   | admin                     |
| `POST`   | `/projects`                                 | Bearer   | Any                       |
| `GET`    | `/projects`                                 | Bearer   | Any (clients: own only)   |
| `GET`    | `/projects/:id`                             | Bearer   | Any                       |
| `PATCH`  | `/projects/:id/status`                      | Bearer   | admin, project_manager    |
| `PUT`    | `/projects/:id/team`                        | Bearer   | admin, project_manager    |
| `PATCH`  | `/projects/:id/progress`                    | Bearer   | admin, PM, developer      |
| `POST`   | `/specifications`                           | Bearer   | Any                       |
| `GET`    | `/specifications?project_id=`               | Bearer   | Any                       |
| `GET`    | `/specifications/:id`                       | Bearer   | Any                       |
| `POST`   | `/specifications/:id/approve`               | Bearer   | admin, PM, client         |
| `POST`   | `/specifications/:id/reject`                | Bearer   | admin, PM, client         |
| `POST`   | `/specifications/:id/notes`                 | Bearer   | admin, PM, dev, qa        |
| `GET`    | `/specifications/:id/pdf`                   | Bearer   | Any                       |
| `POST`   | `/tasks`                                    | Bearer   | Any                       |
| `GET`    | `/tasks`                                    | Bearer   | Any                       |
| `GET`    | `/tasks/:id`                                | Bearer   | Any                       |
| `PATCH`  | `/tasks/:id`                                | Bearer   | Any                       |
| `DELETE` | `/tasks/:id`                                | Bearer   | admin, project_manager    |
| `POST`   | `/tasks/sprints`                            | Bearer   | admin, project_manager    |
| `GET`    | `/tasks/sprints?projectId=`                 | Bearer   | Any                       |
| `GET`    | `/tasks/sprints/:id`                        | Bearer   | Any                       |
| `PATCH`  | `/tasks/sprints/:id`                        | Bearer   | admin, project_manager    |
| `DELETE` | `/tasks/sprints/:id`                        | Bearer   | admin, project_manager    |
| `POST`   | `/invoices`                                 | Bearer   | admin, project_manager    |
| `GET`    | `/invoices`                                 | Bearer   | Any (clients: own only)   |
| `POST`   | `/invoices/:id/paid`                        | Bearer   | admin, project_manager    |
| `POST`   | `/messages/threads`                         | Bearer   | Any                       |
| `GET`    | `/messages/threads`                         | Bearer   | Any                       |
| `GET`    | `/messages/threads/:threadId`               | Bearer   | Any                       |
| `POST`   | `/messages/threads/:threadId/messages`      | Bearer   | Any                       |
| `GET`    | `/messages/threads/:threadId/messages`      | Bearer   | Any                       |
| `GET`    | `/notifications`                            | Bearer   | Any                       |
| `PATCH`  | `/notifications/:id/read`                   | Bearer   | Any                       |
| `POST`   | `/notifications/read-all`                   | Bearer   | Any                       |
| `DELETE` | `/notifications/:id`                        | Bearer   | Any                       |
| `POST`   | `/files/upload`                             | Bearer   | Any                       |
| `GET`    | `/files?projectId=`                         | Bearer   | Any                       |
| `GET`    | `/files/:id`                                | Bearer   | Any                       |
| `DELETE` | `/files/:id`                                | Bearer   | Any                       |
| `GET`    | `/questionnaire/questions`                  | Public   | -                         |
| `POST`   | `/questionnaire/adaptive`                   | Public   | -                         |
| `POST`   | `/questionnaire/responses`                  | Bearer   | Any                       |
| `POST`   | `/questionnaire/complete`                   | Bearer   | Any                       |
| `POST`   | `/contact`                                  | Public   | -                         |

### WebSocket

Connect to `ws://localhost:4000/ws` with a valid access token for real-time updates.

### Importing the Postman Collection

1. Open Postman
2. Click **Import** > select `docs/neurodyne-api.postman_collection.json`
3. The collection includes pre-configured variables and auto-token scripts
4. Run **Login (Admin)** first to populate the `accessToken` variable
5. All subsequent requests will use the token automatically

## RBAC Roles

| Role              | Capabilities                                                           |
| ----------------- | ---------------------------------------------------------------------- |
| `admin`           | Full access to all resources and user management                       |
| `project_manager` | Manage projects, specs, tasks, sprints, invoices, team assignments     |
| `developer`       | View/update tasks, update project progress, add spec notes             |
| `qa`              | View tasks, add spec notes                                             |
| `client`          | View own projects and invoices, approve/reject specs, submit projects  |

## Build

```bash
make build          # Build all apps
make web-build      # Build marketing site only
make server-build   # Build server only
make api-build      # Build Go API only
```

## Deployment

### Production Checklist

1. **Secrets**: Replace all `change-me-*` JWT secrets with strong random values
2. **MongoDB**: Use MongoDB Atlas or a managed instance with authentication enabled
3. **Redis**: Enable password authentication
4. **CORS**: Set `NEURODYNE_CORS_ORIGINS` to your production domains
5. **Cloudinary**: Configure cloud name, API key, and secret for file uploads
6. **Email**: Set `NEURODYNE_RESEND_API_KEY` for transactional email
7. **Payments**: Configure Stripe or Paystack keys and webhook secrets
8. **HTTPS**: Terminate TLS at your load balancer / reverse proxy

### Docker (Production)

Build and run the server:

```bash
# From apps/server
docker build -t neurodyne-server .
docker run -p 4000:4000 --env-file .env neurodyne-server
```

### Vercel (Frontend Apps)

The admin and client dashboards include `vercel.json` for SPA routing. Deploy via:

```bash
cd apps/admin && vercel --prod
cd apps/client && vercel --prod
cd apps/web && vercel --prod
```

### Kubernetes / ECS

The production architecture targets AWS ECS Fargate:

- API server as a Fargate service behind an ALB
- MongoDB Atlas for the database
- ElastiCache (Redis) for caching
- Amazon MSK for Kafka
- CloudFront for frontend CDN
- Route 53 for DNS

## Monitoring

- **Prometheus** scrapes metrics from the API at port 9090 (configurable via `NEURODYNE_METRICS_PORT`)
- **Grafana** at http://localhost:3001 (admin/admin) for dashboards
- Prometheus config is in [infra/prometheus.yml](infra/prometheus.yml)

## Make Commands

```
make install       Install all dependencies (pnpm + Go)
make infra         Start Docker infrastructure
make infra-down    Stop infrastructure
make infra-clean   Stop + remove volumes
make dev           Start everything
make server        TypeScript API server
make api           Go API server
make web           Marketing site
make client        Client dashboard
make admin         Admin dashboard
make mobile        React Native app
make build         Build all apps
make proto         Generate protobuf code
make lint          Lint all apps
make clean         Remove build artifacts
```

## License

Proprietary - NeuroDyne Corp
