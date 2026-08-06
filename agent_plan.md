# Agent Plan — Spec Feature Gaps to Build

**Source spec:** XCreativs Web Platform Specification v1.0 (15 May 2026)
**Implemented in:** NeuroDyne Corp monorepo (`apps/server` Express/Mongo hexagonal, `apps/web|client|admin` React/Vite/MUI, `apps/mobile` Expo)
**Date:** 2026-06-13

## Hardening loop (6 August 2026)

**Goal:** Walk the monorepo end-to-end eliminating authz/IDOR/mass-assignment holes,
tightening production guards, then fixing admin → client → mobile → web contract bugs.
**Cadence:** Agent loop every 15 minutes (`AGENT_LOOP_TICK_harden`) until stopped.
**Priority:** server security first, then portal contracts, then Go API parity.

- [x] **Pass 1 — public CMS draft leak, content CREATE schemas, admin lockout, rate-limit IP spoofing, contact limiter, newsletter token unsubscribe, activity PII load, client message participant allowlist, auth refresh rate limit.**
- [x] **Pass 2 — WS query JWT ban, client-only approval decisions, tickets:read inbox gate, public flag allowlist + maintenance guard, consent PII strip, DSR email bind + fulfillment evidence, trust mfa:false, hide client API keys without apikeys:*.**
- [x] **Pass 3 — admin AuthProvider wrap (CommandPalette crash), password-reset ApiClient constructor, status components GET + incident update shape, KB status=all, BlogCreate save/publish, project create casing + clientId list filter, DSR complete fulfillmentNote.**
- [x] **Pass 4 — project create client ownership, feedback score null 400, contact status updates, role permission matrix from API, invoice send + draft pay gate, admin new message thread, mobile thread open/send.**
- [x] **Pass 5 — spec generate questionnaire completedAt/array fix, ProjectDetail status/team/progress controls, SpecDetail approve/reject, client createThread, Documents listFiles, upload projectId support.**
- [x] **Pass 6 — files list `{items}` shape, listUsers dual keys, user activate/deactivate + camelCase PATCH, Pipeline status moves, client spec approve, notification dismiss, mobile documents/files + honest Stripe pay.**

## Operational repairs (5 August 2026)

- [x] **Admin self-service profile update.** Replaced the hard-coded settings form with authenticated
  account data, added validated `GET/PATCH /api/v1/auth/profile` service methods, persisted name/phone/
  company changes without requiring team-management permission, synchronized the auth context and header,
  and added save/error/loading feedback. Removed the non-functional avatar upload affordance. Admin and
  server lint now have no errors; admin typecheck/build, server tests/strict typecheck, and diff checks pass.
- [x] **Admin dead create forms.** Wired `ServiceCreate`, `TestimonialCreate`, and `TeamCreate` to the API
  (create service/testimonial; register + role assign for staff). Appearance settings now drive real
  `ThemeContext` mode. Stubbed security/notification tabs no longer pretend to save. Finance no-op
  "New Invoice" replaced with an honest placeholder notice. Command palette Sign Out clears the session.
- [x] **Client identity + settings.** Header no longer hardcodes "David Kim"; Settings profile saves via
  `PATCH /auth/profile`; command palette Sign Out clears tokens; notification rows mark-as-read on click;
  fake "Pay Now" replaced with contact-PM copy.
- [x] **Client team visibility (backend).** Project list/detail now embed `assigned_team_members` display
  profiles so clients (who lack `team:read`) can see assigned staff without IDOR-prone user lookups.
- [x] **Honest password-reset UX.** Admin/client Forgot Password no longer fakes a successful email send;
  both surfaces tell users to contact support until a real reset API exists. Web command palette
  "Book a Discovery Call" now routes to `/book` instead of `/contact`.
- [x] **Mobile ↔ client portal parity (core).** Mobile profile can save name/phone/company via the same
  `PATCH /auth/profile` path; Projects open a detail screen with progress, milestones, and embedded
  `assigned_team_members` (fixing dead project taps).
- [x] **CI pnpm mismatch.** GitHub Actions pinned pnpm 9 while `packageManager` is pnpm@11.20.0; workflows
  now follow `packageManager`. Admin route permissions are enforced on direct URL access (not only
  sidebar hide), and Dashboard/Analytics show honest placeholder notices like Finance.
- [x] **Backend authz / IDOR hardening.** Task CRUD and sprint reads now require `tasks:*` permissions and
  project-owner checks for clients. User `PATCH` no longer accepts `role` (escalation must use
  `/roles/assign`). Notifications mark-read/delete are ownership-scoped. Message thread lists by
  `projectId` filter to participants for non-staff. Invoice list requires `finance:read` for staff and
  ignores clientId spoofing by clients. Spec and file GETs enforce project ownership. Invoice
  `markPaid` is an atomic conditional update to prevent duplicate `invoice.paid` events.
- [x] **Backend authz pass 2.** Questionnaire save/complete enforce project ownership. API keys and
  webhooks require `apikeys:*` / `webhooks:*` (no longer any-auth). Webhook URLs are SSRF-checked.
  Realtime project subscribe is ownership-gated; Socket.IO client message broadcast removed. Clients
  get `specifications:read/update` so approve/reject matches README. Admin/client `hasPermission`
  fails closed on empty permission arrays. Non-admins cannot assign the admin role.
