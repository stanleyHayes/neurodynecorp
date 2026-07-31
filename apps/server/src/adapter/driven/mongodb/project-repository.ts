import { ObjectId } from "mongodb";
import type { Collection, Filter } from "mongodb";
import type { Project } from "../../../domain/entity/index.js";
import type { ProjectRepository, ProjectFilter } from "../../../domain/port/index.js";
import type { MongoDBClient } from "./client.js";

interface ProjectDoc {
  _id: ObjectId;
  name: string;
  description: string;
  client_id: string;
  status: string;
  type: string;
  features: Project["features"];
  user_roles: string[];
  integrations: string[];
  budget_range: Project["budgetRange"];
  timeline: Project["timeline"];
  attachments: Project["attachments"];
  assigned_team: string[];
  specification_id?: string;
  progress: number;
  milestones: Project["milestones"];
  created_at: Date;
  updated_at: Date;
}

function toDoc(p: Project): ProjectDoc {
  return {
    _id: new ObjectId(p.id),
    // ProjectService names the field `title`; storage uses `name`.
    name: p.name ?? (p as unknown as { title?: string }).title ?? "",
    description: p.description,
    client_id: p.clientId,
    status: p.status,
    type: p.type,
    features: p.features,
    user_roles: p.userRoles,
    integrations: p.integrations,
    budget_range: p.budgetRange,
    timeline: p.timeline,
    attachments: p.attachments,
    assigned_team: p.assignedTeam,
    specification_id: p.specificationId,
    progress: p.progress,
    milestones: p.milestones,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

function fromDoc(d: ProjectDoc): Project {
  return {
    id: d._id.toHexString(),
    name: d.name,
    description: d.description,
    clientId: d.client_id,
    status: d.status as Project["status"],
    type: d.type as Project["type"],
    features: d.features,
    userRoles: d.user_roles,
    integrations: d.integrations,
    budgetRange: d.budget_range,
    timeline: d.timeline,
    attachments: d.attachments,
    assignedTeam: d.assigned_team,
    specificationId: d.specification_id,
    progress: d.progress,
    milestones: d.milestones,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

export class MongoProjectRepository implements ProjectRepository {
  private readonly col: Collection<ProjectDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<ProjectDoc>("projects");
  }

  async findById(id: string): Promise<Project | null> {
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? fromDoc(doc) : null;
  }

  async findAll(filter?: ProjectFilter): Promise<Project[]> {
    const query: Filter<ProjectDoc> = {};

    if (filter?.clientId) {
      query.client_id = filter.clientId;
    }
    if (filter?.status) {
      query.status = filter.status;
    }
    if (filter?.type) {
      query.type = filter.type;
    }
    if (filter?.assignedTeamMember) {
      query.assigned_team = filter.assignedTeamMember;
    }
    if (filter?.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: "i" } },
        { description: { $regex: filter.search, $options: "i" } },
      ];
    }

    const docs = await this.col
      .find(query)
      .sort({ created_at: -1 })
      .toArray();

    return docs.map(fromDoc);
  }

  async findByClientId(clientId: string): Promise<Project[]> {
    const docs = await this.col
      .find({ client_id: clientId })
      .sort({ created_at: -1 })
      .toArray();

    return docs.map(fromDoc);
  }

  async create(project: Project): Promise<Project> {
    await this.col.insertOne(toDoc(project));
    return project;
  }

  async update(idOrProject: string | Project, data?: Partial<Project>): Promise<Project> {
    if (typeof idOrProject === "string") {
      const existing = await this.findById(idOrProject);
      if (!existing) throw new Error(`Project not found: ${idOrProject}`);
      const merged = { ...existing, ...data, updatedAt: new Date() };
      const doc = toDoc(merged);
      await this.col.replaceOne({ _id: doc._id }, doc);
      return merged;
    }
    const doc = toDoc({ ...idOrProject, updatedAt: new Date() });
    await this.col.replaceOne({ _id: doc._id }, doc);
    return { ...idOrProject, updatedAt: doc.updated_at };
  }

  async list(filter: ProjectFilter & { page?: number; pageSize?: number }): Promise<{ projects: Project[]; total: number }> {
    const query: Filter<ProjectDoc> = {};
    if (filter?.clientId) query.client_id = filter.clientId;
    if (filter?.status) query.status = filter.status;
    if (filter?.type) query.type = filter.type;
    if (filter?.assignedTeamMember) query.assigned_team = filter.assignedTeamMember;
    if (filter?.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: "i" } },
        { description: { $regex: filter.search, $options: "i" } },
      ];
    }

    const page = filter?.page ?? 1;
    const pageSize = filter?.pageSize ?? 20;
    const total = await this.col.countDocuments(query);
    const docs = await this.col
      .find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    return { projects: docs.map(fromDoc), total };
  }

  async delete(id: string): Promise<void> {
    await this.col.deleteOne({ _id: new ObjectId(id) });
  }
}
