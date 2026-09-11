/**
 * NeuroDyne project portfolio — the systems we've engineered.
 *
 * Each entry powers both the /projects index and its /projects/:slug detail
 * page: what it is, the problem it solves, how it solves it, and why it
 * matters for Ghana and the wider region.
 */

import type { Maturity } from "@/content/maturity";

export type ProjectCategory =
  | "Industry OS"
  | "Government"
  | "Education"
  | "Healthcare"
  | "Media & Creators"
  | "Commerce"
  | "Enterprise"
  | "Civic & Impact";

export interface ProjectSection {
  heading: string;
  body: string[];
}

/**
 * How a piece of work relates to Neurodyne.
 *
 * - `platform`    a Neurodyne product. Carries a maturity label.
 * - `open-source` Neurodyne work published publicly under an open licence.
 * - `labs`        a documented concept: specified and designed, not yet built.
 *                 Always RESEARCH. This is a blueprint library, not a roadmap —
 *                 nothing here is a commitment to ship.
 * - `client-work` built for another organisation. No maturity label: it is not
 *                 ours to mature, and the client, not Neurodyne, decides its
 *                 fate. Clients are anonymised unless written permission to
 *                 name them is on file.
 */
export type ProductTier = "platform" | "open-source" | "labs" | "client-work";

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  category: ProjectCategory;
  industry: string;
  tier: ProductTier;
  /** Required for `platform` and `labs`; absent for `client-work`. */
  maturity?: Maturity;
  /**
   * For `client-work` only: whether this was commissioned work or work done in
   * partnership / support of a cause. Both are real engineering; conflating
   * them would misrepresent the commercial relationship in either direction.
   */
  engagement?: "Client project" | "Partnership" | "Non-profit" | "In discussion";
  year: string;
  accent: string;
  /** Short card summary for the index page. */
  summary: string;
  /** The world before this system existed. */
  problem: string[];
  /** How the system solves it. */
  approach: string[];
  /** Concrete capabilities. */
  capabilities: string[];
  /** Who uses it. */
  audience: string[];
  /** Why it matters — Ghana / Africa framing. */
  impact: string[];
  stack: string[];
  /** Which reusable NeuroDyne primitives it proved out. */
  provenPrimitives?: string[];
}

