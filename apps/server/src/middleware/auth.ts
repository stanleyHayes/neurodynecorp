import type { Request, Response, NextFunction } from "express";
import type { Role } from "../domain/entity/user.js";

// ---- Extend Express Request ----

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: Role;
      userPermissions?: string[];
    }
  }
}

// ---- Token service interface (port) ----

export interface TokenService {
  validateAccessToken(token: string): { userId: string; role: string; permissions?: string[] };
}

// ---- Auth middleware ----

export function authMiddleware(tokenService: TokenService) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or invalid Authorization header" });
      return;
    }

    const token = header.slice(7);

    try {
      const payload = tokenService.validateAccessToken(token);
      req.userId = payload.userId;
      req.userRole = payload.role as Role;
      req.userPermissions = payload.permissions ?? [];
      next();
    } catch {
      res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}

/**
 * Attach identity when a valid Bearer token is present; otherwise continue
 * anonymously. Used for public CMS reads where staff tokens unlock drafts.
 */
export function optionalAuthMiddleware(tokenService: TokenService) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      next();
      return;
    }
    try {
      const payload = tokenService.validateAccessToken(header.slice(7));
      req.userId = payload.userId;
      req.userRole = payload.role as Role;
      req.userPermissions = payload.permissions ?? [];
    } catch {
      // Invalid token on a public route — treat as anonymous, do not 401.
    }
    next();
  };
}

// ---- Role guard (kept for backward compatibility) ----

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.userRole) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (!roles.includes(req.userRole)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    next();
  };
}

// ---- Permission guard ----

/**
 * Requires the authenticated user to have ALL of the specified permissions.
 * Permissions follow the format "resource:action" (e.g., "projects:read").
 */
export function requirePermission(...permissions: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const userPerms = req.userPermissions ?? [];

    const missing = permissions.filter((p) => !userPerms.includes(p));
    if (missing.length > 0) {
      res.status(403).json({
        error: "Insufficient permissions",
        missing,
      });
      return;
    }

    next();
  };
}
