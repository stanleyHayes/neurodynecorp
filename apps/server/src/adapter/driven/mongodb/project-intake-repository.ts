import { ObjectId, type Collection } from "mongodb";
import type { MongoDBClient } from "./client.js";
import type { ProjectIntake, ProjectIntakeStatus } from "../../../domain/entity/project-intake.js";

interface IntakeDoc {
  _id: ObjectId;
  owner_id?: string;
  resume_token_hash?: string;
  category: string;
  title: string;
  contact_name: string;
  contact_email: string;
  company?: string;
  answers: Record<string, unknown>;
  current_section: number;
  status: ProjectIntakeStatus;
  submitted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

const fromDoc = (d: IntakeDoc): ProjectIntake => ({
  id: d._id.toHexString(), ownerId: d.owner_id, resumeTokenHash: d.resume_token_hash,
  category: d.category, title: d.title, contactName: d.contact_name,
  contactEmail: d.contact_email, company: d.company, answers: d.answers,
  currentSection: d.current_section, status: d.status, submittedAt: d.submitted_at,
  createdAt: d.created_at, updatedAt: d.updated_at,
});

const toDoc = (i: ProjectIntake): IntakeDoc => ({
  _id: new ObjectId(i.id), owner_id: i.ownerId, resume_token_hash: i.resumeTokenHash,
  category: i.category, title: i.title, contact_name: i.contactName,
  contact_email: i.contactEmail, company: i.company, answers: i.answers,
  current_section: i.currentSection, status: i.status, submitted_at: i.submittedAt,
  created_at: i.createdAt, updated_at: i.updatedAt,
});

export class MongoProjectIntakeRepository {
  private readonly col: Collection<IntakeDoc>;
  constructor(client: MongoDBClient) { this.col = client.collection<IntakeDoc>("project_intakes"); }
  async create(i: ProjectIntake) { await this.col.insertOne(toDoc(i)); return i; }
  async findById(id: string) {
    if (!ObjectId.isValid(id)) return null;
    const d = await this.col.findOne({ _id: new ObjectId(id) });
    return d ? fromDoc(d) : null;
  }
  async findByOwner(ownerId: string) {
    return (await this.col.find({ owner_id: ownerId }).sort({ updated_at: -1 }).toArray()).map(fromDoc);
  }
  async findAll(status?: ProjectIntakeStatus) {
    return (await this.col.find(status ? { status } : {}).sort({ updated_at: -1 }).limit(500).toArray()).map(fromDoc);
  }
  async update(i: ProjectIntake) {
    const next = { ...i, updatedAt: new Date() };
    await this.col.replaceOne({ _id: new ObjectId(i.id) }, toDoc(next));
    return next;
  }
}
