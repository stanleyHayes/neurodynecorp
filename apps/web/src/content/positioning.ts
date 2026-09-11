/**
 * Engineering doctrine, open standards and research areas.
 *
 * The company's *positioning* now lives in `@/content/company` (CANON, HERO,
 * PILLARS, WHY_AFRICA, VISION_PHASES, FOUNDER, PARTNER_PATHWAYS). What remains
 * here is the longer-form thinking those pages draw on — how the engineering is
 * approached, the open-standards initiative, and the open research questions.
 *
 * See docs/NEURODYNE_POSITIONING.md before changing any of it.
 */

// ── About ────────────────────────────────────────────────────────────────────

export const ABOUT = {
  intro: [
    "Africa's digital economy is being built on infrastructure that was designed somewhere else.",
    "Payment systems assume cards where the continent runs on mobile money. Identity systems assume one authority where Ghana has several. API design assumes stable, documented endpoints where most services offer none. The result is that every company here rebuilds the same foundations before it can build anything of its own.",
    "Neurodyne exists to build those foundations once, properly, and in the open.",
    "We are a Ghanaian technology company building AI-native platforms, developer infrastructure and digital systems for African businesses, communities and institutions. Our products — housing, fundraising, education, property recovery — are not separate bets. They are the environments where identity, payments, verification and interoperability have to work before that infrastructure can be offered to anyone else.",
    "The company is founder-led and early. What is built is described as built; what is being designed is described as being designed. That distinction is the point.",
  ],
  vision:
    "Infrastructure that businesses, developers and public institutions across African markets rely on — the way infrastructure is relied on, without much thought about who built it.",
  mission:
    "To build AI and digital infrastructure for Africa: reusable identity, payments, verification, data standards and developer tools, proven inside real products and then opened to everyone else.",
  philosophy: ["Open", "Interoperable", "Verifiable", "Secure", "Intelligent", "Low-bandwidth", "Local-first", "Durable"],
  values: [
    { title: "Evidence Over Marketing", body: "Nothing is claimed that cannot be pointed at. Understating is survivable; overstating is not." },
    { title: "Engineering Excellence", body: "Quality is never accidental." },
    { title: "Openness", body: "Infrastructure that cannot be inspected is not infrastructure. It is a dependency." },
    { title: "Built for Here", body: "Mobile money, intermittent bandwidth, plural identity and informal commerce are the design constraints, not edge cases." },
    { title: "Built for Decades", body: "Infrastructure is judged over decades, not launches." },
  ],
} as const;

// ── Philosophy (long-form) ───────────────────────────────────────────────────

