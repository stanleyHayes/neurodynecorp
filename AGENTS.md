# AGENTS.md

Durable rules for anyone — human or agent — working in this repository.

Full context: [docs/NEURODYNE_POSITIONING.md](docs/NEURODYNE_POSITIONING.md).

## What Neurodyne is

Neurodyne is an **African AI and digital infrastructure company**. It builds
AI-native platforms, developer infrastructure, open standards and vertical
products for African markets, starting in Ghana.

Never describe it primarily as an agency, a web/mobile development shop, an
outsourcing firm, or a collection of unrelated SaaS products. Engineering
services exist but are a secondary area under
`/company/engineering-services` — they never lead.

## Credibility — the rule that matters most

**Never fabricate traction, customers or partnerships.** No customer counts,
user numbers, revenue, funding, government adoption, testimonials, repository
statistics, team size, awards, press mentions, certifications, uptime figures
or SLAs unless there is evidence in this repository.

Specifically, these are known to be false and must not reappear:
a "36+ projects" figure, any subsidiary or holding-company structure, any
award or press coverage, any certification (SOC-2 / ISO / HIPAA), any measured
operational metric.

Neurodyne is **founder-led by one engineer**. Do not write "our team",
"our engineers", or anything implying staff.

Clients are **anonymised by default**. Do not name an organisation without
written permission on file.

If a metric has no honest source, omit it — never show a zero, never invent a
number. If a section can only be filled with a fabricated claim, delete the
section.

## Product maturity comes from configuration

Every product carries a label from `apps/web/src/content/maturity.ts`:
`LIVE`, `PRIVATE BETA`, `PILOT`, `IN DEVELOPMENT`, `RESEARCH`, `OPEN SOURCE`.

Maturity is **editorial, not derived**. It is set by a human in
`apps/web/src/content/projects.ts`. Never infer it from any other field, and
never guess — if the real stage is unknown, ask, or use the lowest defensible
label.

## Experimental work belongs under Labs

Entries with `tier: "labs"` are experiments and concepts, always `RESEARCH`
until they graduate. Early ideas go there, not beside mature products.

## Content is centralized

Business content lives in `apps/web/src/content/` and `apps/web/src/data/`,
never hardcoded in components. Import `CANON`, `PILLARS`, `FOUNDER` and the
rest from `@/content/company` rather than restating copy in JSX.

## Preserve what works

Before removing anything, classify it: Keep, Rewrite, Move, Archive, or Remove.
Rewriting copy is not a licence to delete working machinery — forms, routing,
API calls, analytics and accessibility behaviour must survive.

Old URLs are indexed. Retire a route by redirecting it in `apps/web/src/App.tsx`,
not by deleting it.

## Accessibility and responsiveness are requirements

Semantic HTML, logical heading order, keyboard navigation, visible focus states,
sufficient contrast, meaning never carried by colour alone, `prefers-reduced-motion`
respected, and a working layout at 400px wide.

## Before completing a significant change

```bash
cd apps/web
npx tsc --noEmit     # must be clean
npm run build        # builds and regenerates sitemap + per-route SEO shells
```

`npm run build` runs `scripts/generate-seo.mjs`, which derives `sitemap.xml` and
the prerendered per-route `<head>` from the route table and the content model.
If you add a route or a product, check it appears in the generated sitemap.
