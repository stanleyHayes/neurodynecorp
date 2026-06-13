import { ObjectId } from "mongodb";

/**
 * Stakeholder Map (spec §7.2).
 *
 * Project-scoped, staff-write / client-read. Who is involved on both sides
 * (client and firm), who decides what, and who has been briefed. Rendered as a
 * map grouped by side rather than a free-form graph.
 */

export type StakeholderSide = "client" | "firm";
export const STAKEHOLDER_SIDES: StakeholderSide[] = ["client", "firm"];

export type DecisionAuthority = "decision_maker" | "influencer" | "contributor" | "informed";
export const DECISION_AUTHORITIES: DecisionAuthority[] = ["decision_maker", "influencer", "contributor", "informed"];

export interface Stakeholder {
  id: string;
  projectId: string;
  name: string;
  role: string;
  side: StakeholderSide;
  authority: DecisionAuthority;
  /** Whether this person has been briefed on the engagement. */
  briefed: boolean;
  email?: string;
  notes?: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export function createStakeholder(input: Omit<Stakeholder, "id" | "createdAt" | "updatedAt">): Stakeholder {
  const now = new Date();
  return { id: new ObjectId().toHexString(), ...input, createdAt: now, updatedAt: now };
}
