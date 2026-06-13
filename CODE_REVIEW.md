# NeuroDyne Corp — Platform Code Review

**Date:** 2026-06-13  
**Scope:** Entire monorepo (`apps/web`, `apps/client`, `apps/admin`, `apps/mobile`, `apps/server`, `apps/api`, `packages/shared`, infrastructure, CI/CD)  
**Working tree state:** Active development branch with many modified and untracked files. Findings reflect the current working tree.

---

## Executive Summary

The platform has a coherent high-level architecture (Clean Architecture / Ports & Adapters, polyglot TS/Go monorepo, solid local infrastructure via Docker Compose) and has made significant progress closing trust/operations gaps (audit, status page, DSR, consent, feature flags, webhooks, API keys, newsletters, KB). However, the codebase is not production-ready without addressing several **critical security vulnerabilities**, **architectural inconsistencies**, and **operational gaps**.

### Risk Rating: **HIGH**

The most severe issues allow unauthenticated account takeover, data exfiltration across accounts, NoSQL injection, and payment fraud. These are not edge cases — they are reachable through normal API usage.

### Snapshot from Automated Checks

| Check | Result | Notes |
|-------|--------|-------|
| `pnpm lint` | ❌ Fails | `apps/server`: 4 ESLint errors, 54 warnings (mostly `any`) |
| `pnpm typecheck` | ⚠️ Skipped / passes lightly | Server skips `tsc`; strict mode has **197 errors** |
| `apps/server` tests | ✅ 4 pass | Only 2 test files for ~19k LOC |
| `apps/api` `go test ./...` | ✅ Passes | Many packages have no tests |

---

## Critical Findings (P0 — Fix Before Any Production Deploy)

### 1. Anyone Can Register as an Admin
- **File:** `apps/server/src/adapter/driving/http/auth-routes.ts:11-19`, `apps/server/src/app/auth-service.ts:129`
- **Issue:** The public registration schema accepts an optional `role` field that includes `"admin"`. An unauthenticated attacker can create a fully privileged admin account.
- **Fix:** Remove `role` from public registration; default to `"client"`. Add a separate admin-only endpoint for role assignment.

### 2. NoSQL Injection in Public List Endpoints
- **File:** `apps/server/src/adapter/driving/http/content-routes.ts:41-52`, `apps/server/src/adapter/driven/mongodb/content-repository.ts:38-49`
- **Issue:** Query parameters are copied directly into MongoDB filters. Express parses nested query objects, so `?status[$ne]=null` injects operators and bypasses publication filters.
- **Fix:** Whitelist and coerce every filter value with Zod before passing to repositories. Same issue exists in `kb-routes.ts` and other content modules.

### 3. Committed Secrets and Credentials
- **Files:** `credentials.txt` (root), `apps/server/.env`
- **Issue:** Plaintext credentials file contains seeded passwords (`Password123!`), JWT secrets, and infrastructure defaults. `.env` is also present in the server app.
- **Fix:** `git rm --cached` both files, add to `.gitignore`, rotate every secret/password referenced, and audit git history.

### 4. Payment Status Is Trusted Without Verification
- **Files:** `apps/server/src/adapter/driving/http/invoice-routes.ts:92-114`, `apps/server/src/app/billing-service.ts:123-154`
- **Issue:** `POST /invoices/:id/paid` marks an invoice paid based only on a client-supplied `paymentId`. No Stripe/Paystack webhook handlers verify payment completion.
- **Fix:** Implement provider webhooks with signature verification (`stripe.webhooks.constructEvent` / Paystack HMAC) and verify payment status with the gateway before marking paid.

### 5. Insecure Direct Object Reference (IDOR) Across Core Resources
- **Files:** `apps/server/src/adapter/driving/http/message-routes.ts`, `task-routes.ts`, `spec-routes.ts`, `project-routes.ts`, `notification-routes.ts`, `questionnaire-routes.ts`
- **Issue:** Authenticated users can read/create/update other users' projects, specs, tasks, messages, threads, sprints, notifications, and questionnaire responses because there is no project/membership authorization.
- **Fix:** Add a centralized `assertProjectAccess(userId, projectId)` helper and enforce it on every resource-scoped endpoint. Apply row-level filtering in repositories.

### 6. Go API Environment Variable Prefix Mismatch Breaks Production Config
- **Files:** `apps/api/pkg/config/config.go:69`, `docker-compose.prod.yml`, `render.yaml`, `.github/workflows/api.yml`
- **Issue:** Viper uses `NEURODYNE_` prefix, but deployment configs set unprefixed vars (`MONGODB_URI`, `JWT_SECRET`). They are silently ignored.
- **Fix:** Either remove `SetEnvPrefix` or update every deployment file/workflow to use `NEURODYNE_` consistently.

