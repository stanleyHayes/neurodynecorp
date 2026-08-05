import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requireRole, type TokenService } from "../../../middleware/auth.js";
import { isClientActor } from "../../../middleware/rbac-helpers.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";
import {
  createReport,
  REPORT_TYPES,
  REPORT_STATUSES,
  type Report,
  type ReportType,
  type ReportStatus,
} from "../../../domain/entity/report.js";

interface ReportRepository {
  findByProjectId(projectId: string): Promise<Report[]>;
  findPublishedByProjectId(projectId: string): Promise<Report[]>;
  findById(id: string): Promise<Report | null>;
  create(r: Report): Promise<Report>;
  update(r: Report): Promise<Report>;
  delete(id: string): Promise<void>;
}

type ProjectOwnerLookup = (projectId: string) => Promise<string | null>;

const typeEnum = z.enum(REPORT_TYPES as [ReportType, ...ReportType[]]);
const statusEnum = z.enum(REPORT_STATUSES as [ReportStatus, ...ReportStatus[]]);

// The report URL is rendered as an <a href> on the (untrusted) client surface, so
// it must be an http(s) link — reject javascript:/data:/etc. NOTE: z.string().url()
// is NOT sufficient (the WHATWG URL parser accepts "javascript:..."), hence the
// explicit protocol check.
const httpUrl = z
  .string()
  .max(2000)
  .refine((u) => /^https?:\/\//i.test(u), { message: "URL must start with http:// or https://" });

const createSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1).max(300),
  type: typeEnum.optional(),
  summary: z.string().max(8000).optional(),
  url: httpUrl.optional(),
  period: z.string().max(60).optional(),
  status: statusEnum.optional(),
  // NOTE: publishedAt is server-stamped, never accepted from the client.
});

const updateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  type: typeEnum.optional(),
  summary: z.string().max(8000).optional(),
  url: httpUrl.optional(),
  period: z.string().max(60).optional(),
  status: statusEnum.optional(),
  // NOTE: publishedAt is server-stamped, never accepted from the client.
});

export function createReportRoutes(
  repo: ReportRepository,
  tokenService: TokenService,
  getProjectOwnerId: ProjectOwnerLookup,
): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);
  router.use(auth);

  const isClient = (req: Request): boolean => isClientActor(req.userRole);

  async function assertProjectAccess(req: Request, projectId: string): Promise<void> {
    if (isClient(req)) {
      const ownerId = await getProjectOwnerId(projectId);
      if (!ownerId || ownerId !== req.userId) throw new NotFoundError("project", projectId);
    }
  }

  // POST / — staff only.
  router.post("/", requireRole("admin", "project_manager"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());
      const r = parsed.data;
      const status: ReportStatus = r.status ?? "draft";
      const report = createReport({
        projectId: r.projectId,
        title: r.title,
        type: r.type ?? "other",
        summary: r.summary,
        url: r.url,
        period: r.period,
        status,
        publishedAt: status === "published" ? new Date() : undefined,
        createdById: req.userId!,
      });
      const created = await repo.create(report);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  // GET /?projectId= — owning client (published only) or staff (all).
  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = req.query.projectId ? String(req.query.projectId) : "";
      if (!projectId) throw new ValidationError("projectId is required", {});
      await assertProjectAccess(req, projectId);
      const items = isClient(req)
        ? await repo.findPublishedByProjectId(projectId)
        : await repo.findByProjectId(projectId);
      res.json({ items, total: items.length });
    } catch (err) {
      next(err);
    }
  });

  // GET /:id — owning client (published only) or staff; otherwise indistinguishable 404.
  router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const report = await repo.findById(String(req.params.id));
      if (!report) throw new NotFoundError("report", String(req.params.id));
      try {
        await assertProjectAccess(req, report.projectId);
      } catch {
        throw new NotFoundError("report", String(req.params.id));
      }
      // A client must not be able to read — or even probe the existence of — a draft.
      if (isClient(req) && report.status !== "published") throw new NotFoundError("report", String(req.params.id));
      res.json(report);
    } catch (err) {
      next(err);
    }
  });

  // PATCH /:id — staff only. Stamps publishedAt on first transition to published.
  router.patch("/:id", requireRole("admin", "project_manager"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());
      const existing = await repo.findById(String(req.params.id));
      if (!existing) throw new NotFoundError("report", String(req.params.id));
      const merged: Report = { ...existing, ...parsed.data, id: existing.id };
      // Server-stamp publishedAt the first time a report becomes published.
      if (merged.status === "published" && !merged.publishedAt) merged.publishedAt = new Date();
      const updated = await repo.update(merged);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /:id — staff only.
  router.delete("/:id", requireRole("admin", "project_manager"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await repo.findById(String(req.params.id));
      if (!existing) throw new NotFoundError("report", String(req.params.id));
      await repo.delete(existing.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
