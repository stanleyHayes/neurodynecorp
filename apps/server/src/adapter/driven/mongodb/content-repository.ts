import { ObjectId } from "mongodb";
import type { Collection, Filter } from "mongodb";
import type {
  BlogPost,
  Testimonial,
  ServiceItem,
  CaseStudy,
  ContactSubmission,
} from "../../../domain/entity/content.js";
import type { MongoDBClient } from "./client.js";

// ── Generic CRUD helper ────────────────────────────────────────────────────

function genericRepo<T extends { id: string; createdAt: Date; updatedAt: Date }>(
  client: MongoDBClient,
  collectionName: string,
) {
  const col = client.collection(collectionName);

  function toDoc(item: T): any {
    const { id, ...rest } = item as any;
    return { _id: new ObjectId(id), ...rest };
  }

  function fromDoc(doc: any): T {
    const { _id, ...rest } = doc;
    return { id: _id.toHexString(), ...rest } as T;
  }

  return {
    async findById(id: string): Promise<T | null> {
      const doc = await col.findOne({ _id: new ObjectId(id) });
      return doc ? fromDoc(doc) : null;
    },

    async findAll(filter?: Record<string, any>): Promise<T[]> {
      const query: any = {};
      if (filter) {
        for (const [k, v] of Object.entries(filter)) {
          if (v !== undefined) query[k] = v;
        }
      }
      const docs = await col.find(query).sort({ created_at: -1 }).toArray();
      return docs.map(fromDoc);
    },

    async create(item: T): Promise<T> {
      await col.insertOne(toDoc(item));
      return item;
    },

    async update(item: T): Promise<T> {
      const updated = { ...item, updatedAt: new Date() };
      await col.replaceOne({ _id: new ObjectId(item.id) }, toDoc(updated));
      return updated;
    },

    async delete(id: string): Promise<void> {
      await col.deleteOne({ _id: new ObjectId(id) });
    },

    col,
    fromDoc,
  };
}

// ── Blog Post Repository ──────────────────────────────────────────────────

export class MongoBlogPostRepository {
  private repo;

  constructor(client: MongoDBClient) {
    this.repo = genericRepo<BlogPost>(client, "blog_posts");
  }

  findById(id: string) { return this.repo.findById(id); }
  findAll(filter?: { status?: string; category?: string }) { return this.repo.findAll(filter); }
  create(item: BlogPost) { return this.repo.create(item); }
  update(item: BlogPost) { return this.repo.update(item); }
  delete(id: string) { return this.repo.delete(id); }

  async findBySlug(slug: string): Promise<BlogPost | null> {
    const doc = await this.repo.col.findOne({ slug });
    return doc ? this.repo.fromDoc(doc) : null;
  }
}

// ── Testimonial Repository ────────────────────────────────────────────────

export class MongoTestimonialRepository {
  private repo;

  constructor(client: MongoDBClient) {
    this.repo = genericRepo<Testimonial>(client, "testimonials");
  }

  findById(id: string) { return this.repo.findById(id); }
  findAll(filter?: { status?: string }) { return this.repo.findAll(filter); }
  create(item: Testimonial) { return this.repo.create(item); }
  update(item: Testimonial) { return this.repo.update(item); }
  delete(id: string) { return this.repo.delete(id); }
}

// ── Service Repository ────────────────────────────────────────────────────

export class MongoServiceRepository {
  private repo;

  constructor(client: MongoDBClient) {
    this.repo = genericRepo<ServiceItem>(client, "services");
  }

  findById(id: string) { return this.repo.findById(id); }
  findAll(filter?: { status?: string }) { return this.repo.findAll(filter); }
  create(item: ServiceItem) { return this.repo.create(item); }
  update(item: ServiceItem) { return this.repo.update(item); }
  delete(id: string) { return this.repo.delete(id); }
}

// ── Case Study Repository ─────────────────────────────────────────────────

export class MongoCaseStudyRepository {
  private repo;

  constructor(client: MongoDBClient) {
    this.repo = genericRepo<CaseStudy>(client, "case_studies");
  }

  findById(id: string) { return this.repo.findById(id); }
  findAll(filter?: { status?: string; category?: string }) { return this.repo.findAll(filter); }
  create(item: CaseStudy) { return this.repo.create(item); }
  update(item: CaseStudy) { return this.repo.update(item); }
  delete(id: string) { return this.repo.delete(id); }
}

// ── Contact Submission Repository ─────────────────────────────────────────

export class MongoContactSubmissionRepository {
  private repo;

  constructor(client: MongoDBClient) {
    this.repo = genericRepo<ContactSubmission>(client, "contact_submissions");
  }

  findById(id: string) { return this.repo.findById(id); }
  findAll(filter?: { status?: string }) { return this.repo.findAll(filter); }
  create(item: ContactSubmission) { return this.repo.create(item); }
  update(item: ContactSubmission) { return this.repo.update(item); }
  delete(id: string) { return this.repo.delete(id); }
}
