import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requireRole, type TokenService } from "../../../middleware/auth.js";
import { isClientActor } from "../../../middleware/rbac-helpers.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";
import {
  createRisk,
  RISK_SEVERITIES,
  RISK_STATUSES,
  type Risk,
  type RiskSeverity,
  type RiskStatus,
} from "../../../domain/entity/risk.js";

interface RiskRepository {
  findByProjectId(projectId: string): Promise<Risk[]>;
  findById(id: string): Promise<Risk | null>;
  create(r: Risk): Promise<Risk>;
  update(r: Risk): Promise<Risk>;
  delete(id: string): Promise<void>;
}

/** Returns the owning client's userId for a project, or null if unknown. */
type ProjectOwnerLookup = (projectId: string) => Promise<string | null>;

const severityEnum = z.enum(RISK_SEVERITIES as [RiskSeverity, ...RiskSeverity[]]);
const statusEnum = z.enum(RISK_STATUSES as [RiskStatus, ...RiskStatus[]]);

const createSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1).max(300),
  description: z.string().min(1).max(8000),
  owner: z.string().min(1).max(200),
  severity: severityEnum,
  mitigation: z.string().max(8000).optional(),
  residualRating: severityEnum.optional(),
  escalation: z.string().max(2000).optional(),
  status: statusEnum.optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().min(1).max(8000).optional(),
  owner: z.string().min(1).max(200).optional(),
  severity: severityEnum.optional(),
  mitigation: z.string().max(8000).optional(),
  residualRating: severityEnum.optional(),
  escalation: z.string().max(2000).optional(),
  status: statusEnum.optional(),
});

export function createRiskRoutes(
  repo: RiskRepository,
  tokenService: TokenService,
  getProjectOwnerId: ProjectOwnerLookup,
): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);
  router.use(auth);

  // Row-level isolation: a client may only touch risks for a project they own.
  async function assertProjectAccess(req: Request, projectId: string): Promise<void> {
    if (isClientActor(req.userRole)) {
      const ownerId = await getProjectOwnerId(projectId);
      if (!ownerId || ownerId !== req.userId) throw new NotFoundError("project", projectId);
    }
  }

  // POST / — staff only: register a risk.
  router.post("/", requireRole("admin", "project_manager"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());
      const r = parsed.data;
      const risk = createRisk({
        projectId: r.projectId,
        title: r.title,
        description: r.description,
        owner: r.owner,
        severity: r.severity,
        mitigation: r.mitigation ?? "",
        residualRating: r.residualRating ?? r.severity,
        escalation: r.escalation ?? "",
        status: r.status ?? "open",
        createdById: req.userId!,
      });
      const created = await repo.create(risk);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  // GET /?projectId= — list a project's risks (owning client or staff).
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

  // GET /:id — single risk; not-owned is indistinguishable from not-found.
  router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const risk = await repo.findById(String(req.params.id));
      if (!risk) throw new NotFoundError("risk", String(req.params.id));
      try {
        await assertProjectAccess(req, risk.projectId);
      } catch {
        throw new NotFoundError("risk", String(req.params.id));
      }
      res.json(risk);
    } catch (err) {
      next(err);
    }
  });

  // PATCH /:id — staff only.
  router.patch("/:id", requireRole("admin", "project_manager"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());
      const existing = await repo.findById(String(req.params.id));
      if (!existing) throw new NotFoundError("risk", String(req.params.id));
      const updated = await repo.update({ ...existing, ...parsed.data, id: existing.id });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /:id — staff only.
  router.delete("/:id", requireRole("admin", "project_manager"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await repo.findById(String(req.params.id));
      if (!existing) throw new NotFoundError("risk", String(req.params.id));
      await repo.delete(existing.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
