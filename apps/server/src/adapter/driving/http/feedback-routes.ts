import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requirePermission, type TokenService } from "../../../middleware/auth.js";
import { ValidationError } from "../../../middleware/error-handler.js";
import { createFeedback, type Feedback } from "../../../domain/entity/feedback.js";

// ── Repository interface ─────────────────────────────────────────────────────

interface FeedbackRepository {
  create(feedback: Feedback): Promise<Feedback>;
  findAll(filter?: { type?: string; limit?: number }): Promise<Feedback[]>;
}

// ── Validation schemas ───────────────────────────────────────────────────────

const createFeedbackSchema = z.object({
  type: z.enum(["nps", "general", "bug", "idea"]),
  score: z.number().min(0).max(10).optional(),
  message: z.string().max(4000).optional(),
  email: z.string().email().optional(),
  page: z.string().optional(),
});

// ── Route factory ────────────────────────────────────────────────────────────

export function createFeedbackRoutes(repo: FeedbackRepository, tokenService: TokenService): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  // POST / — PUBLIC: submit feedback
  router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createFeedbackSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());

      const feedback = createFeedback({ ...parsed.data, userId: req.userId });
      const created = await repo.create(feedback);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  // GET / — admin list
  router.get("/", auth, requirePermission("feedback:read"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter: { type?: string; limit?: number } = {};
      if (req.query.type) filter.type = String(req.query.type);
      if (req.query.limit) filter.limit = Number(req.query.limit);

      const items = await repo.findAll(Object.keys(filter).length ? filter : undefined);
      res.json({ items, total: items.length });
    } catch (err) {
      next(err);
    }
  });

  // GET /stats — NPS stats over type==="nps" feedback with a score
  router.get("/stats", auth, requirePermission("feedback:read"), async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const all = await repo.findAll({ type: "nps" });
      const scored = all.filter((f) => typeof f.score === "number");

      const total = scored.length;
      let promoters = 0;
      let detractors = 0;
      let passives = 0;
      let sum = 0;

      for (const f of scored) {
        const score = f.score!;
        sum += score;
        if (score >= 9) promoters++;
        else if (score <= 6) detractors++;
        else passives++;
      }

      const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;
      const averageScore = total > 0 ? sum / total : 0;

      res.json({ total, promoters, passives, detractors, nps, averageScore });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
