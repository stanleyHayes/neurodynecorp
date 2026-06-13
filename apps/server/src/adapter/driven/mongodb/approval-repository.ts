import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { Approval } from "../../../domain/entity/approval.js";
import type { MongoDBClient } from "./client.js";

interface ApprovalDoc {
  _id: ObjectId;
  project_id: string;
  title: string;
  description: string;
  deliverable_ref?: string;
  status: Approval["status"];
  requested_by_id: string;
  decided_by_id?: string;
  decided_at?: Date;
  decision_comment?: string;
  created_at: Date;
  updated_at: Date;
}

function toDoc(a: Approval): ApprovalDoc {
  return {
    _id: new ObjectId(a.id),
    project_id: a.projectId,
    title: a.title,
    description: a.description,
    deliverable_ref: a.deliverableRef,
    status: a.status,
    requested_by_id: a.requestedById,
    decided_by_id: a.decidedById,
    decided_at: a.decidedAt,
    decision_comment: a.decisionComment,
    created_at: a.createdAt,
    updated_at: a.updatedAt,
  };
}

function fromDoc(d: ApprovalDoc): Approval {
  return {
    id: d._id.toHexString(),
    projectId: d.project_id,
    title: d.title,
    description: d.description,
    deliverableRef: d.deliverable_ref,
    status: d.status,
    requestedById: d.requested_by_id,
    decidedById: d.decided_by_id,
    decidedAt: d.decided_at,
    decisionComment: d.decision_comment,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

export class MongoApprovalRepository {
  private readonly col: Collection<ApprovalDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<ApprovalDoc>("approvals");
  }

  async findByProjectId(projectId: string): Promise<Approval[]> {
    const docs = await this.col.find({ project_id: projectId }).sort({ created_at: -1 }).toArray();
    return docs.map(fromDoc);
  }

  async findById(id: string): Promise<Approval | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? fromDoc(doc) : null;
  }

  async create(approval: Approval): Promise<Approval> {
    await this.col.insertOne(toDoc(approval));
    return approval;
  }

  async update(approval: Approval): Promise<Approval> {
    const updated = { ...approval, updatedAt: new Date() };
    await this.col.replaceOne({ _id: new ObjectId(approval.id) }, toDoc(updated));
    return updated;
  }

  /**
   * Atomic decide-once: records a decision only if the approval is still pending.
   * The {status:"pending"} filter makes the transition a compare-and-swap, so two
   * concurrent deciders can never both win. Returns the updated approval, or null
   * if it wasn't pending (already decided / not found).
   */
  async decideIfPending(
    id: string,
    fields: { status: Approval["status"]; decidedById: string; decidedAt: Date; decisionComment?: string },
  ): Promise<Approval | null> {
    if (!ObjectId.isValid(id)) return null;
    const result = await this.col.updateOne(
      { _id: new ObjectId(id), status: "pending" },
      {
        $set: {
          status: fields.status,
          decided_by_id: fields.decidedById,
          decided_at: fields.decidedAt,
          decision_comment: fields.decisionComment,
          updated_at: new Date(),
        },
      },
    );
    if (result.matchedCount === 0) return null;
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    if (!ObjectId.isValid(id)) return;
    await this.col.deleteOne({ _id: new ObjectId(id) });
  }
}
