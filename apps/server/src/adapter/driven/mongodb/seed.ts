import type { Question } from "../../../domain/entity/index.js";
import type { MongoQuestionRepository, MongoQuestionnaireResponseRepository } from "./questionnaire-repository.js";
import type { MongoUserRepository } from "./user-repository.js";
import type { MongoProjectRepository } from "./project-repository.js";
import type { MongoSpecificationRepository } from "./spec-repository.js";
import type { MongoTaskRepository, MongoSprintRepository } from "./task-repository.js";
import type { MongoInvoiceRepository } from "./invoice-repository.js";
import type { MongoNotificationRepository } from "./notification-repository.js";
import type { MongoThreadRepository, MongoMessageRepository } from "./message-repository.js";
import type { MongoRoleRepository } from "./role-repository.js";
import type {
  MongoBlogPostRepository,
  MongoTestimonialRepository,
  MongoServiceRepository,
  MongoCaseStudyRepository,
  MongoContactSubmissionRepository,
} from "./content-repository.js";
import {
  users,
  projects,
  specifications,
  sprints,
  tasks,
  invoices,
  notifications,
  threads,
  messages,
  questionnaireResponses,
  roles,
} from "./seed-data.js";
import {
  blogPosts,
  testimonials,
  serviceItems,
  caseStudies,
  contactSubmissions,
} from "./seed-content.js";
import { portfolioProjects } from "./seed-portfolio.js";

// ── Repository map passed to the main seed function ─────────────────────────

export interface SeedRepositories {
  questions: MongoQuestionRepository;
  users: MongoUserRepository;
  projects: MongoProjectRepository;
  specs: MongoSpecificationRepository;
  tasks: MongoTaskRepository;
  sprints: MongoSprintRepository;
  invoices: MongoInvoiceRepository;
  notifications: MongoNotificationRepository;
  threads: MongoThreadRepository;
  messages: MongoMessageRepository;
  responses: MongoQuestionnaireResponseRepository;
  roles: MongoRoleRepository;
  blogPosts: MongoBlogPostRepository;
  testimonials: MongoTestimonialRepository;
  services: MongoServiceRepository;
  caseStudies: MongoCaseStudyRepository;
  contactSubmissions: MongoContactSubmissionRepository;
}

/**
 * Seeds all collections with initial data.
 * Idempotent – skips collections that already contain documents.
 */
