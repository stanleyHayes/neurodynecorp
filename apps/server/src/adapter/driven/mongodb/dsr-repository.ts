import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { DsrRequest } from "../../../domain/entity/dsr.js";
import type { MongoDBClient } from "./client.js";

interface DsrRequestDoc {
  _id: ObjectId;
  user_id?: string;
  email: string;
  type: string;
  status: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
}

function toDoc(r: DsrRequest): DsrRequestDoc {
  return {
    _id: new ObjectId(r.id),
    user_id: r.userId,
    email: r.email,
    type: r.type,
    status: r.status,
    notes: r.notes,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
    completed_at: r.completedAt,
  };
}

function fromDoc(d: DsrRequestDoc): DsrRequest {
  return {
    id: d._id.toHexString(),
    userId: d.user_id,
    email: d.email,
    type: d.type as DsrRequest["type"],
    status: d.status as DsrRequest["status"],
    notes: d.notes,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
    completedAt: d.completed_at,
  };
}

export class MongoDsrRepository {
  private readonly col: Collection<DsrRequestDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<DsrRequestDoc>("dsr_requests");
  }

  async create(request: DsrRequest): Promise<DsrRequest> {
    await this.col.insertOne(toDoc(request));
    return request;
  }

  async findById(id: string): Promise<DsrRequest | null> {
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? fromDoc(doc) : null;
  }

  async findByUser(userId: string): Promise<DsrRequest[]> {
    const docs = await this.col
      .find({ user_id: userId })
      .sort({ created_at: -1 })
      .toArray();
    return docs.map(fromDoc);
  }

  async findAll(filter?: { status?: string }): Promise<DsrRequest[]> {
    const query: Record<string, any> = {};
    if (filter?.status) query.status = filter.status;
    const docs = await this.col.find(query).sort({ created_at: -1 }).toArray();
    return docs.map(fromDoc);
  }

  async update(request: DsrRequest): Promise<DsrRequest> {
    await this.col.updateOne({ _id: new ObjectId(request.id) }, { $set: toDoc(request) });
    return request;
  }
}
