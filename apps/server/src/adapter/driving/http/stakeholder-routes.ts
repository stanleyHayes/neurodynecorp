import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requireRole, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";
import {
  createStakeholder,
  STAKEHOLDER_SIDES,
  DECISION_AUTHORITIES,
  type Stakeholder,
  type StakeholderSide,
  type DecisionAuthority,
} from "../../../domain/entity/stakeholder.js";

interface StakeholderRepository {
  findByProjectId(projectId: string): Promise<Stakeholder[]>;
  findById(id: string): Promise<Stakeholder | null>;
  create(s: Stakeholder): Promise<Stakeholder>;
  update(s: Stakeholder): Promise<Stakeholder>;
  delete(id: string): Promise<void>;
}

type ProjectOwnerLookup = (projectId: string) => Promise<string | null>;

const sideEnum = z.enum(STAKEHOLDER_SIDES as [StakeholderSide, ...StakeholderSide[]]);
const authorityEnum = z.enum(DECISION_AUTHORITIES as [DecisionAuthority, ...DecisionAuthority[]]);

const createSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  side: sideEnum,
  authority: authorityEnum.optional(),
  briefed: z.boolean().optional(),
  email: z.string().max(320).optional(),
  notes: z.string().max(2000).optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  role: z.string().min(1).max(200).optional(),
  side: sideEnum.optional(),
  authority: authorityEnum.optional(),
  briefed: z.boolean().optional(),
  email: z.string().max(320).optional(),
  notes: z.string().max(2000).optional(),
});

export function createStakeholderRoutes(
  repo: StakeholderRepository,
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

  // POST / — staff only.
  router.post("/", requireRole("admin", "project_manager"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());
      const s = parsed.data;
      const stakeholder = createStakeholder({
        projectId: s.projectId,
        name: s.name,
        role: s.role,
        side: s.side,
        authority: s.authority ?? "informed",
        briefed: s.briefed ?? false,
        email: s.email,
        notes: s.notes,
        createdById: req.userId!,
      });
      const created = await repo.create(stakeholder);
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
      const stakeholder = await repo.findById(req.params.id!);
      if (!stakeholder) throw new NotFoundError("stakeholder", req.params.id);
      try {
        await assertProjectAccess(req, stakeholder.projectId);
      } catch {
        throw new NotFoundError("stakeholder", req.params.id);
      }
      res.json(stakeholder);
    } catch (err) {
      next(err);
    }
  });

  // PATCH /:id — staff only.
  router.patch("/:id", requireRole("admin", "project_manager"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());
      const existing = await repo.findById(req.params.id!);
      if (!existing) throw new NotFoundError("stakeholder", req.params.id);
      const updated = await repo.update({ ...existing, ...parsed.data, id: existing.id });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /:id — staff only.
  router.delete("/:id", requireRole("admin", "project_manager"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await repo.findById(req.params.id!);
      if (!existing) throw new NotFoundError("stakeholder", req.params.id);
      await repo.delete(existing.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
