import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { ChangelogEntry } from "../../../domain/entity/changelog.js";
import type { MongoDBClient } from "./client.js";

interface ChangelogEntryDoc {
  _id: ObjectId;
  version: string;
  title: string;
  body: string;
  category: string;
  published: boolean;
  published_at?: Date;
  created_at: Date;
  updated_at: Date;
}

function toDoc(e: ChangelogEntry): ChangelogEntryDoc {
  return {
    _id: new ObjectId(e.id),
    version: e.version,
    title: e.title,
    body: e.body,
    category: e.category,
    published: e.published,
    published_at: e.publishedAt,
    created_at: e.createdAt,
    updated_at: e.updatedAt,
  };
}

function fromDoc(d: ChangelogEntryDoc): ChangelogEntry {
  return {
    id: d._id.toHexString(),
    version: d.version,
    title: d.title,
    body: d.body,
    category: d.category as ChangelogEntry["category"],
    published: d.published,
    publishedAt: d.published_at,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

export class MongoChangelogRepository {
  private readonly col: Collection<ChangelogEntryDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<ChangelogEntryDoc>("changelog_entries");
  }

  async findAll(filter?: { published?: boolean }): Promise<ChangelogEntry[]> {
    const query: Record<string, any> = {};
    if (filter?.published !== undefined) query.published = filter.published;
    const docs = await this.col
      .find(query)
      .sort({ published_at: -1, created_at: -1 })
      .toArray();
    return docs.map(fromDoc);
  }

  async findById(id: string): Promise<ChangelogEntry | null> {
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? fromDoc(doc) : null;
  }

  async create(entry: ChangelogEntry): Promise<ChangelogEntry> {
    await this.col.insertOne(toDoc(entry));
    return entry;
  }

  async update(entry: ChangelogEntry): Promise<ChangelogEntry> {
    await this.col.updateOne({ _id: new ObjectId(entry.id) }, { $set: toDoc(entry) });
    return entry;
  }

  async delete(id: string): Promise<void> {
    await this.col.deleteOne({ _id: new ObjectId(id) });
  }
}
