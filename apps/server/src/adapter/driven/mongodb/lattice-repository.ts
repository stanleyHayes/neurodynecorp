import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { LatticeItem } from "../../../domain/entity/lattice.js";
import type { MongoDBClient } from "./client.js";

interface LatticeDoc {
  _id: ObjectId;
  project_id: string;
  capability: string;
  category: string;
  status: LatticeItem["status"];
  description?: string;
  owner?: string;
  target_date?: Date;
  created_by_id: string;
  created_at: Date;
  updated_at: Date;
}

function toDoc(l: LatticeItem): LatticeDoc {
  return {
    _id: new ObjectId(l.id),
    project_id: l.projectId,
    capability: l.capability,
    category: l.category,
    status: l.status,
    description: l.description,
    owner: l.owner,
    target_date: l.targetDate,
    created_by_id: l.createdById,
    created_at: l.createdAt,
    updated_at: l.updatedAt,
  };
}

function fromDoc(d: LatticeDoc): LatticeItem {
  return {
    id: d._id.toHexString(),
    projectId: d.project_id,
    capability: d.capability,
    category: d.category,
    status: d.status,
    description: d.description,
    owner: d.owner,
    targetDate: d.target_date,
    createdById: d.created_by_id,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

export class MongoLatticeRepository {
  private readonly col: Collection<LatticeDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<LatticeDoc>("lattice_items");
  }

  async findByProjectId(projectId: string): Promise<LatticeItem[]> {
    const docs = await this.col.find({ project_id: projectId }).sort({ created_at: 1 }).toArray();
    return docs.map(fromDoc);
  }

  async findById(id: string): Promise<LatticeItem | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? fromDoc(doc) : null;
  }

  async create(item: LatticeItem): Promise<LatticeItem> {
    await this.col.insertOne(toDoc(item));
    return item;
  }

  async update(item: LatticeItem): Promise<LatticeItem> {
    const updated = { ...item, updatedAt: new Date() };
    await this.col.replaceOne({ _id: new ObjectId(item.id) }, toDoc(updated));
    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!ObjectId.isValid(id)) return;
    await this.col.deleteOne({ _id: new ObjectId(id) });
  }
}
