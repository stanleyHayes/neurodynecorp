import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { Notification } from "../../../domain/entity/index.js";
import type { NotificationRepository } from "../../../domain/port/index.js";
import type { MongoDBClient } from "./client.js";

interface NotificationDoc {
  _id: ObjectId;
  user_id: string;
  type: string;
  title: string;
  message: string;
  resource_id?: string;
  resource_type?: string;
  read: boolean;
  read_at?: Date;
  created_at: Date;
}

function toDoc(n: Notification): NotificationDoc {
  return {
    _id: new ObjectId(n.id),
    user_id: n.userId,
    type: n.type,
    title: n.title,
    message: n.message,
    resource_id: n.resourceId,
    resource_type: n.resourceType,
    read: n.read,
    read_at: n.readAt,
    created_at: n.createdAt,
  };
}

function fromDoc(d: NotificationDoc): Notification {
  return {
    id: d._id.toHexString(),
    userId: d.user_id,
    type: d.type as Notification["type"],
    title: d.title,
    message: d.message,
    resourceId: d.resource_id,
    resourceType: d.resource_type,
    read: d.read,
    readAt: d.read_at,
    createdAt: d.created_at,
  };
}

export class MongoNotificationRepository implements NotificationRepository {
  private readonly col: Collection<NotificationDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<NotificationDoc>("notifications");
  }

  async findById(id: string): Promise<Notification | null> {
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? fromDoc(doc) : null;
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    const docs = await this.col
      .find({ user_id: userId })
      .sort({ created_at: -1 })
      .toArray();
    return docs.map(fromDoc);
  }

  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    const docs = await this.col
      .find({ user_id: userId, read: false })
      .sort({ created_at: -1 })
      .toArray();
    return docs.map(fromDoc);
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    return this.col.countDocuments({ user_id: userId, read: false });
  }

  async create(notification: Notification): Promise<Notification> {
    await this.col.insertOne(toDoc(notification));
    return notification;
  }

  async markAsRead(id: string): Promise<void> {
    await this.col.updateOne(
      { _id: new ObjectId(id) },
      { $set: { read: true, read_at: new Date() } },
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.col.updateMany(
      { user_id: userId, read: false },
      { $set: { read: true, read_at: new Date() } },
    );
  }

  async delete(id: string): Promise<void> {
    await this.col.deleteOne({ _id: new ObjectId(id) });
  }
}
