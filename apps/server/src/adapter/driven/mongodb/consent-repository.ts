import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { ConsentRecord } from "../../../domain/entity/consent.js";
import type { MongoDBClient } from "./client.js";

interface ConsentDoc {
  _id: ObjectId;
  anonymous_id: string;
  user_id?: string;
  categories: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
  };
  policy_version: string;
  ip?: string;
  user_agent?: string;
  created_at: Date;
}

function toDoc(c: ConsentRecord): ConsentDoc {
  return {
    _id: new ObjectId(c.id),
    anonymous_id: c.anonymousId,
    user_id: c.userId,
    categories: c.categories,
    policy_version: c.policyVersion,
    ip: c.ip,
    user_agent: c.userAgent,
    created_at: c.createdAt,
  };
}

function fromDoc(d: ConsentDoc): ConsentRecord {
  return {
    id: d._id.toHexString(),
    anonymousId: d.anonymous_id,
    userId: d.user_id,
    categories: d.categories,
    policyVersion: d.policy_version,
    ip: d.ip,
    userAgent: d.user_agent,
    createdAt: d.created_at,
  };
}

export class MongoConsentRepository {
  private readonly col: Collection<ConsentDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<ConsentDoc>("consent_log");
  }

  async create(record: ConsentRecord): Promise<ConsentRecord> {
    await this.col.insertOne(toDoc(record));
    return record;
  }

  async findLatestByAnon(anonymousId: string): Promise<ConsentRecord | null> {
    const docs = await this.col
      .find({ anonymous_id: anonymousId })
      .sort({ created_at: -1 })
      .limit(1)
      .toArray();
    return docs.length ? fromDoc(docs[0]!) : null;
  }

  async findAll(filter?: { limit?: number }): Promise<ConsentRecord[]> {
    const docs = await this.col
      .find({})
      .sort({ created_at: -1 })
      .limit(filter?.limit ?? 200)
      .toArray();
    return docs.map(fromDoc);
  }
}
