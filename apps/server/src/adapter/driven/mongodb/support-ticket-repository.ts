import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { SupportTicket, TicketReply } from "../../../domain/entity/support-ticket.js";
import type { MongoDBClient } from "./client.js";

interface TicketDoc {
  _id: ObjectId;
  project_id: string;
  subject: string;
  body: string;
  category: SupportTicket["category"];
  priority: SupportTicket["priority"];
  status: SupportTicket["status"];
  sla_due_at: Date;
  first_responded_at?: Date;
  created_by_id: string;
  created_by_staff: boolean;
  replies: TicketReply[];
  created_at: Date;
  updated_at: Date;
}

function toDoc(t: SupportTicket): TicketDoc {
  return {
    _id: new ObjectId(t.id),
    project_id: t.projectId,
    subject: t.subject,
    body: t.body,
    category: t.category,
    priority: t.priority,
    status: t.status,
    sla_due_at: t.slaDueAt,
    first_responded_at: t.firstRespondedAt,
    created_by_id: t.createdById,
    created_by_staff: t.createdByStaff,
    replies: t.replies,
    created_at: t.createdAt,
    updated_at: t.updatedAt,
  };
}

function fromDoc(d: TicketDoc): SupportTicket {
  return {
    id: d._id.toHexString(),
    projectId: d.project_id,
    subject: d.subject,
    body: d.body,
    category: d.category,
    priority: d.priority,
    status: d.status,
    slaDueAt: d.sla_due_at,
    firstRespondedAt: d.first_responded_at,
    createdById: d.created_by_id,
    createdByStaff: d.created_by_staff,
    replies: d.replies ?? [],
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

export class MongoSupportTicketRepository {
  private readonly col: Collection<TicketDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<TicketDoc>("support_tickets");
  }

  async findByProjectId(projectId: string): Promise<SupportTicket[]> {
    const docs = await this.col.find({ project_id: projectId }).sort({ created_at: -1 }).toArray();
    return docs.map(fromDoc);
  }

  async findAll(filter?: { status?: string; limit?: number }): Promise<SupportTicket[]> {
    const query: Record<string, any> = {};
    if (filter?.status) query.status = filter.status;
    const requested = Number(filter?.limit);
    const limit = Number.isFinite(requested) && requested > 0 ? Math.min(requested, 500) : 200;
    const docs = await this.col.find(query).sort({ created_at: -1 }).limit(limit).toArray();
    return docs.map(fromDoc);
  }

  async findById(id: string): Promise<SupportTicket | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? fromDoc(doc) : null;
  }

  async create(ticket: SupportTicket): Promise<SupportTicket> {
    await this.col.insertOne(toDoc(ticket));
    return ticket;
  }

  async update(ticket: SupportTicket): Promise<SupportTicket> {
    const updated = { ...ticket, updatedAt: new Date() };
    await this.col.replaceOne({ _id: new ObjectId(ticket.id) }, toDoc(updated));
    return updated;
  }
}
