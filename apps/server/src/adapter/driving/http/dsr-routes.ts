import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requirePermission, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";
import { rateLimit } from "../../../middleware/rate-limit.js";
import { createDsrRequest, type DsrRequest } from "../../../domain/entity/dsr.js";

// ── Repository interface ─────────────────────────────────────────────────────

interface DsrRepository {
  create(request: DsrRequest): Promise<DsrRequest>;
  findById(id: string): Promise<DsrRequest | null>;
  findByUser(userId: string): Promise<DsrRequest[]>;
  findAll(filter?: { status?: string }): Promise<DsrRequest[]>;
  update(request: DsrRequest): Promise<DsrRequest>;
}

interface UserEmailLookup {
  findById(id: string): Promise<{ email?: string } | null>;
}

// ── Validation schemas ───────────────────────────────────────────────────────

const createDsrSchema = z.object({
  type: z.enum(["export", "erasure"]),
  // email from body is ignored — always bound to the authenticated account.
});

const updateDsrSchema = z.object({
  status: z.enum(["received", "in_progress", "completed", "rejected"]).optional(),
  notes: z.string().optional(),
  /** Required when marking completed — proves an export URL or erasure evidence. */
  fulfillmentNote: z.string().min(8).max(2000).optional(),
});

// ── Route factory ────────────────────────────────────────────────────────────

export function createDsrRoutes(
  repo: DsrRepository,
  tokenService: TokenService,
  users: UserEmailLookup,
): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);
  const createLimit = rateLimit("dsr-create", {
    max: 5,
    windowMs: 60 * 60 * 1000,
    message: "Too many privacy requests. Please try again later.",
  });

  // POST / — authenticated user creates own request
  router.post("/", auth, createLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createDsrSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());

      const account = await users.findById(req.userId!);
      const email = account?.email?.trim().toLowerCase() ?? "";
      if (!email) throw new ValidationError("Account email is required to file a privacy request", {});

      const request = createDsrRequest({
        userId: req.userId!,
        email,
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

      const existing = await repo.findById(String(req.params.id));
      if (!existing) throw new NotFoundError("dsr", String(req.params.id));

      if (parsed.data.status === "completed") {
        const evidence = (parsed.data.fulfillmentNote ?? parsed.data.notes ?? "").trim();
        if (evidence.length < 8) {
          throw new ValidationError(
            "Marking a DSR completed requires a fulfillmentNote describing the export package or erasure evidence",
            {},
          );
        }
      }

      const now = new Date();
      const { fulfillmentNote, ...rest } = parsed.data;
      const notes = fulfillmentNote
        ? [existing.notes, rest.notes, `Fulfillment: ${fulfillmentNote}`].filter(Boolean).join("\n")
        : rest.notes ?? existing.notes;

      const updated: DsrRequest = {
        ...existing,
        ...rest,
        notes,
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
