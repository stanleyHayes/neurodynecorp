import { ObjectId } from "mongodb";

/**
 * Approval Workflows (spec §7.2).
 *
 * Project-scoped sign-offs: staff send a deliverable for approval; the owning
 * client approves, approves-with-conditions, or rejects-with-comments. Async and
 * fully audited (the global audit recorder logs every mutation). A sign-off is
 * decided once — re-deciding requires a fresh request.
 */

export type ApprovalStatus = "pending" | "approved" | "approved_with_conditions" | "rejected";
export const APPROVAL_STATUSES: ApprovalStatus[] = ["pending", "approved", "approved_with_conditions", "rejected"];

/** The decision outcomes an approver may record (everything except the initial pending state). */
export type ApprovalDecision = "approved" | "approved_with_conditions" | "rejected";
export const APPROVAL_DECISIONS: ApprovalDecision[] = ["approved", "approved_with_conditions", "rejected"];

export interface Approval {
  id: string;
  projectId: string;
  title: string;
  description: string;
  /** What is being signed off — a deliverable name or a link. */
  deliverableRef?: string;
  status: ApprovalStatus;
  /** Staff member who requested the sign-off. */
  requestedById: string;
  decidedById?: string;
  decidedAt?: Date;
  /** Conditions (for conditional approval) or the rejection reason. */
  decisionComment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function createApproval(
  input: Omit<Approval, "id" | "status" | "decidedById" | "decidedAt" | "decisionComment" | "createdAt" | "updatedAt">,
): Approval {
  const now = new Date();
  return { id: new ObjectId().toHexString(), ...input, status: "pending", createdAt: now, updatedAt: now };
}
