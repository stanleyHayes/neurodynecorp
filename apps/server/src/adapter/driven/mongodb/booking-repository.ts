import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { BookingRequest, BookingStatus } from "../../../domain/entity/booking.js";
import type { MongoDBClient } from "./client.js";

interface BookingDoc {
  _id: ObjectId;
  name: string;
  email: string;
  org?: string;
  topic?: string;
  route?: string;
  diagnostic_id?: string;
  duration_mins: number;
  preferred_times?: string;
  timezone?: string;
  status: BookingStatus;
  created_at: Date;
}

function toDoc(b: BookingRequest): BookingDoc {
  return {
    _id: new ObjectId(b.id),
    name: b.name,
    email: b.email,
    org: b.org,
    topic: b.topic,
    route: b.route,
    diagnostic_id: b.diagnosticId,
    duration_mins: b.durationMins,
    preferred_times: b.preferredTimes,
    timezone: b.timezone,
    status: b.status,
    created_at: b.createdAt,
  };
}

function fromDoc(d: BookingDoc): BookingRequest {
  return {
    id: d._id.toHexString(),
    name: d.name,
    email: d.email,
    org: d.org,
    topic: d.topic,
    route: d.route,
    diagnosticId: d.diagnostic_id,
    durationMins: d.duration_mins,
    preferredTimes: d.preferred_times,
    timezone: d.timezone,
    status: d.status,
    createdAt: d.created_at,
  };
}

export class MongoBookingRepository {
  private readonly col: Collection<BookingDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<BookingDoc>("booking_requests");
  }

  async create(record: BookingRequest): Promise<BookingRequest> {
    await this.col.insertOne(toDoc(record));
    return record;
  }

  async findAll(filter?: { status?: string; limit?: number }): Promise<BookingRequest[]> {
    const query: Record<string, any> = {};
    if (filter?.status) query.status = filter.status;

    const requested = Number(filter?.limit);
    const limit = Number.isFinite(requested) && requested > 0 ? Math.min(requested, 500) : 200;

    const docs = await this.col.find(query).sort({ created_at: -1 }).limit(limit).toArray();
    return docs.map(fromDoc);
  }

  async findById(id: string): Promise<BookingRequest | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? fromDoc(doc) : null;
  }

  async updateStatus(id: string, status: BookingStatus): Promise<BookingRequest | null> {
    if (!ObjectId.isValid(id)) return null;
    await this.col.updateOne({ _id: new ObjectId(id) }, { $set: { status } });
    return this.findById(id);
  }
}
