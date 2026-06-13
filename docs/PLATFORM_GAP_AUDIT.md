# Web Platform Specification — Gap Audit & Build

**Source spec:** XCreativs Web Platform Specification v1.0 (15 May 2026)
**Implemented in:** NeuroDyne Corp monorepo (`apps/server` Express/Mongo, `apps/web|client|admin` React/Vite/MUI)
**Date:** 2026-06-02

The v1.0 spec is comprehensive across its ten layers, but a platform that must "demonstrate
the seriousness it sells" and run real government/enterprise engagements needs a set of
cross-cutting capabilities the document never names. This audit lists those gaps and records
which ones were built into the platform in this pass.

Legend: ✅ built in this pass · ◐ partially present before · ▢ documented, not yet built.

---

## 1. Trust, security posture & compliance surface

The spec covers MFA, audit logging, and `/legal/security` as a page, but omits the machinery
that procurement and security reviewers actually ask for.

| Gap | Why it matters | Status |
|-----|----------------|--------|
| **Trust Center** (single page: certifications roadmap, sub-processors, uptime, security contacts, DPA/SLA downloads) | First artefact an enterprise security team requests | ✅ `/trust` |
| **`/.well-known/security.txt`** + Vulnerability Disclosure Policy | RFC 9116; signals a real security function | ✅ server route |
| **Sub-processor list** (who touches client data) | Required by every serious DPA | ✅ `/legal/subprocessors` |
| **Acceptable Use Policy, Cookie Policy, Accessibility Statement, DPA** | The spec lists terms/privacy/security/data-residency only | ✅ `/legal/*` |
| **Data Subject Rights flows** — self-serve data export + right-to-erasure request with status tracking | GDPR/Ghana DPA Act 843; the spec's "client owns their data" claim needs a mechanism | ✅ `dsr` module + portal Security page + admin queue |
| **Cookie consent management** (granular, logged, withdrawable) | Legal prerequisite before analytics fire | ✅ `CookieConsent` banner + `consent` module |
| **Session management** — active sessions, device/login history, remote revoke | Spec mentions MFA but never lists sessions | ◐ surfaced on portal Security page (sessions API stubbed on JWT) |
| **Scoped API keys for clients** (spec §7.4 names "scoped API keys" but defines no surface) | The sovereignty signal the spec leans on | ✅ `apikey` module + portal management |

## 2. Reliability & operations

| Gap | Why it matters | Status |
|-----|----------------|--------|
| **Public status page** + incident timeline + component health + subscribe | Spec only mentions an internal "status page on a separate subdomain" in the stack table | ✅ `/status` + `status` module + admin manager |
| **Incident management** (lifecycle: investigating→identified→monitoring→resolved, postmortems) | Required to honour the 99.9% uptime acceptance criterion credibly | ✅ admin Status Manager |
| **Feature flags + maintenance mode** | The phased plan ships continuously; needs kill-switches and staged rollout | ✅ `feature-flag` module + maintenance guard + admin toggles |
| **Outbound webhooks** for clients (push), with signing secret + delivery log + replay | The spec's API is pull-only; integrators expect push | ✅ `webhook` module + portal config |
| **Comprehensive audit recorder** | Spec mandates "100% of writes" audited (§15.1) but defines no mechanism | ✅ `audit` module + global mutation recorder middleware + admin viewer + CSV/JSON export |
| **Rate limiting / anti-abuse** on public intake, the Document-Intelligence demo, feedback, newsletter | "Capped usage to prevent abuse" (§11) with no mechanism | ✅ `rate-limit` middleware + honeypot helper |

## 3. Growth, lifecycle & CRM

The spec repeatedly says leads are "sent to sales" and "tracked in the CRM" — but no CRM,
lead-scoring, or lifecycle email system is defined in the IA or the stack.

