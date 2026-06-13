import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requireRole, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";
import { createDecision, DECISION_STATUSES, type Decision, type DecisionStatus } from "../../../domain/entity/decision.js";

interface DecisionRepository {
  findByProjectId(projectId: string): Promise<Decision[]>;
  findById(id: string): Promise<Decision | null>;
  create(d: Decision): Promise<Decision>;
  update(d: Decision): Promise<Decision>;
  delete(id: string): Promise<void>;
}

/** Returns the owning client's userId for a project, or null if unknown. */
type ProjectOwnerLookup = (projectId: string) => Promise<string | null>;

const createSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1).max(300),
  rationale: z.string().min(1).max(8000),
  alternatives: z.array(z.string().max(500)).max(50).optional(),
  decisionMaker: z.string().min(1).max(200),
  linkedArtifacts: z.array(z.string().max(2000)).max(50).optional(),
  status: z.enum(DECISION_STATUSES as [DecisionStatus, ...DecisionStatus[]]).optional(),
  decidedAt: z.coerce.date().optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  rationale: z.string().min(1).max(8000).optional(),
  alternatives: z.array(z.string().max(500)).max(50).optional(),
  decisionMaker: z.string().min(1).max(200).optional(),
  linkedArtifacts: z.array(z.string().max(2000)).max(50).optional(),
  status: z.enum(DECISION_STATUSES as [DecisionStatus, ...DecisionStatus[]]).optional(),
  decidedAt: z.coerce.date().optional(),
});

export function createDecisionRoutes(
  repo: DecisionRepository,
  tokenService: TokenService,
  getProjectOwnerId: ProjectOwnerLookup,
): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);
  router.use(auth);

  // Row-level isolation: a client may only touch decisions for a project they own.
  // Mapped to 404 (not 403) so we don't leak the existence of other clients' projects.
  async function assertProjectAccess(req: Request, projectId: string): Promise<void> {
    if (req.userRole === "client") {
      const ownerId = await getProjectOwnerId(projectId);
      if (!ownerId || ownerId !== req.userId) throw new NotFoundError("project", projectId);
    }
  }

  // POST / — staff only: log a decision.
  router.post("/", requireRole("admin", "project_manager"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());
      const d = parsed.data;
      const decision = createDecision({
        projectId: d.projectId,
        title: d.title,
        rationale: d.rationale,
        alternatives: d.alternatives ?? [],
        decisionMaker: d.decisionMaker,
        linkedArtifacts: d.linkedArtifacts ?? [],
        status: d.status ?? "accepted",
        decidedAt: d.decidedAt ?? new Date(),
        createdById: req.userId!,
      });
      const created = await repo.create(decision);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  // GET /?projectId= — list a project's decisions (owning client or staff).
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

  // GET /:id — single decision (owning client or staff).
  router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const decision = await repo.findById(req.params.id!);
      if (!decision) throw new NotFoundError("decision", req.params.id);
      // A non-owning client must not be able to tell "exists-but-not-yours" from
      // "not found", and must never see the owning project's id — surface a plain
      // decision-scoped 404 instead of the project-scoped one from assertProjectAccess.
      try {
        await assertProjectAccess(req, decision.projectId);
      } catch {
        throw new NotFoundError("decision", req.params.id);
      }
      res.json(decision);
    } catch (err) {
      next(err);
    }
  });

  // PATCH /:id — staff only: amend / supersede.
  router.patch("/:id", requireRole("admin", "project_manager"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());
      const existing = await repo.findById(req.params.id!);
      if (!existing) throw new NotFoundError("decision", req.params.id);
      const { decidedAt, ...rest } = parsed.data;
      const updated = await repo.update({
        ...existing,
        ...rest,
        ...(decidedAt ? { decidedAt } : {}),
        id: existing.id,
      });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /:id — staff only.
  router.delete("/:id", requireRole("admin", "project_manager"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await repo.findById(req.params.id!);
      if (!existing) throw new NotFoundError("decision", req.params.id);
      await repo.delete(existing.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
