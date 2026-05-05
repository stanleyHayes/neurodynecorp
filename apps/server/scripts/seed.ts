/**
 * Standalone seed script. Run manually to populate the database:
 *
 *   pnpm seed          — seed (skips existing data)
 *   pnpm seed:fresh    — drop all collections then seed
 */

import { loadConfig } from "../src/config/index.js";
import { createLogger } from "../src/logger/index.js";
import { MongoDBClient } from "../src/adapter/driven/mongodb/client.js";
import { MongoUserRepository } from "../src/adapter/driven/mongodb/user-repository.js";
import { MongoProjectRepository } from "../src/adapter/driven/mongodb/project-repository.js";
import { MongoSpecificationRepository } from "../src/adapter/driven/mongodb/spec-repository.js";
import {
  MongoQuestionRepository,
  MongoQuestionnaireResponseRepository,
} from "../src/adapter/driven/mongodb/questionnaire-repository.js";
import { MongoInvoiceRepository } from "../src/adapter/driven/mongodb/invoice-repository.js";
import {
  MongoTaskRepository,
  MongoSprintRepository,
} from "../src/adapter/driven/mongodb/task-repository.js";
import { MongoNotificationRepository } from "../src/adapter/driven/mongodb/notification-repository.js";
import {
  MongoThreadRepository,
  MongoMessageRepository,
} from "../src/adapter/driven/mongodb/message-repository.js";
import { MongoRoleRepository } from "../src/adapter/driven/mongodb/role-repository.js";
import {
  MongoBlogPostRepository,
  MongoTestimonialRepository,
  MongoServiceRepository,
  MongoCaseStudyRepository,
  MongoContactSubmissionRepository,
} from "../src/adapter/driven/mongodb/content-repository.js";
import { seedAll } from "../src/adapter/driven/mongodb/seed.js";

const fresh = process.argv.includes("--fresh");

async function main() {
  const config = loadConfig();
  const logger = createLogger(config.server.environment);

  const mongoClient = new MongoDBClient({
    uri: config.mongodb.uri,
    database: config.mongodb.database,
  });
  await mongoClient.connect();
  logger.info("Connected to MongoDB");

  if (fresh) {
    logger.info("Dropping all collections (--fresh)...");
    const db = (mongoClient as any).db ?? (mongoClient as any).client?.db?.((mongoClient as any).dbName);

    // Access the underlying Db via the collection helper
    const col = mongoClient.collection("_seed_check");
    const dbInstance = (col as any).dbName
      ? (col as any).s?.db
      : undefined;

    // Fallback: use the MongoClient directly
    const { MongoClient } = await import("mongodb");
    const rawClient = new MongoClient(config.mongodb.uri);
    await rawClient.connect();
    const rawDb = rawClient.db(config.mongodb.database);
    const collections = await rawDb.listCollections().toArray();
    for (const c of collections) {
      await rawDb.collection(c.name).drop();
      console.log(`  Dropped: ${c.name}`);
    }
    await rawClient.close();
  }

  logger.info("Seeding database...");
  await seedAll({
    questions: new MongoQuestionRepository(mongoClient),
    users: new MongoUserRepository(mongoClient),
    projects: new MongoProjectRepository(mongoClient),
    specs: new MongoSpecificationRepository(mongoClient),
    tasks: new MongoTaskRepository(mongoClient),
    sprints: new MongoSprintRepository(mongoClient),
    invoices: new MongoInvoiceRepository(mongoClient),
    notifications: new MongoNotificationRepository(mongoClient),
    threads: new MongoThreadRepository(mongoClient),
    messages: new MongoMessageRepository(mongoClient),
    responses: new MongoQuestionnaireResponseRepository(mongoClient),
    roles: new MongoRoleRepository(mongoClient),
    blogPosts: new MongoBlogPostRepository(mongoClient),
    testimonials: new MongoTestimonialRepository(mongoClient),
    services: new MongoServiceRepository(mongoClient),
    caseStudies: new MongoCaseStudyRepository(mongoClient),
    contactSubmissions: new MongoContactSubmissionRepository(mongoClient),
  });

  logger.info("Seed complete");
  await mongoClient.close();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
