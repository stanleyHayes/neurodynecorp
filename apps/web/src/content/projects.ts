/**
 * NeuroDyne project portfolio — the systems we've engineered.
 *
 * Each entry powers both the /projects index and its /projects/:slug detail
 * page: what it is, the problem it solves, how it solves it, and why it
 * matters for Ghana and the wider region.
 */

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

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  category: ProjectCategory;
  industry: string;
  status: "Production" | "Active development" | "Pilot" | "Prototype" | "Research";
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

export const PROJECTS: Project[] = [
  // ── Flagship industry operating systems ───────────────────────────────────
  {
    slug: "rentos",
    name: "RentOS",
    tagline: "The operating system for Ghana's rental housing market.",
    category: "Industry OS",
    industry: "Housing & Real Estate",
    status: "Active development",
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
    status: "Active development",
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
      "Piloted with Ghanaian schools including a senior high school and a basic school — deliberately different institutions, to prove the model holds across the sector rather than for one customer.",
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
    status: "Prototype",
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
    tagline: "Ghana's national disaster alert and response platform.",
    category: "Government",
    industry: "Public Safety",
    status: "Active development",
    year: "2025—",
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
    slug: "24-hour-economy",
    name: "24-Hour Economy Investment Platform",
    tagline: "Investment intelligence for a national economic programme.",
    category: "Government",
    industry: "Government & Finance",
    status: "Active development",
    year: "2025—",
    accent: "#F59E0B",
    summary:
      "Investor pipeline, project tracking, risk prediction and AI insight for the Republic of Ghana's 24-Hour Economy Programme.",
    problem: [
      "A national economic programme lives or dies on execution visibility. Investor conversations, project pipelines, directorate workstreams and risk all move in parallel — usually tracked in disconnected spreadsheets and inboxes.",
      "Without a single operational picture, leadership cannot answer basic questions reliably: which projects are stalling, where capital is committed versus deployed, which partnerships need intervention this week.",
      "Public accountability compounds the problem: a programme of national significance must be able to report on itself accurately.",
    ],
    approach: [
      "One platform tracks investors, projects and directorate activity through a shared pipeline model, so status is derived from records rather than reassembled by hand.",
      "A machine-learning service scores project risk, surfacing likely trouble before it becomes visible in outcomes.",
      "AI-powered insight summarises pipeline movement for decision makers, and multi-channel notifications (SMS, WhatsApp, email) keep distributed stakeholders synchronised.",
      "A public marketing surface and a mobile application extend the same data outward, so transparency is a property of the system rather than a separate reporting exercise.",
    ],
    capabilities: [
      "Investor and partnership pipeline management",
      "Project tracking across directorates",
      "ML-based risk prediction",
      "AI-generated programme insights",
      "SMS / WhatsApp / email notifications",
      "Public site and mobile application",
    ],
    audience: ["Programme secretariat", "Government directorates", "Investors", "Policy leadership"],
    impact: [
      "Ghana's 24-Hour Economy programme is a national industrial-policy initiative. Software that makes execution measurable is directly in service of the country's economic strategy.",
      "Risk prediction converts oversight from retrospective reporting into forward-looking intervention.",
      "Systems that make government programmes legible to their own leadership are the foundation of public accountability.",
    ],
    stack: ["Node.js", "Express", "MongoDB", "Redis", "React", "Vite", "Next.js", "Python", "FastAPI", "Expo"],
    provenPrimitives: ["Pipeline modelling", "Risk scoring", "Executive analytics", "Multi-channel notification"],
  },
  {
    slug: "xcreativs",
    name: "XCreativs Platform",
    tagline: "Sovereignty-conscious digital systems for government and enterprise.",
    category: "Enterprise",
    industry: "Government & Enterprise",
    status: "Production",
    year: "2024—",
    accent: "#38BDF8",
    summary:
      "Public surface, client delivery portal, partner ecosystem and AI concierge on an 81-table domain model — bilingual and self-hostable.",
    problem: [
      "Government agencies and large enterprises need more than a website. They need the full lifecycle: a public presence, qualified lead intake, a delivery portal where clients can see their own projects, invoices and documents, and a partner network.",
      "Buying that as five separate SaaS products means five vendors, five data silos and five places for sensitive information to live outside the institution's control.",
      "For public-sector buyers in particular, data sovereignty and bilingual delivery are not preferences — they are procurement requirements.",
    ],
    approach: [
      "A single domain model spanning nine bounded contexts across 81 tables — designed first, implemented second — so the platform's behaviour is a consequence of a modelled reality rather than accumulated features.",
      "Self-hostable and bilingual (English/French) by design, so institutions that must keep data inside their own boundary can.",
      "Enterprise identity is built in: SSO, OIDC and multi-factor authentication, with a client portal covering deliverables, invoices and payments through both Stripe and Paystack.",
      "An AI concierge grounded in retrieval answers questions from the institution's own documents rather than from open-ended generation.",
    ],
    capabilities: [
      "Public marketing surface with lead qualification",
      "Client portal: deliverables, invoices, payments",
      "Partner ecosystem portal",
      "SSO / OIDC / MFA and applicant tracking",
      "AI concierge with retrieval grounding",
      "Interactive readiness and cost tools",
      "209 documented API operations",
    ],
    audience: ["Government agencies", "Enterprise clients", "Delivery partners"],
    impact: [
      "Digital sovereignty is a live concern for African institutions: the ability to run critical systems inside your own infrastructure is strategic, not cosmetic.",
      "Bilingual delivery opens the same platform to Francophone West Africa, where the same institutional needs exist and the same software rarely reaches.",
      "Demonstrates that rigorous domain modelling — not framework choice — is what makes enterprise software maintainable.",
    ],
    stack: ["Go", "Chi", "pgx", "PostgreSQL", "Next.js 16", "JWT", "TOTP", "OIDC"],
    provenPrimitives: ["Domain modelling at scale", "Enterprise identity", "Client portals", "Retrieval-grounded AI"],
  },
  {
    slug: "auraops",
    name: "AuraOps",
    tagline: "Zero-trust remote monitoring and management.",
    category: "Enterprise",
    industry: "IT Operations & Security",
    status: "Active development",
    year: "2025—",
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
    status: "Active development",
    year: "2025—",
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
    slug: "back2u",
    name: "Back2u",
    tagline: "A verified lost-and-found ecosystem.",
    category: "Commerce",
    industry: "Consumer Safety",
    status: "Production",
    year: "2024—",
    accent: "#8B85FF",
    summary:
      "AI matching across image, text, location and time — with proof-of-ownership verification, escrow rewards and police-report generation.",
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
    tagline: "The digital home of Cape Coast.",
    category: "Civic & Impact",
    industry: "Community & Culture",
    status: "Active development",
    year: "2024—",
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
    status: "Active development",
    year: "2024—",
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
    slug: "xtiitch",
    name: "Xtiitch",
    tagline: "An operating system for Ghanaian fashion businesses.",
    category: "Commerce",
    industry: "Retail & Fashion",
    status: "Active development",
    year: "2025—",
    accent: "#EF4444",
    summary:
      "Per-business storefronts with payments, customer records and operations — so a tailor runs a business, not a social media account.",
    problem: [
      "Ghana's fashion industry is enormous, skilled and almost entirely undigitised. Most businesses operate through WhatsApp and Instagram: no storefront, no order records, no customer history, no payment reconciliation.",
      "Measurements, deposits, delivery dates and fabric details live in notebooks and chat threads, which is where disputes come from.",
      "Generic e-commerce platforms don't fit a made-to-order craft business with per-customer specifications.",
    ],
    approach: [
      "Every business gets its own storefront on a subdomain — a real commercial address rather than a profile on someone else's platform.",
      "The dashboard models the actual operation: orders, customers, staff and payments, with Paystack subaccounts and splits so money moves correctly.",
      "Background workers handle customer notification over the channels the market already uses.",
    ],
    capabilities: [
      "Per-business storefront on its own subdomain",
      "Owner and staff dashboards",
      "Paystack payments with subaccounts and splits",
      "Customer and order records",
      "Notification worker (WhatsApp/SMS-ready)",
      "Media management",
    ],
    audience: ["Fashion and apparel business owners", "Their staff", "Their customers"],
    impact: [
      "Ghanaian fashion is a globally competitive craft sector held back by operational tooling, not talent.",
      "A verifiable order and payment history is the first step toward these businesses accessing formal credit.",
      "Owning your storefront rather than renting attention on a social platform changes the economics of the business.",
    ],
    stack: ["Go", "Hexagonal architecture", "PostgreSQL", "React Router", "MUI", "Expo", "BullMQ", "Redis"],
    provenPrimitives: ["Multi-tenant storefronts", "Split payments", "Operational modelling"],
  },
  {
    slug: "health-platform",
    name: "Health Platform",
    tagline: "Hospital and patient systems wired into national health infrastructure.",
    category: "Healthcare",
    industry: "Healthcare",
    status: "Active development",
    year: "2024—",
    accent: "#00D4AA",
    summary:
      "Referrals, visits and patient records across hospital and patient applications, integrated with NHIS claims and DHIMS2 reporting.",
    problem: [
      "A patient referred from one Ghanaian facility to another typically carries their own history on paper, or not at all. The receiving clinician starts from an incomplete picture.",
      "Facilities must report into DHIMS2 and claim through NHIS — both of which become manual, error-prone work when the clinical system doesn't speak those languages natively.",
      "Patients have no view of their own health record at all.",
    ],
    approach: [
      "Separate hospital and patient applications on a shared model, so clinicians and patients see the same record from their own perspective.",
      "NHIS and DHIMS2 integration are built as first-class modules rather than export scripts — national reporting and insurance claiming are part of the clinical workflow, not a separate month-end exercise.",
      "Referral and visit workflows are modelled explicitly so that continuity of care survives the handoff between facilities.",
    ],
    capabilities: [
      "Hospital portal: referrals, visits, records",
      "Patient portal and mobile application",
      "NHIS insurance claim integration",
      "DHIMS2 district health reporting",
      "Referral workflow across facilities",
    ],
    audience: ["Hospitals and clinics", "Clinicians", "Patients", "Ghana Health Service"],
    impact: [
      "Interoperability with NHIS and DHIMS2 is the difference between a system a Ghanaian facility can actually adopt and one it cannot.",
      "Accurate, timely district health reporting improves the data on which national health policy is made.",
      "Giving patients access to their own record is a precondition for continuity of care in a system where people move between facilities.",
    ],
    stack: ["React", "Vite", "Expo", "Node.js", "NHIS integration", "DHIMS2 integration"],
    provenPrimitives: ["Health data interoperability", "Referral workflows", "Regulatory reporting"],
  },
  {
    slug: "ubuntu-fund",
    name: "Ubuntu Fund",
    tagline: "Crowdfunding infrastructure with trust built in.",
    category: "Civic & Impact",
    industry: "Philanthropy & Finance",
    status: "Active development",
    year: "2024—",
    accent: "#6C63FF",
    summary:
      "Campaigns, wallets and donations with transactional integrity, campaign limits and fraud controls at the core.",
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
    status: "Production",
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
    status: "Active development",
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
    tagline: "A national framework for personal and civic transformation.",
    category: "Civic & Impact",
    industry: "Civic Education",
    status: "Active development",
    year: "2025—",
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
    status: "Production",
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
    slug: "kedland",
    name: "Kedland International School",
    tagline: "A school's public presence, governed by a content registry.",
    category: "Education",
    industry: "Education",
    status: "Active development",
    year: "2025—",
    accent: "#6C63FF",
    summary:
      "Public site and back office where editors can change content but not break structure — accessibility enforced by quality gates.",
    problem: [
      "Schools need a credible public presence for prospective parents, and the ability to keep it current without a developer.",
      "Give non-technical editors a fully open page builder and the site degrades within months: broken hierarchy, inaccessible markup, inconsistent brand.",
      "Accessibility is usually asserted and rarely enforced.",
    ],
    approach: [
      "A locked-down section registry: editors change content within defined sections but cannot restructure pages — freedom where it helps, constraint where it hurts.",
      "Accessibility to WCAG AA and quality gates are enforced in the build pipeline, so standards hold over time rather than at launch.",
    ],
    capabilities: [
      "Public school website",
      "Section-registry CMS with structural guardrails",
      "WCAG AA accessibility enforcement",
      "Automated quality gates",
    ],
    audience: ["School administrators", "Prospective parents", "Current families"],
    impact: [
      "For a school, digital credibility directly affects enrolment.",
      "Guardrails mean the site is still correct and accessible years after handover — the real test of institutional software.",
      "A repeatable model for the many Ghanaian schools with the same need.",
    ],
    stack: ["Next.js 16", "NestJS", "MongoDB", "Vercel", "Render"],
    provenPrimitives: ["Structured CMS", "Accessibility enforcement", "Quality gating"],
  },
  {
    slug: "obiara",
    name: "Obiara",
    tagline: "Consent-first social connection, culturally grounded.",
    category: "Media & Creators",
    industry: "Social & Community",
    status: "Prototype",
    year: "2025—",
    accent: "#EF4444",
    summary:
      "An African-centred introduction platform where nothing is revealed without dual consent, and product rules are enforced in code.",
    problem: [
      "Mainstream dating platforms optimise for exposure and engagement. Their mechanics — open profile browsing, unsolicited contact, pay-to-be-seen — sit badly with the courtship norms of many African communities.",
      "Consent is typically a policy in a document rather than a property of the system.",
      "Cultural context is treated as a localisation layer over an unchanged product.",
    ],
    approach: [
      "Dual consent is a mechanic, not a setting: identity is revealed only when both parties agree, through deliberately staged introduction ceremonies.",
      "Community structures — circles and gatherings — reflect how introductions actually happen socially.",
      "Product laws are enforced in the system: no selling of introductions, no member-to-member payments, alternating conversation. The AI concierge is explicitly barred from autonomous matchmaking.",
      "A licensed matchmaker marketplace brings an existing cultural role into the platform rather than replacing it with an algorithm.",
    ],
    capabilities: [
      "Dual-consent reveal mechanics",
      "Community circles and gatherings",
      "Consent-bounded AI concierge",
      "Licensed matchmaker marketplace",
      "Cultural games and storytelling",
      "Enforced product laws",
    ],
    audience: ["African singles and their communities", "Licensed matchmakers", "Families"],
    impact: [
      "Technology that adapts to cultural practice rather than overriding it is rare, and it is a deliberate engineering position.",
      "Encoding consent in mechanics — not policy — is a materially stronger privacy guarantee.",
      "Demonstrates that product ethics can be architectural constraints instead of guidelines.",
    ],
    stack: ["Go", "Hexagonal architecture", "MongoDB", "Next.js", "React", "Expo"],
    provenPrimitives: ["Consent architecture", "Community modelling", "Constrained AI"],
  },
];

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  "Industry OS",
  "Government",
  "Education",
  "Healthcare",
  "Media & Creators",
  "Commerce",
  "Enterprise",
  "Civic & Impact",
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}
