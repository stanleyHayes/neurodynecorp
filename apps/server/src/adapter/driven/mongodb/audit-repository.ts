import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { AuditEntry } from "../../../domain/entity/audit.js";
import type { MongoDBClient } from "./client.js";

interface AuditDoc {
  _id: ObjectId;
  user_id?: string;
  user_role?: string;
  action: string;
  method: string;
  path: string;
  resource?: string;
  resource_id?: string;
  status_code?: number;
  ip?: string;
  user_agent?: string;
  metadata?: any;
  created_at: Date;
}

function toDoc(e: AuditEntry): AuditDoc {
  return {
    _id: new ObjectId(e.id),
    user_id: e.userId,
    user_role: e.userRole,
    action: e.action,
    method: e.method,
    path: e.path,
    resource: e.resource,
    resource_id: e.resourceId,
    status_code: e.statusCode,
    ip: e.ip,
    user_agent: e.userAgent,
    metadata: e.metadata,
    created_at: e.createdAt,
  };
}

function fromDoc(d: AuditDoc): AuditEntry {
  return {
    id: d._id.toHexString(),
    userId: d.user_id,
    userRole: d.user_role,
    action: d.action,
    method: d.method,
    path: d.path,
    resource: d.resource,
    resourceId: d.resource_id,
    statusCode: d.status_code,
    ip: d.ip,
    userAgent: d.user_agent,
    metadata: d.metadata,
    createdAt: d.created_at,
  };
}

export interface AuditFilter {
  userId?: string;
  resource?: string;
  method?: string;
  from?: Date;
  to?: Date;
  limit?: number;
}

export class MongoAuditRepository {
  private readonly col: Collection<AuditDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<AuditDoc>("audit_log");
  }

  async create(entry: AuditEntry): Promise<AuditEntry> {
    await this.col.insertOne(toDoc(entry));
    return entry;
  }

  private buildQuery(filter: AuditFilter): Record<string, any> {
    const query: Record<string, any> = {};
    if (filter.userId) query.user_id = filter.userId;
    if (filter.resource) query.resource = filter.resource;
    if (filter.method) query.method = filter.method;
    if (filter.from || filter.to) {
      query.created_at = {};
      if (filter.from) query.created_at.$gte = filter.from;
      if (filter.to) query.created_at.$lte = filter.to;
    }
    return query;
  }

  async findAll(filter: AuditFilter = {}): Promise<AuditEntry[]> {
    const query = this.buildQuery(filter);
    const limit = filter.limit && filter.limit > 0 ? filter.limit : 100;
    const docs = await this.col
      .find(query)
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray();
    return docs.map(fromDoc);
  }

  async count(filter: AuditFilter = {}): Promise<number> {
    return this.col.countDocuments(this.buildQuery(filter));
  }
}
