import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { Feedback } from "../../../domain/entity/feedback.js";
import type { MongoDBClient } from "./client.js";

interface FeedbackDoc {
  _id: ObjectId;
  user_id?: string;
  email?: string;
  type: string;
  score?: number;
  message?: string;
  page?: string;
  created_at: Date;
}

function toDoc(f: Feedback): FeedbackDoc {
  return {
    _id: new ObjectId(f.id),
    user_id: f.userId,
    email: f.email,
    type: f.type,
    score: f.score,
    message: f.message,
    page: f.page,
    created_at: f.createdAt,
  };
}

function fromDoc(d: FeedbackDoc): Feedback {
  return {
    id: d._id.toHexString(),
    userId: d.user_id,
    email: d.email,
    type: d.type as Feedback["type"],
    score: d.score,
    message: d.message,
    page: d.page,
    createdAt: d.created_at,
  };
}

export class MongoFeedbackRepository {
  private readonly col: Collection<FeedbackDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<FeedbackDoc>("feedback");
  }

  async create(feedback: Feedback): Promise<Feedback> {
    await this.col.insertOne(toDoc(feedback));
    return feedback;
  }

  async findAll(filter?: { type?: string; limit?: number }): Promise<Feedback[]> {
    const query: Record<string, any> = {};
    if (filter?.type) query.type = filter.type;

    let cursor = this.col.find(query).sort({ created_at: -1 });
    if (filter?.limit) cursor = cursor.limit(filter.limit);

    const docs = await cursor.toArray();
    return docs.map(fromDoc);
  }
}
