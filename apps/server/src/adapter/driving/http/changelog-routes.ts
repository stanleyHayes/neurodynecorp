import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requirePermission, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";
import { createChangelogEntry, type ChangelogEntry } from "../../../domain/entity/changelog.js";

// ── Repository interface ─────────────────────────────────────────────────────

interface ChangelogRepo {
  findAll(filter?: { published?: boolean }): Promise<ChangelogEntry[]>;
  findById(id: string): Promise<ChangelogEntry | null>;
  create(entry: ChangelogEntry): Promise<ChangelogEntry>;
  update(entry: ChangelogEntry): Promise<ChangelogEntry>;
  delete(id: string): Promise<void>;
}

// ── Validation schemas ───────────────────────────────────────────────────────

const createChangelogSchema = z.object({
  version: z.string(),
  title: z.string(),
  body: z.string(),
  category: z.enum(["feature", "fix", "improvement", "security"]),
  published: z.boolean().optional(),
  publishedAt: z.coerce.date().optional(),
});

const updateChangelogSchema = z.object({
  version: z.string().optional(),
  title: z.string().optional(),
  body: z.string().optional(),
  category: z.enum(["feature", "fix", "improvement", "security"]).optional(),
  published: z.boolean().optional(),
  publishedAt: z.coerce.date().optional(),
});

// ── Route factory ────────────────────────────────────────────────────────────

export function createChangelogRoutes(repo: ChangelogRepo, tokenService: TokenService): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  // GET / — PUBLIC: published entries only
  router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await repo.findAll({ published: true });
      res.json({ items, total: items.length });
    } catch (err) {
      next(err);
    }
  });

  // GET /all — all entries including drafts
  router.get("/all", auth, requirePermission("changelog:read"), async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await repo.findAll();
      res.json({ items, total: items.length });
    } catch (err) {
      next(err);
    }
  });

  // POST / — create
  router.post("/", auth, requirePermission("changelog:create"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createChangelogSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());

      const data = parsed.data;
      const published = data.published ?? false;
      const publishedAt = published && !data.publishedAt ? new Date() : data.publishedAt;

      const entry = createChangelogEntry({
        version: data.version,
        title: data.title,
        body: data.body,
        category: data.category,
        published,
        publishedAt,
      });

      const created = await repo.create(entry);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  // PATCH /:id — update
  router.patch("/:id", auth, requirePermission("changelog:update"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateChangelogSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());

      const existing = await repo.findById(req.params.id!);
      if (!existing) throw new NotFoundError("changelog", req.params.id);

      const merged: ChangelogEntry = { ...existing, ...parsed.data, id: existing.id, updatedAt: new Date() };
      if (merged.published && !merged.publishedAt) merged.publishedAt = new Date();

      const updated = await repo.update(merged);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /:id
  router.delete("/:id", auth, requirePermission("changelog:delete"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await repo.findById(req.params.id!);
      if (!existing) throw new NotFoundError("changelog", req.params.id);
      await repo.delete(req.params.id!);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
