// Shared content for the Industries pages (overview grid + /industries/:slug detail).

export interface Industry {
  slug: string;
  name: string;
  kicker: string;
  color: string;
  summary: string;
  /** Sector-specific problems the firm solves. */
  challenges: string[];
  /** How the capability lattice maps to those problems. */
  approach: string[];
  /** Representative work in this sector (anonymised where required). */
  work: string[];
}

export const INDUSTRIES: Industry[] = [
  {
    slug: "government",
    name: "Government",
    kicker: "PUBLIC SECTOR",
    color: "#6C63FF",
    summary: "National-scale digital systems for authorities and agencies, built sovereign-by-default.",
    challenges: [
      "Fragmented data across agencies with no shared intelligence layer",
      "Procurement and accountability requirements that demand full audit trails",
      "Data-residency and sovereignty obligations",
    ],
    approach: [
      "Architecture audits that produce an 18–36 month roadmap",
      "Mission-critical builds with security and compliance designed in",
      "Sovereign hosting options and client-owned data with extract-at-any-time",
    ],
    work: ["24-Hour Economy Investment Intelligence Platform"],
  },
  {
    slug: "health",
    name: "Health",
    kicker: "CLINICAL SYSTEMS",
    color: "#00D4AA",
    summary: "Interoperable clinical records, claims automation, and health intelligence for clinic networks.",
    challenges: [
      "Paper records and disconnected billing across clinics",
      "Slow NHIS and private claims processing",
      "No intelligence over data already being generated",
    ],
    approach: [
      "Unified, consent-aware electronic health records",
      "Automated claims capture, validation, and submission",
      "Predictive operational layers over network data — never another clinic's",
    ],
    work: ["ILIVVON Health Intelligence Platform", "FastCare Clinics — Healthcare Management Platform"],
  },
  {
    slug: "financial-services",
    name: "Financial Services",
    kicker: "FINTECH",
    color: "#F59E0B",
    summary: "Investment intelligence, payments, and lending platforms hardened for real volume.",
    challenges: [
      "Reconciling capital flows across many sources in real time",
      "Risk scoring with explainable, evaluated models",
      "Multi-currency exposure (USD / GHS / EUR)",
    ],
    approach: [
      "Event-driven ingestion and real-time analytics",
      "ML scoring with evaluation and drift monitoring",
      "Milestone-based invoicing and multi-rail payments (Stripe, Paystack)",
    ],
    work: ["24-Hour Economy Investment Intelligence Platform", "JDPlus — susu & lending"],
  },
  {
    slug: "insurance",
    name: "Insurance",
    kicker: "RISK & CLAIMS",
    color: "#8B85FF",
    summary: "Claims, underwriting support, and member platforms with strong audit and consent.",
    challenges: [
      "Manual claims adjudication and slow settlement",
      "Member data scattered across systems",
      "Regulatory reporting and audit obligations",
    ],
    approach: [
      "Structured claims intake with SLA tracking",
      "Consent-aware member records and full audit logging",
      "Integration with clinical and payment systems",
    ],
    work: ["NHIS claims flows (via ILIVVON / FastCare)"],
  },
  {
    slug: "retail-commerce",
    name: "Retail & Commerce",
    kicker: "COMMERCE",
    color: "#33DDBB",
    summary: "Catalogues, marketplaces, and multi-vendor commerce platforms built to scale.",
    challenges: [
      "Inventory and catalogue management across vendors",
      "Payments and fulfilment in constrained markets",
      "After-sale service and retention",
    ],
    approach: [
      "Advanced product browsing, search, and filtering",
      "Multi-vendor onboarding and product management",
      "QR-coded service histories and SMS follow-up workflows",
    ],
    work: ["JDPlus — AC sales, service & QR follow-up", "Multi-vendor marketplace"],
  },
  {
    slug: "energy",
    name: "Energy",
    kicker: "UTILITIES",
    color: "#F59E0B",
    summary: "Operational and analytics platforms for energy operators and distributors.",
    challenges: [
      "Field operations with poor connectivity",
      "Asset and service tracking at scale",
      "Demand and consumption analytics",
    ],
    approach: [
      "Offline-first field applications",
      "Asset registries with service histories",
      "Analytics layers over operational data",
    ],
    work: ["Available on request"],
  },
  {
    slug: "education",
    name: "Education",
    kicker: "EDTECH",
    color: "#6C63FF",
    summary: "Admissions, learning, and institution-management platforms for schools and programmes.",
    challenges: [
      "Manual admissions and cohort management",
      "Disconnected student and staff records",
      "Limited reporting for funders and regulators",
    ],
    approach: [
      "Admissions and cohort workflows end-to-end",
      "Unified student records and reporting",
      "Role-scoped dashboards for staff and leadership",
    ],
    work: ["Admissions & cohort platform (first cycle live)"],
  },
  {
    slug: "ngo-development",
    name: "NGO / Development",
    kicker: "DEVELOPMENT",
    color: "#00D4AA",
    summary: "Donor-capital intelligence and programme platforms for the development sector.",
    challenges: [
      "Tracking donor capital against outcomes",
      "Reporting across funders with different requirements",
      "Programme operations in low-connectivity settings",
    ],
    approach: [
      "Programme and portfolio tracking against targets",
      "Donor-grade reporting and exports",
      "Offline-capable field data capture",
    ],
    work: ["Donor-capital intelligence (24H+ programme)"],
  },
  {
    slug: "agriculture",
    name: "Agriculture",
    kicker: "FOOD SYSTEMS",
    color: "#22C55E",
    summary: "Traceability, input financing and market linkage for the sector that employs most of the continent.",
    challenges: [
      "Smallholder output is invisible to formal markets and lenders",
      "No verifiable traceability from farm to buyer, which blocks export premiums",
      "Extension advice and price information arrive late, or not at all",
    ],
    approach: [
      "Producer and plot registries that give farmers a durable digital identity",
      "Traceability records that survive the handoffs between aggregator, processor and exporter",
      "Low-bandwidth and USSD channels so the system works where the farms are",
    ],
    work: ["Producer registry and traceability reference models"],
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    kicker: "HOUSING & PROPERTY",
    color: "#00D4AA",
    summary: "Formalising how property is listed, leased, paid for and regulated.",
    challenges: [
      "Verbal tenancy agreements leave both landlords and tenants unprotected",
      "Rent paid faithfully for years produces no credit history",
      "Regulators cannot measure the market they are asked to govern",
    ],
    approach: [
      "Structured digital leases with clause-level compliance checking",
      "Mobile-money rent rails that convert payment into verifiable history",
      "Policy simulation so interventions can be modelled before they are legislated",
    ],
    work: ["RentOS — rental housing operating system"],
  },
  {
    slug: "transportation",
    name: "Transportation & Logistics",
    kicker: "MOVEMENT",
    color: "#38BDF8",
    summary: "Fleet, freight and last-mile systems built for real road, address and connectivity conditions.",
    challenges: [
      "Addressing is inconsistent, which breaks routing and proof of delivery",
      "Fleet and freight status lives in phone calls rather than systems",
      "Cash-on-delivery reconciliation is manual and error-prone",
    ],
    approach: [
      "Geospatial models that tolerate imprecise addressing",
      "Offline-capable driver applications that reconcile when connectivity returns",
      "Event-driven tracking so every party sees the same shipment state",
    ],
    work: ["Routing and dispatch reference implementations"],
  },
  {
    slug: "construction",
    name: "Construction",
    kicker: "BUILT ENVIRONMENT",
    color: "#F59E0B",
    summary: "Project, compliance and supply-chain systems for an industry that runs on documents.",
    challenges: [
      "Drawings, permits, variations and inspections live across paper and chat",
      "Cost overruns surface long after the decisions that caused them",
      "Compliance evidence is assembled retrospectively under deadline",
    ],
    approach: [
      "Document and approval modelling so the audit trail is a by-product of the work",
      "Progress and cost telemetry tied to the schedule rather than to reports",
      "Mobile-first site capture designed for gloves, sunlight and poor signal",
    ],
    work: ["Project controls and compliance modelling"],
  },
  {
    slug: "manufacturing",
    name: "Manufacturing",
    kicker: "PRODUCTION",
    color: "#8B85FF",
    summary: "Production, inventory and quality systems that make output measurable.",
    challenges: [
      "Machine and line data never reaches the people making planning decisions",
      "Inventory accuracy degrades between counts",
      "Quality issues are detected at the end rather than at the source",
    ],
    approach: [
      "Edge data capture close to the line, tolerant of intermittent connectivity",
      "Inventory models that reconcile continuously instead of periodically",
      "Predictive signals for maintenance and quality drift",
    ],
    work: ["Inventory and production data standards"],
  },
  {
    slug: "media-creators",
    name: "Media & Creators",
    kicker: "CREATOR ECONOMY",
    color: "#EF4444",
    summary: "Infrastructure for people who run media businesses, not just publish content.",
    challenges: [
      "Creators operate businesses with none of the operating tools businesses get",
      "Production pipelines are manual and locked to single AI vendors",
      "Distribution platforms own the audience relationship",
    ],
    approach: [
      "Workflow engines that own the process while providers stay swappable",
      "Human approval gates before publication — verification before virality",
      "Owned publishing surfaces so the audience relationship stays with the creator",
    ],
    work: ["Aura Media Engine", "Creator OS", "People Who Inspire"],
  },
  {
    slug: "hospitality",
    name: "Hospitality & Tourism",
    kicker: "GUEST OPERATIONS",
    color: "#F59E0B",
    summary: "Booking, guest experience and operations for a sector that trades on reputation.",
    challenges: [
      "Bookings arrive across phone, WhatsApp and third-party channels with no single view",
      "Guest history is lost between stays",
      "Local operators pay high commissions for demand they could own",
    ],
    approach: [
      "Channel-agnostic booking models with one authoritative reservation record",
      "Guest profiles that persist across properties and visits",
      "Direct-booking surfaces that reduce commission dependency",
    ],
    work: ["Discovery and booking reference models"],
  },
  {
    slug: "telecommunications",
    name: "Telecommunications",
    kicker: "CONNECTIVITY",
    color: "#38BDF8",
    summary: "Subscriber, network and value-added service platforms — including the USSD rails everything else depends on.",
    challenges: [
      "Subscriber data is fragmented across billing, network and support systems",
      "Value-added services take months to launch",
      "USSD and SMS remain critical channels yet are treated as legacy",
    ],
    approach: [
      "Unified subscriber modelling across billing, network and care",
      "Service platforms that treat USSD and SMS as first-class delivery channels",
      "Event streaming for real-time network and usage intelligence",
    ],
    work: ["Multi-channel notification infrastructure"],
  },
  {
    slug: "sports",
    name: "Sports",
    kicker: "ATHLETE & CLUB SYSTEMS",
    color: "#22C55E",
    summary: "Club administration, athlete development and fan platforms.",
    challenges: [
      "Athlete records, scouting notes and medical history sit in disconnected files",
      "Clubs have no operational systems for membership, ticketing or compliance",
      "Talent is discovered informally and inconsistently",
    ],
    approach: [
      "Athlete and club records modelled as durable, portable histories",
      "Ticketing, membership and competition administration in one system",
      "Performance and development analytics for coaching decisions",
    ],
    work: ["Club and competition administration models"],
  },
];

export function getIndustry(slug: string): Industry | undefined {
  return INDUSTRIES.find((i) => i.slug === slug);
}