### 7. Weak Default JWT Secrets in Both Backends
- **Files:** `apps/server/src/config/index.ts:130-131`, `apps/api/config.yaml:21`, `apps/api/Dockerfile:19`
- **Issue:** Dev fallbacks/hardcoded defaults like `dev-access-secret-change-me` and `change-me-in-production...` ship with the code.
- **Fix:** Remove fallback secrets; fail fast at startup if secrets are missing or too short.

### 8. Go API Stores Plaintext Passwords
- **File:** `apps/api/internal/app/onboarding_service.go:117-118`
- **Issue:** `user.PasswordHash = password` stores the raw caller-supplied password. No hashing is enforced.
- **Fix:** Inject a `PasswordHasher` port and hash before storage.

### 9. Webhook Test Endpoint Is an SSRF Vector
- **File:** `apps/server/src/adapter/driving/http/webhook-routes.ts:135-179`
- **Issue:** `fetch(sub.url)` has no URL allowlist, no timeout, follows redirects, and can hit internal services.
- **Fix:** Restrict to public HTTPS, validate host, disable redirects, set short timeout, and deliver from a queue/worker.

---

## High Findings (P1)

### Security

| Issue | Location | Recommended Fix |
|-------|----------|-----------------|
| Refresh tokens never stored, single-use, or revoked | `apps/server/src/app/auth-service.ts:181-201`, `apps/server/src/adapter/driven/auth/jwt.ts:41-52` | Store hashed refresh tokens with device metadata; enforce single-use and revocation on logout/password change |
| Auth middleware does not re-verify user exists/active | `apps/server/src/middleware/auth.ts:35-43` | Re-check user status for sensitive actions; issue short-lived access tokens |
| Webhook/API key secrets stored and returned in plaintext | `apps/server/src/adapter/driven/mongodb/webhook-repository.ts:33`, `api-key-routes.ts:52-54` | Hash secrets with bcrypt/argon2; reveal only once at creation |
| API key feature is unenforced | `apps/server/src/adapter/driving/http/api-key-routes.ts` | Implement API-key auth middleware with scope checks; use slow hash |
| Auth endpoints have no rate limiting | `apps/server/src/adapter/driving/http/auth-routes.ts:44-101` | Apply existing `rateLimit` middleware to login/refresh/register |
| File uploads lack type/filename validation and ownership checks | `apps/server/src/adapter/driving/http/file-routes.ts:66-129`, `cloudinary/storage.ts:21-47` | Whitelist MIME types, sanitize filename/public_id, enforce project ownership on read/delete |
| Mass assignment via raw `req.body` merge | `apps/server/src/adapter/driving/http/content-routes.ts:88-97` | Add strict `updateSchema` per resource |
| Public content endpoints return drafts when no status filter is supplied | `apps/server/src/adapter/driving/http/content-routes.ts:126-193` | Force `status: "published"` server-side on public routes |
| Socket.IO CORS wildcard | `apps/server/src/adapter/driving/websocket/socket-io-hub.ts:27-33` | Restrict to the same allowlist as HTTP CORS |
| Raw WebSocket hub allows any origin and arbitrary project room subscription | `apps/server/src/adapter/driving/websocket/hub.ts:36-57,125-149` | Validate origin and project membership |
| User with `team:update` can elevate self/others to admin | `apps/server/src/adapter/driving/http/user-routes.ts:79-110`, `role-routes.ts:179-227` | Prevent self-elevation and protect last admin; require higher privilege for admin assignment |
| Contact form subject/body used raw in outbound email | `apps/server/src/adapter/driving/http/contact-routes.ts:53`, `index.ts:413-434` | Strip CR/LF, sanitize headers, rate limit |
| Go API regex injection in search | `apps/api/internal/adapter/driven/mongodb/user_repository.go:105-111`, `project_repository.go:95-100` | Escape with `regexp.QuoteMeta` or use `$text` search |
| Go API has no resource-level authorization | `apps/api/internal/adapter/driving/http/project_handler.go`, `task_handler.go`, etc. | Enforce ownership/role checks in application services |
| Go API custom WebSocket parser lacks security checks | `apps/api/internal/adapter/driving/http/websocket.go:232-462` | Replace with `gorilla/websocket` or `nhooyr/websocket` |
| Go Kafka subscriber silently drops failed messages | `apps/api/internal/adapter/driven/kafka/subscriber.go:30-64` | Implement manual commits, retry, and dead-letter topic |

### Architecture & Code Quality

