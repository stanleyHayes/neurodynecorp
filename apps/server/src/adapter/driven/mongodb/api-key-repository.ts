import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { ApiKey } from "../../../domain/entity/api-key.js";
import type { MongoDBClient } from "./client.js";

interface ApiKeyDoc {
  _id: ObjectId;
  owner_id: string;
  name: string;
  prefix: string;
  hashed_key: string;
  scopes: string[];
  last_used_at?: Date;
  revoked_at?: Date;
  created_at: Date;
  updated_at: Date;
}

function toDoc(k: ApiKey): ApiKeyDoc {
  return {
    _id: new ObjectId(k.id),
    owner_id: k.ownerId,
    name: k.name,
    prefix: k.prefix,
    hashed_key: k.hashedKey,
    scopes: k.scopes,
    last_used_at: k.lastUsedAt,
    revoked_at: k.revokedAt,
    created_at: k.createdAt,
    updated_at: k.updatedAt,
  };
}

function fromDoc(d: ApiKeyDoc): ApiKey {
  return {
    id: d._id.toHexString(),
    ownerId: d.owner_id,
    name: d.name,
    prefix: d.prefix,
    hashedKey: d.hashed_key,
    scopes: d.scopes,
    lastUsedAt: d.last_used_at,
    revokedAt: d.revoked_at,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

export class MongoApiKeyRepository {
  private readonly col: Collection<ApiKeyDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<ApiKeyDoc>("api_keys");
  }

  async listByOwner(ownerId: string): Promise<ApiKey[]> {
    const docs = await this.col
      .find({ owner_id: ownerId })
      .sort({ created_at: -1 })
      .toArray();
    return docs.map(fromDoc);
  }

  async getById(id: string): Promise<ApiKey | null> {
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? fromDoc(doc) : null;
  }

  async create(apiKey: ApiKey): Promise<ApiKey> {
    await this.col.insertOne(toDoc(apiKey));
    return apiKey;
  }

  async update(apiKey: ApiKey): Promise<ApiKey> {
    await this.col.updateOne({ _id: new ObjectId(apiKey.id) }, { $set: toDoc(apiKey) });
    return apiKey;
  }

  async delete(id: string): Promise<void> {
    await this.col.deleteOne({ _id: new ObjectId(id) });
  }
}
