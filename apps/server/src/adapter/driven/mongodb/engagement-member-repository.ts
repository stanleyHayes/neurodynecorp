import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { EngagementMember } from "../../../domain/entity/engagement-member.js";
import type { MongoDBClient } from "./client.js";

interface EngagementMemberDoc {
  _id: ObjectId;
  project_id: string;
  name: string;
  role: string;
  email?: string;
  availability: EngagementMember["availability"];
  focus?: string;
  bio?: string;
  created_by_id: string;
  created_at: Date;
  updated_at: Date;
}

function toDoc(m: EngagementMember): EngagementMemberDoc {
  return {
    _id: new ObjectId(m.id),
    project_id: m.projectId,
    name: m.name,
    role: m.role,
    email: m.email,
    availability: m.availability,
    focus: m.focus,
    bio: m.bio,
    created_by_id: m.createdById,
    created_at: m.createdAt,
    updated_at: m.updatedAt,
  };
}

function fromDoc(d: EngagementMemberDoc): EngagementMember {
  return {
    id: d._id.toHexString(),
    projectId: d.project_id,
    name: d.name,
    role: d.role,
    email: d.email,
    availability: d.availability,
    focus: d.focus,
    bio: d.bio,
    createdById: d.created_by_id,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

export class MongoEngagementMemberRepository {
  private readonly col: Collection<EngagementMemberDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<EngagementMemberDoc>("engagement_members");
  }

  async findByProjectId(projectId: string): Promise<EngagementMember[]> {
    const docs = await this.col.find({ project_id: projectId }).sort({ created_at: 1 }).toArray();
    return docs.map(fromDoc);
  }

  async findById(id: string): Promise<EngagementMember | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? fromDoc(doc) : null;
  }

  async create(member: EngagementMember): Promise<EngagementMember> {
    await this.col.insertOne(toDoc(member));
    return member;
  }

  async update(member: EngagementMember): Promise<EngagementMember> {
    const updated = { ...member, updatedAt: new Date() };
    await this.col.replaceOne({ _id: new ObjectId(member.id) }, toDoc(updated));
    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!ObjectId.isValid(id)) return;
    await this.col.deleteOne({ _id: new ObjectId(id) });
  }
}
