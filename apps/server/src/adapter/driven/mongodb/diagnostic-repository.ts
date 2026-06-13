import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { DiagnosticRecord } from "../../../domain/entity/diagnostic.js";
import type { MongoDBClient } from "./client.js";

interface DiagnosticDoc {
  _id: ObjectId;
  respondent_name?: string;
  email?: string;
  org?: string;
  answers: DiagnosticRecord["answers"];
  result: DiagnosticRecord["result"];
  route: string; // denormalised for filtering/analytics
  created_at: Date;
}

function toDoc(r: DiagnosticRecord): DiagnosticDoc {
  return {
    _id: new ObjectId(r.id),
    respondent_name: r.respondentName,
    email: r.email,
    org: r.org,
    answers: r.answers,
    result: r.result,
    route: r.result.route,
    created_at: r.createdAt,
  };
}

function fromDoc(d: DiagnosticDoc): DiagnosticRecord {
  return {
    id: d._id.toHexString(),
    respondentName: d.respondent_name,
    email: d.email,
    org: d.org,
    answers: d.answers,
    result: d.result,
    createdAt: d.created_at,
  };
}

export class MongoDiagnosticRepository {
  private readonly col: Collection<DiagnosticDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<DiagnosticDoc>("diagnostic_submissions");
  }

  async create(record: DiagnosticRecord): Promise<DiagnosticRecord> {
    await this.col.insertOne(toDoc(record));
    return record;
  }

  async findAll(filter?: { route?: string; limit?: number }): Promise<DiagnosticRecord[]> {
    const query: Record<string, any> = {};
    if (filter?.route) query.route = filter.route;

    // Default cap to avoid an unbounded scan; clamp to a sane positive range.
    const requested = Number(filter?.limit);
    const limit = Number.isFinite(requested) && requested > 0 ? Math.min(requested, 500) : 200;

    const docs = await this.col.find(query).sort({ created_at: -1 }).limit(limit).toArray();
    return docs.map(fromDoc);
  }

  async findById(id: string): Promise<DiagnosticRecord | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? fromDoc(doc) : null;
  }
}
