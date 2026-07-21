import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requirePermission, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";

// ── Generic service interface ──────────────────────────────────────────────

interface ContentService<T> {
  findAll(filter?: Record<string, any>): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(item: T): Promise<T>;
  update(item: T): Promise<T>;
  delete(id: string): Promise<void>;
}

// ── Generic CRUD route builder ─────────────────────────────────────────────

function createCrudRoutes<T extends { id: string }>(
  resource: string,
  service: ContentService<T>,
  tokenService: TokenService,
  opts?: {
    createSchema?: z.ZodSchema;
    updateSchema?: z.ZodSchema;
    createFn?: (data: any) => T;
    publicRead?: boolean;
    filterKeys?: string[];
    /** Extra routes registered before the generic /:id catch-all */
    extraRoutes?: (router: Router) => void;
  },
): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  // GET — list all (optionally public)
  const listMiddleware = opts?.publicRead
    ? []
    : [auth, requirePermission(`${resource}:read`)];

  router.get("/", ...listMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter: Record<string, any> = {};
      for (const key of opts?.filterKeys ?? ["status", "category"]) {
        if (req.query[key]) filter[key] = req.query[key];
      }
      const items = await service.findAll(Object.keys(filter).length ? filter : undefined);
      res.json({ items, total: items.length });
    } catch (err) {
      next(err);
    }
  });

  // Register extra routes before the generic /:id catch-all
  opts?.extraRoutes?.(router);

  // GET /:id — single item (optionally public)
  const getMiddleware = opts?.publicRead
    ? []
    : [auth, requirePermission(`${resource}:read`)];

  router.get("/:id", ...getMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await service.findById(String(req.params.id));
      if (!item) throw new NotFoundError(resource, String(req.params.id));
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  // POST — create
  router.post("/", auth, requirePermission(`${resource}:create`), async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (opts?.createSchema) {
        const parsed = opts.createSchema.safeParse(req.body);
        if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());
      }
      const item = opts?.createFn ? opts.createFn(req.body) : req.body;
      const created = await service.create(item);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  // PATCH /:id — update
  router.patch("/:id", auth, requirePermission(`${resource}:update`), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await service.findById(String(req.params.id));
      if (!existing) throw new NotFoundError(resource, String(req.params.id));
      const updated = await service.update({ ...existing, ...req.body, id: existing.id });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /:id
  router.delete("/:id", auth, requirePermission(`${resource}:delete`), async (req: Request, res: Response, next: NextFunction) => {
    try {
      await service.delete(String(req.params.id));
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}

// ── Exports ────────────────────────────────────────────────────────────────

import {
  createBlogPost,
  createTestimonial,
  createServiceItem,
  createCaseStudy,
  createContactSubmission,
} from "../../../domain/entity/content.js";

export function createBlogRoutes(
  service: ContentService<any> & { findBySlug?: (slug: string) => Promise<any | null> },
  tokenService: TokenService,
) {
  return createCrudRoutes("blog", service, tokenService, {
    createFn: (data) => createBlogPost({
      ...data,
      slug: data.slug ?? data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      status: data.status ?? "draft",
      tags: data.tags ?? [],
      readTime: data.readTime ?? "5 min",
    }),
    publicRead: true,
    filterKeys: ["status", "category"],
    extraRoutes: service.findBySlug
      ? (router) => {
          router.get("/slug/:slug", async (req: Request, res: Response, next: NextFunction) => {
            try {
              const item = await service.findBySlug!(String(req.params.slug));
              if (!item) throw new NotFoundError("blog", String(req.params.slug));
              res.json(item);
            } catch (err) {
              next(err);
            }
          });
        }
      : undefined,
  });
}

export function createTestimonialRoutes(service: ContentService<any>, tokenService: TokenService) {
  return createCrudRoutes("testimonials", service, tokenService, {
    createFn: (data) => createTestimonial({ ...data, status: data.status ?? "active" }),
    publicRead: true,
  });
}

export function createServiceItemRoutes(service: ContentService<any>, tokenService: TokenService) {
  return createCrudRoutes("services", service, tokenService, {
    createFn: (data) => createServiceItem({ ...data, status: data.status ?? "active", features: data.features ?? [], order: data.order ?? 0 }),
    publicRead: true,
  });
}

export function createCaseStudyRoutes(
  service: ContentService<any> & { findBySlug?: (slug: string) => Promise<any | null> },
  tokenService: TokenService,
) {
  return createCrudRoutes("portfolio", service, tokenService, {
    createFn: (data) => createCaseStudy({
      ...data,
      slug: data.slug ?? data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      status: data.status ?? "draft",
      tags: data.tags ?? [],
      results: data.results ?? [],
    }),
    publicRead: true,
    filterKeys: ["status", "category", "sector", "serviceLine", "scale", "stage"],
    extraRoutes: service.findBySlug
      ? (router) => {
          router.get("/slug/:slug", async (req: Request, res: Response, next: NextFunction) => {
            try {
              const item = await service.findBySlug!(String(req.params.slug));
              if (!item) throw new NotFoundError("portfolio", String(req.params.slug));
              res.json(item);
            } catch (err) {
              next(err);
            }
          });
        }
      : undefined,
  });
}

export function createContactSubmissionRoutes(service: ContentService<any>, tokenService: TokenService) {
  return createCrudRoutes("contact_submissions", service, tokenService, {
    createFn: (data) => createContactSubmission({ ...data, status: data.status ?? "new" }),
    publicRead: false,
  });
}
