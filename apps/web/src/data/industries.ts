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
];

export function getIndustry(slug: string): Industry | undefined {
  return INDUSTRIES.find((i) => i.slug === slug);
}
