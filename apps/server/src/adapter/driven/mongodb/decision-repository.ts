import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { Decision } from "../../../domain/entity/decision.js";
import type { MongoDBClient } from "./client.js";

interface DecisionDoc {
  _id: ObjectId;
  project_id: string;
  title: string;
  rationale: string;
  alternatives: string[];
  decision_maker: string;
  linked_artifacts: string[];
  status: Decision["status"];
  decided_at: Date;
  created_by_id: string;
  created_at: Date;
  updated_at: Date;
}

function toDoc(d: Decision): DecisionDoc {
  return {
    _id: new ObjectId(d.id),
    project_id: d.projectId,
    title: d.title,
    rationale: d.rationale,
    alternatives: d.alternatives,
    decision_maker: d.decisionMaker,
    linked_artifacts: d.linkedArtifacts,
    status: d.status,
    decided_at: d.decidedAt,
    created_by_id: d.createdById,
    created_at: d.createdAt,
    updated_at: d.updatedAt,
  };
}

function fromDoc(d: DecisionDoc): Decision {
  return {
    id: d._id.toHexString(),
    projectId: d.project_id,
    title: d.title,
    rationale: d.rationale,
    alternatives: d.alternatives ?? [],
    decisionMaker: d.decision_maker,
    linkedArtifacts: d.linked_artifacts ?? [],
    status: d.status,
    decidedAt: d.decided_at,
    createdById: d.created_by_id,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

export class MongoDecisionRepository {
  private readonly col: Collection<DecisionDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<DecisionDoc>("decisions");
  }

  async findByProjectId(projectId: string): Promise<Decision[]> {
    const docs = await this.col.find({ project_id: projectId }).sort({ decided_at: -1, created_at: -1 }).toArray();
    return docs.map(fromDoc);
  }

  async findById(id: string): Promise<Decision | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? fromDoc(doc) : null;
  }

  async create(decision: Decision): Promise<Decision> {
    await this.col.insertOne(toDoc(decision));
    return decision;
  }

  async update(decision: Decision): Promise<Decision> {
    const updated = { ...decision, updatedAt: new Date() };
    await this.col.replaceOne({ _id: new ObjectId(decision.id) }, toDoc(updated));
    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!ObjectId.isValid(id)) return;
    await this.col.deleteOne({ _id: new ObjectId(id) });
  }
}
