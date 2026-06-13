import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { Stakeholder } from "../../../domain/entity/stakeholder.js";
import type { MongoDBClient } from "./client.js";

interface StakeholderDoc {
  _id: ObjectId;
  project_id: string;
  name: string;
  role: string;
  side: Stakeholder["side"];
  authority: Stakeholder["authority"];
  briefed: boolean;
  email?: string;
  notes?: string;
  created_by_id: string;
  created_at: Date;
  updated_at: Date;
}

function toDoc(s: Stakeholder): StakeholderDoc {
  return {
    _id: new ObjectId(s.id),
    project_id: s.projectId,
    name: s.name,
    role: s.role,
    side: s.side,
    authority: s.authority,
    briefed: s.briefed,
    email: s.email,
    notes: s.notes,
    created_by_id: s.createdById,
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  };
}

function fromDoc(d: StakeholderDoc): Stakeholder {
  return {
    id: d._id.toHexString(),
    projectId: d.project_id,
    name: d.name,
    role: d.role,
    side: d.side,
    authority: d.authority,
    briefed: d.briefed,
    email: d.email,
    notes: d.notes,
    createdById: d.created_by_id,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

export class MongoStakeholderRepository {
  private readonly col: Collection<StakeholderDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<StakeholderDoc>("stakeholders");
  }

  async findByProjectId(projectId: string): Promise<Stakeholder[]> {
    const docs = await this.col.find({ project_id: projectId }).sort({ created_at: 1 }).toArray();
    return docs.map(fromDoc);
  }

  async findById(id: string): Promise<Stakeholder | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? fromDoc(doc) : null;
  }

  async create(stakeholder: Stakeholder): Promise<Stakeholder> {
    await this.col.insertOne(toDoc(stakeholder));
    return stakeholder;
  }

  async update(stakeholder: Stakeholder): Promise<Stakeholder> {
    const updated = { ...stakeholder, updatedAt: new Date() };
    await this.col.replaceOne({ _id: new ObjectId(stakeholder.id) }, toDoc(updated));
    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!ObjectId.isValid(id)) return;
    await this.col.deleteOne({ _id: new ObjectId(id) });
  }
}
