import { MongoClient, Db, Collection, Document } from "mongodb";

export interface MongoClientConfig {
  uri: string;
  database: string;
}

export class MongoDBClient {
  private client: MongoClient;
  private db: Db | null = null;
  private readonly dbName: string;

  constructor(config: MongoClientConfig) {
    this.client = new MongoClient(config.uri, {
      maxPoolSize: 100,
      minPoolSize: 10,
      maxIdleTimeMS: 30_000,
    });
    this.dbName = config.database;
  }

  async connect(): Promise<void> {
    await this.client.connect();
    this.db = this.client.db(this.dbName);
    await this.ensureIndexes();
  }

  async close(): Promise<void> {
    await this.client.close();
    this.db = null;
  }

  collection<T extends Document = Document>(name: string): Collection<T> {
    if (!this.db) {
      throw new Error("MongoDB client is not connected. Call connect() first.");
    }
    return this.db.collection<T>(name);
  }

  async ensureIndexes(): Promise<void> {
    if (!this.db) {
      throw new Error("MongoDB client is not connected. Call connect() first.");
    }

    // Users - unique email
    await this.db.collection("users").createIndex(
      { email: 1 },
      { unique: true },
    );

    // Projects - client_id, status, created_at
    await this.db.collection("projects").createIndexes([
      { key: { client_id: 1 } },
      { key: { status: 1 } },
      { key: { created_at: -1 } },
    ]);

    // Specifications - project_id
    await this.db.collection("specifications").createIndex(
      { project_id: 1 },
    );

    // Notifications - user_id + created_at, user_id + read
    await this.db.collection("notifications").createIndexes([
      { key: { user_id: 1, created_at: -1 } },
      { key: { user_id: 1, read: 1 } },
    ]);

    // Messages - project_id + created_at, thread_id + created_at
    await this.db.collection("messages").createIndexes([
      { key: { project_id: 1, created_at: -1 } },
      { key: { thread_id: 1, created_at: -1 } },
    ]);

    // Roles - unique name
    await this.db.collection("roles").createIndex(
      { name: 1 },
      { unique: true },
    );

    // Blog posts - unique slug
    await this.db.collection("blog_posts").createIndex(
      { slug: 1 },
      { unique: true },
    );

    // Tasks - project_id + status, sprint_id, assignee_id
    await this.db.collection("tasks").createIndexes([
      { key: { project_id: 1, status: 1 } },
      { key: { sprint_id: 1 } },
      { key: { assignee_id: 1 } },
    ]);
  }
}
