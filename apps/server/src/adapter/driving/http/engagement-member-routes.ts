import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requireRole, type TokenService } from "../../../middleware/auth.js";
import { isClientActor } from "../../../middleware/rbac-helpers.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";
import {
  createEngagementMember,
  MEMBER_AVAILABILITIES,
  type EngagementMember,
  type MemberAvailability,
} from "../../../domain/entity/engagement-member.js";

interface EngagementMemberRepository {
  findByProjectId(projectId: string): Promise<EngagementMember[]>;
  findById(id: string): Promise<EngagementMember | null>;
  create(m: EngagementMember): Promise<EngagementMember>;
  update(m: EngagementMember): Promise<EngagementMember>;
  delete(id: string): Promise<void>;
}

type ProjectOwnerLookup = (projectId: string) => Promise<string | null>;

const availabilityEnum = z.enum(MEMBER_AVAILABILITIES as [MemberAvailability, ...MemberAvailability[]]);

const createSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  email: z.string().max(320).optional(),
  availability: availabilityEnum.optional(),
  focus: z.string().max(300).optional(),
  bio: z.string().max(2000).optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  role: z.string().min(1).max(200).optional(),
  email: z.string().max(320).optional(),
  availability: availabilityEnum.optional(),
  focus: z.string().max(300).optional(),
  bio: z.string().max(2000).optional(),
});

export function createEngagementMemberRoutes(
  repo: EngagementMemberRepository,
  tokenService: TokenService,
  getProjectOwnerId: ProjectOwnerLookup,
): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);
  router.use(auth);

  async function assertProjectAccess(req: Request, projectId: string): Promise<void> {
    if (isClientActor(req.userRole)) {
      const ownerId = await getProjectOwnerId(projectId);
      if (!ownerId || ownerId !== req.userId) throw new NotFoundError("project", projectId);
    }
  }

  // POST / — staff only.
  router.post("/", requireRole("admin", "project_manager"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());
      const m = parsed.data;
      const member = createEngagementMember({
        projectId: m.projectId,
        name: m.name,
        role: m.role,
        email: m.email,
        availability: m.availability ?? "full_time",
        focus: m.focus,
        bio: m.bio,
        createdById: req.userId!,
      });
      const created = await repo.create(member);
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
      const member = await repo.findById(String(req.params.id));
      if (!member) throw new NotFoundError("team member", String(req.params.id));
      try {
        await assertProjectAccess(req, member.projectId);
      } catch {
        throw new NotFoundError("team member", String(req.params.id));
      }
      res.json(member);
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
      if (!existing) throw new NotFoundError("team member", String(req.params.id));
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
      if (!existing) throw new NotFoundError("team member", String(req.params.id));
      await repo.delete(existing.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
