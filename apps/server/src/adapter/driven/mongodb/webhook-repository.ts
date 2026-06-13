import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { WebhookSubscription, WebhookDelivery } from "../../../domain/entity/webhook.js";
import type { MongoDBClient } from "./client.js";

interface WebhookSubscriptionDoc {
  _id: ObjectId;
  owner_id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface WebhookDeliveryDoc {
  _id: ObjectId;
  subscription_id: string;
  event: string;
  status: "pending" | "success" | "failed";
  response_code?: number;
  attempts: number;
  created_at: Date;
}

function toSubscriptionDoc(s: WebhookSubscription): WebhookSubscriptionDoc {
  return {
    _id: new ObjectId(s.id),
    owner_id: s.ownerId,
    url: s.url,
    events: s.events,
    secret: s.secret,
    active: s.active,
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  };
}

function fromSubscriptionDoc(d: WebhookSubscriptionDoc): WebhookSubscription {
  return {
    id: d._id.toHexString(),
    ownerId: d.owner_id,
    url: d.url,
    events: d.events,
    secret: d.secret,
    active: d.active,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

function toDeliveryDoc(d: WebhookDelivery): WebhookDeliveryDoc {
  return {
    _id: new ObjectId(d.id),
    subscription_id: d.subscriptionId,
    event: d.event,
    status: d.status,
    response_code: d.responseCode,
    attempts: d.attempts,
    created_at: d.createdAt,
  };
}

function fromDeliveryDoc(d: WebhookDeliveryDoc): WebhookDelivery {
  return {
    id: d._id.toHexString(),
    subscriptionId: d.subscription_id,
    event: d.event,
    status: d.status,
    responseCode: d.response_code,
    attempts: d.attempts,
    createdAt: d.created_at,
  };
}

export class MongoWebhookRepository {
  private readonly col: Collection<WebhookSubscriptionDoc>;
  private readonly deliveryCol: Collection<WebhookDeliveryDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<WebhookSubscriptionDoc>("webhook_subscriptions");
    this.deliveryCol = client.collection<WebhookDeliveryDoc>("webhook_deliveries");
  }

  async listByOwner(ownerId: string): Promise<WebhookSubscription[]> {
    const docs = await this.col
      .find({ owner_id: ownerId })
      .sort({ created_at: -1 })
      .toArray();
    return docs.map(fromSubscriptionDoc);
  }

  async getById(id: string): Promise<WebhookSubscription | null> {
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? fromSubscriptionDoc(doc) : null;
  }

  async create(subscription: WebhookSubscription): Promise<WebhookSubscription> {
    await this.col.insertOne(toSubscriptionDoc(subscription));
    return subscription;
  }

  async update(subscription: WebhookSubscription): Promise<WebhookSubscription> {
    await this.col.updateOne(
      { _id: new ObjectId(subscription.id) },
      { $set: toSubscriptionDoc(subscription) },
    );
    return subscription;
  }

  async delete(id: string): Promise<void> {
    await this.col.deleteOne({ _id: new ObjectId(id) });
  }

  async listDeliveries(subscriptionId: string, limit?: number): Promise<WebhookDelivery[]> {
    const docs = await this.deliveryCol
      .find({ subscription_id: subscriptionId })
      .sort({ created_at: -1 })
      .limit(limit ?? 50)
      .toArray();
    return docs.map(fromDeliveryDoc);
  }

  async createDelivery(delivery: WebhookDelivery): Promise<WebhookDelivery> {
    await this.deliveryCol.insertOne(toDeliveryDoc(delivery));
    return delivery;
  }

  async updateDelivery(delivery: WebhookDelivery): Promise<WebhookDelivery> {
    await this.deliveryCol.updateOne(
      { _id: new ObjectId(delivery.id) },
      { $set: toDeliveryDoc(delivery) },
    );
    return delivery;
  }
}
