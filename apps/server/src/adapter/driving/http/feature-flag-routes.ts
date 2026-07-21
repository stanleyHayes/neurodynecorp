import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requirePermission, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";
import { createFeatureFlag } from "../../../domain/entity/feature-flag.js";
import type { FeatureFlag } from "../../../domain/entity/feature-flag.js";
import type { MongoFeatureFlagRepository } from "../../driven/mongodb/feature-flag-repository.js";

const MAINTENANCE_KEY = "maintenance_mode";

// ── Validation schemas ───────────────────────────────────────────────────────

const createFlagSchema = z.object({
  key: z.string().min(1),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
  audience: z.string().optional(),
});

const updateFlagSchema = z.object({
  key: z.string().min(1).optional(),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
  rolloutPercentage: z.number().min(0).max(100).optional(),
  audience: z.string().optional(),
});

// ── Route factory ────────────────────────────────────────────────────────────

export function createFeatureFlagRoutes(repo: MongoFeatureFlagRepository, tokenService: TokenService): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  // GET / — PUBLIC: map of enabled flags + maintenance state
  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const all = await repo.findAll();
      const flags: { [key: string]: boolean } = {};
      let maintenance: { enabled: boolean; message?: string } = { enabled: false };

      for (const flag of all) {
        if (flag.enabled) flags[flag.key] = true;
        if (flag.key === MAINTENANCE_KEY) {
          maintenance = { enabled: flag.enabled, message: flag.description };
        }
      }

      res.json({ flags, maintenance });
    } catch (err) {
      next(err);
    }
  });

  // GET /all — full list of flag objects
  router.get("/all", auth, requirePermission("feature_flags:read"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await repo.findAll();
      res.json({ items, total: items.length });
    } catch (err) {
      next(err);
    }
  });

  // POST / — create
  router.post("/", auth, requirePermission("feature_flags:create"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createFlagSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());

      const flag = createFeatureFlag({
        key: parsed.data.key,
        description: parsed.data.description,
        enabled: parsed.data.enabled ?? false,
        rolloutPercentage: parsed.data.rolloutPercentage ?? 0,
        audience: parsed.data.audience,
      });
      const created = await repo.create(flag);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  // PATCH /:id — update
  router.patch("/:id", auth, requirePermission("feature_flags:update"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateFlagSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());

      const existing = await repo.findById(String(req.params.id));
      if (!existing) throw new NotFoundError("feature_flags", String(req.params.id));

      const updated: FeatureFlag = { ...existing, ...parsed.data, id: existing.id, updatedAt: new Date() };
      const saved = await repo.update(updated);
      res.json(saved);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /:id
  router.delete("/:id", auth, requirePermission("feature_flags:delete"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      await repo.delete(String(req.params.id));
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}

// ── Maintenance guard middleware ─────────────────────────────────────────────

let cachedMaintenance: FeatureFlag | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 10_000;

export function createMaintenanceGuard(repo: MongoFeatureFlagRepository) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const now = Date.now();
      if (now - cachedAt > CACHE_TTL_MS) {
        cachedMaintenance = await repo.findByKey(MAINTENANCE_KEY);
        cachedAt = now;
      }

      if (cachedMaintenance?.enabled && req.userRole !== "admin") {
        res.status(503).json({
          error: "Service temporarily unavailable for maintenance",
          maintenance: true,
        });
        return;
      }

      next();
    } catch {
      // Fail open: never block traffic on a lookup error.
      next();
    }
  };
}
