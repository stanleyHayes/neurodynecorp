import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { KbArticle } from "../../../domain/entity/kb.js";
import type { MongoDBClient } from "./client.js";

interface KbArticleDoc {
  _id: ObjectId;
  title: string;
  slug: string;
  category: string;
  summary: string;
  body: string;
  tags: string[];
  status: string;
  helpful_yes: number;
  helpful_no: number;
  order: number;
  created_at: Date;
  updated_at: Date;
}

function toDoc(a: KbArticle): KbArticleDoc {
  return {
    _id: new ObjectId(a.id),
    title: a.title,
    slug: a.slug,
    category: a.category,
    summary: a.summary,
    body: a.body,
    tags: a.tags,
    status: a.status,
    helpful_yes: a.helpfulYes,
    helpful_no: a.helpfulNo,
    order: a.order,
    created_at: a.createdAt,
    updated_at: a.updatedAt,
  };
}

function fromDoc(d: KbArticleDoc): KbArticle {
  return {
    id: d._id.toHexString(),
    title: d.title,
    slug: d.slug,
    category: d.category,
    summary: d.summary,
    body: d.body,
    tags: d.tags,
    status: d.status as KbArticle["status"],
    helpfulYes: d.helpful_yes,
    helpfulNo: d.helpful_no,
    order: d.order,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

export class MongoKbRepository {
  private readonly col: Collection<KbArticleDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<KbArticleDoc>("kb_articles");
  }

  async findAll(filter?: { status?: string; category?: string; q?: string }): Promise<KbArticle[]> {
    const query: Record<string, any> = {};
    if (filter?.status) query["status"] = filter.status;
    if (filter?.category) query["category"] = filter.category;
    if (filter?.q) {
      // q is an untrusted (public) query param — escape regex metacharacters and cap length so it can
      // only be a literal substring match (prevents regex-injection / catastrophic-backtracking ReDoS).
      const safe = filter.q.slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = { $regex: safe, $options: "i" };
      query["$or"] = [{ title: rx }, { summary: rx }, { body: rx }];
    }
    const docs = await this.col
      .find(query)
      .sort({ order: 1, created_at: -1 })
      .toArray();
    return docs.map(fromDoc);
  }

  async findById(id: string): Promise<KbArticle | null> {
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? fromDoc(doc) : null;
  }

  async findBySlug(slug: string): Promise<KbArticle | null> {
    const doc = await this.col.findOne({ slug });
    return doc ? fromDoc(doc) : null;
  }

  async create(article: KbArticle): Promise<KbArticle> {
    await this.col.insertOne(toDoc(article));
    return article;
  }

  async update(article: KbArticle): Promise<KbArticle> {
    const doc = toDoc(article);
    doc.updated_at = new Date();
    await this.col.updateOne({ _id: new ObjectId(article.id) }, { $set: doc });
    return fromDoc(doc);
  }

  async delete(id: string): Promise<void> {
    await this.col.deleteOne({ _id: new ObjectId(id) });
  }

  async incrementHelpful(id: string, yes: boolean): Promise<void> {
    await this.col.updateOne(
      { _id: new ObjectId(id) },
      { $inc: yes ? { helpful_yes: 1 } : { helpful_no: 1 } },
    );
  }

  async distinctCategories(): Promise<string[]> {
    return this.col.distinct("category", { status: "published" });
  }
}
