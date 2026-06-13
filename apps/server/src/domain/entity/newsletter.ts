import { ObjectId } from "mongodb";

// ── Newsletter Subscriber ──────────────────────────────────────────────────

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: "pending" | "confirmed" | "unsubscribed";
  segments: string[];
  token: string;
  confirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export function createNewsletterSubscriber(input: Omit<NewsletterSubscriber, "id" | "createdAt" | "updatedAt">): NewsletterSubscriber {
  const now = new Date();
  return { id: new ObjectId().toHexString(), ...input, createdAt: now, updatedAt: now };
}
