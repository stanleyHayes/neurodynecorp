# Neurodyne Positioning

This document exists so the strategic direction of the website survives future
changes — by humans or by AI agents. Read it before editing marketing copy,
adding a product, or restructuring navigation.

Source of record: `Neurodyne_Positioning_Strategy_2026.docx` and
`Neurodyne_AI_Website_Implementation_Brief.docx`. These are internal strategy
documents and are **deliberately not committed** — this repository is public.
This file is the durable summary of what they decided; ask the founder for the
originals.

---

## What Neurodyne is

**An African AI and digital infrastructure company.**

| Use | Text |
|---|---|
| Short | Neurodyne is building AI and digital infrastructure for Africa. |
| Medium | Neurodyne is a Ghanaian technology company building AI-native platforms, developer infrastructure and digital systems for African businesses, communities and institutions. |
| Extended | Neurodyne is building the digital infrastructure layer for Africa — combining AI, developer tools, open standards and vertical platforms to solve infrastructure gaps across housing, education, fundraising and public services. |
| Homepage headline | Building Africa's Digital Infrastructure. |
| Brand line | Infrastructure for an Intelligent Africa. |
| Geography | Built in Ghana. Built for Africa. Designed for the world. |

These strings live in `apps/web/src/content/company.ts` as `CANON`. Do not
restate them inline in a component — import them, so the story stays identical
across the site, pitch decks and programme applications.

## What Neurodyne is not

Not a web development agency, mobile app agency, outsourcing company, UI/UX
agency, SEO agency, generic AI consultancy, or a collection of unrelated SaaS
products.

Engineering services still exist and still generate revenue, but they are a
**secondary** area under `/company/engineering-services`. They must never lead
the homepage or occupy a primary navigation slot.

## The four pillars

Defined in `company.ts` as `PILLARS`.

1. **AI & Developer Infrastructure** — agent skills, MCP servers, African API registry, SDKs, developer tooling.
2. **Digital Public Infrastructure** — interoperability, document verification, identity integration, government API standards.
3. **Platforms** — the vertical products: RentOS, Ujimora, AuraEDU, Bak2Me.
4. **Neurodyne Labs** — experiments and concepts that are not commitments.

The central message: *Neurodyne develops digital infrastructure, and its
products are the environments in which that infrastructure is built, tested and
proven.*

---

## Product maturity

Every product and lab entry carries a maturity label from
`apps/web/src/content/maturity.ts`:

`LIVE` · `PRIVATE BETA` · `PILOT` · `IN DEVELOPMENT` · `RESEARCH` · `OPEN SOURCE`

**Maturity is editorial, not derived.** It is set by a human in
`apps/web/src/content/projects.ts` and never inferred from anything else. If a
product's real stage is unknown, it gets the lowest defensible label — or it
stays off the public surface.

Current labels (set by the founder, September 2026):

| Product | Maturity |
|---|---|
| RentOS | PRIVATE BETA |
| Ujimora | PRIVATE BETA |
| Bak2Me | PRIVATE BETA |
| AuraEDU | IN DEVELOPMENT |

## Product tiers

`projects.ts` classifies every entry with a `tier`:

- **`platform`** — a Neurodyne product. Carries a maturity label. Appears on `/products` and the homepage. There are four: RentOS, Ujimora, AuraEDU, Bak2Me.
- **`open-source`** — Neurodyne work published publicly under an open licence. Carries `OPEN SOURCE`.
- **`labs`** — a **documented concept**: specified and designed, not built. Always `RESEARCH`. Presented as a blueprint library, not a roadmap — nothing in it is in development and nothing is a commitment to ship. Its `year` reads `Specified <year>` rather than an open-ended range, which would imply active work.
- **`client-work`** — built for another organisation. **No maturity label**, because the stage is the client's to determine.

Client work carries an `engagement` field, because these are materially
different claims and conflating them misrepresents the relationship:

| Value | Meaning |
|---|---|
| `Client project` | Commissioned, paid work. |
| `Partnership` | Built in support of a person or cause rather than commissioned. |
| `Non-profit` | Delivered for a non-profit organisation. |
| `In discussion` | Scoped and specified, **nothing agreed yet**. Must never be presented as delivered. |

### Renames and removals already applied

- `ubuntu-fund` → **Ujimora**
- `back2u` → **Bak2Me**
- **Removed permanently**: Terios Wellness, 24-Hour Economy Investment Platform / 24H+ Authority Intelligence, Health Platform (and the associated FastCare and NHIS references). These belong to another organisation and must not be reintroduced anywhere on the site.

---

