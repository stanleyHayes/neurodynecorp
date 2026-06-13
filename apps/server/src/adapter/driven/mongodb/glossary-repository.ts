import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { GlossaryTerm } from "../../../domain/entity/glossary.js";
import type { MongoDBClient } from "./client.js";

interface GlossaryDoc {
  _id: ObjectId;
  term: string;
  slug: string;
  definition: string;
  category?: string;
  aliases: string[];
  status: string;
  order: number;
  created_at: Date;
  updated_at: Date;
}

function toDoc(t: GlossaryTerm): GlossaryDoc {
  return {
    _id: new ObjectId(t.id),
    term: t.term,
    slug: t.slug,
    definition: t.definition,
    category: t.category,
    aliases: t.aliases,
    status: t.status,
    order: t.order,
    created_at: t.createdAt,
    updated_at: t.updatedAt,
  };
}

function fromDoc(d: GlossaryDoc): GlossaryTerm {
  return {
    id: d._id.toHexString(),
    term: d.term,
    slug: d.slug,
    definition: d.definition,
    category: d.category,
    aliases: d.aliases ?? [],
    status: d.status as GlossaryTerm["status"],
    order: d.order,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

export class MongoGlossaryRepository {
  private readonly col: Collection<GlossaryDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<GlossaryDoc>("glossary_terms");
  }

  async findAll(filter?: { status?: string; category?: string; q?: string }): Promise<GlossaryTerm[]> {
    const query: Record<string, any> = {};
    if (filter?.status) query["status"] = filter.status;
    if (filter?.category) query["category"] = filter.category;
    if (filter?.q) {
      // q comes from an untrusted (public) query param. Escape regex metacharacters and cap the length
      // so it can only be a literal substring match — a raw $regex would allow regex-injection and
      // catastrophic-backtracking ReDoS against this public endpoint.
      const safe = filter.q.slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = { $regex: safe, $options: "i" };
      query["$or"] = [{ term: rx }, { definition: rx }, { aliases: rx }];
    }
    const docs = await this.col.find(query).sort({ term: 1 }).toArray();
    return docs.map(fromDoc);
  }

  async findById(id: string): Promise<GlossaryTerm | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? fromDoc(doc) : null;
  }

  async findBySlug(slug: string): Promise<GlossaryTerm | null> {
    const doc = await this.col.findOne({ slug });
    return doc ? fromDoc(doc) : null;
  }

  async create(term: GlossaryTerm): Promise<GlossaryTerm> {
    await this.col.insertOne(toDoc(term));
    return term;
  }

  async update(term: GlossaryTerm): Promise<GlossaryTerm> {
    const updated = { ...term, updatedAt: new Date() };
    await this.col.replaceOne({ _id: new ObjectId(term.id) }, toDoc(updated));
    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!ObjectId.isValid(id)) return;
    await this.col.deleteOne({ _id: new ObjectId(id) });
  }

  async distinctCategories(): Promise<string[]> {
    const cats = await this.col.distinct("category", { status: "published" });
    return cats.filter((c): c is string => typeof c === "string" && c.length > 0);
  }
}
