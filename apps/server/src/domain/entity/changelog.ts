import { ObjectId } from "mongodb";

// ── Changelog Entry ──────────────────────────────────────────────────────────

export interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  body: string;
  category: "feature" | "fix" | "improvement" | "security";
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export function createChangelogEntry(input: Omit<ChangelogEntry, "id" | "createdAt" | "updatedAt">): ChangelogEntry {
  const now = new Date();
  return { id: new ObjectId().toHexString(), ...input, createdAt: now, updatedAt: now };
}
