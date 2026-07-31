import { createServer } from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import { loadConfig } from "./config/index.js";
import { createLogger } from "./logger/index.js";
import { metricsMiddleware, metricsEndpoint } from "./middleware/metrics.js";
import { errorHandler } from "./middleware/error-handler.js";

import { createAuthRoutes } from "./adapter/driving/http/auth-routes.js";
import { createProjectRoutes } from "./adapter/driving/http/project-routes.js";
import { createSpecRoutes } from "./adapter/driving/http/spec-routes.js";
import { createQuestionnaireRoutes } from "./adapter/driving/http/questionnaire-routes.js";
import { createNotificationRoutes } from "./adapter/driving/http/notification-routes.js";
import { createMessageRoutes } from "./adapter/driving/http/message-routes.js";
import { createTaskRoutes } from "./adapter/driving/http/task-routes.js";
import { createInvoiceRoutes } from "./adapter/driving/http/invoice-routes.js";
import { createUserRoutes } from "./adapter/driving/http/user-routes.js";
import { createRoleRoutes } from "./adapter/driving/http/role-routes.js";
import { createFileRoutes } from "./adapter/driving/http/file-routes.js";
import { createContactRoutes } from "./adapter/driving/http/contact-routes.js";
import {
  createBlogRoutes,
  createTestimonialRoutes,
  createServiceItemRoutes,
  createCaseStudyRoutes,
  createContactSubmissionRoutes,
} from "./adapter/driving/http/content-routes.js";
import { WebSocketHub } from "./adapter/driving/websocket/hub.js";
import { SocketIOHub } from "./adapter/driving/websocket/socket-io-hub.js";

// Driven adapters
import { MongoDBClient } from "./adapter/driven/mongodb/client.js";
import { MongoUserRepository } from "./adapter/driven/mongodb/user-repository.js";
import { MongoProjectRepository } from "./adapter/driven/mongodb/project-repository.js";
import { MongoSpecificationRepository } from "./adapter/driven/mongodb/spec-repository.js";
import { MongoQuestionRepository, MongoQuestionnaireResponseRepository } from "./adapter/driven/mongodb/questionnaire-repository.js";
import { MongoInvoiceRepository } from "./adapter/driven/mongodb/invoice-repository.js";
import { MongoTaskRepository, MongoSprintRepository } from "./adapter/driven/mongodb/task-repository.js";
import { MongoNotificationRepository } from "./adapter/driven/mongodb/notification-repository.js";
import { MongoThreadRepository, MongoMessageRepository } from "./adapter/driven/mongodb/message-repository.js";
import { MongoRoleRepository } from "./adapter/driven/mongodb/role-repository.js";
import {
  MongoBlogPostRepository,
  MongoTestimonialRepository,
  MongoServiceRepository,
  MongoCaseStudyRepository,
  MongoContactSubmissionRepository,
} from "./adapter/driven/mongodb/content-repository.js";

