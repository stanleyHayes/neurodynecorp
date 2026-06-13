// The five strategic service lines (spec §5.3), each rendered as a deep page at
// /services/:slug. Distinct from the capability cards on the /services overview,
// which are fetched from the CMS.

export interface ServiceLine {
  slug: string;
  name: string;
  kicker: string;
  color: string;
  positioning: string;
  methodology: { title: string; body: string }[];
  deliverables: string[];
  timeline: string;
  priceBand: string;
  sampleWork: string[];
  faq: { q: string; a: string }[];
}

export const SERVICE_LINES: ServiceLine[] = [
  {
    slug: "audit",
    name: "Digital Systems Audit & Architecture",
    kicker: "CORE ENTRY SERVICE",
    color: "#6C63FF",
    positioning:
      "The core entry service. A structured engagement that audits your digital posture and produces an architecture for the next 18–36 months.",
    methodology: [
      { title: "Discovery", body: "We map your systems, data, teams, and constraints — the real posture, not the org chart's version of it." },
      { title: "Assessment", body: "Score across architecture, data, AI maturity, security, and governance against where you need to be." },
      { title: "Architecture", body: "Produce a sequenced 18–36 month target architecture with leverage points identified." },
      { title: "Roadmap", body: "A costed, phased plan you can take to your board and your procurement function." },
    ],
    deliverables: [
      "Current-state systems and data map",
      "Five-dimension readiness assessment",
      "Target architecture for 18–36 months",
      "Sequenced, costed roadmap",
      "Executive board pack",
    ],
    timeline: "4–8 weeks",
    priceBand: "Indicative: USD 15k–60k depending on scope",
    sampleWork: ["24-Hour Economy Investment Intelligence Platform", "ILIVVON Health Intelligence Platform"],
    faq: [
      { q: "Is this a sales pitch for a build?", a: "No. The audit stands alone and is useful even if we never build for you. The architecture is yours." },
      { q: "Who needs to be involved?", a: "A sponsor, your senior technical lead, and access to the people who actually operate the systems." },
    ],
  },
  {
    slug: "enterprise",
    name: "Enterprise & Government System Development",
    kicker: "MISSION-CRITICAL BUILDS",
    color: "#00D4AA",
    positioning:
      "Selective, not open. Mission-critical builds for institutions, with security, compliance, and governance designed in from the first line.",
    methodology: [
      { title: "Engagement model", body: "Milestone-paid, phased delivery with a managed workspace from day one." },
      { title: "Technology posture", body: "Production-grade stacks chosen for hiring availability and operational simplicity in-region." },
      { title: "Security & compliance", body: "MFA, audit logging, RBAC, and data-residency options reviewed by an external practitioner before go-live." },
      { title: "Governance", body: "Decision logs, risk registers, and approval workflows that satisfy procurement and audit." },
    ],
    deliverables: [
      "Phased, milestone-paid delivery plan",
      "Production system with full audit trail",
      "Security & compliance documentation",
      "Handover runbooks and training",
      "Post-engagement support plan",
    ],
    timeline: "12–24+ weeks, phased",
    priceBand: "Indicative: scoped per mandate; milestone-based",
    sampleWork: ["24-Hour Economy Investment Intelligence Platform", "FastCare Clinics — Healthcare Management Platform"],
    faq: [
      { q: "Why selective?", a: "Mission-critical builds carry real commercial and reputational risk. We take what we can do well." },
      { q: "Can you host on-shore?", a: "Yes. Where regulation requires data residency, we deploy to a self-hosted equivalent." },
    ],
  },
  {
    slug: "ai",
    name: "AI & Automation Integration",
    kicker: "THE INTELLIGENCE LAYER",
    color: "#8B85FF",
    positioning:
      "The intelligence layer. Document intelligence, workflow automation, predictive layers, and copilots — added to systems that earn them, with evaluation built in.",
    methodology: [
      { title: "Use-case scoping", body: "We start from a measurable outcome, not a model. No capability claims we can't evaluate." },
      { title: "Data sovereignty", body: "Choice of hosted or self-hosted models depending on document sensitivity." },
      { title: "Evaluation", body: "Every model ships with an evaluation harness and drift monitoring." },
      { title: "Integration", body: "Embedded into existing workflows, not bolted on as a separate tool." },
    ],
    deliverables: [
      "Document intelligence pipelines (extraction, summary, obligations)",
      "Workflow automation",
      "Predictive scoring with evaluation harness",
      "Copilots grounded on your corpus",
    ],
    timeline: "6–16 weeks",
    priceBand: "Indicative: USD 20k–80k depending on scope",
    sampleWork: ["ML scoring (24H+ programme)", "Document intelligence pilots"],
    faq: [
      { q: "Will it hallucinate?", a: "Assistants are grounded on your own corpus and constrained. We measure accuracy before anything ships." },
      { q: "Do you train on our data?", a: "Only with explicit agreement, and never across clients. Your data stays yours." },
    ],
  },
  {
    slug: "digital",
    name: "Strategic Web & Digital Platforms",
    kicker: "TRANSITIONAL, CONTROLLED",
    color: "#33DDBB",
    positioning:
      "We take web and digital platform work where it earns strategic position — not as agency work. The 36+ shipped platforms are the precedent.",
    methodology: [
      { title: "Strategic fit", body: "We take platform work that opens a sector, builds IP, or deepens a relationship." },
      { title: "Design system", body: "Disciplined, restrained, accessible — a single type system and a small palette, used precisely." },
      { title: "Performance", body: "Benchmarked against real network conditions, not lab defaults. Lighthouse 95+ targets." },
      { title: "Continuity", body: "Architected for continuous additions, not a one-time build." },
    ],
    deliverables: [
      "Production web platform",
      "Design system and component library",
      "SEO, performance, and accessibility baked in",
      "CMS-backed content the team owns",
    ],
    timeline: "6–14 weeks",
    priceBand: "Indicative: USD 10k–50k depending on scope",
    sampleWork: ["36+ shipped platforms across fintech, govtech, health, edtech"],
    faq: [
      { q: "Do you do pure marketing sites?", a: "Rarely. We take platforms where they earn strategic position for the firm or the client." },
    ],
  },
  {
    slug: "advisory",
    name: "Strategy, Advisory & Thought Leadership",
    kicker: "THE AUTHORITY ENGINE",
    color: "#F59E0B",
    positioning:
      "The authority engine. Retained advisory, board seats, and published thinking that shapes how intelligent digital systems get built in the region.",
    methodology: [
      { title: "Retainer model", body: "Ongoing advisory at the altitude of strategy, not staff augmentation." },
      { title: "Advisory boards", body: "We sit on boards where our perspective compounds over time." },
      { title: "Publication", body: "Field notes, theses, and whitepapers as continuous infrastructure, not periodic slides." },
    ],
    deliverables: [
      "Retained strategic advisory",
      "Board and advisory participation",
      "Published theses and whitepapers",
      "Architecture and posture reviews",
    ],
    timeline: "Ongoing retainer",
    priceBand: "Indicative: monthly retainer, scoped to engagement",
    sampleWork: ["Published thinking in Insights", "Sector whitepapers"],
    faq: [
      { q: "How is this different from the audit?", a: "The audit is a one-time engagement; advisory is an ongoing relationship at strategy altitude." },
    ],
  },
];

