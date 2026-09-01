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