// ── Gap-audit modules (trust / ops / compliance / growth) ──
import { createAuditRoutes, createAuditRecorder } from "./adapter/driving/http/audit-routes.js";
import { createStatusRoutes } from "./adapter/driving/http/status-routes.js";
import { createFeatureFlagRoutes } from "./adapter/driving/http/feature-flag-routes.js";
import { createWebhookRoutes } from "./adapter/driving/http/webhook-routes.js";
import { createApiKeyRoutes } from "./adapter/driving/http/api-key-routes.js";
import { createDsrRoutes } from "./adapter/driving/http/dsr-routes.js";
import { createConsentRoutes } from "./adapter/driving/http/consent-routes.js";
import { createFeedbackRoutes } from "./adapter/driving/http/feedback-routes.js";
import { createDiagnosticRoutes } from "./adapter/driving/http/diagnostic-routes.js";
import { createRfpRoutes } from "./adapter/driving/http/rfp-routes.js";
import { createBookingRoutes } from "./adapter/driving/http/booking-routes.js";
import { createDecisionRoutes } from "./adapter/driving/http/decision-routes.js";
import { createRiskRoutes } from "./adapter/driving/http/risk-routes.js";
import { createSupportTicketRoutes } from "./adapter/driving/http/support-ticket-routes.js";
import { createApprovalRoutes } from "./adapter/driving/http/approval-routes.js";
import { createStakeholderRoutes } from "./adapter/driving/http/stakeholder-routes.js";
import { createLatticeRoutes } from "./adapter/driving/http/lattice-routes.js";
import { createReportRoutes } from "./adapter/driving/http/report-routes.js";
import { createEngagementMemberRoutes } from "./adapter/driving/http/engagement-member-routes.js";
import { createBudgetRoutes } from "./adapter/driving/http/budget-routes.js";
import { createKbRoutes } from "./adapter/driving/http/kb-routes.js";
import { createGlossaryRoutes } from "./adapter/driving/http/glossary-routes.js";
import { createNewsletterRoutes } from "./adapter/driving/http/newsletter-routes.js";
import { createChangelogRoutes } from "./adapter/driving/http/changelog-routes.js";
import { MongoAuditRepository } from "./adapter/driven/mongodb/audit-repository.js";
import { MongoStatusRepository } from "./adapter/driven/mongodb/status-repository.js";
import { MongoFeatureFlagRepository } from "./adapter/driven/mongodb/feature-flag-repository.js";
import { MongoWebhookRepository } from "./adapter/driven/mongodb/webhook-repository.js";
import { MongoApiKeyRepository } from "./adapter/driven/mongodb/api-key-repository.js";
import { MongoDsrRepository } from "./adapter/driven/mongodb/dsr-repository.js";
import { MongoConsentRepository } from "./adapter/driven/mongodb/consent-repository.js";
import { MongoFeedbackRepository } from "./adapter/driven/mongodb/feedback-repository.js";
import { MongoDiagnosticRepository } from "./adapter/driven/mongodb/diagnostic-repository.js";
import { MongoRfpRepository } from "./adapter/driven/mongodb/rfp-repository.js";
import { MongoBookingRepository } from "./adapter/driven/mongodb/booking-repository.js";
import { MongoDecisionRepository } from "./adapter/driven/mongodb/decision-repository.js";
import { MongoRiskRepository } from "./adapter/driven/mongodb/risk-repository.js";
import { MongoSupportTicketRepository } from "./adapter/driven/mongodb/support-ticket-repository.js";
import { MongoApprovalRepository } from "./adapter/driven/mongodb/approval-repository.js";
import { MongoStakeholderRepository } from "./adapter/driven/mongodb/stakeholder-repository.js";
import { MongoLatticeRepository } from "./adapter/driven/mongodb/lattice-repository.js";
import { MongoReportRepository } from "./adapter/driven/mongodb/report-repository.js";
import { MongoEngagementMemberRepository } from "./adapter/driven/mongodb/engagement-member-repository.js";
import { MongoBudgetRepository } from "./adapter/driven/mongodb/budget-repository.js";
import { createContactSubmission } from "./domain/entity/content.js";
import { MongoKbRepository } from "./adapter/driven/mongodb/kb-repository.js";
import { MongoGlossaryRepository } from "./adapter/driven/mongodb/glossary-repository.js";
import { MongoNewsletterRepository } from "./adapter/driven/mongodb/newsletter-repository.js";
import { MongoChangelogRepository } from "./adapter/driven/mongodb/changelog-repository.js";
import { rateLimit } from "./middleware/rate-limit.js";

import { JwtTokenService } from "./adapter/driven/auth/jwt.js";
import { BcryptPasswordHasher } from "./adapter/driven/auth/password.js";
import { ResendEmailService } from "./adapter/driven/email/resend.js";
import { RedisCacheService } from "./adapter/driven/redis/cache.js";
import { KafkaEventPublisher } from "./adapter/driven/kafka/publisher.js";
import { KafkaEventSubscriber } from "./adapter/driven/kafka/subscriber.js";
import { CloudinaryFileStorage } from "./adapter/driven/cloudinary/storage.js";

// App-layer services
import { AuthService } from "./app/auth-service.js";
import { ProjectService } from "./app/project-service.js";
import { SpecService } from "./app/spec-service.js";
import { QuestionnaireService } from "./app/questionnaire-service.js";
import { BillingService } from "./app/billing-service.js";
import { WorkflowEngine } from "./app/workflow-engine.js";

