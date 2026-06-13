import { ObjectId } from "mongodb";

// ── Cookie Consent Record ──────────────────────────────────────────────────

export interface ConsentRecord {
  id: string;
  anonymousId: string;
  userId?: string;
  categories: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  policyVersion: string;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

export function createConsentRecord(input: Omit<ConsentRecord, "id" | "createdAt">): ConsentRecord {
  const now = new Date();
  return { id: new ObjectId().toHexString(), ...input, createdAt: now };
}
