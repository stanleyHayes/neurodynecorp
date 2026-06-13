import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { RfpSubmission, RfpStatus } from "../../../domain/entity/rfp.js";
import type { MongoDBClient } from "./client.js";

interface RfpDoc {
  _id: ObjectId;
  org: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  sector?: string;
  title: string;
  scope: string;
  evaluation_criteria?: string;
  submission_requirements?: string;
  document_url?: string;
  estimated_value?: string;
  deadline?: string;
  status: RfpStatus;
  sla_due_at: Date;
  acknowledged_at?: Date;
  created_at: Date;
}

function toDoc(r: RfpSubmission): RfpDoc {
  return {
    _id: new ObjectId(r.id),
    org: r.org,
    contact_name: r.contactName,
    contact_email: r.contactEmail,
    contact_phone: r.contactPhone,
    sector: r.sector,
    title: r.title,
    scope: r.scope,
    evaluation_criteria: r.evaluationCriteria,
    submission_requirements: r.submissionRequirements,
    document_url: r.documentUrl,
    estimated_value: r.estimatedValue,
    deadline: r.deadline,
    status: r.status,
    sla_due_at: r.slaDueAt,
    acknowledged_at: r.acknowledgedAt,
    created_at: r.createdAt,
  };
}

function fromDoc(d: RfpDoc): RfpSubmission {
  return {
    id: d._id.toHexString(),
    org: d.org,
    contactName: d.contact_name,
    contactEmail: d.contact_email,
    contactPhone: d.contact_phone,
    sector: d.sector,
    title: d.title,
    scope: d.scope,
    evaluationCriteria: d.evaluation_criteria,
    submissionRequirements: d.submission_requirements,
    documentUrl: d.document_url,
    estimatedValue: d.estimated_value,
    deadline: d.deadline,
    status: d.status,
    slaDueAt: d.sla_due_at,
    acknowledgedAt: d.acknowledged_at,
    createdAt: d.created_at,
  };
}

export class MongoRfpRepository {
  private readonly col: Collection<RfpDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<RfpDoc>("rfp_submissions");
  }

  async create(record: RfpSubmission): Promise<RfpSubmission> {
    await this.col.insertOne(toDoc(record));
    return record;
  }

  async findAll(filter?: { status?: string; limit?: number }): Promise<RfpSubmission[]> {
    const query: Record<string, any> = {};
    if (filter?.status) query.status = filter.status;

    const requested = Number(filter?.limit);
    const limit = Number.isFinite(requested) && requested > 0 ? Math.min(requested, 500) : 200;

    const docs = await this.col.find(query).sort({ created_at: -1 }).limit(limit).toArray();
    return docs.map(fromDoc);
  }

  async findById(id: string): Promise<RfpSubmission | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? fromDoc(doc) : null;
  }

  /** Update status; stamps acknowledgedAt the FIRST time it moves off "received". */
  async updateStatus(id: string, status: RfpStatus): Promise<RfpSubmission | null> {
    if (!ObjectId.isValid(id)) return null;
    const current = await this.findById(id);
    if (!current) return null;
    const set: Partial<RfpDoc> = { status };
    if (status !== "received" && !current.acknowledgedAt) set.acknowledged_at = new Date();
    await this.col.updateOne({ _id: new ObjectId(id) }, { $set: set });
    return this.findById(id);
  }
}