- [x] **API client ↔ server contract fixes.** Shared client now sends camelCase bodies/params the
  server validates (`projectId`, PATCH tasks, `/invoices/:id/paid`). Server schemas also accept
  snake_case aliases for questionnaire/spec/task/invoice/team so older callers keep working.
- [x] **Backend authz / ops pass 3.** Socket.IO CORS uses the server allowlist (not `*`). Stripe/
  Paystack payment webhooks verify signatures and mark invoices paid. Password reset API + admin/
  client UI wired; Resend adapter always exposes welcome/reset methods. Auth public endpoints are
  rate-limited. Invoice `GET /:id` added with ownership checks. Mobile `hasPermission` fails closed.
  In-memory cache fallback when Redis is down (so reset tokens work locally).

This plan lists **features named in the spec that are NOT yet present in the codebase** (or only
partially present), so they can be built out. It is the complement to
[`docs/PLATFORM_GAP_AUDIT.md`](docs/PLATFORM_GAP_AUDIT.md), which covers cross-cutting capabilities
the spec never named. Here we go layer-by-layer through the spec itself.

**Legend:** `[ ]` not started · `[~]` partial (exists but below spec) · `[x]` done.
Each item notes **what to build** and **where** (app · server module).

## Mobile store production readiness (4 August 2026)

- [x] **Apple/Google policy implementation audit.** Mobile is now part of the pnpm 11 workspace and aligned with Expo SDK 55 / React Native 0.83.10. Release config targets Android API 36, iOS 15.1+, uses store-safe versioning, valid icon/splash assets, HTTPS production endpoints, encrypted SecureStore session storage, session restoration, and no unnecessary native permissions. Apple privacy-manifest data types match the app's account and private-messaging flows; tracking is disabled.
- [x] **Account, privacy, and completeness controls.** Profile exposes working privacy/terms/support links, authenticated data-export and permanent-deletion requests, a clear destructive confirmation, and pending-request state. Public `/account-deletion` supplies Google Play's required web path. Dead profile/document actions were removed, signup has a working portal route, and external invoice payment is explicitly for professional services delivered outside the app.
- [x] **Submission package.** `apps/mobile/eas.json` defines preview/production App Bundle builds with remote auto-incrementing versions. `apps/mobile/store/STORE_SUBMISSION.md` contains store copy, review notes, privacy/Data Safety mappings, console declarations, and the release checklist. Dependency check, TypeScript, ESLint, Expo Doctor 19/19, public config evaluation, and clean iOS/Android prebuild passed; the generated Android release manifest retains only Internet access.
- [ ] **External release evidence.** Requires the owner's Apple Developer and Google Play accounts, signing credentials, EAS project association, legal approval, representative screenshots, a dedicated seeded reviewer account, physical-device regression testing, TestFlight/internal-track artifacts, and completed store-console questionnaires. These cannot be manufactured or committed safely.

What already exists and is NOT re-listed: dark/light theme (web), newsletter (double opt-in),
status page, trust center, help/KB, legal pages, audit log, feature flags, webhooks, scoped API
keys, DSR/consent, feedback/NPS, changelog, invoices/billing, messages, notifications, basic
project intake (`/start-project` questionnaire), portfolio, blog, client Security page.

---

## Layer 01 · Public Surface (§5)

Current public routes: Home, About, Services (single page), Portfolio, Blog, Contact, Start-Project,
+ status/trust/help/legal/changelog/spec-library. Missing the firm's "altitude" pages:

- [x] **Services — five deep pages** (§5.3). `/services/:slug` for `audit`, `enterprise`, `ai`,
  `digital`, `advisory` — each with positioning, methodology, deliverables, indicative timeline +
  price band, sample work, FAQ, and tailored intake CTA. Linked from a new "Service lines" section on
  `/services`. _(apps/web: `ServiceDetail.tsx` + `data/serviceLines.ts`. Content is in-file; promote to
  CMS later.)_
- [x] **Labs** (§5.4). `/labs` overview (operating loop Mandate→Build→License→Spin-out + product grid),
  `/labs/:slug` product page (problem, platform, capabilities, architecture, sectors, request-access
  CTA) seeded with ILIVVON + 24H+ Authority Intelligence. _(apps/web: `Labs.tsx`, `LabsProduct.tsx`,
  `data/labs.ts`. A CMS-backed `labs` server module can follow.)_
- [x] **Subsidiaries** (§5.5). `/subsidiaries` with parent→Services/Labs/Subsidiaries note + portfolio
  cards showing honest status (Active / In formation / Planned), relationship, leadership.
  _(apps/web: `Subsidiaries.tsx`. CMS-backing later.)_
