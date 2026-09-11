/**
 * Neurodyne — canonical company positioning (2026).
 *
 * Single source of truth for who Neurodyne says it is. Every page that makes a
 * claim about the company should read it from here rather than restating it in
 * JSX, so the story stays identical across the site, pitch decks and programme
 * applications.
 *
 * Category: African AI and digital infrastructure company.
 * Not an agency. Not a portfolio of unrelated apps.
 *
 * Credibility rule for anything added to this file: if it cannot be pointed at
 * — a repository, a running product, a named pilot — it does not go in. No
 * customer counts, no funding, no partnerships, no adoption claims we cannot
 * substantiate. Understating is survivable; overstating is not.
 */

// ── Canonical descriptions ───────────────────────────────────────────────────

export const CANON = {
  /** One line. Use in meta descriptions, bios, form intros. */
  short: "Neurodyne is building AI and digital infrastructure for Africa.",

  /** Two lines. Use in About intros and social profiles. */
  medium:
    "Neurodyne is a Ghanaian technology company building AI-native platforms, developer infrastructure and digital systems for African businesses, communities and institutions.",

  /** Investor / accelerator framing. Use where the thesis needs to be explicit. */
  extended:
    "Neurodyne is building the digital infrastructure layer for Africa — combining AI, developer tools, open standards and vertical platforms to solve infrastructure gaps across housing, education, fundraising and public services.",

  /** Brand line. Pairs with the logo and closes pages. */
  brandLine: "Infrastructure for an Intelligent Africa.",

  /** Geographic posture. */
  geography: "Built in Ghana. Built for Africa. Designed for the world.",

  /** Expansion story, in order. */
  expansion: ["Ghana", "West Africa", "Africa", "Emerging Markets"],

  /** The thesis in one paragraph — why products and infrastructure are the same strategy. */
  thesis:
    "Neurodyne develops digital infrastructure, and its products are the environments in which that infrastructure is built, tested and proven. Housing, fundraising and education are not separate bets — they are the places where identity, payments, verification and interoperability have to work before they can be offered to anyone else.",
} as const;

export const HERO = {
  headline: "Building Africa's Digital Infrastructure.",
  lead: "AI-native platforms, developer tools and open digital infrastructure built for African markets.",
  sub: "Neurodyne builds the technology layers that help people, businesses and institutions operate digitally — from housing and fundraising to education, interoperability and AI.",
  primaryCta: { label: "Explore What We're Building", to: "/infrastructure" },
  secondaryCta: { label: "Partner With Neurodyne", to: "/partners" },
  developerCta: { label: "View Open Source", to: "/open-source" },
} as const;

// ── Strategic pillars ────────────────────────────────────────────────────────

export interface Pillar {
  slug: string;
  name: string;
  /** One line for cards and nav. */
  tagline: string;
  /** Two or three sentences for the pillar page header. */
  summary: string;
  /** What actually belongs under this pillar. */
  scope: string[];
  accent: string;
  to: string;
}

export const PILLARS: Pillar[] = [
  {
    slug: "ai-developer-infrastructure",
    name: "AI & Developer Infrastructure",
    tagline: "Making African digital services reachable by developers and AI agents.",
    summary:
      "African services — mobile money, identity, logistics, government data — are reachable by humans through apps, and largely unreachable by software. This pillar builds the layer that makes them programmable: SDKs, agent skills, MCP servers and a registry of what actually exists and how to call it.",
    scope: [
      "AI agent skills for African services",
      "MCP servers and agent integrations",
      "An African API registry and directory",
      "SDKs and developer tooling",
      "Open-source libraries and reference implementations",
      "Developer documentation",
    ],
    accent: "#6C63FF",
    to: "/developers",
  },
  {
    slug: "digital-public-infrastructure",
    name: "Digital Public Infrastructure",
    tagline: "Systems institutions can share without surrendering their data.",
    summary:
      "Public and private institutions hold overlapping records and cannot exchange them safely. This pillar is the interoperability work: data-exchange standards, document authenticity, identity integration and API conventions designed for governments and institutions to adopt.",
    scope: [
      "Interoperability and data exchange standards",
      "Digital document verification and authenticity",
      "Public/private-key authenticity systems",
      "Digital identity integrations",
      "Government API standards",
      "Healthcare and education interoperability",
    ],
    accent: "#00D4AA",
    to: "/infrastructure#digital-public-infrastructure",
  },
  {
    slug: "platforms",
    name: "Platforms",
    tagline: "Vertical products where the infrastructure gets proven.",
    summary:
      "Each platform solves a concrete African problem end to end, and each one forces a piece of shared infrastructure to exist. Payments had to work before fundraising could. Verification had to work before property recovery could.",
    scope: [
      "RentOS — rental housing",
      "Ujimora — fundraising and diaspora giving",
      "AuraEDU — education",
      "Bak2Me — property recovery and trust",
    ],
    accent: "#8B85FF",
    to: "/products",
  },
  {
    slug: "labs",
    name: "Neurodyne Labs",
    tagline: "Early work, labelled as early work.",
    summary:
      "Prototypes, concepts and research that may become products, standards or open-source projects — and may not. Keeping them here is what lets the rest of the company stay legible.",
    scope: [
      "Experimental products and prototypes",
      "Emerging technology exploration",
      "Infrastructure concepts",
      "Research that has not yet become a commitment",
    ],
    accent: "#F59E0B",
    to: "/labs",
  },
];