| Issue | Location | Recommended Fix |
|-------|----------|-----------------|
| App services re-declare domain types instead of importing from `domain/entity` | `apps/server/src/app/*-service.ts` | Single source of truth in `domain/entity`; remove duplicate interfaces |
| Most gap-audit repositories do not implement declared ports | `apps/server/src/adapter/driven/mongodb/*-repository.ts` | Define all ports in `domain/port` and use `implements` |
| Business logic leaks into route handlers | `status-routes.ts`, `feedback-routes.ts`, `dsr-routes.ts`, `index.ts:558-601` | Move rule logic into application services |
| No MongoDB transactions | All server repositories | Add unit-of-work/session abstraction; use `withTransaction` |
| Strict TypeScript disabled; 197 strict errors | `apps/server/tsconfig.json` | Enable strict mode and fix errors incrementally |
| Widespread `any` / `as any` | 69 occurrences in server | Replace with proper port interfaces and generics |
| Tests are extremely sparse | 2 test files, 4 tests for ~19k LOC | Add unit + integration tests |
| Fire-and-forget errors swallowed silently | `index.ts:431`, `audit-routes.ts:137`, etc. | At minimum log failures; never drop audit writes silently |
| Error handler may log sensitive request bodies/tokens | `apps/server/src/middleware/error-handler.ts:54-76` | Implement redacting serializer |

### Frontend

| Issue | Location | Recommended Fix |
|-------|----------|-----------------|
| No automatic token refresh | `packages/shared/src/api-client.ts:52-55` | Implement refresh queue and retry in-flight requests |
| Tokens stored in `localStorage` / `AsyncStorage` | `apps/admin/client/mobile auth contexts` | Move to `httpOnly` cookies on web; Keychain/Keystore on mobile |
| Admin routes not guarded by role/permission | `apps/admin/src/App.tsx:87-135`, `ProtectedRoute.tsx` | Add `RoleProtectedRoute` / `PermissionProtectedRoute` |
| `hasPermission` defaults to allow-all when empty | `apps/admin/src/context/AuthContext.tsx:103-108` | Default to deny-all |
| Invalid TypeScript version pin (`^6.0.2`) | All frontend `package.json` | Pin valid version (e.g., `^5.7.0`) |
| `apps/mobile` not in pnpm workspace | `pnpm-workspace.yaml` | Add `apps/mobile` |
| Mobile auth routing broken | `apps/mobile/src/navigation/AppNavigator.tsx`, `useAuth.tsx` | Gate navigator on auth state; restore session on launch |
| Mobile uses inconsistent API URLs | `apps/mobile/src/api/client.ts:3`, `useAuth.tsx:4`, `useSocket.ts:5` | Single `API_URL` constant from env |
| Admin/client `vite.config.ts` default API ports differ | `apps/web/vite.config.ts`, `apps/admin/client/vite.config.ts` | Standardize or document |

### Infrastructure / DevOps

| Issue | Location | Recommended Fix |
|-------|----------|-----------------|
| `render.yaml` repo URL is wrong | `render.yaml:10,42` | Update to actual remote |
| Prometheus scrape target uses `host.docker.internal` | `infra/prometheus.yml:8` | Use service DNS or templatize |
| Prometheus path labels include IDs (high cardinality) | `apps/api/pkg/metrics/metrics.go:49-56` | Route-ify paths before labeling |
| Dockerfiles run as root | `apps/server/Dockerfile`, `apps/api/Dockerfile` | Add non-root user |
| Production Compose omits Kafka | `docker-compose.prod.yml` | Add Kafka/ZK or remove Kafka dependency |
| Production MongoDB/Redis have no auth | `docker-compose.prod.yml` | Enable auth, internal network |
| GitHub Actions env vars mismatch Go API prefix | `.github/workflows/api.yml`, `ci.yml` | Align with config loader |
| No security scanning in CI | `.github/workflows/*.yml` | Add `gosec`, `govulncheck`, secret scanning |

---

## Medium Findings (P2)

- **Rate-limit bypass via `X-Forwarded-For` spoofing** (`middleware/rate-limit.ts:30-34`)
- **Honeypot helper unused** in public forms
- **`/metrics` publicly accessible** (`index.ts:494`)
- **Readiness endpoint leaks error messages** (`index.ts:483-491`)
- **Dev CORS allows any localhost origin with credentials** (`index.ts:455-468`)
- **`ObjectId` validation inconsistent** — some repos throw 500 on malformed IDs
- **Replace-one updates lose atomicity** — use `$set` partial updates
- **Missing indexes** on gap-audit collections
- **Unbounded list endpoints** lack default pagination
- **No request correlation IDs**
- **Redis connection not closed on shutdown**
- **No-op Redis/Kafka stubs typed as `any`**
- **Go gRPC server is dead code** — either wire it up or remove
- **Go HTTP server has no timeouts**
- **Go API CORS wildcard**
- **Two WebSocket hubs instantiated in Go API**
- **Go Dockerfile copies `config.yaml` with default secret**
- **Makefile `proto` target outputs to non-existent dir**
- **Duplicated UI components across web/client/admin** — extract to `packages/ui`
- **Inconsistent `tsconfig` strictness** across frontend apps

