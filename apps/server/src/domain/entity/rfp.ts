import { ObjectId } from "mongodb";

/**
 * RFP / Tender Submission (spec §6.3).
 *
 * Government bodies and enterprises submit formal RFPs/tenders through a structured
 * intake that captures deadline, scope, evaluation criteria, contact, and submission
 * requirements. Each submission is routed internally and carries an SLA-tracked
 * acknowledgement: we commit to acknowledging within `RFP_SLA_HOURS`.
 */

export const RFP_SLA_HOURS = 48;

export type RfpStatus = "received" | "acknowledged" | "in_review" | "declined" | "closed";

export const RFP_STATUSES: RfpStatus[] = ["received", "acknowledged", "in_review", "declined", "closed"];

export interface RfpSubmission {
  id: string;
  org: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  sector?: string;
  title: string;
  scope: string;
  evaluationCriteria?: string;
  submissionRequirements?: string;
  documentUrl?: string;
  estimatedValue?: string;
  /** The client's own submission deadline (ISO date), if any. */
  deadline?: string;
  status: RfpStatus;
  /** When WE must acknowledge by (createdAt + RFP_SLA_HOURS). */
  slaDueAt: Date;
  acknowledgedAt?: Date;
  createdAt: Date;
}

export function createRfpSubmission(
  input: Omit<RfpSubmission, "id" | "status" | "slaDueAt" | "acknowledgedAt" | "createdAt">,
): RfpSubmission {
  const now = new Date();
  return {
    id: new ObjectId().toHexString(),
    ...input,
    status: "received",
    slaDueAt: new Date(now.getTime() + RFP_SLA_HOURS * 3600 * 1000),
    createdAt: now,
  };
}

/** True when the acknowledgement SLA has elapsed without an acknowledgement. */
export function isSlaBreached(r: Pick<RfpSubmission, "slaDueAt" | "acknowledgedAt">, now: Date = new Date()): boolean {
  if (r.acknowledgedAt) return false;
  return now.getTime() > new Date(r.slaDueAt).getTime();
}
