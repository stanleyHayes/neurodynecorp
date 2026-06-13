import { ObjectId } from "mongodb";

/**
 * Decision Log (spec §7.2).
 *
 * A project-scoped, sovereign-grade audit trail: every material decision in an
 * engagement, time-stamped, with rationale, alternatives considered, the
 * decision-maker, and linked artefacts. Staff (admin / project_manager) write;
 * the owning client reads. The whole point is that it cannot be reproduced
 * elsewhere — so it is immutable-by-convention (append + supersede, not rewrite).
 */

export type DecisionStatus = "proposed" | "accepted" | "superseded" | "rejected";

export const DECISION_STATUSES: DecisionStatus[] = ["proposed", "accepted", "superseded", "rejected"];

export interface Decision {
  id: string;
  projectId: string;
  title: string;
  rationale: string;
  /** Options weighed and not taken. */
  alternatives: string[];
  /** Who made the call (free text — a name/role). */
  decisionMaker: string;
  /** URLs/ids of related deliverables, specs, threads. */
  linkedArtifacts: string[];
  status: DecisionStatus;
  /** The decision's effective date — distinct from createdAt (when it was logged). */
  decidedAt: Date;
  /** Server-injected author (the staff user who logged it). */
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export function createDecision(input: Omit<Decision, "id" | "createdAt" | "updatedAt">): Decision {
  const now = new Date();
  return { id: new ObjectId().toHexString(), ...input, createdAt: now, updatedAt: now };
}
