import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requirePermission, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";
import { createDsrRequest, type DsrRequest } from "../../../domain/entity/dsr.js";

// ── Repository interface ─────────────────────────────────────────────────────

interface DsrRepository {
  create(request: DsrRequest): Promise<DsrRequest>;
  findById(id: string): Promise<DsrRequest | null>;
  findByUser(userId: string): Promise<DsrRequest[]>;
  findAll(filter?: { status?: string }): Promise<DsrRequest[]>;
  update(request: DsrRequest): Promise<DsrRequest>;
}

// ── Validation schemas ───────────────────────────────────────────────────────

const createDsrSchema = z.object({
  type: z.enum(["export", "erasure"]),
  email: z.string().email().optional(),
});

const updateDsrSchema = z.object({
  status: z.enum(["received", "in_progress", "completed", "rejected"]).optional(),
  notes: z.string().optional(),
});

// ── Route factory ────────────────────────────────────────────────────────────

export function createDsrRoutes(repo: DsrRepository, tokenService: TokenService): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  // POST / — authenticated user creates own request
  router.post("/", auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createDsrSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());

      const request = createDsrRequest({
        userId: req.userId!,
        email: parsed.data.email ?? "",
        type: parsed.data.type,
        status: "received",
      });
      const created = await repo.create(request);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  // GET /mine — authenticated user lists own requests
  router.get("/mine", auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await repo.findByUser(req.userId!);
      res.json({ items, total: items.length });
    } catch (err) {
      next(err);
    }
  });

  // GET / — admin list (optional ?status)
  router.get("/", auth, requirePermission("dsr:read"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter: { status?: string } = {};
      if (req.query.status) filter.status = req.query.status as string;
      const items = await repo.findAll(Object.keys(filter).length ? filter : undefined);
      res.json({ items, total: items.length });
    } catch (err) {
      next(err);
    }
  });

  // PATCH /:id — admin update status/notes
  router.patch("/:id", auth, requirePermission("dsr:update"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateDsrSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());

      const existing = await repo.findById(req.params.id!);
      if (!existing) throw new NotFoundError("dsr", req.params.id);

      const now = new Date();
      const updated: DsrRequest = {
        ...existing,
        ...parsed.data,
        id: existing.id,
        updatedAt: now,
      };
      if (parsed.data.status === "completed") updated.completedAt = now;

      const result = await repo.update(updated);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
