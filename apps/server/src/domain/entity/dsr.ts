import { ObjectId } from "mongodb";

// ── Data Subject Rights Request ──────────────────────────────────────────────

export interface DsrRequest {
  id: string;
  userId?: string;
  email: string;
  type: "export" | "erasure";
  status: "received" | "in_progress" | "completed" | "rejected";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export function createDsrRequest(input: Omit<DsrRequest, "id" | "createdAt" | "updatedAt">): DsrRequest {
  const now = new Date();
  return { id: new ObjectId().toHexString(), ...input, createdAt: now, updatedAt: now };
}