export function getServiceLine(slug: string): ServiceLine | undefined {
  return SERVICE_LINES.find((s) => s.slug === slug);
}

// ── Project Scope Estimator config (spec §6.2 / §11) ─────────────────────────
// Data-driven configurator: pick a service line, toggle 5–8 parameters, and get
// an indicative component set, weeks-band, price-band, and sample architecture.
// Numbers are indicative bands aligned to each line's priceBand string above.

export interface EstimatorParam {
  id: string;
  label: string;
  weeksDelta: number;
  costDelta: number;
  components?: string[];
}

export interface ServiceLineEstimator {
  baseWeeks: number;
  basePrice: number; // USD floor for the line with no add-ons
  baseComponents: string[];
  architecture: string;
  params: EstimatorParam[];
}

export const SERVICE_LINE_ESTIMATORS: Record<string, ServiceLineEstimator> = {
  audit: {
    baseWeeks: 4,
    basePrice: 15000,
    baseComponents: ["Discovery interviews", "Current-state systems map"],
    architecture: "Current-state map → five-dimension readiness assessment → 18–36 month target architecture → sequenced, costed roadmap.",
    params: [
      { id: "many_systems", label: "10+ systems in scope", weeksDelta: 1, costDelta: 6000, components: ["Systems inventory"] },
      { id: "data_estate", label: "Complex data estate", weeksDelta: 1, costDelta: 6000, components: ["Data architecture map"] },
      { id: "ai_readiness", label: "AI readiness review", weeksDelta: 1, costDelta: 7000, components: ["AI maturity scan"] },
      { id: "security", label: "Security & governance review", weeksDelta: 1, costDelta: 7000, components: ["Security posture review"] },
      { id: "board_pack", label: "Board-ready roadmap", weeksDelta: 1, costDelta: 5000, components: ["Executive board pack"] },
      { id: "workshops", label: "Multi-stakeholder workshops", weeksDelta: 1, costDelta: 5000, components: ["Stakeholder workshops"] },
    ],
  },
  enterprise: {
    baseWeeks: 12,
    basePrice: 60000,
    baseComponents: ["Phased delivery plan", "Production system", "Handover runbooks"],
    architecture: "Hexagonal API + role-based access + full audit log, role-scoped dashboards, milestone-paid phased delivery.",
    params: [
      { id: "integrations", label: "Multiple system integrations", weeksDelta: 3, costDelta: 20000, components: ["Integration layer"] },
      { id: "sovereign", label: "On-shore / sovereign hosting", weeksDelta: 2, costDelta: 15000, components: ["Sovereign deployment"] },
      { id: "compliance", label: "Regulated / audit-grade", weeksDelta: 2, costDelta: 15000, components: ["Compliance + audit trail"] },
      { id: "mobile", label: "Mobile + offline", weeksDelta: 3, costDelta: 18000, components: ["Offline-first PWA"] },
      { id: "ai_layer", label: "Intelligence / ML layer", weeksDelta: 3, costDelta: 25000, components: ["ML scoring service"] },
      { id: "rbac", label: "Multi-org RBAC", weeksDelta: 2, costDelta: 12000, components: ["Role-based access control"] },
    ],
  },
  ai: {
    baseWeeks: 6,
    basePrice: 20000,
    baseComponents: ["Use-case scoping", "Evaluation harness"],
    architecture: "Use-case scoping → data pipeline → model (hosted or self-hosted) → evaluation + drift monitoring → embedded into existing workflows.",
    params: [
      { id: "doc_intel", label: "Document intelligence", weeksDelta: 3, costDelta: 20000, components: ["Extraction pipeline"] },
      { id: "automation", label: "Workflow automation", weeksDelta: 2, costDelta: 12000, components: ["Workflow engine"] },
      { id: "predictive", label: "Predictive scoring", weeksDelta: 4, costDelta: 25000, components: ["Scoring model"] },
      { id: "copilot", label: "Copilot / assistant", weeksDelta: 3, costDelta: 18000, components: ["RAG assistant"] },
      { id: "self_hosted", label: "Self-hosted models (sovereignty)", weeksDelta: 2, costDelta: 12000, components: ["Self-hosted inference"] },
    ],
  },
  digital: {
    baseWeeks: 6,
    basePrice: 10000,
    baseComponents: ["Design system", "Production web platform", "SEO + accessibility"],
    architecture: "Next.js/Vite + a disciplined design system, CMS-backed content, edge-cached, SEO and accessibility baked in.",
    params: [
      { id: "saas", label: "SaaS dashboard / portal", weeksDelta: 3, costDelta: 15000, components: ["App shell + auth"] },
      { id: "payments", label: "Payments / billing", weeksDelta: 2, costDelta: 8000, components: ["Payments (Stripe/Paystack)"] },
      { id: "cms", label: "CMS-backed content", weeksDelta: 1, costDelta: 6000, components: ["Headless CMS"] },
      { id: "mobile", label: "Mobile companion", weeksDelta: 3, costDelta: 18000, components: ["Expo mobile app"] },
      { id: "i18n", label: "Bilingual EN/FR", weeksDelta: 1, costDelta: 5000, components: ["Internationalisation"] },
      { id: "realtime", label: "Real-time / messaging", weeksDelta: 2, costDelta: 10000, components: ["WebSocket layer"] },
    ],
  },
};

export function getEstimator(slug: string): ServiceLineEstimator | undefined {
  return SERVICE_LINE_ESTIMATORS[slug];
}
