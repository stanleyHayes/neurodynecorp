import { ObjectId } from "mongodb";

// ── API Key ────────────────────────────────────────────────────────────────

export interface ApiKey {
  id: string;
  ownerId: string;
  name: string;
  prefix: string;
  hashedKey: string;
  scopes: string[];
  lastUsedAt?: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export function createApiKey(input: Omit<ApiKey, "id" | "createdAt" | "updatedAt">): ApiKey {
  const now = new Date();
  return { id: new ObjectId().toHexString(), ...input, createdAt: now, updatedAt: now };
}
