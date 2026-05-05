import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { Specification } from "../../../domain/entity/index.js";
import type { SpecificationRepository } from "../../../domain/port/index.js";
import type { MongoDBClient } from "./client.js";

interface SpecDoc {
  _id: ObjectId;
  project_id: string;
  status: string;
  version: number;
  overview: string;
  objectives: string[];
  feature_breakdown: Specification["featureBreakdown"];
  user_roles_permissions: Specification["userRolesPermissions"];
  technical_architecture: Specification["technicalArchitecture"];
  integration_reqs: Specification["integrationReqs"];
  timeline_estimate: Specification["timelineEstimate"];
  cost_estimate: Specification["costEstimate"];
  assumptions: string[];
  risks: Specification["risks"];
  internal_notes: Specification["internalNotes"];
  generated_by?: string;
  approved_by?: string;
  approved_at?: Date;
  created_at: Date;
  updated_at: Date;
}

function toDoc(s: Specification): SpecDoc {
  return {
    _id: new ObjectId(s.id),
    project_id: s.projectId,
    status: s.status,
    version: s.version,
    overview: s.overview,
    objectives: s.objectives,
    feature_breakdown: s.featureBreakdown,
    user_roles_permissions: s.userRolesPermissions,
    technical_architecture: s.technicalArchitecture,
    integration_reqs: s.integrationReqs,
    timeline_estimate: s.timelineEstimate,
    cost_estimate: s.costEstimate,
    assumptions: s.assumptions,
    risks: s.risks,
    internal_notes: s.internalNotes,
    generated_by: s.generatedBy,
    approved_by: s.approvedBy,
    approved_at: s.approvedAt,
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  };
}

function fromDoc(d: SpecDoc): Specification {
  return {
    id: d._id.toHexString(),
    projectId: d.project_id,
    status: d.status as Specification["status"],
    version: d.version,
    overview: d.overview,
    objectives: d.objectives,
    featureBreakdown: d.feature_breakdown,
    userRolesPermissions: d.user_roles_permissions,
    technicalArchitecture: d.technical_architecture,
    integrationReqs: d.integration_reqs,
    timelineEstimate: d.timeline_estimate,
    costEstimate: d.cost_estimate,
    assumptions: d.assumptions,
    risks: d.risks,
    internalNotes: d.internal_notes,
    generatedBy: d.generated_by,
    approvedBy: d.approved_by,
    approvedAt: d.approved_at,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

export class MongoSpecificationRepository implements SpecificationRepository {
  private readonly col: Collection<SpecDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<SpecDoc>("specifications");
  }

  async findById(id: string): Promise<Specification | null> {
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? fromDoc(doc) : null;
  }

  async findByProjectId(projectId: string): Promise<Specification | null> {
    const doc = await this.col.findOne(
      { project_id: projectId },
      { sort: { version: -1 } },
    );
    return doc ? fromDoc(doc) : null;
  }

  async create(spec: Specification): Promise<Specification> {
    await this.col.insertOne(toDoc(spec));
    return spec;
  }

  async update(idOrSpec: string | Specification, data?: Partial<Specification>): Promise<Specification> {
    if (typeof idOrSpec === "string") {
      const existing = await this.findById(idOrSpec);
      if (!existing) throw new Error(`Specification not found: ${idOrSpec}`);
      const merged = { ...existing, ...data, updatedAt: new Date() };
      const doc = toDoc(merged);
      await this.col.replaceOne({ _id: doc._id }, doc);
      return merged;
    }
    const doc = toDoc({ ...idOrSpec, updatedAt: new Date() });
    await this.col.replaceOne({ _id: doc._id }, doc);
    return { ...idOrSpec, updatedAt: doc.updated_at };
  }

  async delete(id: string): Promise<void> {
    await this.col.deleteOne({ _id: new ObjectId(id) });
  }
}
