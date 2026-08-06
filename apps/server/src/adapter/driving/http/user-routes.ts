import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requirePermission, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";
import type { User } from "../../../domain/entity/user.js";
import type { UserFilter } from "../../../domain/port/repository.js";

// ---- Validation schemas ----

const listUsersSchema = z.object({
  role: z.enum(["admin", "project_manager", "developer", "qa", "client"]).optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

// Role changes must go through POST /roles/assign (requires roles:update).
// Accepting role here let anyone with team:update escalate to admin.
const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ---- Service interface ----

export interface UserService {
  findAll(filter?: UserFilter): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}

import { toApiUser } from "./user-serializer.js";

// ---- Helpers ----

function sanitizeUser(user: User): Record<string, unknown> {
  return toApiUser(user as unknown as Record<string, unknown>);
}

// ---- Route factory ----

export function createUserRoutes(userService: UserService, tokenService: TokenService): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  router.use(auth);

  // GET /api/v1/users
  router.get("/", requirePermission("team:read"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = listUsersSchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError("Invalid query parameters", parsed.error.flatten());
      }

      const users = await userService.findAll(parsed.data as UserFilter);
      res.status(200).json({ users: users.map(sanitizeUser) });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/users/:id
  router.get("/:id", requirePermission("team:read"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userService.findById(String(req.params.id));
      if (!user) {
        throw new NotFoundError("User", String(req.params.id));
      }
      res.status(200).json(sanitizeUser(user));
    } catch (err) {
      next(err);
    }
  });

  // PATCH /api/v1/users/:id
  router.patch("/:id", requirePermission("team:update"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateUserSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid user update data", parsed.error.flatten());
      }

      const existing = await userService.findById(String(req.params.id));
      if (!existing) {
        throw new NotFoundError("User", String(req.params.id));
      }

      // Only admins may deactivate (or reactivate) admin accounts — PMs with
      // team:update must not be able to lock out the platform owner.
      if (
        parsed.data.isActive !== undefined &&
        existing.role === "admin" &&
        req.userRole !== "admin"
      ) {
        res.status(403).json({ error: "Only admins can change admin account status" });
        return;
      }

      const updated = await userService.update({
        ...existing,
        ...parsed.data,
        updatedAt: new Date(),
      });
      res.status(200).json(sanitizeUser(updated));
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/v1/users/:id (deactivate)
  router.delete("/:id", requirePermission("team:delete"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await userService.findById(String(req.params.id));
      if (!existing) {
        throw new NotFoundError("User", String(req.params.id));
      }
      if (existing.role === "admin" && req.userRole !== "admin") {
        res.status(403).json({ error: "Only admins can deactivate admin accounts" });
        return;
      }
      await userService.delete(String(req.params.id));
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
