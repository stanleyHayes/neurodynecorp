/**
 * Standalone seed script.
 * Run with: pnpm --filter @neurodyne/server seed
 */
import "dotenv/config";
import { loadConfig } from "./config/index.js";
import { MongoDBClient } from "./adapter/driven/mongodb/client.js";
import { MongoUserRepository } from "./adapter/driven/mongodb/user-repository.js";
import { MongoProjectRepository } from "./adapter/driven/mongodb/project-repository.js";
import { MongoSpecificationRepository } from "./adapter/driven/mongodb/spec-repository.js";
import { MongoTaskRepository, MongoSprintRepository } from "./adapter/driven/mongodb/task-repository.js";
import { MongoInvoiceRepository } from "./adapter/driven/mongodb/invoice-repository.js";
import { MongoNotificationRepository } from "./adapter/driven/mongodb/notification-repository.js";
import { MongoThreadRepository, MongoMessageRepository } from "./adapter/driven/mongodb/message-repository.js";
import { MongoQuestionRepository, MongoQuestionnaireResponseRepository } from "./adapter/driven/mongodb/questionnaire-repository.js";
import { MongoRoleRepository } from "./adapter/driven/mongodb/role-repository.js";
import {
  MongoBlogPostRepository,
  MongoTestimonialRepository,
  MongoServiceRepository,
  MongoCaseStudyRepository,
  MongoContactSubmissionRepository,
} from "./adapter/driven/mongodb/content-repository.js";
import { seedAll } from "./adapter/driven/mongodb/seed.js";

async function main() {
  const config = loadConfig();

  console.log("Connecting to MongoDB...");
  console.log(`  URI: ${config.mongodb.uri.replace(/:([^@]+)@/, ":****@")}`);
  console.log(`  Database: ${config.mongodb.database}`);

  const mongoClient = new MongoDBClient({
    uri: config.mongodb.uri,
    database: config.mongodb.database,
  });
  await mongoClient.connect();
  console.log("Connected.\n");

  console.log("Seeding database...");
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

  console.log("\nSeeding complete.");
  await mongoClient.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
