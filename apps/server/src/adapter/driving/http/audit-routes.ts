import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requirePermission, type TokenService } from "../../../middleware/auth.js";
import { ValidationError } from "../../../middleware/error-handler.js";
import { createAuditEntry, type AuditEntry } from "../../../domain/entity/audit.js";
import type { AuditFilter } from "../../../adapter/driven/mongodb/audit-repository.js";

// ── Repository interface ───────────────────────────────────────────────────

export interface AuditRepository {
  create(entry: AuditEntry): Promise<AuditEntry>;
  findAll(filter?: AuditFilter): Promise<AuditEntry[]>;
  count(filter?: AuditFilter): Promise<number>;
}

// ── Validation schemas ─────────────────────────────────────────────────────

const listAuditSchema = z.object({
  userId: z.string().optional(),
  resource: z.string().optional(),
  method: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

const exportAuditSchema = z.object({
  format: z.enum(["csv", "json"]).optional().default("json"),
});

// ── Route factory ──────────────────────────────────────────────────────────

export function createAuditRoutes(repo: AuditRepository, tokenService: TokenService): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  // GET /api/v1/audit
  router.get("/", auth, requirePermission("audit:read"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = listAuditSchema.safeParse(req.query);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());

      const filter: AuditFilter = parsed.data;
      const [items, total] = await Promise.all([repo.findAll(filter), repo.count(filter)]);

      res.json({ items, total });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/audit/me — any authenticated user (incl. clients) exports THEIR OWN activity trail.
  // The userId filter is forced server-side to the caller's id; a client-supplied userId is ignored,
  // so a client can never read another user's events (no IDOR, no audit:read permission required).
  router.get("/me", auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        res.json({ items: [], total: 0 });
        return;
      }
      const parsed = listAuditSchema.safeParse(req.query);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());
      // Take only the time/limit facets from the query — NEVER the userId/resource/method facets.
      const filter: AuditFilter = {
        userId: req.userId,
        from: parsed.data.from,
        to: parsed.data.to,
        limit: parsed.data.limit ?? 500,
      };
      const [items, total] = await Promise.all([repo.findAll(filter), repo.count(filter)]);
      res.json({ items, total });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/audit/export
  router.get("/export", auth, requirePermission("audit:read"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = exportAuditSchema.safeParse(req.query);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());

      const items = await repo.findAll({});

      if (parsed.data.format === "csv") {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=audit-log.csv");
        const header = "timestamp,userId,method,path,statusCode,ip";
        const rows = items.map((e) =>
          [
            e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt,
            e.userId ?? "",
            e.method,
            e.path,
            e.statusCode ?? "",
            e.ip ?? "",
          ]
            .map((v) => String(v).replace(/"/g, '""'))
            .map((v) => (/[",\n]/.test(v) ? `"${v}"` : v))
            .join(","),
        );
        res.send([header, ...rows].join("\n"));
        return;
      }

      res.json(items);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

// ── Audit recorder middleware ──────────────────────────────────────────────

export function createAuditRecorder(repo: AuditRepository) {
  const mutating = new Set(["POST", "PUT", "PATCH", "DELETE"]);

  return function auditRecorder(req: Request, res: Response, next: NextFunction): void {
    if (mutating.has(req.method)) {
      res.on("finish", () => {
        repo
          .create(
            createAuditEntry({
              userId: req.userId,
              userRole: req.userRole,
              action: req.method + " " + req.path,
              method: req.method,
              path: req.originalUrl,
              statusCode: res.statusCode,
              ip: req.ip,
              userAgent: req.headers["user-agent"],
            }),
          )
          .catch(() => {});
      });
    }
    next();
  };
}