// ---- Bootstrap ----

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = createLogger(config.server.environment);

  logger.info({ env: config.server.environment }, "Starting NeuroDyne Corp server");

  // ── Infrastructure connections ──────────────────────────────────────────────

  // MongoDB
  const mongoClient = new MongoDBClient({
    uri: config.mongodb.uri,
    database: config.mongodb.database,
  });
  await mongoClient.connect();
  logger.info("Connected to MongoDB");

  // ── Driven adapters ─────────────────────────────────────────────────────────

  // Repositories (MongoDB)
  const userRepo = new MongoUserRepository(mongoClient);
  const projectRepo = new MongoProjectRepository(mongoClient);
  const specRepo = new MongoSpecificationRepository(mongoClient);
  const questionRepo = new MongoQuestionRepository(mongoClient);
  const responseRepo = new MongoQuestionnaireResponseRepository(mongoClient);
  const invoiceRepo = new MongoInvoiceRepository(mongoClient);
  const taskRepo = new MongoTaskRepository(mongoClient);
  const sprintRepo = new MongoSprintRepository(mongoClient);
  const notificationRepo = new MongoNotificationRepository(mongoClient);
  const threadRepo = new MongoThreadRepository(mongoClient);
  const messageRepo = new MongoMessageRepository(mongoClient);
  const roleRepo = new MongoRoleRepository(mongoClient);
  const blogPostRepo = new MongoBlogPostRepository(mongoClient);
  const testimonialRepo = new MongoTestimonialRepository(mongoClient);
  const serviceRepo = new MongoServiceRepository(mongoClient);
  const caseStudyRepo = new MongoCaseStudyRepository(mongoClient);
  const contactSubmissionRepo = new MongoContactSubmissionRepository(mongoClient);

  // Gap-audit module repositories
  const auditRepo = new MongoAuditRepository(mongoClient);
  const statusRepo = new MongoStatusRepository(mongoClient);
  const featureFlagRepo = new MongoFeatureFlagRepository(mongoClient);
  const webhookRepo = new MongoWebhookRepository(mongoClient);
  const apiKeyRepo = new MongoApiKeyRepository(mongoClient);
  const dsrRepo = new MongoDsrRepository(mongoClient);
  const consentRepo = new MongoConsentRepository(mongoClient);
  const feedbackRepo = new MongoFeedbackRepository(mongoClient);
  const diagnosticRepo = new MongoDiagnosticRepository(mongoClient);
  const rfpRepo = new MongoRfpRepository(mongoClient);
  const bookingRepo = new MongoBookingRepository(mongoClient);
  const decisionRepo = new MongoDecisionRepository(mongoClient);
  const riskRepo = new MongoRiskRepository(mongoClient);
  const supportTicketRepo = new MongoSupportTicketRepository(mongoClient);
  const approvalRepo = new MongoApprovalRepository(mongoClient);
  const stakeholderRepo = new MongoStakeholderRepository(mongoClient);
  const latticeRepo = new MongoLatticeRepository(mongoClient);
  const reportRepo = new MongoReportRepository(mongoClient);
  const engagementMemberRepo = new MongoEngagementMemberRepository(mongoClient);
  const budgetRepo = new MongoBudgetRepository(mongoClient);
  const kbRepo = new MongoKbRepository(mongoClient);
  const glossaryRepo = new MongoGlossaryRepository(mongoClient);
  const newsletterRepo = new MongoNewsletterRepository(mongoClient);
  const changelogRepo = new MongoChangelogRepository(mongoClient);

  // Auth
  const passwordHasher = new BcryptPasswordHasher();
  const tokenService = new JwtTokenService({
    accessSecret: config.jwt.accessSecret,
    refreshSecret: config.jwt.refreshSecret,
    accessExpiresIn: config.jwt.accessExpiresIn,
    refreshExpiresIn: config.jwt.refreshExpiresIn,
  });

  // Email – use Resend in production, log-only stub in dev when no API key
  const emailService = config.email.resendApiKey
    ? new ResendEmailService({
        apiKey: config.email.resendApiKey,
        fromAddress: config.email.fromAddress,
      })
    : {
        sendEmail: async (to: string, subject: string, _html: string) => {
          logger.info({ to, subject }, "Email (dev stub, not sent)");
        },
        sendTemplateEmail: async (to: string, templateId: string, _vars: Record<string, string>) => {
          logger.info({ to, templateId }, "Template email (dev stub, not sent)");
        },
        sendWelcome: async (email: string, firstName: string) => {
          logger.info({ email, firstName }, "Welcome email (dev stub, not sent)");
        },
        sendPasswordReset: async (email: string, _token: string) => {
          logger.info({ email }, "Password reset email (dev stub, not sent)");
        },
        send: async (to: string, subject: string, _body: string) => {
          logger.info({ to, subject }, "Email (dev stub, not sent)");
        },
      };

  // Cache (Redis) – optional, falls back to no-op in dev
  let cacheService: Any;
  try {
    cacheService = new RedisCacheService({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
    });
    logger.info("Connected to Redis");
  } catch {
    logger.warn("Redis unavailable, using no-op cache");
    cacheService = {
      get: async () => null,
      set: async () => {},
      del: async () => {},
    };
  }

  // Events (Kafka) – optional, falls back to no-op stubs
  let eventPublisher: Any;
  let eventSubscriber: Any;

  // Quick TCP check to avoid slow KafkaJS retries
  const net = await import("net");
  const kafkaReachable = await new Promise<boolean>((resolve) => {
    const [host, portStr] = config.kafka.brokers[0].split(":");
    const sock = net.createConnection({ host, port: Number(portStr), timeout: 1500 });
    sock.on("connect", () => { sock.destroy(); resolve(true); });
    sock.on("error", () => { sock.destroy(); resolve(false); });
    sock.on("timeout", () => { sock.destroy(); resolve(false); });
  });

  if (kafkaReachable) {
    try {
      eventPublisher = new KafkaEventPublisher({
        brokers: config.kafka.brokers,
        clientId: config.kafka.clientId,
      });
      await eventPublisher.connect();

      eventSubscriber = new KafkaEventSubscriber({
        brokers: config.kafka.brokers,
        clientId: config.kafka.clientId,
        groupId: config.kafka.groupId,
      });
      await eventSubscriber.connect();
      logger.info("Connected to Kafka");
    } catch {
      // The TCP probe only proves *something* is listening — it may not be Kafka
      // (or the broker may be half-up). Reset both so the no-op fallback below
      // engages; otherwise a half-constructed publisher slips through the
      // `!eventPublisher` check and the workflow engine dies on startup.
      logger.warn("Kafka connection failed, using no-op event stubs");
      eventPublisher = undefined;
      eventSubscriber = undefined;
    }
  }

  if (!kafkaReachable || !eventPublisher) {
    logger.warn("Kafka unavailable, using no-op event stubs");
    eventPublisher = {
      publish: async (topic: string, _payload: unknown) => {
        logger.debug({ topic }, "Event publish (no-op)");
      },
      connect: async () => {},
      close: async () => {},
    };
    eventSubscriber = {
      subscribe: async () => {},
      start: async () => {},
      connect: async () => {},
      close: async () => {},
    };
  }

  // File storage (Cloudinary)
  const fileStorage = new CloudinaryFileStorage({
    cloudName: config.cloud.cloudinaryCloudName,
    apiKey: config.cloud.cloudinaryApiKey,
    apiSecret: config.cloud.cloudinaryApiSecret,
  });

  // ── Application services ────────────────────────────────────────────────────

  const authService = new AuthService(
    userRepo,
    passwordHasher,
    tokenService as Any,
    emailService as Any,
    cacheService,
    eventPublisher,
    logger,
  );

  const projectService = new ProjectService(
    projectRepo as Any,
    specRepo as Any,
    eventPublisher,
    cacheService,
    logger,
  );

  const specService = new SpecService(
    specRepo as Any,
    responseRepo as Any,
    projectRepo as Any,
    eventPublisher,
    logger,
  );

  const questionnaireService = new QuestionnaireService(
    questionRepo as Any,
    responseRepo as Any,
    projectRepo as Any,
    eventPublisher,
    logger,
  );

  const billingService = new BillingService(
    invoiceRepo as Any,
    eventPublisher,
    logger,
  );

  const workflowEngine = new WorkflowEngine(
    projectRepo as Any,
    notificationRepo as Any,
    emailService as Any,
    eventPublisher,
    eventSubscriber,
    logger,
  );

  // Thin service adapters for routes that operate directly on repositories
  const notificationService = {
    findByUserId: (userId: string) => notificationRepo.findByUserId(userId),
    findUnreadByUserId: (userId: string) => notificationRepo.findUnreadByUserId(userId),
    countUnreadByUserId: (userId: string) => notificationRepo.countUnreadByUserId(userId),
    markAsRead: (id: string) => notificationRepo.markAsRead(id),
    markAllAsRead: (userId: string) => notificationRepo.markAllAsRead(userId),
    delete: (id: string) => notificationRepo.delete(id),
  };

  const messageService = {
    createThread: async (input: Any) => {
      const { createThread } = await import("./domain/entity/message.js");
      const thread = createThread(input);
      return threadRepo.create(thread);
    },
    listThreadsByProject: (projectId: string) => threadRepo.findByProjectId(projectId),
    listThreadsByParticipant: (userId: string) => threadRepo.findByParticipantId(userId),
    getThread: (threadId: string) => threadRepo.findById(threadId),
    sendMessage: async (threadId: string, senderId: string, content: string, attachments?: string[]) => {
      const { createMessage } = await import("./domain/entity/message.js");
      const msg = createMessage({ threadId, senderId, content, attachments });
      return messageRepo.create(msg);
    },
    getMessages: (threadId: string) => messageRepo.findByThreadId(threadId),
  };

  const taskServiceAdapter = {
    createTask: (task: Any) => taskRepo.create(task),
    findTask: (id: string) => taskRepo.findById(id),
    listTasks: (filter?: Any) => taskRepo.findAll(filter),
    updateTask: (task: Any) => taskRepo.update(task),
    deleteTask: (id: string) => taskRepo.delete(id),
    createSprint: (sprint: Any) => sprintRepo.create(sprint),
    findSprint: (id: string) => sprintRepo.findById(id),
    listSprints: (projectId: string) => sprintRepo.findByProjectId(projectId),
    updateSprint: (sprint: Any) => sprintRepo.update(sprint),
    deleteSprint: (id: string) => sprintRepo.delete(id),
  };

  const userServiceAdapter = {
    findAll: (filter?: Any) => userRepo.findAll(filter),
    findById: (id: string) => userRepo.findById(id),
    update: (user: Any) => userRepo.update(user),
    delete: (id: string) => userRepo.delete(id),
  };

  const roleServiceAdapter = {
    findAll: () => roleRepo.findAll(),
    findById: (id: string) => roleRepo.findById(id),
    findByName: (name: string) => roleRepo.findByName(name),
    create: (role: Any) => roleRepo.create(role),
    update: (role: Any) => roleRepo.update(role),
    delete: (id: string) => roleRepo.delete(id),
  };

  const fileServiceAdapter = {
    upload: async (buf: Buffer, name: string, mime: string, uploadedBy: string, projectId?: string) => {
      const { url, publicId } = await fileStorage.upload(buf, name, mime);
      return { id: crypto.randomUUID(), fileName: name, fileURL: url, publicId, fileSize: buf.length, mimeType: mime, uploadedBy, projectId, createdAt: new Date() };
    },
    getById: async (_id: string) => null as Any,
    listByProject: async (_projectId: string) => [] as Any[],
    delete: async (id: string) => { await fileStorage.delete(id); },
  };

  const contactService = {
    submit: async (input: Any) => {
      // Persist the lead so it lands in the admin inbox (previously this only
      // emailed and was never written to the contact_submissions collection).
      const submission = createContactSubmission({
        name: input.name,
        email: input.email,
        phone: input.phone ?? "",
        company: input.company ?? "",
        subject: input.subject ?? "",
        projectType: input.projectType ?? "",
        message: input.message,
        status: "new",
      });
      await contactSubmissionRepo.create(submission);
      // Staff notification is best-effort — never fail the submission on email.
      void (emailService as Any)
        .sendEmail(config.email.fromAddress, `New Contact: ${input.subject ?? ""}`, JSON.stringify(input, null, 2))
        .catch(() => undefined);
      return submission;
    },
  };

  // ── Multer (memory storage for Cloudinary upload) ───────────────────────────
  const multerModule = await import("multer");
  const multerFn = multerModule.default ?? multerModule;
  const upload = (multerFn as unknown as (opts: Record<string, unknown>) => { single(field: string): import("express").RequestHandler })({
    storage: (multerFn as unknown as { memoryStorage(): unknown }).memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  });

  // ── Socket.IO hub (created early so routes can reference it; started after server) ──

  const sioHub = new SocketIOHub(tokenService as Any, logger);

  // ── Express app ─────────────────────────────────────────────────────────────

  const app = express();

  app.use(helmet());
  // In dev, accept any localhost / 127.0.0.1 origin so any Vite port works.
  // In production, use the explicit allowlist from NEURODYNE_CORS_ORIGINS.
  const isDev = config.server.environment === "development";
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true); // same-origin / curl
        if (isDev && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
          return cb(null, true);
        }
        if (config.server.corsOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`CORS: origin ${origin} not allowed`));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(metricsMiddleware);

  // Record every mutating request to the audit log (spec §15.1: 100% of writes).
  // Uses res.on("finish"), so req.userId/userRole set by per-route auth are captured.
  app.use(createAuditRecorder(auditRepo));

  // Liveness — process is up
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
  });

  // Readiness — process is up AND can talk to Mongo
  app.get("/readiness", async (_req, res) => {
    try {
      // Cheapest way to confirm Mongo connectivity from outside the client class
      await mongoClient.collection("users").estimatedDocumentCount({ maxTimeMS: 1500 });
      res.status(200).json({ status: "ready", mongo: "ok", uptime: process.uptime() });
    } catch (err: any) {
      res.status(503).json({ status: "degraded", mongo: "unreachable", error: err?.message });
    }
  });

  // Metrics endpoint
  app.get("/metrics", metricsEndpoint);

  // ── Mount routes ────────────────────────────────────────────────────────────

  app.use("/api/v1/auth", createAuthRoutes(authService, tokenService as Any));
  app.use("/api/v1/projects", createProjectRoutes(projectService, tokenService as Any));
  app.use("/api/v1/specifications", createSpecRoutes(specService, tokenService as Any));
  app.use("/api/v1/questionnaire", createQuestionnaireRoutes(questionnaireService, tokenService as Any));
  app.use("/api/v1/notifications", createNotificationRoutes(notificationService, tokenService as Any));
  app.use("/api/v1/messages", createMessageRoutes(messageService, tokenService as Any, sioHub));
  app.use("/api/v1/tasks", createTaskRoutes(taskServiceAdapter, tokenService as Any));
  // Owning-client lookup shared by the project-scoped portal modules (decisions, risks).
  const getProjectOwnerId = async (projectId: string): Promise<string | null> => {
    try {
      const p = await projectService.getProject(projectId);
      return (p as Any)?.clientId ?? null;
    } catch {
      return null;
    }
  };
  app.use("/api/v1/decisions", createDecisionRoutes(decisionRepo, tokenService as Any, getProjectOwnerId));
  app.use("/api/v1/risks", createRiskRoutes(riskRepo, tokenService as Any, getProjectOwnerId));
  app.use("/api/v1/tickets", createSupportTicketRoutes(supportTicketRepo, tokenService as Any, getProjectOwnerId));
  app.use("/api/v1/approvals", createApprovalRoutes(approvalRepo, tokenService as Any, getProjectOwnerId));
  app.use("/api/v1/stakeholders", createStakeholderRoutes(stakeholderRepo, tokenService as Any, getProjectOwnerId));
  app.use("/api/v1/lattice", createLatticeRoutes(latticeRepo, tokenService as Any, getProjectOwnerId));
  app.use("/api/v1/reports", createReportRoutes(reportRepo, tokenService as Any, getProjectOwnerId));
  app.use("/api/v1/team", createEngagementMemberRoutes(engagementMemberRepo, tokenService as Any, getProjectOwnerId));
  app.use("/api/v1/budget", createBudgetRoutes(budgetRepo, tokenService as Any, getProjectOwnerId));
  app.use("/api/v1/invoices", createInvoiceRoutes(billingService, tokenService as Any));
  app.use("/api/v1/users", createUserRoutes(userServiceAdapter, tokenService as Any));
  app.use("/api/v1/roles", createRoleRoutes(roleServiceAdapter, userServiceAdapter, tokenService as Any));
  app.use("/api/v1/files", createFileRoutes(fileServiceAdapter, tokenService as Any, upload));
  app.use("/api/v1/contact", createContactRoutes(contactService));
  app.use("/api/v1/blog", createBlogRoutes(blogPostRepo, tokenService as Any));
  app.use("/api/v1/testimonials", createTestimonialRoutes(testimonialRepo, tokenService as Any));
  app.use("/api/v1/services", createServiceItemRoutes(serviceRepo, tokenService as Any));
  app.use("/api/v1/portfolio", createCaseStudyRoutes(caseStudyRepo, tokenService as Any));
  app.use("/api/v1/contact-submissions", createContactSubmissionRoutes(contactSubmissionRepo, tokenService as Any));

  // ── Gap-audit modules ─────────────────────────────────────────────────────
  // Public-write endpoints get lightweight anti-abuse rate limiting; GET passes through.
  const publicWrite = (name: string, max: number) => {
    const limiter = rateLimit(name, { max, windowMs: 60_000 });
    return (req: Any, res: Any, next: Any) => (req.method === "GET" ? next() : limiter(req, res, next));
  };

  app.use("/api/v1/audit", createAuditRoutes(auditRepo, tokenService as Any));
  app.use("/api/v1/status", publicWrite("status", 30), createStatusRoutes(statusRepo, emailService as Any, tokenService as Any));
  app.use("/api/v1/flags", createFeatureFlagRoutes(featureFlagRepo, tokenService as Any));
  app.use("/api/v1/webhooks", createWebhookRoutes(webhookRepo, tokenService as Any));
  app.use("/api/v1/api-keys", createApiKeyRoutes(apiKeyRepo, tokenService as Any));
  app.use("/api/v1/privacy/requests", createDsrRoutes(dsrRepo, tokenService as Any));
  app.use("/api/v1/consent", publicWrite("consent", 30), createConsentRoutes(consentRepo, tokenService as Any));
  app.use("/api/v1/feedback", publicWrite("feedback", 20), createFeedbackRoutes(feedbackRepo, tokenService as Any));
  app.use("/api/v1/diagnostic", publicWrite("diagnostic", 20), createDiagnosticRoutes(diagnosticRepo, tokenService as Any, emailService as Any, config.email.fromAddress));
  app.use("/api/v1/rfp", publicWrite("rfp", 10), createRfpRoutes(rfpRepo, tokenService as Any, emailService as Any, config.email.fromAddress));
  app.use("/api/v1/booking", publicWrite("booking", 15), createBookingRoutes(bookingRepo, tokenService as Any, emailService as Any, config.email.fromAddress));
  app.use("/api/v1/help", createKbRoutes(kbRepo, tokenService as Any));
  app.use("/api/v1/glossary", createGlossaryRoutes(glossaryRepo, tokenService as Any));
  app.use("/api/v1/newsletter", publicWrite("newsletter", 15), createNewsletterRoutes(newsletterRepo, emailService as Any, tokenService as Any));
  app.use("/api/v1/changelog", createChangelogRoutes(changelogRepo, tokenService as Any));

  // ── Public activity feed (anonymized, derived from recent events) ─────────
  app.get("/api/v1/activity", async (_req, res, next) => {
    try {
      const [recentProjects, recentPosts, recentSubmissions] = await Promise.all([
        projectRepo.findAll().catch(() => []),
        blogPostRepo.findAll({ status: "published" }).catch(() => []),
        contactSubmissionRepo.findAll().catch(() => []),
      ]);

      const events: Array<{ type: string; text: string; ts: string; color: string }> = [];

      for (const p of (recentProjects as any[]).slice(0, 8)) {
        const status = String(p.status ?? "lead").replace(/_/g, " ");
        events.push({
          type: "project",
          text: `Project moved to ${status}`,
          ts: new Date(p.updatedAt ?? p.createdAt ?? Date.now()).toISOString(),
          color: status.includes("delivered") ? "#10B981" : status.includes("development") ? "#F59E0B" : "#6C63FF",
        });
      }

      for (const post of (recentPosts as any[]).slice(0, 4)) {
        events.push({
          type: "blog",
          text: `New post: ${post.title}`,
          ts: new Date(post.createdAt ?? Date.now()).toISOString(),
          color: "#8B85FF",
        });
      }

      for (const sub of (recentSubmissions as any[]).slice(0, 4)) {
        events.push({
          type: "contact",
          text: "New project briefed",
          ts: new Date(sub.createdAt ?? Date.now()).toISOString(),
          color: "#10B981",
        });
      }

      events.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
      res.json({ events: events.slice(0, 12) });
    } catch (err) {
      next(err);
    }
  });

  // ── RSS feed and sitemap (public, no auth) ────────────────────────────────
  const SITE_URL = process.env.NEURODYNE_SITE_URL ?? "https://neurodynecorp.com";

  function escapeXml(s: string): string {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  // ── Trust & security endpoints (RFC 9116 + trust summary) ─────────────────
  app.get("/.well-known/security.txt", (_req, res) => {
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send(
      [
        "Contact: mailto:security@neurodynecorp.com",
        `Expires: ${expires}`,
        `Policy: ${SITE_URL}/legal/security`,
        `Canonical: ${SITE_URL}/.well-known/security.txt`,
        "Preferred-Languages: en",
        "",
      ].join("\n"),
    );
  });

  app.get("/api/v1/trust", (_req, res) => {
    res.json({
      security: {
        mfa: true,
        auditLogging: true,
        encryptionInTransit: true,
        rbac: true,
        vulnerabilityDisclosure: `${SITE_URL}/.well-known/security.txt`,
      },
      compliance: { gdpr: true, ghanaDataProtectionAct: true, dataResidency: "configurable" },
      subprocessors: `${SITE_URL}/legal/subprocessors`,
      status: `${SITE_URL}/status`,
    });
  });

  app.get("/feed.xml", async (_req, res, next) => {
    try {
      const posts = await blogPostRepo.findAll({ status: "published" });
      const items = posts
        .map((p: any) => {
          const url = `${SITE_URL}/blog/${p.slug ?? p.id}`;
          const date = new Date(p.createdAt ?? Date.now()).toUTCString();
          return `<item>
  <title>${escapeXml(p.title)}</title>
  <link>${url}</link>
  <guid isPermaLink="true">${url}</guid>
  <pubDate>${date}</pubDate>
  <description>${escapeXml(p.excerpt ?? "")}</description>
  <category>${escapeXml(p.category ?? "Engineering")}</category>
</item>`;
        })
        .join("\n");

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>NeuroDyne Corp — Engineering Blog</title>
<link>${SITE_URL}/blog</link>
<description>Architecture, AI-assisted specs, and lessons from shipping software at scale.</description>
<language>en-us</language>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
<atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>`;

      res.set("Content-Type", "application/rss+xml; charset=utf-8");
      res.send(xml);
    } catch (err) {
      next(err);
    }
  });

  app.get("/sitemap.xml", async (_req, res, next) => {
    try {
      const [posts, caseStudies] = await Promise.all([
        blogPostRepo.findAll({ status: "published" }),
        caseStudyRepo.findAll({ status: "published" }),
      ]);

      const staticPaths = ["/", "/about", "/services", "/services/audit", "/services/enterprise", "/services/ai", "/services/digital", "/services/advisory", "/labs", "/subsidiaries", "/industries", "/portfolio", "/blog", "/faq", "/press", "/contact", "/start-project", "/changelog", "/open-source", "/privacy", "/terms", "/status", "/trust", "/help", "/legal/cookies", "/legal/acceptable-use", "/legal/accessibility", "/legal/subprocessors", "/legal/security", "/legal/dpa"];
      const blogUrls = (posts as any[]).map((p) => `/blog/${p.slug ?? p.id}`);
      const portfolioUrls = (caseStudies as any[]).map((c) => `/portfolio/${c.slug ?? c.id}`);

      const urls = [...staticPaths, ...blogUrls, ...portfolioUrls].map((path) => {
        const lastmod = new Date().toISOString().slice(0, 10);
        return `<url><loc>${SITE_URL}${path}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq></url>`;
      });

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

      res.set("Content-Type", "application/xml; charset=utf-8");
      res.send(xml);
    } catch (err) {
      next(err);
    }
  });

  // Error handler (must be last)
  app.use(errorHandler(logger));

  // ── HTTP server + WebSocket ─────────────────────────────────────────────────

  const server = createServer(app);

  const wsHub = new WebSocketHub(tokenService as Any, logger);
  wsHub.start(server);

  sioHub.start(server);

  // Wire real-time emitter into workflow engine
  workflowEngine.setRealtimeEmitter(sioHub);

  // ── Start workflow engine ───────────────────────────────────────────────────

  await workflowEngine.start();
  await eventSubscriber.start();
  logger.info("Workflow engine started");

  // ── Start listening ─────────────────────────────────────────────────────────

  server.listen(config.server.port, config.server.host, () => {
    logger.info(
      { port: config.server.port, host: config.server.host },
      "NeuroDyne Corp server listening",
    );
  });

  // ── Metrics server (separate port) ──────────────────────────────────────────

  if (config.metrics.enabled && config.metrics.port !== config.server.port) {
    const metricsApp = express();
    metricsApp.get("/metrics", metricsEndpoint);
    metricsApp.listen(config.metrics.port, () => {
      logger.info({ port: config.metrics.port }, "Metrics server listening");
    });
  }

  // ── Graceful shutdown ───────────────────────────────────────────────────────

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down gracefully");

    await workflowEngine.stop();
    wsHub.shutdown();

    server.close(() => {
      logger.info("HTTP server closed");
    });

    await eventPublisher.close();
    await eventSubscriber.close();
    logger.info("Kafka disconnected");

    await mongoClient.close();
    logger.info("MongoDB disconnected");

    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
