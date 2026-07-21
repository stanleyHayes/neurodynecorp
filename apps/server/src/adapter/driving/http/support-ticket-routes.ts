import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requireRole, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";
import {
  createSupportTicket,
  newTicketReply,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type SupportTicket,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from "../../../domain/entity/support-ticket.js";

interface TicketRepository {
  findByProjectId(projectId: string): Promise<SupportTicket[]>;
  findAll(filter?: { status?: string; limit?: number }): Promise<SupportTicket[]>;
  findById(id: string): Promise<SupportTicket | null>;
  create(t: SupportTicket): Promise<SupportTicket>;
  update(t: SupportTicket): Promise<SupportTicket>;
}

type ProjectOwnerLookup = (projectId: string) => Promise<string | null>;

const createSchema = z.object({
  projectId: z.string().min(1),
  subject: z.string().min(1).max(300),
  body: z.string().min(1).max(8000),
  category: z.enum(TICKET_CATEGORIES as [TicketCategory, ...TicketCategory[]]).optional(),
  priority: z.enum(TICKET_PRIORITIES as [TicketPriority, ...TicketPriority[]]).optional(),
});

const replySchema = z.object({ body: z.string().min(1).max(8000) });
const statusSchema = z.object({ status: z.enum(TICKET_STATUSES as [TicketStatus, ...TicketStatus[]]) });

export function createSupportTicketRoutes(
  repo: TicketRepository,
  tokenService: TokenService,
  getProjectOwnerId: ProjectOwnerLookup,
): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);
  router.use(auth);

  // Row-level isolation: a client may only touch tickets for a project they own.
  async function assertProjectAccess(req: Request, projectId: string): Promise<void> {
    if (req.userRole === "client") {
      const ownerId = await getProjectOwnerId(projectId);
      if (!ownerId || ownerId !== req.userId) throw new NotFoundError("project", projectId);
    }
  }

  // Fail closed: an absent role is treated as non-staff (a client), never staff.
  const isStaff = (req: Request) => req.userRole != null && req.userRole !== "client";

  // POST / — owning client OR staff raises a ticket.
  router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());
      const t = parsed.data;
      await assertProjectAccess(req, t.projectId);
      const ticket = createSupportTicket({
        projectId: t.projectId,
        subject: t.subject,
        body: t.body,
        category: t.category ?? "question",
        priority: t.priority ?? "normal",
        createdById: req.userId!,
        createdByStaff: isStaff(req),
      });
      const created = await repo.create(ticket);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  // GET / — project-scoped (?projectId=, owning client or staff) OR global staff inbox.
  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = req.query.projectId ? String(req.query.projectId) : "";
      if (projectId) {
        await assertProjectAccess(req, projectId);
        const items = await repo.findByProjectId(projectId);
        res.json({ items, total: items.length });
        return;
      }
      // No projectId: global list is staff-only; clients get an empty set.
      if (req.userRole === "client") {
        res.json({ items: [], total: 0 });
        return;
      }
      const filter: { status?: string; limit?: number } = {};
      if (req.query.status) filter.status = String(req.query.status);
      if (req.query.limit) filter.limit = Number(req.query.limit);
      const items = await repo.findAll(Object.keys(filter).length ? filter : undefined);
      res.json({ items, total: items.length });
    } catch (err) {
      next(err);
    }
  });

  // GET /:id — single ticket; not-owned indistinguishable from not-found.
  router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ticket = await repo.findById(String(req.params.id));
      if (!ticket) throw new NotFoundError("ticket", String(req.params.id));
      try {
        await assertProjectAccess(req, ticket.projectId);
      } catch {
        throw new NotFoundError("ticket", String(req.params.id));
      }
      res.json(ticket);
    } catch (err) {
      next(err);
    }
  });

  // POST /:id/replies — owning client or staff adds to the thread.
  router.post("/:id/replies", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = replySchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());
      const ticket = await repo.findById(String(req.params.id));
      if (!ticket) throw new NotFoundError("ticket", String(req.params.id));
      try {
        await assertProjectAccess(req, ticket.projectId);
      } catch {
        throw new NotFoundError("ticket", String(req.params.id));
      }
      const staff = isStaff(req);
      const reply = newTicketReply({ authorId: req.userId!, body: parsed.data.body, staff });
      ticket.replies.push(reply);
      if (staff && !ticket.firstRespondedAt) ticket.firstRespondedAt = reply.createdAt;
      if (staff && ticket.status === "open") ticket.status = "in_progress";
      if (!staff && ticket.status === "resolved") ticket.status = "open"; // client reopened
      const updated = await repo.update(ticket);
      res.status(201).json(updated);
    } catch (err) {
      next(err);
    }
  });

  // PATCH /:id — staff only: advance status.
  router.patch("/:id", requireRole("admin", "project_manager"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = statusSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());
      const ticket = await repo.findById(String(req.params.id));
      if (!ticket) throw new NotFoundError("ticket", String(req.params.id));
      ticket.status = parsed.data.status;
      const updated = await repo.update(ticket);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
