import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requirePermission, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError, ConflictError } from "../../../middleware/error-handler.js";
import type { RBACRole } from "../../../domain/entity/role.js";
import { createRole } from "../../../domain/entity/role.js";
import {
  ALL_PERMISSIONS,
  normalizePermissions,
  RESOURCES,
  ACTIONS,
} from "../../../domain/entity/permission.js";
import type { User } from "../../../domain/entity/user.js";

// ---- Validation schemas ----

const permissionSchema = z.string().refine(
  (val) => {
    const [resource, action] = val.split(":");
    return (
      RESOURCES.includes(resource as any) &&
      ACTIONS.includes(action as any)
    );
  },
  { message: "Invalid permission format. Must be resource:action" },
);

const createRoleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().default(""),
  permissions: z.array(permissionSchema).min(1),
});

const updateRoleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  permissions: z.array(permissionSchema).optional(),
});

const assignRoleSchema = z.object({
  roleId: z.string().min(1),
});

const updateUserPermissionsSchema = z.object({
  permissions: z.array(permissionSchema),
});

// ---- Service interfaces ----

export interface RoleService {
  findAll(): Promise<RBACRole[]>;
  findById(id: string): Promise<RBACRole | null>;
  findByName(name: string): Promise<RBACRole | null>;
  create(role: RBACRole): Promise<RBACRole>;
  update(role: RBACRole): Promise<RBACRole>;
  delete(id: string): Promise<void>;
}

export interface UserService {
  findById(id: string): Promise<User | null>;
  update(user: User): Promise<User>;
}

// ---- Route factory ----

export function createRoleRoutes(
  roleService: RoleService,
  userService: UserService,
  tokenService: TokenService,
): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  router.use(auth);

  // GET /api/v1/roles — list all roles
  router.get("/", requirePermission("roles:read"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roles = await roleService.findAll();
      res.status(200).json({ roles });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/roles/permissions — list all available permissions
  router.get("/permissions", requirePermission("roles:read"), async (_: Request, res: Response) => {
    res.status(200).json({
      permissions: ALL_PERMISSIONS,
      resources: RESOURCES,
      actions: ACTIONS,
    });
  });

  // GET /api/v1/roles/:id — get single role
  router.get("/:id", requirePermission("roles:read"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = await roleService.findById(String(req.params.id));
      if (!role) throw new NotFoundError("Role", String(req.params.id));
      res.status(200).json(role);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/v1/roles — create a role
  router.post("/", requirePermission("roles:create"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createRoleSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid role data", parsed.error.flatten());

      const existing = await roleService.findByName(parsed.data.name);
      if (existing) throw new ConflictError(`Role "${parsed.data.name}" already exists`);

      const normalized = normalizePermissions(parsed.data.permissions);
      const role = createRole({
        name: parsed.data.name,
        description: parsed.data.description,
        permissions: normalized,
      });

      const created = await roleService.create(role);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  // PATCH /api/v1/roles/:id — update a role
  router.patch("/:id", requirePermission("roles:update"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateRoleSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid role update data", parsed.error.flatten());

      const existing = await roleService.findById(String(req.params.id));
      if (!existing) throw new NotFoundError("Role", String(req.params.id));

      if (parsed.data.name && parsed.data.name !== existing.name) {
        const dup = await roleService.findByName(parsed.data.name);
        if (dup) throw new ConflictError(`Role "${parsed.data.name}" already exists`);
      }

      const permissions = parsed.data.permissions
        ? normalizePermissions(parsed.data.permissions)
        : existing.permissions;

      const updated = await roleService.update({
        ...existing,
        ...parsed.data,
        permissions,
        updatedAt: new Date(),
      });
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/v1/roles/:id — delete a role (not system roles)
  router.delete("/:id", requirePermission("roles:delete"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await roleService.findById(String(req.params.id));
      if (!existing) throw new NotFoundError("Role", String(req.params.id));

      if (existing.isSystem) {
        res.status(403).json({ error: "Cannot delete a system role" });
        return;
      }

      await roleService.delete(String(req.params.id));
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  // POST /api/v1/roles/assign/:userId — assign a role to a user (copies role's default permissions)
  router.post("/assign/:userId", requirePermission("roles:update"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = assignRoleSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid assignment data", parsed.error.flatten());

      const user = await userService.findById(String(req.params.userId));
      if (!user) throw new NotFoundError("User", String(req.params.userId));

      const role = await roleService.findById(parsed.data.roleId);
      if (!role) throw new NotFoundError("Role", parsed.data.roleId);

      const updated = await userService.update({
        ...user,
        role: role.name as User["role"],
        roleId: role.id,
        permissions: [...role.permissions],
        updatedAt: new Date(),
      });

      const { passwordHash: _, ...safe } = updated;
      res.status(200).json(safe);
    } catch (err) {
      next(err);
    }
  });

  // PATCH /api/v1/roles/user-permissions/:userId — update individual user permissions
  router.patch("/user-permissions/:userId", requirePermission("roles:update"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateUserPermissionsSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid permissions data", parsed.error.flatten());

      const user = await userService.findById(String(req.params.userId));
      if (!user) throw new NotFoundError("User", String(req.params.userId));

      const normalized = normalizePermissions(parsed.data.permissions);

      const updated = await userService.update({
        ...user,
        permissions: normalized,
        updatedAt: new Date(),
      });

      const { passwordHash: _, ...safe } = updated;
      res.status(200).json(safe);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
