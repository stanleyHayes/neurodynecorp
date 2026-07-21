import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requireRole, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";
import {
  createGlossaryTerm,
  slugifyTerm,
  GLOSSARY_STATUSES,
  type GlossaryTerm,
  type GlossaryStatus,
} from "../../../domain/entity/glossary.js";

interface GlossaryRepository {
  findAll(filter?: { status?: string; category?: string; q?: string }): Promise<GlossaryTerm[]>;
  findById(id: string): Promise<GlossaryTerm | null>;
  findBySlug(slug: string): Promise<GlossaryTerm | null>;
  create(t: GlossaryTerm): Promise<GlossaryTerm>;
  update(t: GlossaryTerm): Promise<GlossaryTerm>;
  delete(id: string): Promise<void>;
  distinctCategories(): Promise<string[]>;
}

const statusEnum = z.enum(GLOSSARY_STATUSES as [GlossaryStatus, ...GlossaryStatus[]]);

const createSchema = z.object({
  term: z.string().min(1).max(200),
  slug: z.string().max(200).optional(),
  definition: z.string().min(1).max(8000),
  category: z.string().max(120).optional(),
  aliases: z.array(z.string().max(120)).max(20).optional(),
  status: statusEnum.optional(),
  order: z.number().int().optional(),
});

const updateSchema = z.object({
  term: z.string().min(1).max(200).optional(),
  slug: z.string().max(200).optional(),
  definition: z.string().min(1).max(8000).optional(),
  category: z.string().max(120).optional(),
  aliases: z.array(z.string().max(120)).max(20).optional(),
  status: statusEnum.optional(),
  order: z.number().int().optional(),
});

export function createGlossaryRoutes(repo: GlossaryRepository, tokenService: TokenService): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  // GET / — PUBLIC list. Always published-only (drafts are never served here, whatever ?status= says);
  // supports ?category= and ?q=.
  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter: { status?: string; category?: string; q?: string } = { status: "published" };
      if (req.query["category"]) filter.category = String(req.query["category"]);
      if (req.query["q"]) filter.q = String(req.query["q"]);
      const items = await repo.findAll(filter);
      res.json({ items, total: items.length });
    } catch (err) {
      next(err);
    }
  });

  // GET /all — STAFF list including drafts, for admin management. Optional ?status=/?category=/?q=.
  router.get("/all", auth, requireRole("admin", "project_manager"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter: { status?: string; category?: string; q?: string } = {};
      if (req.query["status"]) filter.status = String(req.query["status"]);
      if (req.query["category"]) filter.category = String(req.query["category"]);
      if (req.query["q"]) filter.q = String(req.query["q"]);
      const items = await repo.findAll(filter);
      res.json({ items, total: items.length });
    } catch (err) {
      next(err);
    }
  });

  // GET /categories — PUBLIC distinct published categories.
  router.get("/categories", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await repo.distinctCategories();
      res.json({ categories });
    } catch (err) {
      next(err);
    }
  });

  // GET /slug/:slug — PUBLIC single PUBLISHED term by slug (drafts return 404).
  router.get("/slug/:slug", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await repo.findBySlug(String(req.params.slug));
      if (!item || item.status !== "published") throw new NotFoundError("glossary", String(req.params.slug));
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  // POST / — staff only.
  router.post("/", auth, requireRole("admin", "project_manager"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());
      const d = parsed.data;
      const slug = (d.slug && d.slug.trim()) || slugifyTerm(d.term);
      const term = createGlossaryTerm({
        term: d.term,
        slug,
        definition: d.definition,
        category: d.category,
        aliases: d.aliases ?? [],
        status: d.status ?? "draft",
        order: d.order ?? 0,
      });
      const created = await repo.create(term);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  // PATCH /:id — staff only.
  router.patch("/:id", auth, requireRole("admin", "project_manager"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());
      const existing = await repo.findById(String(req.params.id));
      if (!existing) throw new NotFoundError("glossary", String(req.params.id));
      const updated = await repo.update({ ...existing, ...parsed.data, id: existing.id });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /:id — staff only.
  router.delete("/:id", auth, requireRole("admin", "project_manager"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await repo.findById(String(req.params.id));
      if (!existing) throw new NotFoundError("glossary", String(req.params.id));
      await repo.delete(existing.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