export const PHILOSOPHY_SECTIONS = [
  {
    id: "not-software",
    title: "We Don't Start With Software.",
    body: [
      "Most technology companies begin by asking, \"What application should we build?\"",
      "We begin with a different question: \"How does this industry actually work?\"",
      "Before writing a single line of code, we study the people, workflows, regulations, data, relationships, and decisions that define an organization. Only then do we begin engineering technology.",
      "Software should reflect reality — not force reality to adapt to software.",
    ],
  },
  {
    id: "industries",
    title: "We Engineer Industries, Not Applications.",
    body: [
      "Applications come and go. Industries last for generations.",
      "Rather than building disconnected products, NeuroDyne models entire industries as interconnected systems — healthcare, education, government, media, commerce, finance, agriculture, construction.",
      "Every industry has common language, common processes, common data, and common challenges. Once these are understood, they become reusable building blocks from which an unlimited number of solutions can be created.",
    ],
  },
  {
    id: "standards",
    title: "Everything Begins With Standards",
    body: [
      "Software is temporary. Data lives forever.",
      "Organizations should never lose access to their information because they changed vendors. Data should belong to the people who create it.",
      "That is why NeuroDyne defines open, implementation-independent standards for how information is described and exchanged. We standardize the meaning of information — not the technology used to store it.",
      "Whether a system uses PostgreSQL, MongoDB, MySQL, or SQL Server is irrelevant. If they speak the same language, they can work together. This philosophy is the foundation of the NeuroDyne Open Standards Initiative (NOSI).",
    ],
  },
  {
    id: "reuse",
    title: "Build Once. Reuse Everywhere.",
    body: [
      "Every successful civilization is built on shared infrastructure: roads, electricity, postal systems, the internet.",
      "Likewise, every digital ecosystem requires shared foundations. Instead of rebuilding authentication, payments, notifications, workflows, AI, analytics, identity, permissions, messaging, search, and integrations for every project, NeuroDyne develops reusable platform capabilities that power many different industry operating systems.",
      "This allows solutions to evolve faster while remaining consistent, secure, and maintainable.",
    ],
  },
  {
    id: "industry-os",
    title: "Operating Systems for Industries",
    body: [
      "Creator OS taught us something important: a creator does not simply need content scheduling software — a creator runs a business.",
      "Schools revealed the same insight: a school does not simply need a student portal — it operates an entire educational ecosystem.",
      "The same applies to hospitals, municipalities, sports organizations, employers, associations, and governments. That is why we build Industry Operating Systems rather than isolated applications.",
      "Each operating system combines the workflows, intelligence, data models, integrations, automation, and user experiences required to support an entire domain.",
    ],
  },
  {
    id: "configuration",
    title: "Configuration Over Customization",
    body: [
      "Traditional enterprise software often requires expensive custom development for every customer.",
      "At NeuroDyne, we believe software should adapt through configuration rather than code changes. A single platform should support thousands of organizations, each with its own branding, policies, permissions, workflows, and feature set.",
      "This philosophy — proven in our education platform architecture — allows organizations to move faster while remaining on a shared, continuously improving platform.",
    ],
  },
  {
    id: "ai-infrastructure",
    title: "AI as Infrastructure",
    body: [
      "Artificial Intelligence is not a feature. It is infrastructure.",
      "Every operating system we build is designed with AI woven into its architecture — from intelligent search and automation to decision support, recommendations, document understanding, workflow assistance, and natural language interfaces.",
      "Our goal is not to replace people, but to augment human expertise and remove repetitive work so professionals can focus on higher-value decisions.",
    ],
  },
  {
    id: "engineering",
    title: "Engineering Before Technology",
    body: [
      "Technology changes every few years. Engineering principles endure.",
    ],
    list: [
      "Systems thinking over feature thinking.",
      "Long-term architecture over short-term convenience.",
      "Documentation before implementation.",
      "Standards before integrations.",
      "Security by design.",
      "Observability by default.",
      "Automation wherever possible.",
      "Evidence over assumptions.",
      "Reliability over hype.",
    ],
    outro: "These principles ensure that our platforms remain resilient, maintainable, and valuable long after the technologies used to build them have evolved.",
  },
  {
    id: "knowledge",
    title: "Knowledge Is Infrastructure",
    body: ["Every project teaches us something. Rather than allowing that knowledge to disappear, we convert it into reusable engineering assets."],
    list: [
      "Design systems.",
      "Data models.",
      "API standards.",
      "Architecture patterns.",
      "Engineering playbooks.",
      "Reference implementations.",
      "AI prompts.",
      "Testing frameworks.",
      "Documentation.",
      "Software libraries.",
    ],
    outro: "Knowledge compounds when it is shared. Each project strengthens every project that follows.",
  },
  {
    id: "open",
    title: "Open Where Possible. Proprietary Where Necessary.",
    body: [
      "We believe that collaboration accelerates innovation.",
      "Where it benefits the broader ecosystem, NeuroDyne contributes open standards, reference implementations, libraries, documentation, and community tooling.",
      "Where customers require competitive differentiation, security, or proprietary capabilities, we develop tailored solutions that respect those needs. This balanced approach encourages interoperability while enabling sustainable innovation.",
    ],
  },
  {
    id: "institutions",
    title: "Engineering Institutions, Not Just Products",
    body: [
      "Our ambition is larger than launching successful software.",
      "We want to create enduring engineering institutions that advance industries, develop talent, publish standards, foster research, and build digital infrastructure that future generations can rely upon.",
      "Success is measured not only by the products we release, but by the ecosystems they enable, the knowledge they contribute, and the impact they have on society.",
    ],
  },
] as const;

export const PRINCIPLES = [
  { title: "Model Reality Before Writing Code", body: "Software should mirror real-world operations, not force organizations into artificial workflows." },
  { title: "Standardize Before Scaling", body: "Establish common models, APIs, and governance before expanding features or markets." },
  { title: "Configuration Over Customization", body: "One platform, many organizations, each with its own identity and policies." },
  { title: "Platform Thinking Over Product Thinking", body: "Build reusable capabilities that support many products instead of isolated applications." },
  { title: "Interoperability by Design", body: "Systems communicate through open APIs, events, and shared standards rather than tightly coupled integrations." },
  { title: "Documentation as a First-Class Deliverable", body: "Architecture decisions, standards, APIs, and operating procedures are part of the product itself." },
  { title: "Multi-Tenant by Default", body: "Every platform is designed to serve many organizations securely from a single, configurable codebase." },
  { title: "Verification Before Virality", body: "In ecosystems involving creators, education, or public information, trust, auditability, and provenance come before growth." },
  { title: "Build for Decades, Not Demonstrations", body: "Optimize for maintainability, resilience, and institutional value rather than short-lived trends." },
] as const;

