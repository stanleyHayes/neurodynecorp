import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { Message, Thread } from "../../../domain/entity/index.js";
import type {
  MessageRepository,
  ThreadRepository,
} from "../../../domain/port/index.js";
import type { MongoDBClient } from "./client.js";

// ── Message ──────────────────────────────────────────────────────────────────

interface MessageDoc {
  _id: ObjectId;
  thread_id: string;
  sender_id: string;
  content: string;
  attachments: string[];
  read_by: string[];
  created_at: Date;
  updated_at: Date;
}

function messageToDoc(m: Message): MessageDoc {
  return {
    _id: new ObjectId(m.id),
    thread_id: m.threadId,
    sender_id: m.senderId,
    content: m.content,
    attachments: m.attachments,
    read_by: m.readBy,
    created_at: m.createdAt,
    updated_at: m.updatedAt,
  };
}

function messageFromDoc(d: MessageDoc): Message {
  return {
    id: d._id.toHexString(),
    threadId: d.thread_id,
    senderId: d.sender_id,
    content: d.content,
    attachments: d.attachments,
    readBy: d.read_by,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

export class MongoMessageRepository implements MessageRepository {
  private readonly col: Collection<MessageDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<MessageDoc>("messages");
  }

  async findById(id: string): Promise<Message | null> {
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? messageFromDoc(doc) : null;
  }

  async findByThreadId(threadId: string): Promise<Message[]> {
    const docs = await this.col
      .find({ thread_id: threadId })
      .sort({ created_at: 1 })
      .toArray();
    return docs.map(messageFromDoc);
  }

  async create(message: Message): Promise<Message> {
    await this.col.insertOne(messageToDoc(message));
    return message;
  }

  async update(message: Message): Promise<Message> {
    const doc = messageToDoc({ ...message, updatedAt: new Date() });
    await this.col.replaceOne({ _id: doc._id }, doc);
    return { ...message, updatedAt: doc.updated_at };
  }

  async delete(id: string): Promise<void> {
    await this.col.deleteOne({ _id: new ObjectId(id) });
  }
}

// ── Thread ───────────────────────────────────────────────────────────────────

interface ThreadDoc {
  _id: ObjectId;
  project_id: string;
  title: string;
  participant_ids: string[];
  last_message_at?: Date;
  created_at: Date;
  updated_at: Date;
}

function threadToDoc(t: Thread): ThreadDoc {
  return {
    _id: new ObjectId(t.id),
    project_id: t.projectId,
    title: t.title,
    participant_ids: t.participantIds,
    last_message_at: t.lastMessageAt,
    created_at: t.createdAt,
    updated_at: t.updatedAt,
  };
}

function threadFromDoc(d: ThreadDoc): Thread {
  return {
    id: d._id.toHexString(),
    projectId: d.project_id,
    title: d.title,
    participantIds: d.participant_ids,
    lastMessageAt: d.last_message_at,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

export class MongoThreadRepository implements ThreadRepository {
  private readonly col: Collection<ThreadDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<ThreadDoc>("threads");
  }

  async findById(id: string): Promise<Thread | null> {
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? threadFromDoc(doc) : null;
  }

  async findAll(): Promise<Thread[]> {
    const docs = await this.col
      .find({})
      .sort({ last_message_at: -1, created_at: -1 })
      .toArray();
    return docs.map(threadFromDoc);
  }

  async findByProjectId(projectId: string): Promise<Thread[]> {
    const docs = await this.col
      .find({ project_id: projectId })
      .sort({ last_message_at: -1, created_at: -1 })
      .toArray();
    return docs.map(threadFromDoc);
  }

  async findByParticipantId(participantId: string): Promise<Thread[]> {
    const docs = await this.col
      .find({ participant_ids: participantId })
      .sort({ last_message_at: -1, created_at: -1 })
      .toArray();
    return docs.map(threadFromDoc);
  }

  async create(thread: Thread): Promise<Thread> {
    await this.col.insertOne(threadToDoc(thread));
    return thread;
  }

  async update(thread: Thread): Promise<Thread> {
    const doc = threadToDoc({ ...thread, updatedAt: new Date() });
    await this.col.replaceOne({ _id: doc._id }, doc);
    return { ...thread, updatedAt: doc.updated_at };
  }

  async delete(id: string): Promise<void> {
    await this.col.deleteOne({ _id: new ObjectId(id) });
  }
}
