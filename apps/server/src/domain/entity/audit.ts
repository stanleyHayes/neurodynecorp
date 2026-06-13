import { ObjectId } from "mongodb";

// ── Audit Entry ──────────────────────────────────────────────────────────────

export interface AuditEntry {
  id: string;
  userId?: string;
  userRole?: string;
  action: string;
  method: string;
  path: string;
  resource?: string;
  resourceId?: string;
  statusCode?: number;
  ip?: string;
  userAgent?: string;
  metadata?: any;
  createdAt: Date;
}

export function createAuditEntry(input: Omit<AuditEntry, "id" | "createdAt">): AuditEntry {
  const now = new Date();
  return { id: new ObjectId().toHexString(), ...input, createdAt: now };
}
