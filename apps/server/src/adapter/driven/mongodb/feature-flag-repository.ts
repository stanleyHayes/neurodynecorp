import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { FeatureFlag } from "../../../domain/entity/feature-flag.js";
import type { MongoDBClient } from "./client.js";

interface FeatureFlagDoc {
  _id: ObjectId;
  key: string;
  description?: string;
  enabled: boolean;
  rollout_percentage: number;
  audience?: string;
  created_at: Date;
  updated_at: Date;
}

function toDoc(f: FeatureFlag): FeatureFlagDoc {
  return {
    _id: new ObjectId(f.id),
    key: f.key,
    description: f.description,
    enabled: f.enabled,
    rollout_percentage: f.rolloutPercentage,
    audience: f.audience,
    created_at: f.createdAt,
    updated_at: f.updatedAt,
  };
}

function fromDoc(d: FeatureFlagDoc): FeatureFlag {
  return {
    id: d._id.toHexString(),
    key: d.key,
    description: d.description,
    enabled: d.enabled,
    rolloutPercentage: d.rollout_percentage,
    audience: d.audience,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

export class MongoFeatureFlagRepository {
  private readonly col: Collection<FeatureFlagDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<FeatureFlagDoc>("feature_flags");
  }

  async findAll(): Promise<FeatureFlag[]> {
    const docs = await this.col.find({}).sort({ created_at: -1 }).toArray();
    return docs.map(fromDoc);
  }

  async findByKey(key: string): Promise<FeatureFlag | null> {
    const doc = await this.col.findOne({ key });
    return doc ? fromDoc(doc) : null;
  }

  async create(flag: FeatureFlag): Promise<FeatureFlag> {
    await this.col.insertOne(toDoc(flag));
    return flag;
  }

  async update(flag: FeatureFlag): Promise<FeatureFlag> {
    await this.col.updateOne({ _id: new ObjectId(flag.id) }, { $set: toDoc(flag) });
    return flag;
  }

  async findById(id: string): Promise<FeatureFlag | null> {
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? fromDoc(doc) : null;
  }

  async delete(id: string): Promise<void> {
    await this.col.deleteOne({ _id: new ObjectId(id) });
  }
}