export function getPillar(slug: string): Pillar | undefined {
  return PILLARS.find((p) => p.slug === slug);
}

// ── Why Africa ───────────────────────────────────────────────────────────────

export interface AfricaCondition {
  title: string;
  /** The structural fact. */
  reality: string;
  /** What it means for anyone building software here. */
  implication: string;
}

export const WHY_AFRICA = {
  title: "Why Africa",
  lead: "These are engineering conditions, not deficits. Infrastructure designed around them works here — and works in a lot of other places too.",
  conditions: [
    {
      title: "Mobile money is the default rail",
      reality:
        "Payments move through MTN MoMo, Telecel and AirtelTigo wallets far more than through cards or bank transfers.",
      implication:
        "Systems designed card-first are wrong here. Settlement, reconciliation and failure handling have to be built around wallet rails from the start.",
    },
    {
      title: "APIs are fragmented and undocumented",
      reality:
        "The services that matter are reachable by humans through apps, but rarely by software through a stable, documented interface.",
      implication:
        "Every integration is bespoke work repeated by every company. A registry and shared SDKs remove that duplicated cost.",
    },
    {
      title: "Commerce is largely informal",
      reality:
        "Most economic activity happens outside systems that produce records — no receipts, no history, no credit file.",
      implication:
        "Software that generates verifiable history is doing more than digitising a workflow; it is creating the record that unlocks finance.",
    },
    {
      title: "Identity is plural, not singular",
      reality:
        "Ghana Card, voter ID, passport, phone numbers and institutional IDs coexist, and different processes trust different ones.",
      implication:
        "Identity has to be an integration layer over several authorities, not a single lookup against one.",
    },
    {
      title: "Bandwidth and devices are constrained",
      reality:
        "A large share of users are on mid-range Android over intermittent mobile data.",
      implication:
        "Payload size, offline tolerance and retry behaviour are product requirements, not optimisations to do later.",
    },
    {
      title: "Institutions cannot exchange data",
      reality:
        "Hospitals, schools, ministries and agencies hold overlapping records with no shared format to move them.",
      implication:
        "Interoperability standards are the precondition for most public-sector digital work, and they do not exist yet.",
    },
    {
      title: "African languages are underserved by AI",
      reality:
        "Models handle Twi, Ewe, Ga, Hausa and Yoruba far less reliably than they handle English.",
      implication:
        "AI systems built here need evaluation and fallbacks for the languages people actually use.",
    },
    {
      title: "Diaspora money moves on high-friction channels",
      reality:
        "Remittance and diaspora giving still route through expensive, slow, informal intermediaries.",
      implication:
        "Trustworthy digital rails for cross-border giving address real cost, not just convenience.",
    },
  ] satisfies AfricaCondition[],
} as const;

// ── Ten-year vision ──────────────────────────────────────────────────────────

export interface VisionPhase {
  phase: number;
  name: string;
  /** Where this phase stands today — honest, not aspirational. */
  state: "Current" | "Underway" | "Ahead";
  summary: string;
  detail: string[];
}

export const VISION_PHASES: VisionPhase[] = [
  {
    phase: 1,
    name: "Products",
    state: "Current",
    summary: "Build focused products that solve concrete African problems.",
    detail: [
      "Housing, fundraising, education and property recovery — each one a real problem with a real user, not a demonstration.",
      "Products are chosen for what they force us to build underneath them as much as for the market they serve.",
    ],
  },
  {
    phase: 2,
    name: "Infrastructure",
    state: "Underway",
    summary: "Extract the capabilities the products keep re-proving.",
    detail: [
      "Identity, payments, messaging, verification, APIs, AI skills and data standards stop being per-product code and become shared infrastructure.",
      "This is the phase Neurodyne is entering: the second and third products reuse what the first one had to invent.",
    ],
  },
  {
    phase: 3,
    name: "Ecosystem",
    state: "Ahead",
    summary: "Open that infrastructure to people outside Neurodyne.",
    detail: [
      "Developers, companies and institutions build on the same APIs, SDKs, standards and open-source projects the products run on.",
      "Success here is measured by what gets built by people we did not hire.",
    ],
  },
  {
    phase: 4,
    name: "Digital Infrastructure",
    state: "Ahead",
    summary: "Become infrastructure African digital ecosystems depend on.",
    detail: [
      "The end state is unglamorous and specific: systems that businesses, developers and public institutions rely on without thinking about who built them.",
      "Infrastructure is judged over decades, not launches.",
    ],
  },
];

