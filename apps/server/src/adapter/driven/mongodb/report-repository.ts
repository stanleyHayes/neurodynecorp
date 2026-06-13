import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { Report } from "../../../domain/entity/report.js";
import type { MongoDBClient } from "./client.js";

interface ReportDoc {
  _id: ObjectId;
  project_id: string;
  title: string;
  type: Report["type"];
  summary?: string;
  url?: string;
  period?: string;
  status: Report["status"];
  published_at?: Date;
  created_by_id: string;
  created_at: Date;
  updated_at: Date;
}

function toDoc(r: Report): ReportDoc {
  return {
    _id: new ObjectId(r.id),
    project_id: r.projectId,
    title: r.title,
    type: r.type,
    summary: r.summary,
    url: r.url,
    period: r.period,
    status: r.status,
    published_at: r.publishedAt,
    created_by_id: r.createdById,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  };
}

function fromDoc(d: ReportDoc): Report {
  return {
    id: d._id.toHexString(),
    projectId: d.project_id,
    title: d.title,
    type: d.type,
    summary: d.summary,
    url: d.url,
    period: d.period,
    status: d.status,
    publishedAt: d.published_at,
    createdById: d.created_by_id,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

export class MongoReportRepository {
  private readonly col: Collection<ReportDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<ReportDoc>("reports");
  }

  /** All reports for a project (staff view). */
  async findByProjectId(projectId: string): Promise<Report[]> {
    const docs = await this.col.find({ project_id: projectId }).sort({ created_at: -1 }).toArray();
    return docs.map(fromDoc);
  }

  /** Only published reports for a project (client view). */
  async findPublishedByProjectId(projectId: string): Promise<Report[]> {
    const docs = await this.col.find({ project_id: projectId, status: "published" }).sort({ created_at: -1 }).toArray();
    return docs.map(fromDoc);
  }

  async findById(id: string): Promise<Report | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? fromDoc(doc) : null;
  }

  async create(report: Report): Promise<Report> {
    await this.col.insertOne(toDoc(report));
    return report;
  }

  async update(report: Report): Promise<Report> {
    const updated = { ...report, updatedAt: new Date() };
    await this.col.replaceOne({ _id: new ObjectId(report.id) }, toDoc(updated));
    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!ObjectId.isValid(id)) return;
    await this.col.deleteOne({ _id: new ObjectId(id) });
  }
}
