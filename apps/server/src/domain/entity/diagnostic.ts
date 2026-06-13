import { ObjectId } from "mongodb";

/**
 * Engagement Readiness Diagnostic (spec §6.1 / §6.6).
 *
 * A pre-engagement, anonymous intake. A short branching questionnaire whose answers
 * are scored SERVER-SIDE into one of four routing decisions, plus a one-page summary.
 * Distinct from the project-scoped `questionnaire` module (which runs post-engagement
 * and feeds spec generation) — this module owns its own static question tree and
 * `diagnostic_submissions` collection.
 */

// ── Routing ──────────────────────────────────────────────────────────────────

export type RouteKey = "services" | "labs" | "gov_digital_excellence" | "decline_referral";

export const ROUTE_LABELS: Record<RouteKey, string> = {
  services: "Services engagement",
  labs: "Labs collaboration",
  gov_digital_excellence: "Government Digital Excellence Initiative",
  decline_referral: "Referral & resources",
};

export const ROUTE_NEXT_STEP: Record<RouteKey, string> = {
  services:
    "Book a qualified conversation. We'll scope an engagement against your brief and propose an indicative architecture and price band.",
  labs:
    "Let's explore co-development. Tell us what you bring (product, users, expertise) and what you need (intelligence, scale, distribution).",
  gov_digital_excellence:
    "We'll route this to the team that owns government mandates and follow up with an SLA-tracked acknowledgement.",
  decline_referral:
    "You're below our current engagement threshold — but we don't want to leave you stranded. Here are resources and named alternatives, and we'll keep you in mind as things evolve.",
};

// ── Question model ─────────────────────────────────────────────────────────────

export interface DiagnosticOption {
  value: string;
  label: string;
  /** Points this option contributes toward each route. */
  weights?: Partial<Record<RouteKey, number>>;
  /** Named signals used by the hard-gate rules. */
  flags?: string[];
}

export interface DiagnosticQuestion {
  id: string;
  text: string;
  helpText?: string;
  type: "single" | "multi";
  options: DiagnosticOption[];
  /** Show this question only when a prior answer matches. */
  dependsOn?: { questionId: string; expectedValue: string };
  order: number;
}

export type AnswerValue = string | string[];
export interface DiagnosticAnswer {
  questionId: string;
  value: AnswerValue;
}

export interface DiagnosticResult {
  route: RouteKey;
  routeLabel: string;
  scores: Record<RouteKey, number>;
  confidence: number; // 0..1
  lowConfidence: boolean;
  summary: string;
  reasons: string[];
  nextStep: string;
}

export interface DiagnosticRecord {
  id: string;
  respondentName?: string;
  email?: string;
  org?: string;
  answers: DiagnosticAnswer[];
  result: DiagnosticResult;
  createdAt: Date;
}

// ── Tunables ─────────────────────────────────────────────────────────────────

const CONFIDENCE_FLOOR = 0.4;
const ZERO_SCORES = (): Record<RouteKey, number> => ({
  services: 0,
  labs: 0,
  gov_digital_excellence: 0,
  decline_referral: 0,
});

