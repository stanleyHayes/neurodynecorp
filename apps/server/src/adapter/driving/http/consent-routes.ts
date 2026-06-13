import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requirePermission, type TokenService } from "../../../middleware/auth.js";
import { ValidationError } from "../../../middleware/error-handler.js";
import { createConsentRecord } from "../../../domain/entity/consent.js";
import type { MongoConsentRepository } from "../../driven/mongodb/consent-repository.js";

// ── Validation schemas ─────────────────────────────────────────────────────

const recordConsentSchema = z.object({
  anonymousId: z.string().min(1),
  categories: z.object({
    necessary: z.boolean().default(true),
    analytics: z.boolean(),
    marketing: z.boolean(),
  }),
  policyVersion: z.string().default("1.0"),
});

// ── Route factory ──────────────────────────────────────────────────────────

export function createConsentRoutes(repo: MongoConsentRepository, tokenService: TokenService): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  // POST /api/v1/consent — PUBLIC: record consent
  router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = recordConsentSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid data", parsed.error.flatten());
      }

      const record = createConsentRecord({
        anonymousId: parsed.data.anonymousId,
        userId: req.userId,
        categories: parsed.data.categories,
        policyVersion: parsed.data.policyVersion,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });

      const created = await repo.create(record);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/consent/current — PUBLIC: latest record for anonymousId
  router.get("/current", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const anonymousId = req.query.anonymousId as string | undefined;
      if (!anonymousId) {
        res.json({ categories: null });
        return;
      }
      const record = await repo.findLatestByAnon(anonymousId);
      if (!record) {
        res.json({ categories: null });
        return;
      }
      res.json(record);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/consent — admin list
  router.get("/", auth, requirePermission("consent:read"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 200;
      const items = await repo.findAll({ limit });
      res.json({ items, total: items.length });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