- [x] **Case Dossiers** (§5.6). `/portfolio` upgraded to "Case Dossiers" — declassified-brief format
  (brief, constraint set, architecture chosen, what shipped, what was retained as IP, what was learnt) +
  faceted filtering (category/sector/service-line/scale/stage) + per-dossier detail at `/portfolio/:slug`
  (`PortfolioDetail.tsx`, slug→id fallback fetch). Full stack: `CaseStudy` entity extended (slug + facets
  + narrative), repo `findBySlug`, `/slug/:slug` route + facet `filterKeys`, **12 dossiers seeded** from the
  real portfolio, sitemap emits dossier URLs, cards navigate via SPA router, and the admin create form now
  persists with all dossier fields. Adversarially reviewed (3 agents) and the findings fixed.
  _Known follow-ups: admin **edit** mode/route (PATCH exists, no UI yet); hoist facet option lists into
  `packages/shared` so admin form and web facets can't drift; card keyboard-a11y._
- [x] **Industries** (§5.7). `/industries` overview + `/industries/:slug` for Government, Health,
  Financial Services, Insurance, Retail/Commerce, Energy, Education, NGO/Development — each maps the
  capability lattice to sector challenges + relevant work + sector-specific intake CTA. _(apps/web:
  `Industries.tsx`, `IndustryDetail.tsx`, `data/industries.ts`. CMS-backing later.)_
