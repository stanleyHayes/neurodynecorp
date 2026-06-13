// Shared content for NeuroDyne Labs product pages (overview + /labs/:slug detail).
// In-file structured content matches the convention used by other identity pages
// (About, Trust, Legal*). Can be promoted to a CMS-backed `labs` module later.

export interface LabsProduct {
  slug: string;
  name: string;
  kicker: string;
  tagline: string;
  status: "Active" | "In development" | "In formation" | "Piloting";
  color: string;
  /** The problem the platform exists to solve. */
  problem: string;
  /** What the platform is, in one paragraph. */
  platform: string;
  /** Headline capabilities. */
  features: { title: string; body: string }[];
  /** Sectors / markets served. */
  sectors: string[];
  /** Technical architecture highlights. */
  architecture: string[];
}

export const LABS_PRODUCTS: LabsProduct[] = [
  {
    slug: "ilivvon",
    name: "ILIVVON",
    kicker: "HEALTH INTELLIGENCE",
    tagline: "A health intelligence platform connecting clinics, patients, and payers across an interoperable record.",
    status: "In development",
    color: "#00D4AA",
    problem:
      "African clinics run on fragmented paper records, disconnected billing, and no shared patient history. Care is duplicated, claims are slow, and there is no intelligence layer over the data that is already being generated every day.",
    platform:
      "ILIVVON is a health intelligence platform that unifies the clinical record, automates NHIS and private claims, and adds a predictive layer over patient and operational data — built mobile-first and resilient on low-bandwidth networks.",
    features: [
      { title: "Unified patient record", body: "One interoperable EHR shared across the clinic network, with consent-aware access." },
      { title: "Claims automation", body: "NHIS and private claims captured, validated, and submitted with status tracking end-to-end." },
      { title: "Telemedicine", body: "Asynchronous and live consults that work on constrained connections." },
      { title: "Intelligence layer", body: "Operational dashboards and predictive signals over the network's own data — never another clinic's." },
    ],
    sectors: ["Health", "Insurance", "Government / Public Health"],
    architecture: [
      "Mobile-first PWA with aggressive offline caching for low-bandwidth realities",
      "Consent-aware access control and a full audit trail on every record view",
      "Interoperability via standard health data exchange formats",
      "Data residency options for on-shore hosting where regulation requires",
    ],
  },
  {
    slug: "24h-economy-intelligence",
    name: "24H+ Authority Intelligence",
    kicker: "INVESTMENT INTELLIGENCE",
    tagline: "Investment intelligence and management for the 24-hour economy — real-time analytics, ML scoring, and portfolio tracking.",
    status: "Piloting",
    color: "#F59E0B",
    problem:
      "National economic programmes generate enormous flows of investment, donor, and operational data with no single intelligence surface to evaluate readiness, score opportunities, or track deployment against policy intent.",
    platform:
      "The 24H+ Authority Intelligence Architecture is an investment-intelligence platform that ingests market, donor, and programme data, scores opportunities with ML, and gives authorities a real-time picture of capital deployment against policy outcomes.",
    features: [
      { title: "Real-time analytics", body: "Live dashboards over market, investment, and programme data." },
      { title: "ML-driven scoring", body: "Opportunity and readiness scoring models that surface where capital should move." },
      { title: "Portfolio tracking", body: "Track deployment and outcomes against policy targets across sectors." },
      { title: "Mobile companion", body: "Executive-grade views for decision-makers in transit." },
    ],
    sectors: ["Government", "Financial Services", "NGO / Development"],
    architecture: [
      "Event-driven ingestion of market, donor, and programme data streams",
      "Production ML scoring service with evaluation and drift monitoring",
      "Role-scoped dashboards from board-pack altitude down to operational detail",
      "Sovereign-by-default: the authority owns and can extract its own data at any time",
    ],
  },
];

export function getLabsProduct(slug: string): LabsProduct | undefined {
  return LABS_PRODUCTS.find((p) => p.slug === slug);
}
