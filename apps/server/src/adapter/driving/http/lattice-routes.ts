import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requireRole, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";
import {
  createLatticeItem,
  LATTICE_STATUSES,
  type LatticeItem,
  type LatticeStatus,
} from "../../../domain/entity/lattice.js";

interface LatticeRepository {
  findByProjectId(projectId: string): Promise<LatticeItem[]>;
  findById(id: string): Promise<LatticeItem | null>;
  create(l: LatticeItem): Promise<LatticeItem>;
  update(l: LatticeItem): Promise<LatticeItem>;
  delete(id: string): Promise<void>;
}

type ProjectOwnerLookup = (projectId: string) => Promise<string | null>;

const statusEnum = z.enum(LATTICE_STATUSES as [LatticeStatus, ...LatticeStatus[]]);

const createSchema = z.object({
  projectId: z.string().min(1),
  capability: z.string().min(1).max(200),
  category: z.string().min(1).max(200),
  status: statusEnum.optional(),
  description: z.string().max(4000).optional(),
  owner: z.string().max(200).optional(),
  targetDate: z.coerce.date().optional(),
});

const updateSchema = z.object({
  capability: z.string().min(1).max(200).optional(),
  category: z.string().min(1).max(200).optional(),
  status: statusEnum.optional(),
  description: z.string().max(4000).optional(),
  owner: z.string().max(200).optional(),
  targetDate: z.coerce.date().optional(),
});

export function createLatticeRoutes(
  repo: LatticeRepository,
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
      const l = parsed.data;
      const item = createLatticeItem({
        projectId: l.projectId,
        capability: l.capability,
        category: l.category,
        status: l.status ?? "queued",
        description: l.description,
        owner: l.owner,
        targetDate: l.targetDate,
        createdById: req.userId!,
      });
      const created = await repo.create(item);
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
      const item = await repo.findById(String(req.params.id));
      if (!item) throw new NotFoundError("capability", String(req.params.id));
      try {
        await assertProjectAccess(req, item.projectId);
      } catch {
        throw new NotFoundError("capability", String(req.params.id));
      }
      res.json(item);
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
      if (!existing) throw new NotFoundError("capability", String(req.params.id));
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
      if (!existing) throw new NotFoundError("capability", String(req.params.id));
      await repo.delete(existing.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
