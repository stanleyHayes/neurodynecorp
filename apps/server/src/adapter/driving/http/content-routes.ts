import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import {
  authMiddleware,
  optionalAuthMiddleware,
  requirePermission,
  type TokenService,
} from "../../../middleware/auth.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";

// ── Generic service interface ──────────────────────────────────────────────

interface ContentService<T> {
  findAll(filter?: Record<string, any>): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(item: T): Promise<T>;
  update(item: T): Promise<T>;
  delete(id: string): Promise<void>;
}

/** Status values anonymous visitors may see for a given resource. */
function publicStatusesFor(resource: string): string[] | null {
  switch (resource) {
    case "blog":
    case "portfolio":
      return ["published"];
    case "testimonials":
      return ["active"];
    case "services":
      return ["active", "coming_soon"];
    default:
      return null;
  }
}

function canReadDrafts(req: Request, resource: string): boolean {
  return !!req.userId && (req.userPermissions ?? []).includes(`${resource}:read`);
}

// ── Generic CRUD route builder ─────────────────────────────────────────────

function createCrudRoutes<T extends { id: string; status?: string }>(
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
  const optionalAuth = optionalAuthMiddleware(tokenService);
  const publicStatuses = publicStatusesFor(resource);

  // GET — list all (optionally public; anonymous forced to published/active)
  const listMiddleware = opts?.publicRead
    ? [optionalAuth]
    : [auth, requirePermission(`${resource}:read`)];

  router.get("/", ...listMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter: Record<string, any> = {};
      for (const key of opts?.filterKeys ?? ["status", "category"]) {
        if (req.query[key]) filter[key] = req.query[key];
      }
      if (opts?.publicRead && publicStatuses && !canReadDrafts(req, resource)) {
        // Ignore client-supplied status — never leak drafts publicly.
        filter.status = publicStatuses.length === 1 ? publicStatuses[0] : { $in: publicStatuses };
        // Mongo repos may not support $in via generic filter — flatten to first
        // public status when only one, otherwise filter in memory below.
        if (publicStatuses.length > 1) {
          delete filter.status;
          const items = (await service.findAll(
            Object.keys(filter).length ? filter : undefined,
          )).filter((i) => publicStatuses.includes(String(i.status ?? "")));
          return res.json({ items, total: items.length });
        }
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
    ? [optionalAuth]
    : [auth, requirePermission(`${resource}:read`)];

  router.get("/:id", ...getMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await service.findById(String(req.params.id));
      if (!item) throw new NotFoundError(resource, String(req.params.id));
      if (
        opts?.publicRead &&
        publicStatuses &&
        !canReadDrafts(req, resource) &&
        !publicStatuses.includes(String(item.status ?? ""))
      ) {
        throw new NotFoundError(resource, String(req.params.id));
      }
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  // POST — create
  router.post("/", auth, requirePermission(`${resource}:create`), async (req: Request, res: Response, next: NextFunction) => {
    try {
      let data: unknown = req.body;
      if (opts?.createSchema) {
        const parsed = opts.createSchema.safeParse(req.body);
        if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());
        data = parsed.data;
      }
      const item = opts?.createFn ? opts.createFn(data) : data;
      const created = await service.create(item as T);
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
      let patch: Record<string, unknown> = {};
      if (opts?.updateSchema) {
        const parsed = opts.updateSchema.safeParse(req.body);
        if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());
        patch = parsed.data as Record<string, unknown>;
      } else {
        // Never spread raw req.body — strip identity / audit fields at minimum.
        const {
          id: _id,
          _id: __id,
          createdAt: _createdAt,
          created_at: _created_at,
          updatedAt: _updatedAt,
          updated_at: _updated_at,
          ...rest
        } = req.body as Record<string, unknown>;
        patch = rest;
      }
      const updated = await service.update({
        ...existing,
        ...patch,
        id: existing.id,
        createdAt: (existing as { createdAt?: Date }).createdAt,
        updatedAt: new Date(),
      } as T);
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

const blogUpdateSchema = z
  .object({
    title: z.string().optional(),
    slug: z.string().optional(),
    excerpt: z.string().optional(),
    content: z.string().optional(),
    category: z.string().optional(),
    status: z.enum(["published", "draft", "archived"]).optional(),
    author: z.string().optional(),
    authorId: z.string().optional(),
    readTime: z.string().optional(),
    tags: z.array(z.string()).optional(),
    coverImage: z.string().optional(),
  })
  .strict();

const blogCreateSchema = z
  .object({
    title: z.string().min(1),
    slug: z.string().optional(),
    excerpt: z.string().optional().default(""),
    content: z.string().optional().default(""),
    category: z.string().optional().default("general"),
    status: z.enum(["published", "draft", "archived"]).optional(),
    author: z.string().optional().default(""),
    authorId: z.string().optional().default(""),
    readTime: z.string().optional(),
    tags: z.array(z.string()).optional(),
    coverImage: z.string().optional(),
  })
  .strict();

const testimonialUpdateSchema = z
  .object({
    name: z.string().optional(),
    role: z.string().optional(),
    company: z.string().optional(),
    content: z.string().optional(),
    rating: z.number().optional(),
    status: z.enum(["active", "hidden"]).optional(),
    avatarColor: z.string().optional(),
  })
  .strict();

const testimonialCreateSchema = z
  .object({
    name: z.string().min(1),
    role: z.string().optional().default(""),
    company: z.string().optional().default(""),
    content: z.string().min(1),
    rating: z.number().min(1).max(5).optional().default(5),
    status: z.enum(["active", "hidden"]).optional(),
    avatarColor: z.string().optional().default("#6C63FF"),
  })
  .strict();

const serviceUpdateSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
    features: z.array(z.string()).optional(),
    status: z.enum(["active", "coming_soon", "inactive"]).optional(),
    projectCount: z.number().optional(),
    color: z.string().optional(),
    order: z.number().optional(),
  })
  .strict();

const serviceCreateSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().optional().default(""),
    icon: z.string().optional().default("code"),
    features: z.array(z.string()).optional(),
    status: z.enum(["active", "coming_soon", "inactive"]).optional(),
    projectCount: z.number().optional(),
    color: z.string().optional().default("#6C63FF"),
    order: z.number().optional(),
  })
  .strict();

const caseStudyUpdateSchema = z
  .object({
    title: z.string().optional(),
    slug: z.string().optional(),
    client: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    description: z.string().optional(),
    impact: z.string().optional(),
    results: z.array(z.string()).optional(),
    status: z.enum(["published", "draft"]).optional(),
    coverImage: z.string().optional(),
    color: z.string().optional(),
    sector: z.string().optional(),
    serviceLine: z.string().optional(),
    scale: z.string().optional(),
    stage: z.string().optional(),
    brief: z.string().optional(),
    constraints: z.array(z.string()).optional(),
    architecture: z.string().optional(),
    shipped: z.array(z.string()).optional(),
    retained: z.array(z.string()).optional(),
    learnt: z.array(z.string()).optional(),
  })
  .strict();

const caseStudyCreateSchema = z
  .object({
    title: z.string().min(1),
    slug: z.string().optional(),
    client: z.string().optional().default(""),
    category: z.string().optional().default("general"),
    tags: z.array(z.string()).optional(),
    description: z.string().optional().default(""),
    impact: z.string().optional().default(""),
    results: z.array(z.string()).optional(),
    status: z.enum(["published", "draft"]).optional(),
    coverImage: z.string().optional(),
    color: z.string().optional().default("#6C63FF"),
    sector: z.string().optional(),
    serviceLine: z.string().optional(),
    scale: z.string().optional(),
    stage: z.string().optional(),
    brief: z.string().optional(),
    constraints: z.array(z.string()).optional(),
    architecture: z.string().optional(),
    shipped: z.array(z.string()).optional(),
    retained: z.array(z.string()).optional(),
    learnt: z.array(z.string()).optional(),
  })
  .strict();

const contactUpdateSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
    subject: z.string().optional(),
    projectType: z.string().optional(),
    message: z.string().optional(),
    status: z.enum(["new", "read", "replied", "archived"]).optional(),
  })
  .strict();

const contactCreateSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional().default(""),
    company: z.string().optional().default(""),
    subject: z.string().optional().default(""),
    projectType: z.string().optional().default(""),
    message: z.string().min(1),
    status: z.enum(["new", "read", "replied", "archived"]).optional(),
  })
  .strict();

export function createBlogRoutes(
  service: ContentService<any> & { findBySlug?: (slug: string) => Promise<any | null> },
  tokenService: TokenService,
) {
  const optionalAuth = optionalAuthMiddleware(tokenService);
  return createCrudRoutes("blog", service, tokenService, {
    createSchema: blogCreateSchema,
    createFn: (data) => createBlogPost({
      title: data.title,
      slug: data.slug ?? data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      excerpt: data.excerpt ?? "",
      content: data.content ?? "",
      category: data.category ?? "general",
      status: data.status ?? "draft",
      author: data.author ?? "",
      authorId: data.authorId ?? "",
      tags: data.tags ?? [],
      readTime: data.readTime ?? "5 min",
      coverImage: data.coverImage,
    }),
    updateSchema: blogUpdateSchema,
    publicRead: true,
    filterKeys: ["status", "category"],
    extraRoutes: service.findBySlug
      ? (router) => {
          router.get("/slug/:slug", optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
            try {
              const item = await service.findBySlug!(String(req.params.slug));
              if (!item || (item.status !== "published" && !canReadDrafts(req, "blog"))) {
                throw new NotFoundError("blog", String(req.params.slug));
              }
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
    createSchema: testimonialCreateSchema,
    createFn: (data) => createTestimonial({
      name: data.name,
      role: data.role ?? "",
      company: data.company ?? "",
      content: data.content,
      rating: data.rating ?? 5,
      status: data.status ?? "active",
      avatarColor: data.avatarColor ?? "#6C63FF",
    }),
    updateSchema: testimonialUpdateSchema,
    publicRead: true,
  });
}

export function createServiceItemRoutes(service: ContentService<any>, tokenService: TokenService) {
  return createCrudRoutes("services", service, tokenService, {
    createSchema: serviceCreateSchema,
    createFn: (data) => createServiceItem({
      title: data.title,
      description: data.description ?? "",
      icon: data.icon ?? "code",
      status: data.status ?? "active",
      features: data.features ?? [],
      order: data.order ?? 0,
      projectCount: data.projectCount ?? 0,
      color: data.color ?? "#6C63FF",
    }),
    updateSchema: serviceUpdateSchema,
    publicRead: true,
  });
}

export function createCaseStudyRoutes(
  service: ContentService<any> & { findBySlug?: (slug: string) => Promise<any | null> },
  tokenService: TokenService,
) {
  const optionalAuth = optionalAuthMiddleware(tokenService);
  return createCrudRoutes("portfolio", service, tokenService, {
    createSchema: caseStudyCreateSchema,
    createFn: (data) => createCaseStudy({
      title: data.title,
      slug: data.slug ?? data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      client: data.client ?? "",
      category: data.category ?? "general",
      status: data.status ?? "draft",
      tags: data.tags ?? [],
      results: data.results ?? [],
      description: data.description ?? "",
      impact: data.impact ?? "",
      coverImage: data.coverImage,
      color: data.color ?? "#6C63FF",
      sector: data.sector,
      serviceLine: data.serviceLine,
      scale: data.scale,
      stage: data.stage,
      brief: data.brief,
      constraints: data.constraints,
      architecture: data.architecture,
      shipped: data.shipped,
      retained: data.retained,
      learnt: data.learnt,
    }),
    updateSchema: caseStudyUpdateSchema,
    publicRead: true,
    filterKeys: ["status", "category", "sector", "serviceLine", "scale", "stage"],
    extraRoutes: service.findBySlug
      ? (router) => {
          router.get("/slug/:slug", optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
            try {
              const item = await service.findBySlug!(String(req.params.slug));
              if (!item || (item.status !== "published" && !canReadDrafts(req, "portfolio"))) {
                throw new NotFoundError("portfolio", String(req.params.slug));
              }
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
    createSchema: contactCreateSchema,
    createFn: (data) => createContactSubmission({
      name: data.name,
      email: data.email,
      phone: data.phone ?? "",
      company: data.company ?? "",
      subject: data.subject ?? "",
      projectType: data.projectType ?? "",
      message: data.message,
      status: data.status ?? "new",
    }),
    updateSchema: contactUpdateSchema,
    publicRead: false,
  });
}
