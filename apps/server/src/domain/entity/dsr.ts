import { ObjectId } from "mongodb";

// ── Data Subject Rights Request ──────────────────────────────────────────────

/**
 * Days allowed to answer a data-subject request.
 *
 * /account-deletion tells people "we normally complete verified requests
 * within 30 days". Nothing tracked that, so a request could sit in `received`
 * indefinitely while the page kept promising a deadline — the commitment was
 * real, the clock was not. `dueAt` is that clock, and the admin queue shows
 * what is running out of time.
 */
export const DSR_RESPONSE_DAYS = 30;

export interface DsrRequest {
  id: string;
  userId?: string;
  email: string;
  type: "export" | "erasure";
  status: "received" | "in_progress" | "completed" | "rejected";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  /** createdAt + DSR_RESPONSE_DAYS. Fixed at creation so it cannot drift. */
  dueAt: Date;
  completedAt?: Date;
}

export function createDsrRequest(
  input: Omit<DsrRequest, "id" | "createdAt" | "updatedAt" | "dueAt">,
): DsrRequest {
  const now = new Date();
  const dueAt = new Date(now.getTime() + DSR_RESPONSE_DAYS * 24 * 60 * 60 * 1000);
  return { ...input, id: new ObjectId().toHexString(), createdAt: now, updatedAt: now, dueAt };
}

/** Days left to answer. Negative once the deadline has passed. */
export function daysUntilDue(request: DsrRequest, now: Date = new Date()): number {
  return Math.ceil((request.dueAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
}

/** Open past its deadline. A completed or rejected request is never overdue. */
export function isOverdue(request: DsrRequest, now: Date = new Date()): boolean {
  if (request.status === "completed" || request.status === "rejected") return false;
  return request.dueAt.getTime() < now.getTime();
}
