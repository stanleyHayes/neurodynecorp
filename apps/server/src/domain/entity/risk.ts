import { ObjectId } from "mongodb";

/**
 * Risk Register (spec §7.2).
 *
 * Project-scoped, staff-write / client-read. Open risks with owner, mitigation
 * plan, residual rating after mitigation, escalation status, and lifecycle.
 * Filterable by severity and status on the client.
 */

export type RiskSeverity = "low" | "medium" | "high" | "critical";
export const RISK_SEVERITIES: RiskSeverity[] = ["low", "medium", "high", "critical"];

export type RiskStatus = "open" | "mitigating" | "monitoring" | "accepted" | "closed";
export const RISK_STATUSES: RiskStatus[] = ["open", "mitigating", "monitoring", "accepted", "closed"];

export interface Risk {
  id: string;
  projectId: string;
  title: string;
  description: string;
  owner: string;
  severity: RiskSeverity;
  mitigation: string;
  /** Severity remaining after the mitigation is applied. */
  residualRating: RiskSeverity;
  /** Escalation status / path (free text). */
  escalation: string;
  status: RiskStatus;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export function createRisk(input: Omit<Risk, "id" | "createdAt" | "updatedAt">): Risk {
  const now = new Date();
  return { id: new ObjectId().toHexString(), ...input, createdAt: now, updatedAt: now };
}