---

## Recommended Remediation Roadmap

### Phase 1 — Stop the Bleeding (1–2 weeks)
1. Fix admin self-registration and remove `role` from public registration.
2. Fix NoSQL injection in all content/list endpoints by coercing query params through Zod.
3. Remove `credentials.txt` and `apps/server/.env` from git; rotate all secrets.
4. Implement real payment webhook verification (Stripe + Paystack).
5. Add project/resource authorization checks to messages, tasks, specs, projects, notifications.
6. Fix Go API env prefix mismatch and remove weak default JWT secrets.
7. Hash passwords in Go API onboarding.

### Phase 2 — Harden Auth & Session Layer (1–2 weeks)
1. Implement refresh-token persistence, binding, and revocation.
2. Add rate limiting to auth endpoints.
3. Move web tokens to `httpOnly` cookies; mobile to secure storage.
4. Implement automatic token refresh in the shared API client.
5. Add role/permission guards to admin routes.
6. Fix mobile auth routing and workspace inclusion.

### Phase 3 — Architecture & Quality (2–4 weeks)
1. Enable TypeScript strict mode and fix the 197 errors.
2. Centralize domain types in `domain/entity`; remove duplicates from app services.
3. Define repository ports for all aggregates and enforce `implements`.
4. Move business rules from route handlers into app services.
5. Add MongoDB transactions / outbox pattern for multi-step writes.
6. Refactor repositories with a shared generic base to reduce duplication.
7. Expand test coverage (unit + integration).

### Phase 4 — Operations & Production Readiness (1–2 weeks)
1. Fix `render.yaml` repo URL, secrets, and missing Kafka.
2. Run containers as non-root; remove default secrets from images.
3. Fix Prometheus targets and high-cardinality labels.
4. Add security scanning to CI (`gosec`, `govulncheck`, secret scanner).
5. Enable MongoDB/Redis auth in production Compose.
6. Add request correlation IDs and redacting error logger.

---

## Positive Observations

- **Clean Architecture intent is clear** and the repository layout is sensible.
- **Helmet, bcrypt (12 rounds), Zod, RBAC middleware** provide a solid security baseline.
- **Pino structured logging** and Prometheus metrics are wired in.
- **Audit logging** is implemented for mutating requests.
- **`security.txt`** and trust/legal pages show security consciousness.
- **Shared `ApiClient`** centralizes request handling across frontends.
- **Graceful shutdown logic** exists and covers most critical resources.
- **Docker Compose local stack** with health checks makes local development straightforward.

---

## Files Referenced Most Frequently

- `apps/server/src/index.ts` — bootstrap, route wiring, shutdown
- `apps/server/src/config/index.ts` — config loader and weak defaults
- `apps/server/src/adapter/driving/http/auth-routes.ts` — admin registration
- `apps/server/src/adapter/driving/http/content-routes.ts` — NoSQL injection / mass assignment
- `apps/server/src/adapter/driving/http/webhook-routes.ts` — SSRF, plaintext secrets
- `apps/server/src/adapter/driving/http/invoice-routes.ts` — payment fraud
- `apps/server/src/adapter/driving/http/message-routes.ts`, `task-routes.ts`, `spec-routes.ts`, `project-routes.ts` — IDOR
- `apps/server/src/middleware/auth.ts` — stale token validation
- `apps/server/src/app/*-service.ts` — duplicate domain models
- `apps/server/src/adapter/driven/mongodb/*-repository.ts` — port compliance, transactions
- `packages/shared/src/api-client.ts` — no token refresh
- `apps/admin/src/context/AuthContext.tsx` — localStorage tokens, allow-all permissions
- `apps/mobile/src/hooks/useAuth.tsx`, `navigation/AppNavigator.tsx` — broken auth routing
- `apps/api/pkg/config/config.go` — env prefix mismatch
- `apps/api/config.yaml`, `Dockerfile` — weak default secret
- `render.yaml` — wrong repo URL

---

*Review generated by static analysis of the working tree plus `pnpm lint`, `pnpm typecheck`, `apps/server` tests, and `apps/api` `go test ./...`.*
