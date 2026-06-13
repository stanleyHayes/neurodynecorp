import { ObjectId } from "mongodb";

/**
 * Support Tickets (spec §7.2).
 *
 * Project-scoped, CLIENT-WRITE / staff-respond: the owning client raises issues,
 * change requests, and questions; staff reply and advance status. SLA-tracked —
 * a first-response target (by priority) is visible to the client.
 */

export type TicketCategory = "question" | "issue" | "change_request" | "other";
export const TICKET_CATEGORIES: TicketCategory[] = ["question", "issue", "change_request", "other"];

export type TicketPriority = "low" | "normal" | "high" | "urgent";
export const TICKET_PRIORITIES: TicketPriority[] = ["low", "normal", "high", "urgent"];

export type TicketStatus = "open" | "in_progress" | "waiting" | "resolved" | "closed";
export const TICKET_STATUSES: TicketStatus[] = ["open", "in_progress", "waiting", "resolved", "closed"];

/** First-response SLA in hours, by priority. */
const SLA_HOURS_BY_PRIORITY: Record<TicketPriority, number> = {
  urgent: 4,
  high: 24,
  normal: 48,
  low: 72,
};

export function ticketSlaHours(priority: TicketPriority): number {
  return SLA_HOURS_BY_PRIORITY[priority];
}

export interface TicketReply {
  id: string;
  authorId: string;
  authorName?: string;
  body: string;
  /** True when the reply came from a staff member (not the client). */
  staff: boolean;
  createdAt: Date;
}

export interface SupportTicket {
  id: string;
  projectId: string;
  subject: string;
  body: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  /** First-response target (createdAt + SLA-by-priority). */
  slaDueAt: Date;
  firstRespondedAt?: Date;
  createdById: string;
  /** Whether the ticket was raised by staff (vs the client). */
  createdByStaff: boolean;
  replies: TicketReply[];
  createdAt: Date;
  updatedAt: Date;
}

export function createSupportTicket(
  input: Omit<SupportTicket, "id" | "status" | "slaDueAt" | "replies" | "firstRespondedAt" | "createdAt" | "updatedAt">,
): SupportTicket {
  const now = new Date();
  return {
    id: new ObjectId().toHexString(),
    ...input,
    status: "open",
    slaDueAt: new Date(now.getTime() + ticketSlaHours(input.priority) * 3600 * 1000),
    replies: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function newTicketReply(input: Omit<TicketReply, "id" | "createdAt">): TicketReply {
  return { id: new ObjectId().toHexString(), ...input, createdAt: new Date() };
}
