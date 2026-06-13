import { ObjectId } from "mongodb";

/**
 * Reports Library (spec §7).
 *
 * Project-scoped, staff-write / client-read. Quarterly reviews, status memos,
 * board-pack exports, handover docs, post-engagement reports.
 *
 * Lifecycle: staff create reports as `draft`; the owning client sees ONLY
 * `published` reports. Drafts must be unprobeable by clients (404, not 403).
 * `publishedAt` is server-stamped on transition to published — never client-set.
 */

export type ReportType =
  | "quarterly_review"
  | "status_memo"
  | "board_pack"
  | "handover"
  | "post_engagement"
  | "other";
export const REPORT_TYPES: ReportType[] = [
  "quarterly_review",
  "status_memo",
  "board_pack",
  "handover",
  "post_engagement",
  "other",
];

export type ReportStatus = "draft" | "published";
export const REPORT_STATUSES: ReportStatus[] = ["draft", "published"];

export interface Report {
  id: string;
  projectId: string;
  title: string;
  type: ReportType;
  summary?: string;
  /** Link to the document / board-pack export. */
  url?: string;
  /** Reporting period, e.g. "Q2 2026". */
  period?: string;
  status: ReportStatus;
  publishedAt?: Date;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export function createReport(input: Omit<Report, "id" | "createdAt" | "updatedAt">): Report {
  const now = new Date();
  return { id: new ObjectId().toHexString(), ...input, createdAt: now, updatedAt: now };
}
