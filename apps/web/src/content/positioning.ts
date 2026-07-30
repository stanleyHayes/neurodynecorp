/**
 * NeuroDyne Corp — brand positioning content.
 *
 * Single source of truth for the marketing narrative: NeuroDyne is an
 * engineering company building intelligent digital infrastructure for
 * organizations, industries, and nations — not a software agency.
 */

export const BRAND = {
  positioning:
    "NeuroDyne is an engineering company building intelligent digital infrastructure for organizations, industries, and nations. Through software engineering, artificial intelligence, cloud technologies, and open standards, we create interoperable systems that enable the next generation of digital transformation.",
  hero: {
    title: "Engineering the Operating Systems of Tomorrow.",
    lead: "NeuroDyne designs intelligent digital infrastructure that powers organizations, industries, and nations.",
    sub: "From AI-powered enterprise platforms to open data standards and digital transformation frameworks, we build the systems that make modern societies work.",
    primaryCta: { label: "Explore Our Solutions", to: "/solutions" },
    secondaryCta: { label: "Start a Project", to: "/start-project" },
  },
  intro: {
    title: "More Than Software",
    body: [
      "Technology shouldn't be a collection of disconnected applications.",
      "Hospitals, schools, governments, businesses, financial institutions, and creators all deserve technology that works together seamlessly.",
      "At NeuroDyne, we design digital ecosystems rather than isolated software. Every platform we build is designed to integrate, scale, and evolve.",
    ],
  },
} as const;

// ── What We Do ───────────────────────────────────────────────────────────────

export const WHAT_WE_DO = [
  {
    slug: "digital-transformation",
    title: "Digital Transformation",
    blurb: "Helping organizations modernize operations using software, AI and automation.",
  },
  {
    slug: "enterprise-software",
    title: "Enterprise Software",
    blurb: "Custom platforms built for performance, security and long-term growth.",
  },
  {
    slug: "artificial-intelligence",
    title: "Artificial Intelligence",
    blurb: "Practical AI that improves productivity, decision making and customer experiences.",
  },
  {
    slug: "open-standards",
    title: "Open Standards",
    blurb: "Building open specifications that allow different software systems to communicate effortlessly.",
  },
  {
    slug: "research-innovation",
    title: "Research & Innovation",
    blurb: "Exploring the future of computing, digital identity, interoperability and intelligent systems.",
  },
] as const;

// ── Why NeuroDyne ────────────────────────────────────────────────────────────

export const WHY_NEURODYNE = [
  { title: "Engineering First", body: "We believe great software begins with great engineering." },
  { title: "Open by Design", body: "Whenever possible, we build technologies based on open standards rather than vendor lock-in." },
  { title: "AI Native", body: "Artificial intelligence isn't an add-on. It is part of our engineering process." },
  { title: "Built to Scale", body: "Whether serving one company or millions of users, every system is engineered for reliability." },
  { title: "Long-Term Partnerships", body: "We don't disappear after launch. We become technology partners throughout your organization's growth." },
] as const;

// ── Featured initiatives (industry operating systems) ────────────────────────

export const INITIATIVES = [
  { slug: "neurodyne-os", name: "NeuroDyne OS", blurb: "The operating system for digital organizations.", status: "In development" },
  { slug: "open-standards", name: "Open Data Standards Initiative", blurb: "Building interoperable standards for industries across Africa.", status: "Active" },
  { slug: "creator-os", name: "Creator OS", blurb: "Digital infrastructure for creators.", status: "In development" },
  { slug: "education-os", name: "Education OS", blurb: "Operating system for schools.", status: "Piloting" },
  { slug: "health-os", name: "Health OS", blurb: "Unified healthcare ecosystem.", status: "Research" },
  { slug: "rentos", name: "RentOS", blurb: "The future of intelligent property management.", status: "In development" },
  { slug: "career-os", name: "Career OS", blurb: "The complete employment lifecycle platform.", status: "In development" },
] as const;

// ── About ────────────────────────────────────────────────────────────────────

export const ABOUT = {
  intro: [
    "Technology is changing every industry.",
    "Unfortunately, much of today's software remains fragmented, incompatible, and difficult to scale. Organizations often rely on disconnected systems that create inefficiencies, duplicate data, and limit innovation.",
    "NeuroDyne was founded to solve this challenge.",
    "We are an engineering company focused on building intelligent digital infrastructure that connects people, organizations, and industries through scalable software, artificial intelligence, and open standards.",
    "Rather than creating isolated applications, we build complete ecosystems that simplify operations, improve interoperability, and prepare organizations for the future.",
    "Our work combines software engineering, cloud architecture, artificial intelligence, user experience, cybersecurity, and data engineering into solutions designed to stand the test of time.",
  ],
  vision:
    "To become Africa's leading engineering company for intelligent digital infrastructure, creating technology that enables every organization to operate seamlessly in a connected world.",
  mission:
    "To design and build secure, scalable, and intelligent software platforms that accelerate digital transformation while promoting openness, interoperability, and innovation.",
  philosophy: ["Simple", "Reliable", "Interoperable", "Secure", "Intelligent", "Human-Centered", "Open", "Scalable"],
  values: [
    { title: "Engineering Excellence", body: "Quality is never accidental." },
    { title: "Continuous Learning", body: "Innovation comes from curiosity." },
    { title: "Openness", body: "We believe collaboration builds stronger technology." },
    { title: "Integrity", body: "Trust is earned through transparency." },
    { title: "Impact", body: "Technology should solve meaningful problems." },
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

// ── Industries ───────────────────────────────────────────────────────────────

export const INDUSTRY_LIST = [
  "Healthcare",
  "Education",
  "Government",
  "Financial Services",
  "Retail & Commerce",
  "Agriculture",
  "Transportation",
  "Construction",
  "Manufacturing",
  "Media & Creators",
  "Hospitality",
  "NGOs",
  "Telecommunications",
  "Energy",
  "Professional Services",
  "Sports",
  "Real Estate",
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
