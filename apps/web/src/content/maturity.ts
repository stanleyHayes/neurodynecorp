/**
 * Product maturity system.
 *
 * Every Neurodyne product, infrastructure project and repository carries a
 * maturity label, and that label lives here rather than being inferred from
 * anything else in the codebase.
 *
 * Rule: maturity is editorial, not derived. If a product's real stage is not
 * known, it does not get a flattering guess — it gets the lowest label that is
 * defensible, or it is left out of the public surface entirely. Overstating
 * stage is the single fastest way to lose credibility with the institutions,
 * accelerators and investors this site is written for.
 */

export type Maturity =
  | "LIVE"
  | "PRIVATE BETA"
  | "PILOT"
  | "IN DEVELOPMENT"
  | "RESEARCH"
  | "OPEN SOURCE";

export interface MaturityMeta {
  /** Label as it appears on a badge. */
  label: Maturity;
  /** What the label actually promises a visitor. Used in tooltips and legends. */
  meaning: string;
  /** Badge colour. */
  color: string;
  /** Ordering for sorts and filters — most mature first. */
  rank: number;
}

export const MATURITY: Record<Maturity, MaturityMeta> = {
  LIVE: {
    label: "LIVE",
    meaning: "Publicly available and in real use.",
    color: "#00D4AA",
    rank: 0,
  },
  "PRIVATE BETA": {
    label: "PRIVATE BETA",
    meaning: "Working software, running with invited users rather than open signup.",
    color: "#6C63FF",
    rank: 1,
  },
  PILOT: {
    label: "PILOT",
    meaning: "Deployed with a specific organisation under an agreed scope of work.",
    color: "#8B85FF",
    rank: 2,
  },
  "IN DEVELOPMENT": {
    label: "IN DEVELOPMENT",
    meaning: "Actively being engineered. Not yet available to use.",
    color: "#F59E0B",
    rank: 3,
  },
  RESEARCH: {
    label: "RESEARCH",
    meaning: "A design or prototype being explored. No commitment to ship.",
    color: "#94A3B8",
    rank: 4,
  },
  "OPEN SOURCE": {
    label: "OPEN SOURCE",
    meaning: "Published publicly under an open licence.",
    color: "#E2E8F0",
    rank: 5,
  },
};

export const MATURITY_ORDER: Maturity[] = (
  Object.keys(MATURITY) as Maturity[]
).sort((a, b) => MATURITY[a].rank - MATURITY[b].rank);

export function maturityMeta(label: Maturity): MaturityMeta {
  return MATURITY[label];
}