// ── The question tree ──────────────────────────────────────────────────────────
// Static and code-owned. Branching uses the same dependsOn convention as the
// project questionnaire so a future shared editor stays familiar.

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: "org_type",
    order: 1,
    type: "single",
    text: "Who are you?",
    helpText: "The kind of organisation evaluating us.",
    options: [
      { value: "government", label: "Government or public body", weights: { gov_digital_excellence: 3, services: 1 }, flags: ["gov_org"] },
      { value: "enterprise", label: "Enterprise or large institution", weights: { services: 3, labs: 1 } },
      { value: "startup", label: "Startup or scaleup", weights: { services: 2, labs: 2 } },
      { value: "individual", label: "Individual or early idea", weights: { decline_referral: 2 } },
    ],
  },
  {
    id: "brief",
    order: 2,
    type: "single",
    text: "What do you need?",
    options: [
      { value: "audit", label: "A digital systems audit & architecture", weights: { services: 3 } },
      { value: "build", label: "A mission-critical system built", weights: { services: 3 } },
      { value: "ai", label: "An AI or automation layer", weights: { services: 2, labs: 1 } },
      { value: "co_develop", label: "To co-develop a product / share IP", weights: { labs: 4 }, flags: ["co_dev"] },
      { value: "exploring", label: "Just exploring for now", weights: { decline_referral: 2 }, flags: ["exploring"] },
    ],
  },
  {
    id: "labs_contribution",
    order: 3,
    type: "single",
    text: "For a co-development partnership, what do you bring?",
    helpText: "Labs collaborates with products that solve real problems but lack intelligence, scale, or distribution.",
    dependsOn: { questionId: "brief", expectedValue: "co_develop" },
    options: [
      { value: "product", label: "An existing product with traction", weights: { labs: 2 } },
      { value: "users", label: "A user base or distribution", weights: { labs: 2 } },
      { value: "expertise", label: "Domain expertise", weights: { labs: 1 } },
    ],
  },
  {
    id: "mission_criticality",
    order: 4,
    type: "single",
    text: "How mission-critical is this system?",
    options: [
      { value: "national", label: "National-scale infrastructure", weights: { gov_digital_excellence: 2, services: 2 } },
      { value: "core", label: "Core to the business", weights: { services: 2 } },
      { value: "internal", label: "An internal tool", weights: { services: 1 } },
      { value: "experiment", label: "An experiment", weights: { labs: 1, decline_referral: 1 } },
    ],
  },
  {
    id: "sector",
    order: 5,
    type: "single",
    text: "Which sector are you in?",
    options: [
      { value: "government", label: "Government / public sector", weights: { gov_digital_excellence: 3 }, flags: ["gov_sector"] },
      { value: "health", label: "Health", weights: { services: 1 } },
      { value: "financial", label: "Financial services", weights: { services: 1 } },
      { value: "other", label: "Something else", weights: {} },
    ],
  },
  {
    id: "sovereignty",
    order: 6,
    type: "single",
    text: "Do you have data sovereignty or residency constraints?",
    options: [
      { value: "strict", label: "Yes — strict (on-shore required)", weights: { gov_digital_excellence: 2 } },
      { value: "some", label: "Some", weights: { gov_digital_excellence: 1 } },
      { value: "none", label: "No", weights: {} },
    ],
  },
  {
    id: "budget",
    order: 7,
    type: "single",
    text: "What budget band are you working with?",
    options: [
      { value: "above_100k", label: "Above USD 100k", weights: { services: 3, gov_digital_excellence: 1 } },
      { value: "30k_100k", label: "USD 30k–100k", weights: { services: 2 } },
      { value: "10k_30k", label: "USD 10k–30k", weights: { services: 1 } },
      { value: "below_10k", label: "Below USD 10k / not yet defined", weights: { decline_referral: 2 }, flags: ["below_floor"] },
    ],
  },
  {
    id: "authority",
    order: 8,
    type: "single",
    text: "What's your decision authority?",
    options: [
      { value: "decision_maker", label: "I'm the decision-maker", weights: { services: 2 } },
      { value: "influencer", label: "I influence the decision", weights: { services: 1 } },
      { value: "researching", label: "I'm researching for someone", weights: { decline_referral: 1 }, flags: ["researching"] },
    ],
  },
  {
    id: "timeline",
    order: 9,
    type: "single",
    text: "What's your timeline?",
    options: [
      { value: "lt_3m", label: "Within 3 months", weights: { services: 1 } },
      { value: "3_6m", label: "3–6 months", weights: { services: 1 } },
      { value: "6_12m", label: "6–12 months", weights: {} },
      { value: "none", label: "No timeline yet", weights: { decline_referral: 1 } },
    ],
  },
  {
    id: "capability",
    order: 10,
    type: "single",
    text: "What internal technical capability do you have?",
    options: [
      { value: "strong", label: "A strong technical team", weights: { services: 1, labs: 1 } },
      { value: "some", label: "Some capability", weights: { services: 1 } },
      { value: "none", label: "Little or none", weights: { services: 1, gov_digital_excellence: 1 } },
    ],
  },
];

// ── Branching ──────────────────────────────────────────────────────────────────

/** Build a map of questionId -> answered value for matching. */
function answerMap(answers: DiagnosticAnswer[]): Map<string, AnswerValue> {
  const m = new Map<string, AnswerValue>();
  for (const a of answers) m.set(a.questionId, a.value);
  return m;
}

/** Normalised chosen option values for a question — single-select collapses to one value. */
function chosenValues(q: DiagnosticQuestion, val: AnswerValue): string[] {
  if (q.type === "single") return [Array.isArray(val) ? String(val[0] ?? "") : val];
  return Array.isArray(val) ? val : [val];
}

function matchesDependsOn(q: DiagnosticQuestion, answered: Map<string, AnswerValue>): boolean {
  if (!q.dependsOn) return true;
  const parent = answered.get(q.dependsOn.questionId);
  if (parent === undefined) return false;
  return Array.isArray(parent) ? parent.includes(q.dependsOn.expectedValue) : parent === q.dependsOn.expectedValue;
}

/** Questions that should currently be shown given the answers so far. */
export function visibleDiagnosticQuestions(answers: DiagnosticAnswer[]): DiagnosticQuestion[] {
  const answered = answerMap(answers);
  return DIAGNOSTIC_QUESTIONS.filter((q) => matchesDependsOn(q, answered)).sort((a, b) => a.order - b.order);
}

// ── Scoring ──────────────────────────────────────────────────────────────────

function hasFlag(answers: DiagnosticAnswer[], flag: string): boolean {
  const answered = answerMap(answers);
  for (const q of DIAGNOSTIC_QUESTIONS) {
    const val = answered.get(q.id);
    if (val === undefined) continue;
    const chosen = chosenValues(q, val);
    for (const opt of q.options) {
      if (chosen.includes(opt.value) && opt.flags?.includes(flag)) return true;
    }
  }
  return false;
}

