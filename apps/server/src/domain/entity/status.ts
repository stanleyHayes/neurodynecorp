import { ObjectId } from "mongodb";

// ── Status Component ─────────────────────────────────────────────────────────

export interface StatusComponent {
  id: string;
  name: string;
  description?: string;
  status: "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance";
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export function createStatusComponent(input: Omit<StatusComponent, "id" | "createdAt" | "updatedAt">): StatusComponent {
  const now = new Date();
  return { id: new ObjectId().toHexString(), ...input, createdAt: now, updatedAt: now };
}

// ── Incident ─────────────────────────────────────────────────────────────────

export interface IncidentUpdate {
  status: string;
  body: string;
  createdAt: Date;
}

export interface Incident {
  id: string;
  title: string;
  impact: "none" | "minor" | "major" | "critical";
  status: "investigating" | "identified" | "monitoring" | "resolved";
  affectedComponents: string[];
  updates: IncidentUpdate[];
  startedAt: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export function createIncident(input: Omit<Incident, "id" | "createdAt" | "updatedAt">): Incident {
  const now = new Date();
  return { id: new ObjectId().toHexString(), ...input, createdAt: now, updatedAt: now };
}

// ── Status Subscriber ────────────────────────────────────────────────────────

export interface StatusSubscriber {
  id: string;
  email: string;
  createdAt: Date;
}

export function createStatusSubscriber(input: Omit<StatusSubscriber, "id" | "createdAt">): StatusSubscriber {
  const now = new Date();
  return { id: new ObjectId().toHexString(), ...input, createdAt: now };
}