// ── Solutions ────────────────────────────────────────────────────────────────

export const SOLUTIONS = [
  {
    slug: "enterprise-software",
    title: "Enterprise Software",
    blurb: "Custom enterprise applications engineered for performance, security, and long-term growth.",
    capabilities: ["ERP", "CRM", "CMS", "Workflow Automation", "Portals", "Internal Platforms"],
  },
  {
    slug: "artificial-intelligence",
    title: "Artificial Intelligence",
    blurb: "Practical AI woven into the architecture — not bolted on as a feature.",
    capabilities: ["AI Agents", "LLMs", "Automation", "Document Processing", "Knowledge Systems", "Computer Vision", "Predictive Analytics", "Recommendation Engines"],
  },
  {
    slug: "cloud-engineering",
    title: "Cloud Engineering",
    blurb: "Architecture and operations designed for reliability at any scale.",
    capabilities: ["Architecture", "Migration", "DevOps", "Containers", "Kubernetes", "CI/CD", "Observability"],
  },
  {
    slug: "data-engineering",
    title: "Data Engineering",
    blurb: "Turning operational data into a durable, governed institutional asset.",
    capabilities: ["Warehouses", "Pipelines", "Streaming", "Analytics", "BI", "Governance"],
  },
  {
    slug: "cybersecurity",
    title: "Cybersecurity",
    blurb: "Security by design — identity, access, and compliance built into the foundation.",
    capabilities: ["Identity", "SSO", "Access Control", "Security Audits", "Monitoring", "Compliance"],
  },
  {
    slug: "ux-engineering",
    title: "UX Engineering",
    blurb: "Human-centered interfaces engineered as systems, not screens.",
    capabilities: ["Design Systems", "Web", "Mobile", "Accessibility", "Research"],
  },
] as const;

// ── Open Standards (NOSI) ────────────────────────────────────────────────────

export const NOSI = {
  title: "Building the Future Through Open Standards",
  intro: [
    "Modern organizations shouldn't lose data simply because they change software providers.",
    "NeuroDyne is establishing open, community-driven data standards that allow software systems to exchange information reliably regardless of programming language, framework, or database technology.",
    "The initiative aims to create reusable schemas, APIs, validation tools, and reference implementations that anyone can adopt.",
  ],
  workingGroups: [
    "Healthcare", "Education", "Government", "Human Resources", "Finance", "Inventory",
    "Commerce", "Identity", "Geospatial", "Transportation", "Agriculture", "Construction",
    "Legal", "Media", "Research",
  ],
  join: ["Developers", "Researchers", "Universities", "Government", "Companies", "Students"],
} as const;

// ── Research ─────────────────────────────────────────────────────────────────

export const RESEARCH_AREAS = [
  { title: "Artificial Intelligence", blurb: "Applied intelligence for real operational decisions — agents, retrieval, and document understanding." },
  { title: "Distributed Systems", blurb: "Consistency, resilience, and coordination across services and regions." },
  { title: "Digital Identity", blurb: "Portable, privacy-preserving identity for citizens, students, and professionals." },
  { title: "Human Computer Interaction", blurb: "Interfaces that reduce cognitive load for high-stakes work." },
  { title: "Interoperability", blurb: "How independent systems exchange meaning, not just data." },
  { title: "Knowledge Graphs", blurb: "Modelling institutional knowledge as connected, queryable structure." },
  { title: "Digital Twins", blurb: "Live models of physical operations for simulation and planning." },
  { title: "Smart Cities", blurb: "Municipal infrastructure that senses, reports, and adapts." },
  { title: "Data Standards", blurb: "Implementation-independent schemas that outlive the software that writes them." },
  { title: "Cloud Infrastructure", blurb: "Cost, performance, and sovereignty in African deployment contexts." },
  { title: "Edge Computing", blurb: "Computation close to the point of use, for low-connectivity environments." },
  { title: "Autonomous Systems", blurb: "Software that plans, acts, and reports under human oversight." },
] as const;
