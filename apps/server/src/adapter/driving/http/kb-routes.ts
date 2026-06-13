import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requirePermission, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";
import { createKbArticle, type KbArticle } from "../../../domain/entity/kb.js";

// ── Repository interface ─────────────────────────────────────────────────────

interface KbRepository {
  findAll(filter?: { status?: string; category?: string; q?: string }): Promise<KbArticle[]>;
  findById(id: string): Promise<KbArticle | null>;
  findBySlug(slug: string): Promise<KbArticle | null>;
  create(article: KbArticle): Promise<KbArticle>;
  update(article: KbArticle): Promise<KbArticle>;
  delete(id: string): Promise<void>;
  incrementHelpful(id: string, yes: boolean): Promise<void>;
  distinctCategories(): Promise<string[]>;
}

// ── Validation schemas ───────────────────────────────────────────────────────

const createKbSchema = z.object({
  title: z.string(),
  slug: z.string().optional(),
  category: z.string(),
  summary: z.string().optional(),
  body: z.string(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["published", "draft"]).optional(),
  order: z.number().optional(),
});

const helpfulSchema = z.object({
  helpful: z.boolean(),
});

// ── Route factory ────────────────────────────────────────────────────────────

export function createKbRoutes(repo: KbRepository, tokenService: TokenService): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  // GET / — PUBLIC list
  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter: { status?: string; category?: string; q?: string } = {
        status: (req.query["status"] as string) ?? "published",
      };
      if (req.query["category"]) filter.category = req.query["category"] as string;
      if (req.query["q"]) filter.q = req.query["q"] as string;
      const items = await repo.findAll(filter);
      res.json({ items, total: items.length });
    } catch (err) {
      next(err);
    }
  });

  // GET /categories — PUBLIC distinct published categories
  router.get("/categories", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await repo.distinctCategories();
      res.json({ categories });
    } catch (err) {
      next(err);
    }
  });

  // GET /slug/:slug — PUBLIC single article by slug
  router.get("/slug/:slug", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await repo.findBySlug(req.params.slug!);
      if (!item) throw new NotFoundError("kb", req.params.slug);
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  // POST /:id/helpful — PUBLIC vote
  router.post("/:id/helpful", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = helpfulSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());
      await repo.incrementHelpful(req.params.id!, parsed.data.helpful);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  // POST / — create (kb:create)
  router.post("/", auth, requirePermission("kb:create"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createKbSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());
      const data = parsed.data;
      const article = createKbArticle({
        title: data.title,
        slug: data.slug ?? data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        category: data.category,
        summary: data.summary ?? "",
        body: data.body,
        tags: data.tags ?? [],
        status: data.status ?? "draft",
        helpfulYes: 0,
        helpfulNo: 0,
        order: data.order ?? 0,
      });
      const created = await repo.create(article);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  // PATCH /:id — update (kb:update)
  router.patch("/:id", auth, requirePermission("kb:update"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await repo.findById(req.params.id!);
      if (!existing) throw new NotFoundError("kb", req.params.id);
      const updated = await repo.update({ ...existing, ...req.body, id: existing.id });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /:id — delete (kb:delete)
  router.delete("/:id", auth, requirePermission("kb:delete"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      await repo.delete(req.params.id!);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
