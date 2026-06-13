import { ObjectId } from "mongodb";

// ── Feature Flag ─────────────────────────────────────────────────────────────

export interface FeatureFlag {
  id: string;
  key: string;
  description?: string;
  enabled: boolean;
  rolloutPercentage: number;
  audience?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function createFeatureFlag(input: Omit<FeatureFlag, "id" | "createdAt" | "updatedAt">): FeatureFlag {
  const now = new Date();
  return { id: new ObjectId().toHexString(), ...input, createdAt: now, updatedAt: now };
}
