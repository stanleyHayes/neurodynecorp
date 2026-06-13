import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { NewsletterSubscriber } from "../../../domain/entity/newsletter.js";
import type { MongoDBClient } from "./client.js";

interface NewsletterSubscriberDoc {
  _id: ObjectId;
  email: string;
  status: string;
  segments: string[];
  token: string;
  confirmed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

function toDoc(s: NewsletterSubscriber): NewsletterSubscriberDoc {
  return {
    _id: new ObjectId(s.id),
    email: s.email,
    status: s.status,
    segments: s.segments,
    token: s.token,
    confirmed_at: s.confirmedAt,
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  };
}

function fromDoc(d: NewsletterSubscriberDoc): NewsletterSubscriber {
  return {
    id: d._id.toHexString(),
    email: d.email,
    status: d.status as NewsletterSubscriber["status"],
    segments: d.segments,
    token: d.token,
    confirmedAt: d.confirmed_at,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

export class MongoNewsletterRepository {
  private readonly col: Collection<NewsletterSubscriberDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<NewsletterSubscriberDoc>("newsletter_subscribers");
  }

  async findByEmail(email: string): Promise<NewsletterSubscriber | null> {
    const doc = await this.col.findOne({ email });
    return doc ? fromDoc(doc) : null;
  }

  async findByToken(token: string): Promise<NewsletterSubscriber | null> {
    const doc = await this.col.findOne({ token });
    return doc ? fromDoc(doc) : null;
  }

  async create(subscriber: NewsletterSubscriber): Promise<NewsletterSubscriber> {
    await this.col.insertOne(toDoc(subscriber));
    return subscriber;
  }

  async update(subscriber: NewsletterSubscriber): Promise<NewsletterSubscriber> {
    const updated = { ...subscriber, updatedAt: new Date() };
    await this.col.updateOne({ _id: new ObjectId(updated.id) }, { $set: toDoc(updated) });
    return updated;
  }

  async findAll(filter?: { status?: string }): Promise<NewsletterSubscriber[]> {
    const query: Record<string, any> = {};
    if (filter?.status) query.status = filter.status;
    const docs = await this.col.find(query).sort({ created_at: -1 }).toArray();
    return docs.map(fromDoc);
  }
}