/** Selected option labels that contributed to a given route — used for reasons[]. */
function contributingLabels(answers: DiagnosticAnswer[], route: RouteKey): string[] {
  const answered = answerMap(answers);
  const labels: { label: string; weight: number }[] = [];
  for (const q of DIAGNOSTIC_QUESTIONS) {
    const val = answered.get(q.id);
    if (val === undefined) continue;
    const chosen = chosenValues(q, val);
    for (const opt of q.options) {
      if (chosen.includes(opt.value)) {
        const w = opt.weights?.[route] ?? 0;
        if (w > 0) labels.push({ label: opt.label, weight: w });
      }
    }
  }
  return labels.sort((a, b) => b.weight - a.weight).map((l) => l.label).slice(0, 3);
}

/**
 * Score answers into a routing decision. Weighted additive scoring with ordered
 * hard gates that override the argmax. Evaluated server-side so the verdict can't
 * be tampered with from the client.
 */
export function scoreDiagnostic(
  rawAnswers: DiagnosticAnswer[],
  meta?: { respondentName?: string; org?: string },
): DiagnosticResult {
  // Defence-in-depth: ignore answers to questions that aren't currently visible
  // (e.g. an orphaned branch answer left behind after the user changed its parent).
  const visibleIds = new Set(visibleDiagnosticQuestions(rawAnswers).map((q) => q.id));
  const answers = rawAnswers.filter((a) => visibleIds.has(a.questionId));
  const answered = answerMap(answers);
  const scores = ZERO_SCORES();

  for (const q of DIAGNOSTIC_QUESTIONS) {
    const val = answered.get(q.id);
    if (val === undefined) continue;
    const chosen = chosenValues(q, val);
    for (const opt of q.options) {
      if (!chosen.includes(opt.value)) continue;
      for (const [route, w] of Object.entries(opt.weights ?? {})) {
        scores[route as RouteKey] += w ?? 0;
      }
    }
  }

  // Ordered hard gates (first match wins).
  let route: RouteKey;
  let gateReason: string | null = null;

  if (hasFlag(answers, "below_floor") && (hasFlag(answers, "researching") || hasFlag(answers, "exploring"))) {
    route = "decline_referral";
    gateReason = "Below the current engagement threshold (early budget and exploratory intent).";
  } else if (hasFlag(answers, "co_dev")) {
    route = "labs";
    gateReason = "You're looking to co-develop and share IP — that's a Labs collaboration.";
  } else if (
    (answered.get("org_type") === "government" || answered.get("sector") === "government") &&
    !hasFlag(answers, "exploring") &&
    !hasFlag(answers, "below_floor")
  ) {
    route = "gov_digital_excellence";
    gateReason = "A serious public-sector mandate routes to the Government Digital Excellence Initiative.";
  } else {
    // argmax, default to services on empty/tie.
    route = (Object.entries(scores) as [RouteKey, number][]).reduce<[RouteKey, number]>(
      (best, cur) => (cur[1] > best[1] ? cur : best),
      ["services", -1],
    )[0];
    if (scores[route] <= 0) route = "services";
  }

  const sum = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = sum > 0 ? Math.round((scores[route] / sum) * 100) / 100 : 0;
  const lowConfidence = !gateReason && confidence < CONFIDENCE_FLOOR;

  const reasons: string[] = [];
  if (gateReason) reasons.push(gateReason);
  reasons.push(...contributingLabels(answers, route));
  if (lowConfidence) reasons.push("Mixed signals — we routed you to the highest-touch path so a human can take it from here.");

  const summary = buildSummary(route, reasons, confidence, meta);

  return {
    route,
    routeLabel: ROUTE_LABELS[route],
    scores,
    confidence,
    lowConfidence,
    summary,
    reasons,
    nextStep: ROUTE_NEXT_STEP[route],
  };
}

/** Deterministic one-page summary (no LLM) — testable and dependency-free. */
function buildSummary(
  route: RouteKey,
  reasons: string[],
  confidence: number,
  meta?: { respondentName?: string; org?: string },
): string {
  const who = meta?.org || meta?.respondentName || "Your organisation";
  const lines = [
    `Engagement Readiness Summary`,
    ``,
    `Prepared for: ${who}`,
    `Indicative routing: ${ROUTE_LABELS[route]}`,
    `Confidence: ${Math.round(confidence * 100)}%`,
    ``,
    `Why:`,
    ...reasons.map((r) => `  • ${r}`),
    ``,
    `Recommended next step:`,
    `  ${ROUTE_NEXT_STEP[route]}`,
  ];
  return lines.join("\n");
}

// ── Record factory ─────────────────────────────────────────────────────────────

export function createDiagnosticRecord(
  input: Omit<DiagnosticRecord, "id" | "createdAt">,
): DiagnosticRecord {
  return { id: new ObjectId().toHexString(), ...input, createdAt: new Date() };
}
