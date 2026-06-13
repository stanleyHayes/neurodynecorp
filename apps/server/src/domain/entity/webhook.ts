import { ObjectId } from "mongodb";

// ── Webhook Subscription ─────────────────────────────────────────────────────

export interface WebhookSubscription {
  id: string;
  ownerId: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function createWebhookSubscription(input: Omit<WebhookSubscription, "id" | "createdAt" | "updatedAt">): WebhookSubscription {
  const now = new Date();
  return { id: new ObjectId().toHexString(), ...input, createdAt: now, updatedAt: now };
}

// ── Webhook Delivery ─────────────────────────────────────────────────────────

export interface WebhookDelivery {
  id: string;
  subscriptionId: string;
  event: string;
  status: "pending" | "success" | "failed";
  responseCode?: number;
  attempts: number;
  createdAt: Date;
}

export function createWebhookDelivery(input: Omit<WebhookDelivery, "id" | "createdAt">): WebhookDelivery {
  const now = new Date();
  return { id: new ObjectId().toHexString(), ...input, createdAt: now };
}