## Credibility rules — non-negotiable

Credibility matters more than appearing large. The site is read by
accelerators, investors, cloud providers and government institutions who will
check.

**Never** publish: customer logos, user counts, revenue, funding, government
partnerships, testimonials, repository statistics, employee counts, office
locations, investors, awards, press mentions, production deployments,
certifications, uptime figures, or SLAs — unless there is evidence in the
repository.

Specific facts established with the founder:

- There is **no** "36+ projects delivered" figure. Do not publish any project count.
- Neurodyne is **not** a holding company and has **no** subsidiaries.
- There are **no** awards, press coverage, or speaking engagements.
- There are **no** certifications (no SOC-2, ISO, HIPAA) and no active certification process.
- There are **no** measured operational metrics.
- Clients are **anonymised by default**. No organisation is named without written permission on file.
- Neurodyne is **founder-led by one engineer**. Never write "our team", "our engineers", or imply staff.
- The client portal `https://client.neurodyne.dev` **is** live and real.
- The GitHub account `https://github.com/stanleyHayes` **is** real.

Honest alternatives: "designed for institutions", "built to support regulated
ecosystems", "intended to". Forward-looking language is fine. Claims of
adoption are not.

If a section can only be filled with a fabricated claim, **delete the section**.
If a metric has no honest source, **omit it** — a zeroed counter reads as
failure and an invented one is worse.

---

## Information architecture

Primary navigation: **Products · Infrastructure · Developers · Research · Company**.
Primary CTA: **Partner With Us** (six visible destinations in total). Open Source
is under Developers; Labs and Blog are under Research. Company includes About,
Vision, Engineering Services, Changelog, Trust & Security and Client Login.
The opening navigation grid additionally exposes Home and fills its rows, with
the partnership action spanning the bottom row. Navigation content lives in
`src/content/navigation.tsx`.

| Route | Contents |
|---|---|
| `/` | Hero, thesis, four pillars, flagship products, developer infrastructure, Why Africa, founder, partnership pathways, research |
| `/products`, `/products/:slug` | Platforms, Labs summary, client work |
| `/work/:slug` | Client engagement detail |
| `/infrastructure` | Pillar hub, Why Africa, open standards initiative |
| `/developers` | Developer destination (architected to move to `developers.neurodyne.dev`) |
| `/open-source` | Real repositories only |
| `/research`, `/labs`, `/labs/:slug` | Technical work and experiments |
| `/about`, `/vision`, `/partners` | Company, four-phase strategy, partnership pathways |
| `/company/engineering-services/*` | The demoted services area |

Old URLs redirect rather than 404 — see the redirect block in
`apps/web/src/App.tsx`. Do not remove those; they are indexed.

## Content architecture

Business content lives in centralized modules, never hardcoded in components:

- `src/content/company.ts` — positioning, pillars, Why Africa, vision phases, founder, partnership pathways
- `src/content/maturity.ts` — the maturity label system
- `src/content/projects.ts` — every product, lab and client engagement
- `src/content/positioning.ts` — engineering doctrine, open standards (NOSI), research areas
- `src/data/` — service lines, industries

## Adding a product

1. Add an entry to `PROJECTS` in `src/content/projects.ts`.
2. Set `tier` and, for `platform`/`labs`, a `maturity` label — **ask a human**, do not infer.
3. For `client-work`, set `engagement` and **anonymise the client**.
4. Nothing else is needed: `/products`, `/labs` and the homepage derive from the tier helpers (`PLATFORMS`, `LABS`, `CLIENT_WORK`).

## The ten-year vision

`VISION_PHASES` in `company.ts`. Phase 1 Products → Phase 2 Infrastructure →
Phase 3 Ecosystem → Phase 4 Digital Infrastructure.

Each phase carries a `state` (`Current` / `Underway` / `Ahead`). The `/vision`
page must render that state visibly: a visitor has to be able to see that
Neurodyne is at phases 1–2 and that 3–4 are ambition, not achievement.

## Interface direction

Buttons and cards use zero border radius. Dense content should use connected
grids with shared borders, rather than detached rounded panels. Honeycomb
layouts are for shorter content and must preserve a half-cell row offset; use
a readable rectangular grid on compact screens. Dropdown destinations carry
a title, icon, description and decorative SVG watermark.

Navigation destinations use Outfit. Network loading uses content skeletons;
errors explain a recovery path rather than printing raw transport messages.
The engineering-services overview is derived from `src/data/serviceLines.ts`,
which also supplies the detail pages. Do not substitute the older CMS catalogue
without reconciling it against these positioning and credibility rules.
