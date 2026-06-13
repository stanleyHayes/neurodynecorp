import { ObjectId } from "mongodb";

// ── Feedback / NPS ───────────────────────────────────────────────────────────

export interface Feedback {
  id: string;
  userId?: string;
  email?: string;
  type: "nps" | "general" | "bug" | "idea";
  score?: number;
  message?: string;
  page?: string;
  createdAt: Date;
}

export function createFeedback(input: Omit<Feedback, "id" | "createdAt">): Feedback {
  const now = new Date();
  return { id: new ObjectId().toHexString(), ...input, createdAt: now };
}
