import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { Risk } from "../../../domain/entity/risk.js";
import type { MongoDBClient } from "./client.js";

interface RiskDoc {
  _id: ObjectId;
  project_id: string;
  title: string;
  description: string;
  owner: string;
  severity: Risk["severity"];
  mitigation: string;
  residual_rating: Risk["residualRating"];
  escalation: string;
  status: Risk["status"];
  created_by_id: string;
  created_at: Date;
  updated_at: Date;
}

function toDoc(r: Risk): RiskDoc {
  return {
    _id: new ObjectId(r.id),
    project_id: r.projectId,
    title: r.title,
    description: r.description,
    owner: r.owner,
    severity: r.severity,
    mitigation: r.mitigation,
    residual_rating: r.residualRating,
    escalation: r.escalation,
    status: r.status,
    created_by_id: r.createdById,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  };
}

function fromDoc(d: RiskDoc): Risk {
  return {
    id: d._id.toHexString(),
    projectId: d.project_id,
    title: d.title,
    description: d.description,
    owner: d.owner,
    severity: d.severity,
    mitigation: d.mitigation,
    residualRating: d.residual_rating,
    escalation: d.escalation,
    status: d.status,
    createdById: d.created_by_id,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

export class MongoRiskRepository {
  private readonly col: Collection<RiskDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<RiskDoc>("risks");
  }

  async findByProjectId(projectId: string): Promise<Risk[]> {
    const docs = await this.col.find({ project_id: projectId }).sort({ created_at: -1 }).toArray();
    return docs.map(fromDoc);
  }

  async findById(id: string): Promise<Risk | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? fromDoc(doc) : null;
  }

  async create(risk: Risk): Promise<Risk> {
    await this.col.insertOne(toDoc(risk));
    return risk;
  }

  async update(risk: Risk): Promise<Risk> {
    const updated = { ...risk, updatedAt: new Date() };
    await this.col.replaceOne({ _id: new ObjectId(risk.id) }, toDoc(updated));
    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!ObjectId.isValid(id)) return;
    await this.col.deleteOne({ _id: new ObjectId(id) });
  }
}
