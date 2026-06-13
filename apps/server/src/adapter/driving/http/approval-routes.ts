import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requireRole, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";
import {
  createApproval,
  APPROVAL_DECISIONS,
  type Approval,
  type ApprovalDecision,
} from "../../../domain/entity/approval.js";

interface ApprovalRepository {
  findByProjectId(projectId: string): Promise<Approval[]>;
  findById(id: string): Promise<Approval | null>;
  create(a: Approval): Promise<Approval>;
  decideIfPending(
    id: string,
    fields: { status: Approval["status"]; decidedById: string; decidedAt: Date; decisionComment?: string },
  ): Promise<Approval | null>;
  delete(id: string): Promise<void>;
}

type ProjectOwnerLookup = (projectId: string) => Promise<string | null>;

const createSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1).max(300),
  description: z.string().max(8000).optional(),
  deliverableRef: z.string().max(2000).optional(),
});

const decisionSchema = z
  .object({
    decision: z.enum(APPROVAL_DECISIONS as [ApprovalDecision, ...ApprovalDecision[]]),
    comment: z.string().max(8000).optional(),
  })
  // A rejection or conditional approval must carry a reason/conditions for the audit trail.
  .superRefine((d, ctx) => {
    if ((d.decision === "rejected" || d.decision === "approved_with_conditions") && !d.comment?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["comment"], message: "A comment is required for this decision" });
    }
  });

export function createApprovalRoutes(
  repo: ApprovalRepository,
  tokenService: TokenService,
  getProjectOwnerId: ProjectOwnerLookup,
): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);
  router.use(auth);

  async function assertProjectAccess(req: Request, projectId: string): Promise<void> {
    if (req.userRole === "client") {
      const ownerId = await getProjectOwnerId(projectId);
      if (!ownerId || ownerId !== req.userId) throw new NotFoundError("project", projectId);
    }
  }

  // POST / — staff only: send a deliverable for sign-off.
  router.post("/", requireRole("admin", "project_manager"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());
      const a = parsed.data;
      const approval = createApproval({
        projectId: a.projectId,
        title: a.title,
        description: a.description ?? "",
        deliverableRef: a.deliverableRef,
        requestedById: req.userId!,
      });
      const created = await repo.create(approval);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  // GET /?projectId= — owning client or staff.
  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = req.query.projectId ? String(req.query.projectId) : "";
      if (!projectId) throw new ValidationError("projectId is required", {});
      await assertProjectAccess(req, projectId);
      const items = await repo.findByProjectId(projectId);
      res.json({ items, total: items.length });
    } catch (err) {
      next(err);
    }
  });

  // GET /:id — owning client or staff; not-owned indistinguishable from not-found.
  router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const approval = await repo.findById(req.params.id!);
      if (!approval) throw new NotFoundError("approval", req.params.id);
      try {
        await assertProjectAccess(req, approval.projectId);
      } catch {
        throw new NotFoundError("approval", req.params.id);
      }
      res.json(approval);
    } catch (err) {
      next(err);
    }
  });

  // POST /:id/decision — the owning client (the approver) OR staff records a decision. Decided once.
  router.post("/:id/decision", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = decisionSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());
      const approval = await repo.findById(req.params.id!);
      if (!approval) throw new NotFoundError("approval", req.params.id);
      try {
        await assertProjectAccess(req, approval.projectId);
      } catch {
        throw new NotFoundError("approval", req.params.id);
      }
      // Atomic decide-once: the DB conditional update is the single source of truth,
      // so concurrent deciders can't both win and clobber each other's decision.
      const updated = await repo.decideIfPending(req.params.id!, {
        status: parsed.data.decision,
        decidedById: req.userId!,
        decidedAt: new Date(),
        decisionComment: parsed.data.comment,
      });
      if (!updated) throw new ValidationError("This sign-off has already been decided", {});
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /:id — staff only: withdraw a request.
  router.delete("/:id", requireRole("admin", "project_manager"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await repo.findById(req.params.id!);
      if (!existing) throw new NotFoundError("approval", req.params.id);
      await repo.delete(existing.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
