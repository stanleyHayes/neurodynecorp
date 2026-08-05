import { Router } from "express";
import { z } from "zod";
import { randomBytes, createHash } from "crypto";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requirePermission, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";
import { createApiKey, type ApiKey } from "../../../domain/entity/api-key.js";
import { ALL_PERMISSIONS } from "../../../domain/entity/permission.js";
import type { MongoApiKeyRepository } from "../../driven/mongodb/api-key-repository.js";

const ALLOWED_SCOPES = new Set<string>(ALL_PERMISSIONS);

// ── Validation schemas ─────────────────────────────────────────────────────

const createApiKeySchema = z.object({
  name: z.string().min(1),
  scopes: z.array(z.string()).optional(),
});

// ── Serialization ──────────────────────────────────────────────────────────
// Never expose the hashed key. Provide a masked display for the listing.

function toMetadata(k: ApiKey) {
  const { hashedKey: _hashedKey, ...rest } = k;
  return { ...rest, display: "ndk_" + k.prefix + "..." };
}

// ── Route factory ──────────────────────────────────────────────────────────

export function createApiKeyRoutes(repo: MongoApiKeyRepository, tokenService: TokenService): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  router.use(auth);

  // GET /api/v1/api-keys — list owner's keys (without hashedKey)
  router.get("/", requirePermission("apikeys:read"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const keys = await repo.listByOwner(req.userId!);
      const items = keys.map(toMetadata);
      res.status(200).json({ items, total: items.length });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/v1/api-keys — create a new key; plaintext returned ONCE
  router.post("/", requirePermission("apikeys:create"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createApiKeySchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid data", parsed.error.flatten());
      }

      const scopes = parsed.data.scopes ?? [];
      const invalid = scopes.filter((s) => !ALLOWED_SCOPES.has(s));
      if (invalid.length > 0) {
        throw new ValidationError("Invalid API key scopes", { invalid });
      }
      // Keys cannot exceed the caller's own permissions.
      const callerPerms = new Set(req.userPermissions ?? []);
      const overreach = scopes.filter((s) => !callerPerms.has(s));
      if (overreach.length > 0) {
        throw new ValidationError("Scopes exceed caller permissions", { overreach });
      }

      const raw = "ndk_" + randomBytes(24).toString("hex");
      const prefix = raw.slice(4, 12);
      const hashedKey = createHash("sha256").update(raw).digest("hex");

      const apiKey = createApiKey({
        ownerId: req.userId!,
        name: parsed.data.name,
        prefix,
        hashedKey,
        scopes,
      });

      const created = await repo.create(apiKey);
      res.status(201).json({ ...toMetadata(created), key: raw });
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/v1/api-keys/:id — soft-revoke (set revokedAt)
  router.delete("/:id", requirePermission("apikeys:delete"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await repo.getById(String(req.params.id));
      if (!existing || existing.ownerId !== req.userId!) {
        throw new NotFoundError("apikeys", String(req.params.id));
      }
      await repo.update({ ...existing, revokedAt: new Date(), updatedAt: new Date() });
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