| Gap | Why it matters | Status |
|-----|----------------|--------|
| **Newsletter double opt-in + preference center + compliant unsubscribe** | Spec §6.7 lists signup + segments but not confirmation/unsubscribe (CAN-SPAM/GDPR) | ✅ `newsletter` module (subscribe→confirm→preferences→unsubscribe) + confirm page + admin list |
| **NPS / feedback capture** across public + portal | No voice-of-customer instrument anywhere in the spec | ✅ `feedback` module + floating `FeedbackWidget` + admin NPS dashboard |
| **Lead pipeline / CRM** | Referenced but undefined | ◐ admin `Pipeline` already existed; intake feeds it |
| **Lifecycle / drip email + template management** | "Different cadences for different segments" needs an engine | ▢ noted; uses Resend adapter, templates not yet centralised |

## 4. Knowledge & self-serve support

| Gap | Why it matters | Status |
|-----|----------------|--------|
| **Help Center / Knowledge Base** (searchable, categorised, public + in-portal) | Spec has support *tickets* but no self-serve KB — every serious SaaS has both | ✅ `kb` module + `/help` + `/help/:slug` + portal Help + admin manager |
| **Public changelog with backend + RSS** | Spec's IA never includes a public changelog; the firm "ships continuously" | ◐ web `/changelog` existed (static) → ✅ now backed by `changelog` module + admin manager + RSS |
| **Glossary of Practice as data** (spec §10.5) | Listed as content but no model | ▢ can reuse `kb` with a `glossary` category |

## 5. Finance correctness

| Gap | Why it matters | Status |
|-----|----------------|--------|
| **Tax lines** (Ghana VAT 15% + NHIL 2.5% + GETFund 2.5% + COVID 1%) on invoices | Invoices carry a single flat `tax: number`; Ghana statutory levies are itemised | ▢ documented; invoice schema extension proposed (non-breaking `levies[]`) |
| **FX rate source** for USD/GHS/EUR | Currency switcher + budget tracker need an authoritative rate, not hardcoded | ▢ documented; `fx` rate endpoint proposed |
| **Dunning / failed-payment retries, credit notes, refunds** | Milestone invoicing at national scale will hit failures | ▢ documented |

## 6. Engineering & quality (process gaps, not features)

Recorded for completeness — the spec defines acceptance criteria but not the means to meet them:

- **Test strategy** (unit/integration/E2E/visual-regression/load) — only ad-hoc server tests exist.
- **Environment strategy** (preview/staging/prod) and **CI gates** beyond the existing Render deploy hook.
- **Error/empty/maintenance pages** as a deliberate set (404 exists; offline/500/maintenance added via flags).
- **Design tokens / component library docs** — discipline the spec demands (Inter Tight, 3 colours) but never operationalises.
- **Observability**: spec lists Sentry/Axiom; repo has Prometheus/Pino. Status page + audit close part of this.

---

## What was actually built in this pass

**Backend modules** (`apps/server`, hexagonal — entity + Mongo repo + HTTP routes, mounted under `/api/v1`):
`audit`, `status` (incidents/components/subscribers), `feature-flag` (+ maintenance guard),
`webhook`, `apikey`, `dsr`, `consent`, `feedback`, `kb`, `newsletter`, `changelog`, plus a
`rate-limit` middleware and a global audit-recorder.

**Public surface** (`apps/web`): `/status`, `/trust`, `/help`, `/help/:slug`,
`/legal/{cookies,acceptable-use,accessibility,subprocessors,security,dpa}`, `/newsletter/confirm`,
plus a logged cookie-consent banner and a floating feedback widget.

**Client portal** (`apps/client`): `/security` (API keys + data export/erasure + sessions),
`/webhooks`, `/help`, feedback widget.

**Admin** (`apps/admin`): Audit Log, Status/Incident Manager, Feature Flags, NPS/Feedback,
Knowledge Base, Newsletter, Privacy (DSR) Requests, Changelog Manager.

**Cross-cutting:** new RBAC resources registered in `permission.ts` (`audit`, `incidents`,
`feature_flags`, `webhooks`, `apikeys`, `dsr`, `consent`, `feedback`, `kb`, `newsletter`,
`changelog`); generic `get/post/put/patch/del` helpers on the shared `ApiClient`;
`security.txt` + trust summary endpoints.