export const PROJECTS: Project[] = [{
    slug: "rentos",
    name: "RentOS",
    tagline: "The operating system for Ghana's rental housing market.",
    category: "Industry OS",
    industry: "Housing & Real Estate",
    tier: "platform",
    maturity: "PRIVATE BETA",
    year: "2025—",
    accent: "#00D4AA",
    summary:
      "Digital infrastructure for renting in Ghana — verified listings, signed leases, mobile-money rent, tenant credit history, and policy tools for regulators.",
    problem: [
      "Ghana's rental market runs on cash, verbal agreements and trust. A tenant can pay rent faithfully for a decade and still have no financial record to show for it — no credit history, no proof of reliability, nothing a bank will recognise.",
      "Landlords have no reliable way to verify tenants. Tenants have no protection from illegal clauses or arbitrary advance demands. And the state, which sets housing policy, has almost no visibility into what is actually happening in the market it regulates.",
      "The result is a market where disputes are resolved informally, deposits vanish, and the two- and three-year rent advances that lock young Ghanaians out of housing continue unchallenged because nobody can measure them.",
    ],
    approach: [
      "RentOS models the entire rental lifecycle as one system rather than a listings app: discovery, agreement, payment, dispute, and oversight.",
      "Every lease is a structured digital record, not a scanned PDF. Because the agreement is modelled, the platform can detect clauses that contradict tenancy law before either party signs.",
      "Rent paid through the platform becomes a verifiable payment history. Over time this produces something Ghana's housing market has never had at scale: a tenant credit record built from real behaviour.",
      "Regulators get an analytical layer on top — the ability to simulate the effect of a rent cap or an advance limit against real market data before it becomes policy.",
    ],
    capabilities: [
      "Property listings with government-approval workflow",
      "Digitally signed leases with illegal-clause detection",
      "Mobile-money rent collection (MTN MoMo, Telecel, AirtelTigo)",
      "Tenant credit scoring from payment, savings and compliance history",
      "RentGuard wallet: savings and micro-advances for rent shortfalls",
      "Structured dispute mediation workflow",
      "Policy simulation tools for housing regulators",
    ],
    audience: ["Tenants", "Landlords", "Property managers", "Housing regulators", "Legal officers"],
    impact: [
      "Rent advance demands of two to three years are one of the sharpest barriers to housing access for young Ghanaians. You cannot regulate what you cannot measure — RentOS makes the market legible.",
      "A tenant credit record turns years of faithful rent payment into financial identity: the basis for a loan, a mortgage, or a formal tenancy elsewhere.",
      "Formalising agreements reduces the disputes that currently consume court and community time, and gives both landlords and tenants a record to stand on.",
    ],
    stack: ["React 19", "Vite", "TypeScript", "Expo / React Native", "Node.js", "Express", "MongoDB", "Socket.IO", "Mobile Money APIs"],
    provenPrimitives: ["Identity & verification", "Payments & wallets", "Document modelling", "Dispute workflows", "Policy analytics"],
  },
  {
    slug: "auraedu",
    name: "AuraEDU",
    tagline: "A multi-tenant operating system for schools.",
    category: "Education",
    industry: "Education",
    tier: "platform",
    maturity: "IN DEVELOPMENT",
    year: "2024—",
    accent: "#6C63FF",
    summary:
      "One platform running academics, fees, attendance, admissions, communication and AI guidance — configurable per school rather than rebuilt per school.",
    problem: [
      "A school does not need a student portal. It operates an entire educational ecosystem: admissions, timetabling, assessment, fees, attendance, discipline, parent communication, career guidance and reporting — usually across paper, spreadsheets and disconnected tools.",
      "Software vendors respond by selling a different product for each function, or by writing bespoke code for each school. Both approaches collapse at scale: the first fragments the data, the second makes every customer a maintenance burden.",
      "For most Ghanaian schools the practical outcome is that the data needed to actually improve outcomes — who is falling behind, which fees are outstanding, which interventions worked — is never assembled in one place.",
    ],
    approach: [
      "AuraEDU models the school itself, not a feature list. Thirty-plus domain services cover academics, fees, attendance, admissions, CRM, campaigns, assessment, computer-based testing and career guidance.",
      "It is multi-tenant by default: a single continuously improving platform serves many schools, each with its own branding, policies, permissions and enabled features — configuration rather than custom code.",
      "AI is infrastructure here, not a feature: recommendation, prediction and orchestration services support teachers and administrators with early-warning signals and guidance instead of replacing their judgement.",
      "Each service owns its data with strict isolation, so a school's records remain its own and remain portable.",
    ],
    capabilities: [
      "Academic records, timetabling and assessment",
      "Fees, invoicing and payment reconciliation",
      "Attendance and discipline tracking",
      "Admissions pipeline and CRM",
      "Computer-based testing",
      "Career guidance with AI recommendation",
      "Parent, teacher and student portals (web + mobile)",
      "Per-tenant branding and feature flags",
    ],
    audience: ["School administrators", "Teachers", "Students", "Parents", "Education authorities"],
    impact: [
      "Ghana's education sector is digitising school by school, each one paying to solve problems every other school also has. A shared, configurable platform converts that duplicated spend into shared infrastructure.",
      "When attendance, assessment and fees live in one model, early-warning becomes possible: the student drifting toward dropout is visible while there is still time to intervene.",
    ],
    stack: ["Go", "Hexagonal microservices", "Python", "FastAPI", "Next.js 16", "React 19", "Expo", "PostgreSQL", "NATS JetStream"],
    provenPrimitives: ["Multi-tenancy", "Configuration over customization", "Service isolation", "AI orchestration", "Event streaming"],
  },
  {
    slug: "aura-media-engine",
    name: "Aura Media Engine",
    tagline: "Industrial-scale video production, engineered as a pipeline.",
    category: "Media & Creators",
    industry: "Media & Creators",
    tier: "client-work",
    engagement: "Client project",
    year: "2025—",
    accent: "#8B85FF",
    summary:
      "A workflow engine that takes a topic through brief, script, scenes, render, human approval and publishing — with every AI provider swappable.",
    problem: [
      "Short-form video is now how a large share of the world receives information, but producing it at volume is a manual chain of scripting, voicing, sourcing visuals, rendering and publishing.",
      "Teams that try to automate it typically hard-wire themselves to one AI vendor. When that vendor's price, quality or availability changes — and it always does — the whole pipeline has to be rebuilt.",
      "The harder problem is trust: fully automated content pipelines publish mistakes at the same speed they publish everything else.",
    ],
    approach: [
      "The workflow engine owns the process — topic → brief → script → scenes → render → approval → publish — and treats video, voice, music, language and publishing providers as interchangeable capabilities behind adapters.",
      "A human approval gate sits before publication by design. The system is built to accelerate a team's judgement, not to remove it.",
      "Because provider adapters are swappable, the pipeline survives vendor churn: models can be replaced without touching the production logic.",
    ],
    capabilities: [
      "Topic-to-publish production workflow",
      "Swappable video / voice / music / LLM providers",
      "Scene composition and automated rendering",
      "Mandatory human approval gate",
      "Multi-tenant studio workspaces",
      "Performance metrics dashboard",
    ],
    audience: ["Content studios", "Marketing teams", "Creators operating at volume", "Media organisations"],
    impact: [
      "African stories are under-produced not for lack of stories but for lack of production capacity. Lowering the cost per finished video changes who gets to publish at scale.",
      "Provider independence matters more in markets with foreign-exchange constraints — the ability to switch to a cheaper or locally available model is an economic feature, not a technical one.",
      "The approval gate encodes a principle we hold across the company: verification before virality.",
    ],
    stack: ["Go", "Node.js", "FFmpeg", "PostgreSQL", "Redis", "MinIO", "MCP adapters"],
    provenPrimitives: ["Workflow orchestration", "Provider abstraction", "Human-in-the-loop approval", "Media pipelines"],
  },
  {
    slug: "nadaa",
    name: "NADAA",
    tagline: "A disaster alert and response system designed for national scale.",
    category: "Government",
    industry: "Public Safety",
    tier: "labs",
    maturity: "RESEARCH",
    year: "Specified 2025",
    accent: "#EF4444",
    summary:
      "Flood risk monitoring, citizen reporting, dispatcher command and agency coordination — one system connecting citizens to NADMO, assemblies and hospitals.",
    problem: [
      "When flooding hits, the information that matters — where water is rising, who is trapped, which shelters have space, which hospitals can receive patients — exists in fragments across agencies, phone calls and social media.",
      "Citizens often have no reliable channel to report an incident or check whether their area is at risk. Dispatchers work without a shared operational picture.",
      "By the time coordination happens through informal channels, the window in which response is most effective has usually closed.",
    ],
    approach: [
      "NADAA connects the whole response chain in one system: a citizen application for alerts, risk checks, reporting and shelter information; a dispatcher command console; agency operations portals; and an administrative governance layer.",
      "Machine-learning services model flood risk so that warnings can be issued ahead of impact rather than after it.",
      "Notifications reach people the way they actually communicate — SMS, USSD, WhatsApp and voice — because a disaster platform that assumes smartphone data access will fail the people who need it most.",
      "Shelter capacity, hospital capacity, relief logistics and a missing-person registry are modelled as first-class services, not afterthoughts.",
    ],
    capabilities: [
      "Citizen alerts, risk checks and incident reporting",
      "ML flood prediction and risk scoring",
      "Dispatcher command console and incident command",
      "SMS / USSD / WhatsApp / voice notification fan-out",
      "Shelter and hospital capacity tracking",
      "Relief logistics coordination",
      "Missing-person registry",
    ],
    audience: ["Citizens", "NADMO", "District assemblies", "Hospitals", "Emergency dispatchers"],
    impact: [
      "Seasonal flooding is a recurring national emergency in Ghana with predictable geography and unpredictable timing. Infrastructure that shortens warning-to-response time saves lives directly.",
      "USSD and voice channels mean the platform reaches citizens without smartphones or data — the population most exposed to flood risk.",
      "A shared operational picture across NADMO, assemblies and hospitals turns parallel efforts into coordinated response.",
    ],
    stack: ["Go microservices", "React", "Vite", "Expo", "Terraform", "Kubernetes", "ML risk services"],
    provenPrimitives: ["Multi-channel notification", "Geospatial modelling", "Incident command workflows", "Inter-agency coordination"],
  },
  {
    slug: "auraops",
    name: "AuraOps",
    tagline: "Zero-trust remote monitoring and management.",
    category: "Enterprise",
    industry: "IT Operations & Security",
    tier: "labs",
    maturity: "RESEARCH",
    year: "Specified 2025",
    accent: "#EF4444",
    summary:
      "Endpoint telemetry, patching, remote sessions and AI-assisted diagnostics — governed by a control plane with signed agent communication.",
    problem: [
      "Managing a fleet of machines requires an agent on every endpoint. Most such agents run with sweeping privileges and implicit trust, which makes the management tool itself one of the most dangerous pieces of software in the organisation.",
      "IT teams and managed service providers need telemetry, patching, remote support and automation — without accepting that risk profile.",
      "Meanwhile the operational knowledge of what actually fixed an incident stays in individual engineers' heads.",
    ],
    approach: [
      "A control plane owns policy, identity and audit; endpoints act on signed instruction envelopes rather than ambient trust, with cryptographic signing on every command.",
      "Real host telemetry drives patch and software rollout, terminal sessions and automation — with every action attributable.",
      "AI assists diagnosis and learns from resolved incidents, turning individual troubleshooting into institutional capability, and predicts capacity pressure before it becomes an outage.",
      "Enterprise identity (SSO, SCIM) is built in, because access governance is the point of the product, not an add-on.",
    ],
    capabilities: [
      "Signed-envelope endpoint agent protocol",
      "Host telemetry and inventory",
      "Patch and software rollout",
      "Remote terminal sessions",
      "AI-assisted diagnostics and incident learning",
      "Capacity prediction",
      "Enterprise SSO and SCIM provisioning",
    ],
    audience: ["Managed service providers", "Enterprise IT teams", "Security operations"],
    impact: [
      "As African organisations digitise, the endpoints running their operations multiply faster than the security expertise available to manage them.",
      "A zero-trust management layer means the tool that protects the fleet cannot itself become the attack path.",
      "Incident learning compounds scarce expertise across an entire team instead of concentrating it in individuals.",
    ],
    stack: ["Go", "Next.js", "MUI", "PostgreSQL", "Redis", "NATS", "ed25519 signing"],
    provenPrimitives: ["Zero-trust agent protocol", "Audit and attribution", "Fleet telemetry", "AI incident learning"],
  },
  {
    slug: "launchpad",
    name: "LaunchPad",
    tagline: "The employment lifecycle, from offer to fully onboarded.",
    category: "Enterprise",
    industry: "Employment & HR",
    tier: "labs",
    maturity: "RESEARCH",
    year: "Specified 2025",
    accent: "#00D4AA",
    summary:
      "Multi-tenant employee onboarding with SCIM provisioning, HRIS sync, and an AI assistant that answers only from the company's own documents.",
    problem: [
      "Onboarding is where an organisation's promises meet its administration. It spans HR, IT, compliance, and management — and is usually coordinated through checklists and email.",
      "New employees spend their first weeks asking questions that are already answered somewhere in an internal document nobody can find.",
      "Provisioning accounts by hand across systems is both slow and a standing security risk when offboarding is equally manual.",
    ],
    approach: [
      "Onboarding is modelled as a structured, auditable process per tenant, with each organisation's own branding, policies and steps.",
      "SCIM 2.0 provisioning and OIDC single sign-on automate account lifecycle; HRIS synchronisation keeps records aligned with the system of record.",
      "The AI assistant is deliberately constrained: it answers from the organisation's grounded knowledge base with citations only, never from open generation — because a confidently wrong answer about policy is worse than no answer.",
    ],
    capabilities: [
      "Per-tenant onboarding journeys",
      "SCIM 2.0 provisioning and OIDC SSO",
      "HRIS synchronisation",
      "Grounded AI assistant with citation-only answers",
      "Slack and Teams notifications",
      "Knowledge management",
    ],
    audience: ["Enterprise HR teams", "IT administrators", "New employees"],
    impact: [
      "Youth employment is one of Ghana's defining economic questions. Infrastructure that makes it cheaper for organisations to bring people in properly lowers a real barrier to hiring.",
      "Citation-only AI is a trust design decision: staff can verify every answer against the source policy.",
      "Automated provisioning and deprovisioning closes one of the most common security gaps in growing organisations.",
    ],
    stack: ["Go", "Hexagonal modular monolith", "MongoDB", "Redis", "Next.js", "Claude"],
    provenPrimitives: ["Multi-tenancy", "Identity provisioning", "Grounded RAG", "Process modelling"],
  },
  {
    slug: "bak2me",
    name: "Bak2Me",
    tagline: "A property recovery and trust network.",
    category: "Commerce",
    industry: "Consumer Safety",
    tier: "platform",
    maturity: "PRIVATE BETA",
    year: "2024—",
    accent: "#8B85FF",
    summary:
      "Verified recovery points, ownership proof, chain-of-custody records and fraud scoring — built as a trust network rather than a lost-item listing board, because a user-confirmed return is not evidence enough to pay out a reward.",
    problem: [
      "Lost property recovery fails on two problems: matching and trust. Finding the right item among thousands of reports is hard; proving it is actually yours is harder.",
      "Existing channels — noticeboards, social media groups, institutional lost-and-found desks — solve neither, and create a route for opportunistic claiming.",
      "Where a reward is involved, both parties face a payment problem with no protection on either side.",
    ],
    approach: [
      "Matching combines visual, textual, geographic and temporal signals rather than relying on keyword search alone.",
      "Proof-of-ownership verification gates every claim, so recovery depends on evidence rather than assertion.",
      "Mobile-money escrow holds rewards until recovery is confirmed, and police-case PDF generation produces the documentation institutions actually require.",
      "Language support spans English, French, Twi, Ga and Ewe — because a national recovery service has to work in the languages people report in.",
    ],
    capabilities: [
      "AI visual + text + geo + time matching",
      "Geo-fenced hotspot map",
      "QR tag ecosystem",
      "Proof-of-ownership verification",
      "Mobile-money escrow rewards",
      "Courier recovery jobs",
      "Police-case PDF generation",
      "Multi-language: English, French, Twi, Ga, Ewe",
    ],
    audience: ["General public", "Schools", "Airports", "Malls", "Transport operators"],
    impact: [
      "Losing a phone, a laptop or documents represents a far larger share of household wealth in Ghana than the replacement cost suggests. Recovery infrastructure is consumer protection.",
      "Local-language support and mobile-money escrow are what make the system usable by the whole population rather than a segment of it.",
      "Institutional integrations — schools, airports, transport — turn scattered desks into a connected national network.",
    ],
    stack: ["Node.js", "Express", "Hexagonal architecture", "MongoDB", "OpenAI", "Twilio", "Mapbox", "Expo"],
    provenPrimitives: ["Multi-signal matching", "Verification workflows", "Escrow payments", "Localisation"],
  },
  {
    slug: "oguaa",
    name: "Oguaa",
    tagline: "A civic platform designed for Cape Coast.",
    category: "Civic & Impact",
    industry: "Community & Culture",
    tier: "labs",
    maturity: "RESEARCH",
    year: "Specified 2024",
    accent: "#F59E0B",
    summary:
      "One listings engine powering artists, heritage, memorials, businesses, festivals, safety reporting and a diaspora register for a single city.",
    problem: [
      "Cape Coast carries an outsized share of Ghana's cultural and historical significance, and almost none of it is organised digitally. Musicians, businesses, festivals, schools, memorials and heritage sites exist in fragments or not at all online.",
      "Cultural memory that isn't recorded is lost with the generation that held it.",
      "A diaspora with deep ties to the city has no structured way to stay connected to what is happening in it.",
    ],
    approach: [
      "A single polymorphic listings engine models everything the city needs to publish — artists, memorials, businesses, events, lost and found, safety incidents, diaspora register — rather than building a separate product per category.",
      "Public site, administrative console, creator studio and mobile applications all draw on that one model.",
      "Revenue is built into the civic mission: ticketing, subscriptions and promotion give the platform a path to sustaining itself rather than depending on grants.",
      "An AI writing assistant helps local administrators publish well without needing editorial staff.",
    ],
    capabilities: [
      "Polymorphic listings: artists, businesses, events, memorials",
      "Heritage and cultural preservation records",
      "Festival and event ticketing",
      "Safety incident reporting",
      "Diaspora register",
      "Creator studio and AI writing assistant",
    ],
    audience: ["Cape Coast residents", "Diaspora communities", "Local businesses", "Cultural institutions"],
    impact: [
      "Hyperlocal digital infrastructure is almost entirely absent in Ghanaian cities. Oguaa is a template: model one city properly and the pattern transfers.",
      "Recording heritage, memorials and cultural practice is preservation work with a deadline attached.",
      "Connecting diaspora to local commerce and culture creates an economic channel, not only a sentimental one.",
    ],
    stack: ["Go", "MongoDB", "React 19", "Vite", "Expo", "Claude", "Paystack"],
    provenPrimitives: ["Polymorphic content modelling", "Ticketing & payments", "AI authoring assistance"],
  },
  {
    slug: "encore",
    name: "Encore",
    tagline: "Local business discovery, built for Ghana.",
    category: "Commerce",
    industry: "Local Commerce",
    tier: "labs",
    maturity: "RESEARCH",
    year: "Specified 2024",
    accent: "#F59E0B",
    summary:
      "Business listings, reviews, ordering and discovery with Ghana-specific design, Twi language support and offline-capable mobile.",
    problem: [
      "Finding a trustworthy local business in Ghana still runs largely on word of mouth. Global review platforms have thin, stale coverage and interfaces designed for other markets.",
      "Small businesses have no low-friction way to establish a verifiable public reputation.",
      "Connectivity assumptions in most discovery apps exclude the users and areas where discovery matters most.",
    ],
    approach: [
      "Listings and reviews modelled for the local market, with an Adinkra-influenced visual language rather than an imported template.",
      "Offline mobile mode and Twi language support are treated as core requirements, not accessibility extras.",
      "Practical commerce features — order-ahead, delivery integration, itinerary routing — extend discovery into transaction.",
      "AI description generation and bulk import lower the effort of getting a business listed accurately in the first place.",
    ],
    capabilities: [
      "Business listings and reviews",
      "AI description generation and bulk import",
      "Social feed and order-ahead",
      "Offline mobile mode",
      "Itinerary route optimisation",
      "English and Twi localisation",
      "Elasticsearch-backed search",
    ],
    audience: ["Consumers across Ghana", "Local business owners", "Visitors and tourists"],
    impact: [
      "Discoverability is a growth constraint for small businesses that have no marketing budget. Reputation infrastructure is economic infrastructure.",
      "Twi support and offline capability determine whether the platform serves the whole country or only its connected centres.",
      "Local ownership of local commerce data keeps the value of that data in the market that produced it.",
    ],
    stack: ["Express", "MongoDB", "React 19", "Vite", "MUI", "Expo", "Redis", "Elasticsearch", "Paystack"],
    provenPrimitives: ["Search & discovery", "Offline-first mobile", "Localisation", "Reviews & reputation"],
  },
  {
    slug: "ujimora",
    name: "Ujimora",
    tagline: "Fundraising infrastructure for African causes and diaspora giving.",
    category: "Civic & Impact",
    industry: "Philanthropy & Finance",
    tier: "platform",
    maturity: "PRIVATE BETA",
    year: "2024—",
    accent: "#6C63FF",
    summary:
      "Connects African causes, communities and organisations with local and diaspora supporters — campaign tiers, progressive KYC, an auditable ledger, payout orchestration and fraud controls at the core.",
    problem: [
      "Online giving depends entirely on trust, and trust is exactly what informal fundraising cannot establish. Donors have no way to verify that a campaign is what it claims to be.",
      "Fraudulent campaigns damage the entire donation ecosystem, making legitimate causes harder to fund.",
      "Money movement in donation platforms is unforgiving: a partial failure that debits a donor without crediting a campaign destroys confidence permanently.",
    ],
    approach: [
      "Donation flows run inside database transactions so money movement is atomic — it either completes fully or not at all.",
      "Campaign limits, cooldowns and role-based administration constrain the behaviours fraud depends on.",
      "Security hardening — including token revocation — has been treated as ongoing engineering work rather than a launch checklist.",
    ],
    capabilities: [
      "Campaign creation with limits and cooldowns",
      "Transactional donation processing",
      "Wallets and subscriptions",
      "Donor leaderboards",
      "Role-based administration",
      "Organisation accounts",
    ],
    audience: ["Fundraisers", "Charitable organisations", "Donors", "Diaspora givers"],
    impact: [
      "Community fundraising is deeply embedded in Ghanaian social practice. Giving it reliable digital infrastructure extends reach beyond physical networks.",
      "Diaspora giving is a significant flow of capital that currently moves through informal, high-friction channels.",
      "Trust infrastructure protects legitimate causes from the reputational damage caused by fraudulent ones.",
    ],
    stack: ["TypeScript", "Node.js", "Express", "MongoDB", "Multi-app architecture"],
    provenPrimitives: ["Transactional payments", "Fraud controls", "Wallets", "RBAC"],
  },
  {
    slug: "impact-africa-alliance",
    name: "Impact Africa Alliance",
    tagline: "Digital presence for a Pan-African non-profit.",
    category: "Civic & Impact",
    industry: "Non-profit",
    tier: "client-work",
    engagement: "Non-profit",
    year: "2024—",
    accent: "#00D4AA",
    summary:
      "Marketing site and CMS with dual-rail donations — Stripe for international donors, Paystack for African ones.",
    problem: [
      "Non-profits are judged on credibility, and credibility online requires publishing consistently: news, impact stories, partners, opportunities. Most lack the technical staff to do it.",
      "A single international payment processor either excludes African donors or imposes costs that make small local donations uneconomic.",
      "Content that requires a developer to update simply doesn't get updated.",
    ],
    approach: [
      "A content management layer designed for non-technical editors, so the communications team publishes without engineering involvement.",
      "Dual payment rails — Stripe for international donors, Paystack for African donors — so each audience gives through the channel that works for them.",
      "Role-based access separates editorial from administrative capability.",
    ],
    capabilities: [
      "Marketing site with news and impact stories",
      "Admin CMS for non-technical editors",
      "Partners and job listings",
      "Stripe (international) + Paystack (Africa) donations",
      "JWT auth with role-based access",
    ],
    audience: ["Non-profit staff", "Donors", "Partners", "Job seekers", "Governments"],
    impact: [
      "Pan-African organisations need to be legible to international funders and local communities simultaneously — that is a dual-audience design problem, not just a translation one.",
      "Payment rails determine who can participate. Paystack alongside Stripe means African donors are first-class.",
      "Editorial independence from engineering is what makes consistent publishing sustainable for a small team.",
    ],
    stack: ["TypeScript", "React 18", "Vite", "MUI", "Express", "tsyringe", "MongoDB"],
    provenPrimitives: ["Editorial CMS", "Dual payment rails", "RBAC"],
  },
  {
    slug: "people-who-inspire",
    name: "People Who Inspire",
    tagline: "A leadership media platform with a content backbone.",
    category: "Media & Creators",
    industry: "Media & Community",
    tier: "client-work",
    engagement: "Non-profit",
    year: "2024—",
    accent: "#8B85FF",
    summary:
      "Events, conversations, fellowship applications and features — API-driven so a media brand can operate at publishing cadence.",
    problem: [
      "A media brand built on a weekly livestream, a fellowship programme and guest features needs an operational backbone, not a brochure site.",
      "Static marketing sites force every episode, guest and application cycle through a developer.",
      "Programme applications handled by email don't scale and don't produce usable data.",
    ],
    approach: [
      "Events, posts, partners and testimonials are modelled as managed content, driving the public site through an API.",
      "The admin CMS lets the team run the publishing cadence themselves.",
      "Fellowship applications are structured records, so a programme can be operated and measured rather than merely announced.",
    ],
    capabilities: [
      "Event and livestream management",
      "Blog and guest feature publishing",
      "Fellowship programme applications",
      "Partner and testimonial management",
      "Admin CMS",
    ],
    audience: ["Purpose-driven leaders and creatives", "Programme applicants", "Partners", "The editorial team"],
    impact: [
      "Accra-based, globally distributed: African thought leadership reaching an international audience on its own infrastructure.",
      "Structured programme applications turn an informal fellowship into something that can be run, tracked and improved.",
      "Media brands that own their publishing stack own their audience relationship.",
    ],
    stack: ["React 19", "Vite", "Tailwind", "Express", "MongoDB", "Framer Motion"],
    provenPrimitives: ["Editorial CMS", "Event modelling", "Application workflows"],
  },
  {
    slug: "yenara",
    name: "Yén Ara",
    tagline: "A framework for personal and civic transformation.",
    category: "Civic & Impact",
    industry: "Civic Education",
    tier: "labs",
    maturity: "RESEARCH",
    year: "Specified 2025",
    accent: "#F59E0B",
    summary:
      "A five-volume curriculum — self, home, school, work, nation — delivered with pledges, a behaviour code and organisational analytics.",
    problem: [
      "National development conversations focus on policy and capital, and rarely on the everyday behaviours that determine whether either works.",
      "Values programmes are typically delivered as speeches and campaigns: no structure, no participation record, no way to know whether anything changed.",
      "Schools and organisations that want to run such a programme have no framework to run it with.",
    ],
    approach: [
      "A structured curriculum across five concentric rings — self, home, school, work, nation — so personal change and national change are treated as the same continuum.",
      "A pledge system and code of behaviours make participation explicit and recordable.",
      "Organisational analytics let schools and institutions see engagement, converting a movement into a programme that can be evaluated.",
    ],
    capabilities: [
      "Five-volume Rings curriculum",
      "Pledge system",
      "Code of behaviours",
      "Organisation analytics dashboard",
      "Admin CMS",
    ],
    audience: ["Citizens", "Schools", "Organisations", "Civic institutions"],
    impact: [
      "Ghana's development challenges are as much civic and behavioural as they are technical or financial.",
      "Structure and measurement are what separate a sustained movement from a campaign.",
      "Institutional delivery through schools and workplaces reaches people where habits are actually formed.",
    ],
    stack: ["React", "Vite", "Node.js", "Express"],
    provenPrimitives: ["Curriculum modelling", "Participation tracking", "Organisational analytics"],
  },
  {
    slug: "daadd",
    name: "Daadd",
    tagline: "Advertising intelligence for the rest of the market.",
    category: "Commerce",
    industry: "Advertising & Marketing",
    tier: "client-work",
    engagement: "Client project",
    year: "2024—",
    accent: "#38BDF8",
    summary:
      "Campaign management, attribution and AI budget optimisation for advertisers priced out of enterprise adtech.",
    problem: [
      "Serious campaign management, attribution and optimisation tooling is built for large advertisers with agencies attached. Everyone else runs on intuition.",
      "Without attribution, spend is unmeasurable; without measurement, small advertisers cannot learn what works.",
      "Ad fraud and creative fatigue quietly consume budgets that can least absorb the loss.",
    ],
    approach: [
      "A two-sided platform connecting advertisers and publishers with real campaign lifecycle management and real-time analytics.",
      "AI handles bid and budget optimisation, anomaly detection and ad-fatigue management — the analytical work an agency would otherwise do.",
      "Cross-device attribution and geographic heatmaps make spend legible; six-language localisation makes the platform usable across markets.",
    ],
    capabilities: [
      "Campaign lifecycle management",
      "Real-time analytics and geographic heatmaps",
      "AI bid and budget optimisation",
      "Anomaly and fraud detection",
      "Cross-device attribution",
      "Ad-fatigue management",
      "Six-language localisation",
    ],
    audience: ["Small and mid-size advertisers", "Publishers", "Campaign managers"],
    impact: [
      "Access to measurement is what lets a small business compete on effectiveness rather than budget.",
      "Fraud detection protects advertisers for whom a wasted campaign is a material loss.",
      "Localisation opens the same tooling across multiple African markets.",
    ],
    stack: ["Express", "MongoDB", "React", "Vite", "React Native", "Expo", "i18n"],
    provenPrimitives: ["Analytics pipelines", "AI optimisation", "Attribution modelling"],
  },
  {
    slug: "aura",
    name: "AURA",
    tagline: "Smart space management for a private university campus.",
    category: "Education",
    industry: "Higher Education",
    tier: "client-work",
    engagement: "In discussion",
    year: "2026",
    accent: "#F59E0B",
    summary: "A web and mobile resource-allocation platform that combines timetables, reservations and maintenance windows to calculate trustworthy, real-time campus availability.",
    problem: ["Lecture schedules, ad-hoc bookings and maintenance windows compete for the same rooms but are usually managed in separate records.", "Without concurrency-safe approval, two valid-looking requests can reserve the same facility."],
    approach: ["AURA stores recurring timetable occupancy separately from bookings, then computes availability across both without destroying historical reservations when a semester changes.", "PostgreSQL exclusion constraints and per-room locking make approval safe under concurrent demand."],
    capabilities: ["Timetable CSV/XLSX ingestion", "Real-time room availability", "Conflict-safe booking approval", "Web and mobile access", "Utilisation reporting", "RBAC, MFA and audit trails"],
    audience: ["Students", "Faculty", "Campus staff", "Timetable administrators", "Booking officers"],
    impact: ["Turns scarce campus facilities into measurable, discoverable shared resources.", "The completed technical core proves a reusable model for universities managing lectures and ad-hoc reservations together."],
    stack: ["Go", "PostgreSQL 18", "Next.js 16", "React 19", "Expo", "sqlc", "Terraform"],
    provenPrimitives: ["Interval-based availability", "Concurrency-safe approval", "Academic timetable ingestion"],
  },
  {
    slug: "scheduleflow",
    name: "ScheduleFlow",
    tagline: "Conflict-free academic scheduling with an auditable institutional workflow.",
    category: "Education",
    industry: "Higher Education",
    tier: "client-work",
    engagement: "In discussion",
    year: "2026",
    accent: "#6C63FF",
    summary: "A scheduling engine and administration platform that assembles, validates, approves and exports university timetables with zero hard conflicts.",
    problem: ["Academic scheduling must reconcile rooms, courses, lecturers and institutional constraints at a scale spreadsheets cannot safely govern."],
    approach: ["The system separates optimisation from the approval workflow and records every decision, notification and published schedule as auditable state."],
    capabilities: ["Constraint-aware schedule generation", "Conflict validation", "HOD review inbox", "Approval and publication workflow", "PostgreSQL-backed notifications", "Exports for downstream systems"],
    audience: ["Registry teams", "Heads of department", "Lecturers", "University administrators"],
    impact: ["Reduces the manual coordination cost of producing a valid semester timetable and creates a dependable record other campus systems can consume."],
    stack: ["Go", "PostgreSQL", "React", "TypeScript", "Background jobs"],
    provenPrimitives: ["Constraint engines", "Institutional approvals", "Auditable publication"],
  },
  {
    slug: "alumni-platform",
    name: "Alumni Platform",
    tagline: "A digital home for alumni, school legacy and collective support.",
    category: "Education",
    industry: "Alumni & Education",
    tier: "client-work",
    engagement: "Client project",
    year: "2025—2026",
    accent: "#00D4AA",
    summary: "A public site and alumni operations platform for registration, year-group directories, events, projects, news, volunteering and donations.",
    problem: ["Alumni records, events, school projects and fundraising often live in disconnected forms, chats and spreadsheets.", "That fragmentation makes it difficult to sustain participation across generations."],
    approach: ["One API-backed platform gives alumni, administrators and the public role-appropriate views of the same association record.", "Production deployment keeps the API isolated while the public, admin and alumni surfaces use an explicit origin allowlist."],
    capabilities: ["Alumni registration and directory", "Events and RSVP", "Projects and initiatives", "News and announcements", "Volunteer and donation pathways", "Admin and alumni portals"],
    audience: ["Old students", "Year-group representatives", "School leadership", "Association administrators", "Supporters"],
    impact: ["Preserves institutional memory while turning alumni goodwill into structured mentorship, projects and support for the school."],
    stack: ["TypeScript", "React", "Node.js", "MongoDB", "Render", "Vercel", "Socket.IO"],
    provenPrimitives: ["Membership directories", "Alumni engagement", "Multi-surface deployment"],
  },
  {
    slug: "creator-os",
    name: "Creator OS",
    tagline: "Owned business infrastructure beneath a creator's social attention.",
    category: "Media & Creators",
    industry: "Creator Economy",
    tier: "labs",
    maturity: "RESEARCH",
    year: "Specified 2026",
    accent: "#38BDF8",
    summary: "A multi-tenant platform for creator-owned publishing, community, commerce, events, sponsorships and operations without replacing discovery networks.",
    problem: ["Creators build audiences on platforms they do not control, then operate community, sales and partnerships through disconnected tools."],
    approach: ["Creator OS keeps discovery platforms as distribution while giving each creator an owned destination, customer record and operational console."],
    capabilities: ["Creator sites and studio", "Community and memberships", "Commerce and payments", "Events and sponsorships", "Agency workspaces", "CMS and analytics"],
    audience: ["Creators", "Creator teams", "Agencies", "Brand partners", "Fans"],
    impact: ["Moves creators from rented reach toward durable audience relationships and diversified businesses."],
    stack: ["TypeScript", "Go", "Next.js", "React", "PostgreSQL", "MongoDB", "Playwright"],
    provenPrimitives: ["Multi-tenant publishing", "Creator commerce", "Consent-aware sponsorship operations"],
  },
  {
    slug: "fan-nation-os",
    name: "Fan Nation OS",
    tagline: "Infrastructure for creator-led fan nations.",
    category: "Media & Creators",
    industry: "Creator Economy",
    tier: "labs",
    maturity: "RESEARCH",
    year: "Specified 2026",
    accent: "#EF4444",
    summary: "A creator-first fan platform spanning public identity, community, content, paid access, mobile experiences and operational dashboards.",
    problem: ["Fan communities are scattered across social feeds, messaging groups and payment tools, leaving creators without a coherent operating model."],
    approach: ["The platform treats each fan nation as an isolated tenant with shared product infrastructure and explicit boundaries between public previews and authenticated data."],
    capabilities: ["Nation-branded public experience", "Fan feeds and gated content", "Creator and company dashboards", "Mobile applications", "Subscriptions and payouts", "Tenant-safe operations"],
    audience: ["Creators", "Fans", "Creator teams", "Platform operators"],
    impact: ["Gives African creators infrastructure to own community value instead of exporting it entirely to global social networks."],
    stack: ["Go", "Next.js", "React Native", "MongoDB", "Paystack"],
    provenPrimitives: ["Tenant resolution", "Fan memberships", "Creator payouts"],
  },
  {
    slug: "ghana-geo",
    name: "GhanaGeo",
    tagline: "A trustworthy geographic data platform for Ghana.",
    category: "Government",
    industry: "Geospatial Infrastructure",
    tier: "open-source",
    maturity: "IN DEVELOPMENT",
    year: "2026—",
    accent: "#00D4AA",
    summary: "Versioned geography data, search, geocoding, APIs and operator tools built around Ghana's regions, districts and places.",
    problem: ["Applications repeatedly rebuild incomplete or inconsistent copies of Ghana's administrative geography, weakening search, reporting and interoperability."],
    approach: ["A governed data core publishes versioned datasets through stable REST and gRPC contracts, typo-tolerant search and auditable operator workflows."],
    capabilities: ["Regions, districts and places catalogue", "Search and autocomplete", "Geocode and reverse geocode", "Dataset publish and rollback", "Developer portal and sandbox", "Admin governance"],
    audience: ["Software teams", "Government programmes", "Researchers", "Logistics and civic platforms"],
    impact: ["Shared geographic infrastructure removes duplicated data cleaning and gives Ghanaian digital services a consistent language for place."],
    stack: ["Go", "MongoDB", "Redis", "Typesense", "gRPC", "React", "OpenAPI"],
    provenPrimitives: ["Versioned public data", "Search relevance", "Dataset governance"],
  },
  {
    slug: "proguide-gh",
    name: "ProGuideGH",
    tagline: "Certified tourist-guide supply for Ghana.",
    category: "Commerce",
    industry: "Tourism",
    tier: "client-work",
    engagement: "Client project",
    year: "2026—",
    accent: "#F59E0B",
    summary: "A marketplace where visitors book certified guides while operators manage assignments, payments, safety, quality and supply in real time.",
    problem: ["Travellers struggle to verify guides, while certified guides lack a dependable channel for paid assignments and tourism authorities lack operating visibility."],
    approach: ["Tourist, guide and administrator experiences share a PostgreSQL system of record, with realtime assignment state and explicit safety and quality controls."],
    capabilities: ["Guide discovery and verification", "Bookings and paid assignments", "Tourist and guide PWAs", "Operations console", "Safety workflows", "Quality and financial reporting"],
    audience: ["Tourists", "Certified guides", "Tour operators", "Tourism authorities"],
    impact: ["Improves visitor trust while directing more tourism income to qualified local professionals."],
    stack: ["Go", "PostgreSQL", "Redis", "Next.js", "React Native"],
    provenPrimitives: ["Two-sided marketplaces", "Assignment dispatch", "Safety-aware commerce"],
  },
  {
    slug: "al-maleek",
    name: "AL Maleek Digital Ecosystem",
    tagline: "An owned commercial platform for a creator-led brand.",
    category: "Media & Creators",
    industry: "Creator Economy",
    tier: "client-work",
    engagement: "Partnership",
    year: "2026—",
    accent: "#8B85FF",
    summary: "A public brand, client portal and operations stack connecting content, community, partnerships, events, ticketing, education and enquiries.",
    problem: ["A growing creator brand cannot reliably convert attention into partnerships and transactions when every workflow lives in a different third-party channel."],
    approach: ["Independent public, client and administration surfaces share one API and business model while remaining separately deployable."],
    capabilities: ["Content and community", "Enquiries and partnerships", "Events and ticketing", "Education offers", "Client portal", "Administration and analytics"],
    audience: ["Fans", "Brand partners", "Event attendees", "Creator operations staff"],
    impact: ["Creates an owned path from attention to durable community and revenue."],
    stack: ["Go", "Next.js 16", "TypeScript", "MongoDB", "Vercel", "Render"],
    provenPrimitives: ["Creator CRM", "First-party ticketing", "Multi-surface brand operations"],
  },
  {
    slug: "joe-kuntani",
    name: "Joe Kuntani Digital Brand Platform",
    tagline: "First-party media, commercial operations and ticketing.",
    category: "Media & Creators",
    industry: "Media & Entertainment",
    tier: "client-work",
    engagement: "Partnership",
    year: "2026",
    accent: "#EF4444",
    summary: "A standalone public brand and administration platform for content, enquiries, campaigns, bookings, analytics and direct event ticketing.",
    problem: ["A creator's brand, content catalogue, commercial enquiries and event sales become fragile when they depend on disconnected social and ticketing platforms."],
    approach: ["A first-party site and operations console share a typed API contract, while social-link video ingestion avoids unnecessary paid media hosting."],
    capabilities: ["Public media catalogue", "CMS and media management", "Enquiries and CRM", "Bookings and campaigns", "First-party event ticketing", "Analytics"],
    audience: ["Fans", "Event attendees", "Brand partners", "Management staff"],
    impact: ["Keeps audience relationships and commercial intelligence under the creator's control."],
    stack: ["Go", "Next.js 16", "MongoDB", "OpenAPI", "Playwright"],
    provenPrimitives: ["Social media ingestion", "First-party ticketing", "Creator operations"],
  },
  {
    slug: "altar-os",
    name: "ALTAR OS",
    tagline: "An operating system for churches and ministry communities.",
    category: "Civic & Impact",
    industry: "Faith & Community",
    tier: "labs",
    maturity: "RESEARCH",
    year: "Specified 2026",
    accent: "#F59E0B",
    summary: "A planned and partially built platform for congregation identity, ministry operations, giving, communication, programmes and pastoral workflows.",
    problem: ["Church operations span people, programmes, care, finance and communication, yet the institutional record is often fragmented across paper and consumer messaging tools."],
    approach: ["ALTAR OS models ministry operations as one governed system, with a Go service core and separate web and mobile experiences."],
    capabilities: ["Member and ministry records", "Programmes and scheduling", "Giving and receipts", "Pastoral-care workflows", "Communication", "Web and mobile access"],
    audience: ["Church leaders", "Administrators", "Ministry teams", "Members"],
    impact: ["Helps community institutions preserve continuity, accountability and care as they grow."],
    stack: ["Go", "PostgreSQL", "React", "Expo", "Kafka"],
    provenPrimitives: ["Community identity", "Receipt-led finance", "Ministry workflow modelling"],
  },
  {
    slug: "career-os",
    name: "CareerOS",
    tagline: "From career discovery to preparation, opportunity, growth and legacy.",
    category: "Civic & Impact",
    industry: "Employment & Skills",
    tier: "labs",
    maturity: "RESEARCH",
    year: "Specified 2026",
    accent: "#6C63FF",
    summary: "A build-ready career platform designed to support the full arc of a person's working life rather than stopping at job search.",
    problem: ["Job boards optimise for vacancies, leaving career discovery, preparation, transitions and long-term development fragmented."],
    approach: ["CareerOS models a continuous journey from self-understanding through employment and advancement, with secure foundations and phase-ready domain boundaries."],
    capabilities: ["Career discovery", "Skills and preparation plans", "Opportunity matching", "Applications and employment", "Growth and transitions", "Career legacy"],
    audience: ["Students", "Job seekers", "Working professionals", "Career advisers", "Employers"],
    impact: ["Treats a career as a compounding human-development journey, not a sequence of isolated applications."],
    stack: ["Next.js 16", "Go", "MongoDB", "Redis", "Render"],
    provenPrimitives: ["Lifecycle modelling", "Opportunity workflows", "Guided progression"],
  },
  {
    slug: "retail-os",
    name: "RetailOS",
    tagline: "Enter, scan, shop, pay and walk out.",
    category: "Commerce",
    industry: "Physical Retail",
    tier: "labs",
    maturity: "RESEARCH",
    year: "Specified 2026",
    accent: "#F59E0B",
    summary: "A Ghana-first, multi-store checkout platform that begins with smartphones and existing barcodes, then progressively supports smart carts and store hardware.",
    problem: ["Traditional checkout queues create friction for shoppers and operational cost for retailers, while hardware-first automation is too expensive for most African stores."],
    approach: ["A software-first modular platform delivers scan-and-go on customers' phones before introducing optional weight sensors, RFID and smart-cart devices."],
    capabilities: ["Barcode scan-and-go", "Live baskets", "Digital payment", "Exit verification", "Multi-store tenancy", "Optional smart-cart hardware"],
    audience: ["Shoppers", "Supermarkets", "Retail chains", "Store operators"],
    impact: ["Makes modern self-checkout accessible without requiring a retailer to rebuild every store around expensive hardware."],
    stack: ["Go", "Next.js", "React Native", "PostgreSQL", "Mobile Money"],
    provenPrimitives: ["Store tenancy", "Checkout integrity", "Hardware-optional architecture"],
  },
  {
    slug: "circle-of-life",
    name: "Circle of Life",
    tagline: "Gather, give, remember—and return to the moment each year.",
    category: "Civic & Impact",
    industry: "Life Events & Community",
    tier: "labs",
    maturity: "RESEARCH",
    year: "Specified 2026",
    accent: "#8B85FF",
    summary: "A private, shareable platform for life events, wishlists, tributes, contributions, gifting and yearly remembrance.",
    problem: ["The people, gifts, messages and memories around important life moments are scattered across chats, payment receipts and temporary social posts."],
    approach: ["One reusable event model supports celebration, support and remembrance while keeping privacy, contribution records and recurring dates explicit."],
    capabilities: ["Life-event spaces", "Wishlists and gifts", "Group contributions", "Tributes and memories", "Private sharing", "Annual remembrance"],
    audience: ["Families", "Friends", "Communities", "Event organisers"],
    impact: ["Creates durable, culturally adaptable records around how communities gather, give and remember."],
    stack: ["Next.js 16", "Go", "MongoDB", "Cloudinary", "Resend"],
    provenPrimitives: ["Private sharing", "Group contributions", "Recurring life events"],
  },
  {
    slug: "intercity-logistics",
    name: "Intercity Logistics Platform",
    tagline: "One shipment identity across every handoff.",
    category: "Industry OS",
    industry: "Logistics",
    tier: "labs",
    maturity: "RESEARCH",
    year: "Specified 2026",
    accent: "#00D4AA",
    summary: "A Ghana-first logistics layer connecting homes, parcel points, terminals, carriers, destination hubs and last-mile delivery.",
    problem: ["Domestic parcels move through informal handoffs, paper tickets and phone calls, forcing customers and merchants to coordinate transport infrastructure themselves."],
    approach: ["Customers create and pay for one shipment while the platform orchestrates carrier and hub handoffs behind one tracking identity."],
    capabilities: ["Shipment creation", "Pricing and payment", "Carrier and hub orchestration", "Chain-of-custody tracking", "Merchant tools", "Last-mile delivery"],
    audience: ["Households", "Online merchants", "Transport operators", "Parcel points", "Couriers"],
    impact: ["Turns existing transport capacity into legible, trackable logistics infrastructure for domestic commerce."],
    stack: ["Go", "PostgreSQL", "React", "Expo", "Event-driven boundaries"],
    provenPrimitives: ["Chain of custody", "Multi-party orchestration", "Unified tracking"],
  },
  {
    slug: "communication-os",
    name: "Communication OS",
    tagline: "Turn conversations into action, knowledge and community.",
    category: "Enterprise",
    industry: "Communication & Collaboration",
    tier: "labs",
    maturity: "RESEARCH",
    year: "Specified 2026",
    accent: "#38BDF8",
    summary: "An AI-native communication platform for messaging, structured communities, collaborative work, knowledge, commerce, mini-apps and developer APIs.",
    problem: ["Important decisions and commitments disappear into message history, while overloaded users must manually convert conversation into tasks and durable knowledge."],
    approach: ["Messaging stays fast and private, while consent-aware AI helps extract decisions, tasks, events and searchable knowledge for low-bandwidth, multilingual markets."],
    capabilities: ["Private and group messaging", "Structured communities", "AI catch-up and search", "Conversation-to-action workflows", "Community commerce", "Bots and mini-apps"],
    audience: ["Individuals", "Teams", "Communities", "Businesses", "Developers"],
    impact: ["Makes communication more operational without increasing noise or surrendering user control to automation."],
    stack: ["Go", "WebSockets", "PostgreSQL", "React", "React Native", "AI retrieval"],
    provenPrimitives: ["Realtime messaging", "Conversation intelligence", "Low-bandwidth collaboration"],
  },
  {
    slug: "authentiseal",
    name: "AuthentiSeal",
    tagline: "Digitise institutional trust, not merely signatures.",
    category: "Government",
    industry: "Document Trust",
    tier: "labs",
    maturity: "RESEARCH",
    year: "Specified 2026",
    accent: "#EF4444",
    summary: "A digital institutional seal and document-trust network for policy-driven approvals, verification, revocation and public-sector auditability.",
    problem: ["A visible signature image cannot prove that an institution authorised a document, that the signer had authority, or that approval remains valid."],
    approach: ["Routine approvals become policy-bound institutional seals backed by HSM/KMS signing, immutable audit evidence and public verification; exceptional decisions remain human-controlled."],
    capabilities: ["Policy-driven institutional seals", "HSM/KMS delegated signing", "Document verification", "Revocation and expiry", "Issuer governance", "Tamper-evident audit"],
    audience: ["Government institutions", "Regulated organisations", "Document issuers", "Citizens and verifiers"],
    impact: ["Creates verifiable public trust around official digital documents without exposing institutional signing keys."],
    stack: ["Go", "PostgreSQL", "KMS / HSM", "React", "OpenAPI"],
    provenPrimitives: ["Institutional trust", "Key isolation", "Verifiable documents"],
  },
];

/** Only categories that actually have entries — no empty filter chips. */
export const PROJECT_CATEGORIES: ProjectCategory[] = [
  "Industry OS",
  "Government",
  "Education",
  "Media & Creators",
  "Commerce",
  "Enterprise",
  "Civic & Impact",
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

/** Neurodyne's own products. The narrow, flagship surface. */
export const PLATFORMS = PROJECTS.filter((p) => p.tier === "platform");

/**
 * Documented concepts: specified and designed, not built. Presented as a
 * blueprint library rather than a roadmap, so a long list reads as depth of
 * thinking rather than as fifteen half-finished products.
 */
export const LABS = PROJECTS.filter((p) => p.tier === "labs");

/** Neurodyne work published publicly under an open licence. */
export const OPEN_SOURCE = PROJECTS.filter((p) => p.tier === "open-source");

/** Work delivered for other organisations. Clients anonymised by default. */
export const CLIENT_WORK = PROJECTS.filter((p) => p.tier === "client-work");

export function projectsByTier(tier: ProductTier): Project[] {
  return PROJECTS.filter((p) => p.tier === tier);
}