// ── Founder ──────────────────────────────────────────────────────────────────

/**
 * Evidence-led and short by design. Neurodyne is founder-led, so the founder
 * should be visible — but the brief is explicit that this is about demonstrated
 * technical execution, not biography.
 */
export const FOUNDER = {
  name: "Stanley Asoku Hayford",
  role: "Founder",
  location: "Accra, Ghana",
  summary:
    "Software engineer with 7+ years building backend systems, distributed services and production platforms.",
  focus: [
    "Backend engineering",
    "Distributed systems",
    "Go and microservices",
    "Event-driven architecture",
    "Cloud infrastructure",
    "AI systems",
    "Software engineering education",
  ],
  bio: [
    "Neurodyne is founder-led. The products on this site were architected and largely built by one engineer, which is the honest reason the portfolio is deliberately narrow.",
    "The work that matters here is production engineering: payment flows that cannot partially fail, multi-tenant systems that stay separated under load, and verification that holds up when someone has an incentive to defeat it.",
  ],
  links: [
    { label: "GitHub", href: "https://github.com/stanleyHayes" },
  ],
} as const;

// ── Partnership pathways ─────────────────────────────────────────────────────

export interface PartnerPathway {
  slug: string;
  audience: string;
  /** What this group actually wants from Neurodyne. */
  proposition: string;
  /** Concrete ways to engage — no vague "let's talk". */
  engagements: string[];
  /** Pre-selects the contact form's inquiry type. */
  inquiryType: string;
  accent: string;
}

export const PARTNER_PATHWAYS: PartnerPathway[] = [
  {
    slug: "governments-institutions",
    audience: "Governments & Institutions",
    proposition:
      "Interoperability, verification and data-exchange work designed for regulated environments — built to be adopted and audited, not to create a dependency.",
    engagements: [
      "Interoperability and data-standards work",
      "Document authenticity and verification systems",
      "Pilot deployments with a defined scope",
      "Technical review of existing digital infrastructure",
    ],
    inquiryType: "Government / Institution",
    accent: "#00D4AA",
  },
  {
    slug: "companies",
    audience: "Companies",
    proposition:
      "Platform engineering for organisations that need systems built around African payment, identity and connectivity realities rather than retrofitted to them.",
    engagements: [
      "Platform architecture and build",
      "Mobile money and payment integration",
      "AI systems for operational decisions",
      "Engineering partnership on an existing product",
    ],
    inquiryType: "Enterprise",
    accent: "#6C63FF",
  },
  {
    slug: "developers",
    audience: "Developers",
    proposition:
      "SDKs, agent skills, MCP servers and open-source work you can use directly — and contribute to.",
    engagements: [
      "Build on Neurodyne SDKs and APIs",
      "Contribute to open-source repositories",
      "Propose an integration or agent skill",
      "Report an issue in published work",
    ],
    inquiryType: "Developer",
    accent: "#8B85FF",
  },
  {
    slug: "startups-investors",
    audience: "Startups & Investors",
    proposition:
      "The infrastructure thesis, what has been built against it, and where the next layer goes. Technical diligence welcome.",
    engagements: [
      "Investment and strategic conversations",
      "Technical due diligence",
      "Startup and accelerator partnerships",
      "Co-development on shared infrastructure",
    ],
    inquiryType: "Investment",
    accent: "#F59E0B",
  },
];

// ── Traction ─────────────────────────────────────────────────────────────────

/**
 * Metrics shown publicly.
 *
 * Everything here is either computed from content in this repository or left
 * off. Nothing is typed in by hand. If a metric has no honest source yet, it is
 * absent rather than zero — a zeroed counter reads as a failure, and an invented
 * one is worse.
 *
 * When real usage data exists (users, transactions, pilot organisations), add it
 * here with a `source` describing where the number comes from, so the next
 * person can verify it.
 */
export interface TractionMetric {
  label: string;
  value: number | string;
  /** How this number is arrived at. Required — if you cannot write it, do not ship the metric. */
  source: string;
}

export const TRACTION_NOTE =
  "Neurodyne is early. These are the numbers we can actually stand behind — no user counts, funding or partnerships that do not exist yet.";