export async function seedAll(repos: SeedRepositories): Promise<void> {
  await seedQuestions(repos.questions);
  // System roles: insert or refresh permissions so seed permission changes apply
  // to existing databases (e.g. clients gaining specifications:update).
  await seedSystemRoles(repos.roles, roles);
  await seedUsersWithPermissionRefresh(repos.users, users);
  await seedCollection("projects", repos.projects, projects);
  await seedCollection("portfolio_projects", repos.projects, portfolioProjects);
  await seedCollection("specifications", repos.specs, specifications);
  await seedCollection("sprints", repos.sprints, sprints);
  await seedCollection("tasks", repos.tasks, tasks);
  await seedCollection("invoices", repos.invoices, invoices);
  await seedCollection("notifications", repos.notifications, notifications);
  await seedCollection("threads", repos.threads, threads);
  await seedCollection("messages", repos.messages, messages);
  await seedCollection("questionnaire_responses", repos.responses, questionnaireResponses);
  await seedCollection("blog_posts", repos.blogPosts, blogPosts);
  await seedCollection("testimonials", repos.testimonials, testimonials);
  await seedCollection("services", repos.services, serviceItems);
  await seedCollection("case_studies", repos.caseStudies, caseStudies);
  await seedCollection("contact_submissions", repos.contactSubmissions, contactSubmissions);
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Generic helper: inserts all items, skipping duplicates.
 */
async function seedCollection<T>(
  name: string,
  repo: { create(item: T): Promise<T> },
  items: T[],
): Promise<void> {
  if (items.length === 0) return;

  let inserted = 0;
  for (const item of items) {
    try {
      await repo.create(item);
      inserted++;
    } catch (err: any) {
      // Skip duplicate key errors (E11000)
      if (err?.code === 11000) continue;
      console.error(`  ✗ Failed to seed ${name}:`, err.message);
      throw err;
    }
  }

  if (inserted > 0) {
    console.log(`  ✓ Seeded ${inserted} ${name}`);
  }
}

async function seedSystemRoles(
  repo: MongoRoleRepository,
  items: typeof roles,
): Promise<void> {
  let inserted = 0;
  let refreshed = 0;
  for (const role of items) {
    try {
      await repo.create(role);
      inserted++;
    } catch (err: any) {
      if (err?.code !== 11000) {
        console.error(`  ✗ Failed to seed roles:`, err.message);
        throw err;
      }
      if (role.isSystem) {
        await repo.update({ ...role, updatedAt: new Date() });
        refreshed++;
      }
    }
  }
  if (inserted > 0) console.log(`  ✓ Seeded ${inserted} roles`);
  if (refreshed > 0) console.log(`  ✓ Refreshed permissions on ${refreshed} system roles`);
}

async function seedUsersWithPermissionRefresh(
  repo: MongoUserRepository,
  items: typeof users,
): Promise<void> {
  let inserted = 0;
  let refreshed = 0;
  for (const user of items) {
    try {
      await repo.create(user);
      inserted++;
    } catch (err: any) {
      if (err?.code !== 11000) {
        console.error(`  ✗ Failed to seed users:`, err.message);
        throw err;
      }
      // Keep seeded demo accounts aligned with current role permission sets.
      const existing = await repo.findById(user.id);
      if (existing) {
        await repo.update({
          ...existing,
          permissions: [...user.permissions],
          role: user.role,
          roleId: user.roleId,
          updatedAt: new Date(),
        });
        refreshed++;
      }
    }
  }
  if (inserted > 0) console.log(`  ✓ Seeded ${inserted} users`);
  if (refreshed > 0) console.log(`  ✓ Refreshed permissions on ${refreshed} seeded users`);
}

/**
 * Seeds the adaptive questionnaire question tree into the database.
 * Mirrors the Go seed.go implementation with the full set of conditional questions.
 */
export async function seedQuestions(
  repo: MongoQuestionRepository,
): Promise<void> {
  const existing = await repo.findAll();
  if (existing.length > 0) {
    return; // already seeded
  }

  const questions: Question[] = [
    // ── General questions (always shown) ──────────────────────────────────
    {
      id: "q1",
      text: "What are you building?",
      type: "multi_select",
      options: ["Web App", "Mobile App", "AI System", "Blockchain Platform"],
      required: true,
      order: 1,
      section: "general",
      helpText: "Select the primary type of your project",
    },
    {
      id: "q2",
      text: "Give us a brief description of your project",
      type: "textarea",
      required: true,
      order: 2,
      section: "general",
      helpText: "Describe your idea in a few sentences",
    },
    {
      id: "q3",
      text: "Who are the main user roles in your system?",
      type: "textarea",
      required: true,
      order: 3,
      section: "general",
      helpText: "e.g., Admin, Customer, Vendor, Manager",
    },
    {
      id: "q4",
      text: "What third-party integrations do you need?",
      type: "textarea",
      required: false,
      order: 4,
      section: "general",
      helpText: "e.g., Stripe, Google Maps, Twilio, Salesforce",
    },
    {
      id: "q5",
      text: "Do you have any design preferences or references?",
      type: "textarea",
      required: false,
      order: 5,
      section: "general",
      helpText: "Links to designs you like, brand guidelines, etc.",
    },
    {
      id: "q6",
      text: "Do you have any existing documents or wireframes?",
      type: "checkbox",
      required: false,
      order: 6,
      section: "general",
    },

    // ── Mobile-specific questions ─────────────────────────────────────────
    {
      id: "q_mobile_platform",
      text: "Which platforms do you need?",
      type: "select",
      options: ["iOS", "Android", "Both"],
      required: true,
      order: 10,
      section: "mobile",
      dependsOn: { questionId: "q1", expectedValue: "Mobile App" },
      helpText: "Select all target platforms",
    },
    {
      id: "q_mobile_auth",
      text: "Is authentication required?",
      type: "checkbox",
      required: true,
      order: 11,
      section: "mobile",
      dependsOn: { questionId: "q1", expectedValue: "Mobile App" },
    },
    {
      id: "q_mobile_push",
      text: "Do you need push notifications?",
      type: "checkbox",
      required: true,
      order: 12,
      section: "mobile",
      dependsOn: { questionId: "q1", expectedValue: "Mobile App" },
    },
    {
      id: "q_mobile_offline",
      text: "Do you need offline capability?",
      type: "checkbox",
      required: true,
      order: 13,
      section: "mobile",
      dependsOn: { questionId: "q1", expectedValue: "Mobile App" },
    },

    // ── AI-specific questions ─────────────────────────────────────────────
    {
      id: "q_ai_type",
      text: "What type of AI system?",
      type: "select",
      options: ["Prediction", "NLP", "Computer Vision"],
      required: true,
      order: 10,
      section: "ai",
      dependsOn: { questionId: "q1", expectedValue: "AI System" },
      helpText: "Select the primary AI capability",
    },
    {
      id: "q_ai_dataset",
      text: "Do you have a dataset available?",
      type: "checkbox",
      required: true,
      order: 11,
      section: "ai",
      dependsOn: { questionId: "q1", expectedValue: "AI System" },
    },
    {
      id: "q_ai_training",
      text: "Is custom model training required?",
      type: "checkbox",
      required: true,
      order: 12,
      section: "ai",
      dependsOn: { questionId: "q1", expectedValue: "AI System" },
    },

    // ── Web App-specific questions ────────────────────────────────────────
    {
      id: "q_web_auth",
      text: "What authentication method do you prefer?",
      type: "select",
      options: [
        "Email/Password",
        "Social Login (Google, GitHub)",
        "SSO/SAML",
        "Multi-factor",
      ],
      required: true,
      order: 10,
      section: "web",
      dependsOn: { questionId: "q1", expectedValue: "Web App" },
    },
    {
      id: "q_web_realtime",
      text: "Do you need real-time features (chat, notifications, live updates)?",
      type: "checkbox",
      required: true,
      order: 11,
      section: "web",
      dependsOn: { questionId: "q1", expectedValue: "Web App" },
    },

    // ── Blockchain-specific questions ─────────────────────────────────────
    {
      id: "q_blockchain_chain",
      text: "Which blockchain network?",
      type: "select",
      options: ["Ethereum", "Solana", "Polygon", "Other"],
      required: true,
      order: 10,
      section: "blockchain",
      dependsOn: { questionId: "q1", expectedValue: "Blockchain Platform" },
    },
    {
      id: "q_blockchain_smart",
      text: "Do you need smart contracts?",
      type: "checkbox",
      required: true,
      order: 11,
      section: "blockchain",
      dependsOn: { questionId: "q1", expectedValue: "Blockchain Platform" },
    },
    {
      id: "q_blockchain_token",
      text: "Is tokenomics/token creation needed?",
      type: "checkbox",
      required: false,
      order: 12,
      section: "blockchain",
      dependsOn: { questionId: "q1", expectedValue: "Blockchain Platform" },
    },

    // ── Budget and timeline (always shown, at the end) ────────────────────
    {
      id: "q_budget",
      text: "What is your budget range?",
      type: "select",
      options: [
        "$10,000 - $25,000",
        "$25,000 - $50,000",
        "$50,000 - $100,000",
        "$100,000 - $250,000",
        "$250,000+",
      ],
      required: true,
      order: 90,
      section: "budget",
    },
    {
      id: "q_timeline",
      text: "What is your preferred timeline?",
      type: "select",
      options: [
        "1-2 months",
        "2-4 months",
        "4-6 months",
        "6-12 months",
        "12+ months",
      ],
      required: true,
      order: 91,
      section: "budget",
    },
    {
      id: "q_urgency",
      text: "How urgent is this project?",
      type: "select",
      options: [
        "Not urgent - flexible timeline",
        "Moderate - within the quarter",
        "Urgent - ASAP",
        "Critical - has a hard deadline",
      ],
      required: true,
      order: 92,
      section: "budget",
    },
  ];

  for (const question of questions) {
    await repo.upsert(question);
  }

  console.log("  ✓ Seeded questionnaire questions");
}