- [~] **Insights** (§5.8). `/blog` exists ≈ field notes. Missing the unified Insights library that holds
  three content types (field notes, long-form theses w/ gated download, whitepapers), each
  taggable/searchable/dated/author-attributed/**RSS-syndicated**. See also Layer 06. _(apps/web · extend `content`)_
- [x] **FAQ** (§5.9). `/faq` — working reference grouped by 8 categories (engagement model, pricing, IP,
  government work, timelines, team, security/compliance, post-launch) as accordions, with FAQPage
  JSON-LD. _(apps/web: `FAQ.tsx`. CMS-backing later.)_
- [x] **Press / Newsroom** (§5.10). `/press` — releases, media coverage, media kit (brand assets +
  one-pager download stubs), awards, speaking engagements, press contact. _(apps/web: `Press.tsx`. CMS +
  real asset files later.)_

> **Phase A public pages — shipped this pass.** New routes wired in `apps/web/src/App.tsx`; all new
> pages reachable from the Footer ("Company" + "Resources"). Web app type-checks clean and
> `pnpm build` succeeds. New shared kit: `apps/web/src/components/shared/Marketing.tsx`
> (Overline / SectionHeading / InfoCard / CardGrid / CTABand). Primary `NAV_ITEMS` left at 6 entries
> because the Navbar + onboarding GridMenu hardcode a 6-item (3×2) grid; promote pages into the primary
> nav only alongside a grid-layout refactor. Content is in-file structured data (matching the About/
> Trust/Legal convention) — ready to be promoted to CMS-backed server modules later.

## Layer 02 · Lead Qualification & Intake (§6)

`/start-project` is a multi-step questionnaire; `BookACall` is a mailto/Calendly stub. The structured
qualification system is mostly missing:

- [x] **Adaptive Project Discovery Brief** — `/start-project` now uses a server-backed draft → resume →
  submit lifecycle with category-specific questionnaires distilled from the supplied cleaning,
  photography, and luxury-interior DOCX discovery forms, plus the general digital-product path. Public
  prospects resume with a high-entropy private key stored on their device; signed-in clients get
  account-bound drafts and a new portal **Start a Project** page. Both surfaces include an optional
  server-side OpenAI Responses API brief copilot (deterministic coaching fallback when unconfigured),
  whose suggestions never silently overwrite answers. Submission sends owner + client email, locks the
  brief, and appears in the admin **Project Briefs** inbox with category-aware review. Public-key and
  owner access are 404-hardened; admin reads require admin/PM role. _(server `project-intake` module +
  shared schema/API client + apps/web, apps/client, apps/admin)_
  **Deployment polish:** intake coverage expanded from 4 to 18 researched categories spanning
  commerce, professional services, health, education, nonprofit/community, hospitality, property,
  construction/home services, wellness, events, creative/media, government, logistics, and personal
  brands while retaining the three document-derived specialist branches. `neurodyne.dev` is now the
  canonical public origin; SEO defaults, service structured data, sitemap/robots, private-app noindex
  headers, Render/Vercel host configuration, rate limits, and a production deployment runbook are in place.

- [x] **Engagement Readiness Diagnostic** (§6.1). New self-contained `diagnostic` server module
  (entity + Mongo repo + routes, NOT bolted onto the project-scoped questionnaire): a 10-question
  branching tree with **server-authoritative weighted scoring + ordered hard gates** → one of
  Services / Labs collaboration / Government Digital Excellence Initiative / decline-with-referral,
  plus a deterministic **one-page summary** (downloadable as text, printable to PDF via scoped
  `@media print`). Public `/api/v1/diagnostic/{questions,next,submit}` (rate-limited), admin
  `/api/v1/diagnostic` + `/:id` (`diagnostic:read`). Web flow at `/diagnostic`; admin inbox at
  `/diagnostics`. Adversarially reviewed (3 agents, all "works") and findings fixed (orphaned-answer
  scoping, single-select normalization, print-scoping, list cap). _(server `diagnostic` module +
  apps/web `Diagnostic.tsx` + apps/admin `Diagnostics.tsx` + shared api-client)_
- [x] **Project Scope Estimator / Configurator** (§6.2, §11). `ScopeEstimator` — pick a service line →
  toggle 5–8 params → indicative components + weeks-band + price-band + sample architecture, data-driven
  from `SERVICE_LINE_ESTIMATORS` in `serviceLines.ts`. Inline lead capture posts to the (now-persisted)
  public `/contact` endpoint with the full config in the message + service-line slug as `projectType`,
  landing in the admin Contact Submissions inbox. Live on `/services` (replacing the old hardcoded
  `CostEstimator`) and a dedicated `/estimator` page. Adversarially reviewed; a blocker was caught and
  fixed (the `/contact` `projectType` enum rejected service-line slugs → relaxed to a string).
  _(apps/web `ScopeEstimator.tsx` + `Estimator.tsx` + `serviceLines.ts`)_
- [x] **RFP / Tender Submission Portal** (§6.3). New `rfp` server module — structured intake capturing
  org/contact, scope, evaluation criteria, submission requirements, deadline, value, and a document link;
  a **48-hour acknowledgement SLA** + status lifecycle (received→acknowledged→in_review→declined→closed),
  best-effort staff notification + submitter acknowledgement email. Public rate-limited `/rfp/submit`;
  admin list/detail + `PATCH` status (RBAC `rfp:read`/`rfp:update`). Web form at `/rfp` (SLA confirmation
  screen); admin inbox at `/rfp` with computed SLA status (On-track / Overdue / Actioned) + inline status
  updates. Adversarially reviewed (all "works"); fixes applied (client email validation + `maxLength` caps
  so server-only validation can't surface as opaque 400s; `documentUrl` relaxed from strict URL; honest
  "Actioned" label). _Follow-up: direct binary upload needs a public/presigned upload endpoint (today it
  takes a document URL)._ _(server `rfp` module + apps/web `RFP.tsx` + apps/admin `Rfp.tsx`)_
- [x] **Book a Reading** (§6.4). New `booking` server module — request an initial conversation whose
  **duration is set by the diagnostic routing** (gov 45m / services·labs 30m / else 20m) with a
  requested→confirmed→declined→completed lifecycle; public `GET /booking/duration` + `POST /booking/submit`,
  admin list/detail + `PATCH` status (RBAC `booking:read`/`booking:update`), best-effort staff + requester
  emails. Web `/book` page reads diagnostic context (`?ref=&route=`) and reserves the right-length slot;
  the **Diagnostic result links qualifying routes straight to `/book`** with the routing + record id
  (fulfilling "gated by completion of the diagnostic"). Admin "Reading Requests" inbox with status updates.
  Adversarially reviewed (all "works"; only no-op nits). _Follow-up: live Google Calendar / Microsoft 365
  sync on confirmation (today captures + emails the request)._ _(server `booking` module + apps/web
  `Booking.tsx` + apps/admin `Bookings.tsx`)_
- [ ] **NDA + MoU auto-issue** (§6.5). On passing a qualification threshold, auto-issue NDA (and MoU
  template) via e-signature (DocuSign / Dropbox Sign); signature status tracked in CRM. _(server · new `esign` module)_
- [x] **Graceful decline & referral path** (§6.6). The `decline_referral` route: below-threshold
  prospects get a thoughtful result screen pointing to resources (Insights) and an invitation to return
  when the brief firms up, instead of a hard rejection. Built as part of the diagnostic routing.

> **Latent bug found and FIXED during the intake slices:** the public `POST /api/v1/contact` route
> previously only emailed staff and never persisted to `contact_submissions`, so real contact-form leads
> were invisible in admin. `contactService.submit` in `index.ts` now writes via `contactSubmissionRepo`
> (using `createContactSubmission`) and treats the staff email as best-effort. This makes **all** inbound
> leads — contact form and Scope Estimator — land in the admin inbox.

## Layer 03 · Client Portal (§7) — the highest-leverage layer

Present portal modules: Dashboard, Projects/ProjectDetail, Documents, Billing, Messages,
Notifications, Settings, Security (API keys + data export/erasure + sessions), Webhooks, Help.
Missing/partial engagement-workspace modules (§7.2):

- [ ] **Engagement workspace shell** at `/portal/engagements/[id]` with persistent left-nav (today the
  client app is project-centric, not engagement-workspace-centric). _(apps/client)_
- [~] **Deliverables Vault** — versioning, signature status, diff viewer between versions, download
  history, role-based visibility per document. (`Documents` exists but flat.) _(apps/client · server `content`/files)_
- [x] **Decision Log** — new project-scoped `decision` server module (entity + repo + routes): material
  decisions with rationale, alternatives, decision-maker, linked artefacts, status, and an effective
  `decidedAt` (validated via `z.coerce.date()`). **Staff-write / client-read** done securely: writes gated
  by `requireRole("admin","project_manager")`; reads gated by auth **+ an explicit per-request project-
  ownership check** (a client touching another engagement's decisions gets an indistinguishable 404 — no
  IDOR, no projectId leak). Client portal: read-only "Decisions" tab in `ProjectDetail` (the sovereign-grade
  audit trail). Admin: a "Decision Log" section + log-a-decision dialog + delete in `ProjectDetail`. Shared
  api-client methods (camelCase wire). Adversarially reviewed (access control confirmed sound); fixes
  applied (date coercion to prevent timeline corruption; 404 hardening). **This establishes the reusable
  secure project-scoped-module pattern** for the remaining portal modules (Risk Register, etc.).
  _(server `decision` module + apps/client & apps/admin `ProjectDetail.tsx`)_
- [x] **Stakeholder Map** — new project-scoped `stakeholder` server module: name, role, `side`
  (client/firm), decision `authority` (decision_maker/influencer/contributor/informed), `briefed` flag,
  optional email/notes. Same secure pattern as Decision Log / Risk Register: staff-write
  (`requireRole` admin/PM) / client-read with project-ownership check + GET /:id re-throws a
  stakeholder-scoped 404 so a non-owner can't probe existence/projectId. Rendered as a map grouped
  by side (Client / NeuroDyne) rather than a graph lib — client portal tab "Stakeholders" (read-only,
  grouped), admin ProjectDetail "Stakeholder Map" section with add/delete dialog.
  _(server `stakeholder` module + shared api-client + apps/client & apps/admin `ProjectDetail.tsx`)_
- [x] **Risk Register** — new project-scoped `risk` server module (owner, severity, mitigation, residual
  rating, escalation, lifecycle open→mitigating→monitoring→accepted→closed). Same secure pattern as the
  Decision Log: staff-write (`requireRole` admin/PM) / client-read with the project-ownership check +
  404-hardened `GET /:id`. Client portal: read-only "Risks" tab (severity/residual/status chips) in
  `ProjectDetail`; admin: a "Risk Register" section + register-a-risk dialog + delete (coexisting with the
  Decision Log section). Shared api-client methods. Adversarially reviewed (both reviewers "works"; only
  cosmetic nits). The shared `getProjectOwnerId` lookup now backs both decisions and risks.
  _(server `risk` module + apps/client & apps/admin `ProjectDetail.tsx`)_
- [x] **Capability Lattice Tracker** — new project-scoped `lattice` server module: each `LatticeItem` is a
  capability mapped to a standard capability-map `category`, with a delivery `status`
  (delivered → in_flight → queued → deferred), optional description/owner/`targetDate` (coerced via
  `z.coerce.date()`). Same secure pattern as Decision Log / Risk Register / Stakeholder Map: staff-write
  (`requireRole` admin/PM) / client-read with project-ownership check + GET /:id re-throws a
  capability-scoped 404 (no existence/projectId leak). Client portal: read-only "Capabilities" tab
  rendering the lattice as four delivery-state columns (delivered/in-flight/queued/deferred), each item
  tagged with its category; admin ProjectDetail: a "Capability Lattice" section + add-capability dialog +
  delete. Shared api-client methods. _(server `lattice` module + shared api-client + apps/client &
  apps/admin `ProjectDetail.tsx`)_
- [x] **Budget & Milestone Tracker** — new project-scoped `budget` server module (`BudgetItem`): each line
  is a milestone/workstream/retainer/expense with a `currency` (USD/GHS/EUR/GBP) and contracted
  `budgetAmount` plus `invoicedAmount`/`paidAmount` to date, a lifecycle status, and an optional `dueDate`.
  Money is validated `z.number().nonnegative().finite().max(1e12)`; `dueDate` coerced via `z.coerce.date()`.
  Both UIs aggregate **per currency** (never mixing currencies): burn = invoiced/budget, outstanding =
  max(0, invoiced − paid), remaining/forecast = budget − invoiced — exactly the spec's burn-vs-budget,
  invoiced/outstanding, USD↔GHS exposure and forward forecast. Same secure pattern: staff-write
  (`requireRole` admin/PM) / client-read with ownership check + GET /:id "budget item"-scoped 404. Client
  portal: read-only "Budget" tab (per-currency summary cards with burn bar + line-item table); admin
  ProjectDetail: a "Budget & Milestones" section + add/delete dialog. Shared api-client methods; mounted at
  `/api/v1/budget`. Adversarially reviewed (access control + per-currency aggregation confirmed sound);
  applied two review-driven polish fixes — the admin form now mirrors the server's nonnegative rule on
  invoiced/paid (clear message vs a generic 400), and money displays use 2 decimal places so the tracker
  reconciles exactly against invoices. _(server `budget` module + shared api-client + apps/client &
  apps/admin `ProjectDetail.tsx`)_
- [x] **Approval Workflows** — new project-scoped `approval` server module: staff send a deliverable for
  sign-off (`requireRole` admin/PM create + withdraw); the owning client (or staff) records a decision —
  approve / approve-with-conditions / reject — **decided once via an atomic compare-and-swap** (no race),
  with a server-enforced **comment required** for reject/conditional. Reads ownership-checked + 404-hardened;
  decision metadata server-stamped; fully audited via the global recorder. Client portal: an "Approvals"
  tab in `ProjectDetail` with a decision dialog; admin: a "Sign-offs" section + request dialog + withdraw.
  Shared api-client methods. Adversarially reviewed (decision authz confirmed sound); fixes applied
  (atomic decide-once, comment-on-reject, client decision-note display). _(server `approval` module +
  apps/client & apps/admin `ProjectDetail.tsx`)_
- [~] **Threaded Comms** — discussions anchored to each deliverable/decision/risk, w/ email digests,
  owned by the engagement record. (`Messages` is general threads.) _(extend `message`)_
- [ ] **Embedded Demos** — embed live preview environment of platforms being built, SSO, no context
  switch. _(apps/client)_
- [x] **Reports Library** — new project-scoped `report` server module: quarterly reviews, status memos,
  board-pack exports, handover & post-engagement reports (typed), with a **draft → published lifecycle**.
  Staff-write (`requireRole` admin/PM); the owning client sees **only published** reports — list uses a
  DB-level `findPublishedByProjectId` for clients, and GET /:id returns a report-scoped 404 for a client
  whenever `status !== "published"` (drafts are unreadable AND unprobeable, no existence/projectId leak).
  `publishedAt` is **server-stamped** on first transition to published and never accepted from client input.
  Client portal: read-only "Reports" tab with an Open link; admin ProjectDetail: a "Reports Library"
  section with add (draft/published) + publish/unpublish toggle + delete. Shared api-client methods.
  Adversarially reviewed (draft/published boundary + correctness both confirmed sound); applied a
  defense-in-depth hardening from the review — the report `url` (the one user-influenced value rendered
  as an `<a href>` on the client surface) is now validated server-side to http(s) only (an explicit
  protocol check, since `z.string().url()` accepts `javascript:`) **and** both UIs refuse to render a
  non-http(s) href, closing a stored-`javascript:`-URL vector.
  _(server `report` module + shared api-client + apps/client & apps/admin `ProjectDetail.tsx`)_
- [~] **Document Library** — onboarding, runbooks, contracts, NDAs, SLAs, kept distinct from
  deliverables vault. _(extend files/content)_
- [x] **Team Directory** — new project-scoped `engagement-member` server module: the firm's delivery team
  on an engagement — name, role, email, `availability` (full_time/part_time/on_call/unavailable), focus,
  bio. Distinct from `project.assigned_team` (flat id list) and the Stakeholder Map (decision authority
  across both sides): this is the curated, contactable roster with allocation/availability. Same secure
  pattern: staff-write (`requireRole` admin/PM) / client-read with project-ownership check + GET /:id
  re-throws a "team member"-scoped 404. Client portal: read-only "Directory" tab (availability chip +
  mailto: contact); admin ProjectDetail: a "Team Directory" section + add/delete dialog. Shared api-client
  methods; mounted at `/api/v1/team`. _(server `engagement-member` module + shared api-client + apps/client
  & apps/admin `ProjectDetail.tsx`)_
- [~] **Activity Feed** — in-app activity stream (Notifications exist; dedicated per-engagement feed does not). _(extend `notification`)_
- [x] **Support Tickets** — new project-scoped `support-ticket` server module (category, priority, status,
  **SLA first-response target by priority** [urgent 4h / high 24h / normal 48h / low 72h], embedded reply
  thread). First **client-write** module: the owning client raises tickets + replies (gated by the project-
  ownership check), staff reply + advance status (`requireRole` admin/PM), the global inbox is staff-only,
  reads are 404-hardened, and reply authorship (`staff`) is **server-stamped, not client-spoofable** (fail-
  closed `isStaff`). Client portal: a "Support" tab in `ProjectDetail` (raise + threaded conversation +
  reply). Admin: a global "Support Tickets" inbox with SLA-breach indicators + thread/reply/status dialog.
  Shared api-client methods; RBAC `tickets` resource (admin + PM). Adversarially reviewed (all "works";
  client-write authz confirmed sound; only no-op nits). _(server `support-ticket` module + apps/client
  `ProjectDetail.tsx` + apps/admin `Tickets.tsx`)_
- [~] **Settings & Access Control** — clients manage their own users, roles, permissions, notif prefs
  within their workspace. (Settings exists but no client-side user mgmt.) _(extend settings + RBAC)_
- [x] **Client-exportable Audit Log** — new client-facing `GET /api/v1/audit/me` on the existing audit
  module: auth-only (no `audit:read` permission, so clients can call it), it returns the **caller's own**
  audit trail with the `userId` filter **forced server-side to `req.userId`** — any `userId`/`resource`/
  `method` in the query string is ignored, and a falsy `req.userId` short-circuits to an empty result (so a
  client can never read another user's events or widen to all users — no IDOR, no unscoped query). Surfaced
  in the client portal **Security** page as an "Activity Log" card: a recent-activity table plus CSV/JSON
  downloads built client-side (Blob) from the caller's own entries. The pre-existing admin
  `/api/v1/audit` + `/export` stay `audit:read`-gated and untouched. Adversarially reviewed — the IDOR
  invariant (own-events-only, query userId ignored, falsy-userId short-circuit) confirmed sound; applied a
  defense-in-depth hardening from the review: the client CSV builder now neutralizes spreadsheet
  formula-injection (cells starting with `= + - @`/tab/CR are apostrophe-prefixed). _(extend `audit` +
  shared api-client + apps/client `Security.tsx`)_
- [ ] **Multi-engagement view** (§7.3) — unified portal home across engagements, switch without
  re-auth. _(apps/client)_
- [ ] **Per-workspace RBAC roles** (§7.1) — Executive / Project / Viewer per engagement (distinct from
  the firm's internal RBAC). _(server `role`/`permission`)_
- [ ] **White-label mode** (§7.1) — client-owned subdomain, client logo/colours/email-from. "Built from
  day one." _(apps/client + server tenancy)_
- [ ] **Portal offline / low-bandwidth PWA** (§7.5) — installable, aggressive caching of dashboard /
  deliverables / decisions / risks, queued+resumable downloads. (web has a manifest; portal offline does not.) _(apps/client)_

## Layer 04 · Partner & Collaborator Portal (§8) — entirely missing

- [ ] **Partnership Application** — structured intake (existing product, domain, traction, what they
  need / bring); routed + tracked. _(apps/web + admin · new `partner` module)_
- [ ] **Active Partner Dashboard** — joint product status, dev progress, revenue-share visibility, IP
  ownership tracker, agreement vault, scheduled reviews, escalation. _(apps/client/partner)_
- [ ] **Co-Development Workspace** — mirror of client workspace for joint builds; equal visibility, firm
  retains audit/admin rights. _(apps/client/partner)_
- [ ] **Referral Programme** — track referrals in, conversion status, fees/equity arrangements. _(new module)_
- [ ] **Distribution Partner Layer** — orders, training, regional performance, commission tracking,
  support routing (e.g. regional ILIVVON distributor). _(new module)_

## Layer 05 · Careers & Talent (§9) — entirely missing

- [ ] **Roles Open** — each role a full page (what it is, real project examples, who they work with,
  comp philosophy, growth, process, start window). _(apps/web · new `careers` module)_
- [ ] **Application Tracking** — submit + track status (received→under-review→interview→offer/decline)
  with automated email at each transition. _(apps/web/client + admin)_
- [ ] **Talent Network** — always-open expression of interest by domain; notified when a fitting role
  opens. _(new module)_
- [ ] **Technical Assessments** — optional skill-aligned challenges in the application flow. _(new module)_
- [ ] **Internship & Fellowship Programme** — 3-month internships, 6-month fellowships, learning
  outcomes, conversion pathways. _(content)_
- [ ] **Inside XCreativs** — day-in-the-life / how-we-work content for attraction + onboarding. _(content)_

## Layer 06 · Knowledge & Publishing (§10)

`/blog` ≈ field notes. The rest of the authority engine is missing:

- [~] **Field Notes** — exists as Blog; align format (500–1000 words, author-attributed, anonymised). _(content)_
- [ ] **Long-form Theses** — 10–20k words, **gated qualified download**, available as PDF + exec summary
  + audio. _(new `thesis` content type + gating)_
- [ ] **Whitepapers** — sector-specific, branded, formal; sales collateral. _(content)_
- [ ] **Annotated Bibliography** — living list: citation + substantive annotation + link. _(new module / reuse `kb`)_
- [x] **Glossary of Practice** — new **dedicated** `glossary` server module (own `glossary_terms`
  collection — intentionally NOT reusing `kb`, since `kb` is the Help Center backend and a shared
  collection would leak glossary terms into help listings). `GlossaryTerm` = term, slug, definition,
  optional category, aliases, draft/published status, order. Public reads (`GET /` always published-only
  regardless of `?status=`; `GET /slug/:slug` 404s drafts; `GET /categories`) + a staff-only `GET /all`
  (incl. drafts) and role-gated POST/PATCH/DELETE (`requireRole` admin/PM). Public web page **`/glossary`**:
  A–Z grouping, client-side search across term/definition/aliases, category filter, and **DefinedTermSet
  JSON-LD** structured data for SEO; linked in the footer Resources column. Admin **Glossary** management
  page (list incl. drafts + add/edit/delete) wired into App router + sidebar (Knowledge & Compliance group,
  `kb:read`-gated nav). Adversarially reviewed — surfaced and fixed **two real, confirmed security bugs**:
  (1) a **HIGH stored-XSS** in the shared `SEO.tsx` JSON-LD injector (react-helmet-async sets a `<script>`
  child as raw `innerHTML` on the CSR path, and `JSON.stringify` doesn't escape `<`/`>`, so authored
  structuredData containing `</script>…` could break out and execute on every public page using SEO —
  fixed by `\uXXXX`-escaping `< > &` + U+2028/U+2029 in the serialized JSON-LD, protecting all pages);
  (2) a **MEDIUM regex-injection/ReDoS** on the public `?q=` search — `findAll` passed raw user input into
  `$regex`; fixed by escaping regex metacharacters + capping length, applied to both `glossary` and the
  identically-exposed pre-existing `kb` (Help Center) public search. _(server `glossary` module + shared
  api-client + apps/web `Glossary.tsx` & `SEO.tsx` + apps/server `kb-repository.ts` + apps/admin
  `Glossary.tsx`)_
- [ ] **Audio Brief** — long-form thinking read aloud; embedded on insights + standalone podcast feed. _(content + audio)_
- [ ] **Webinars & Events** — registration, calendar, replays, follow-up; CRM-segmented attendees. _(new `events` module)_

## Layer 07 · Interactive Tools & Public Utilities (§11) — entirely missing

- [ ] **Digital Systems Readiness Assessment** — 15–20 questions → readiness score across 5 dimensions
  (architecture, data, AI maturity, security, governance) + next steps mapped to services + lead capture. _(apps/web · new `tools` module)_
- [ ] **AI Maturity Score** — maturity tier, gap analysis, recommendations. _(tools)_
- [ ] **Tech Debt Estimator** — inputs (age, tech, integrations, change frequency) → debt rating + remediation start. _(tools)_
- [ ] **Document Intelligence Demo** — drop a non-sensitive doc → structured extraction (entities, dates,
  obligations, summary); capped usage. A public capability demo. _(tools + AI/ML)_
- [ ] **Capability Lattice Explorer** — interactive grid of capabilities × sectors; click an intersection
  for approach + case precedent. _(tools)_
- [ ] **Holding Company Visualiser** — animated interactive parent→Services/Labs/Subsidiaries tree
  (also used on Home §5.1). _(tools)_
- [ ] **Value Flow Animation** — Services→Labs→Subsidiaries loop, hover explanations. _(tools)_
- [ ] **Engagement Cost Calculator** — indicative pricing with toggles (complexity, urgency, team size,
  sovereignty). _(tools)_
- [ ] **Live Engagement Counter** — active engagements, deliverables in flight, sectors, capabilities,
  from the firm's own record, real-time (also the Home ticker §5.1). _(tools · server aggregate endpoint)_

## Layer 08 · Cross-cutting Features (§12)

- [ ] **Universal Search** (§12.1) — single box; public scope (pages, dossiers, notes, theses,
  whitepapers, glossary) for visitors, extends into workspace for authed users; <200ms, typo-tolerant,
  ranked. No search backend today (Command Palette is client-side nav only). _(server · Typesense/Algolia · all apps)_
- [ ] **AI Concierge "XC Assistant"** (§12.2) — branded assistant grounded on the firm's own corpus
  (no hallucinated claims); public + deeper portal integration. _(server · RAG · all apps)_
- [ ] **Bilingual EN / FR** (§12.3) — full translation of public surface + portal; `next-intl`/i18n,
  strings in CMS. None present today. _(all apps · i18n)_
- [ ] **Currency switcher** (§12.4) — USD / GHS / EUR across pricing, estimates, budget tracker; needs an
  authoritative FX source. _(all apps · server `fx` endpoint — see PLATFORM_GAP_AUDIT)_
- [x] **Dark / Light mode** (§12.5) — present in web (ThemeContext). _Verify portal defaults to dark._
- [~] **Accessibility WCAG AA** (§12.6) — accessibility statement page exists; needs audited keyboard/
  screen-reader/contrast conformance per release.
- [~] **Performance — Lighthouse ≥95** (§12.7, §15.1) — verify/instrument; benchmark from Accra (TTFB <200ms,
  LCP <1.8s on 4G).
- [~] **SEO — JSON-LD on every entity** (§12.8) — org/services/articles/dossiers/products/people structured
  data, sitemap.xml, robots.txt, og:image automation, canonical URLs. _(all web apps)_
- [x] **Analytics** (§12.9) — admin Analytics exists.
- [x] **Notifications** (§12.10) — present.
- [~] **PWA** (§12.11) — web manifest exists; portal offline-first views missing (see Layer 03).
- [ ] **Multi-region performance** (§12.12) — CDN edge presence Ghana/West Africa priority. _(infra)_
- [x] **Audit logging** (§12.13) — present (recorder + admin viewer + CSV/JSON export).

---

## Recommended build sequence (mirrors spec §14 phases)

**Phase A — public surface + intake completion.** Services deep pages, Labs + ILIVVON,
Subsidiaries, Industries, Case Dossiers upgrade, FAQ, Press; diagnostic routing+PDF, Scope
Estimator, RFP portal, real booking, NDA auto-issue, graceful decline; Insights/theses w/ gated
download + glossary; universal search (public), EN/FR, SEO/JSON-LD, Live Engagement Counter +
Holding Company Visualiser.

**Phase B — client portal to full engagement workspace.** Workspace shell + per-workspace RBAC,
Decision Log, Stakeholder Map, Risk Register, Capability Lattice Tracker, Budget/Milestone,
Approval Workflows, threaded comms, embedded demos, Reports/Document libraries, Team Directory,
Support Tickets, client access control, client audit export, multi-engagement view, white-label,
portal offline PWA. Full applicant tracking.

**Phase C — compounding layers.** Partner & Collaborator portal (all of Layer 04), the remaining
interactive tools (readiness/maturity/tech-debt/doc-intelligence/lattice explorer/cost calculator/
value flow), AI Concierge across public + portal, annotated bibliography, audio brief, webinars,
client API expansion.

> Scope note: this is many weeks of work. Each `[ ]` is roughly one server module + one or more
> frontend pages. Pick a slice to start; I'll implement it against the existing hexagonal patterns
> (entity + Mongo repo + HTTP routes under `/api/v1`, RBAC resource in `permission.ts`, shared
> `ApiClient` helpers, admin manager where relevant).
