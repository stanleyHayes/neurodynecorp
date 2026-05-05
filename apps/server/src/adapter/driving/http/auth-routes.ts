import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError, ConflictError, UnauthorizedError } from "../../../middleware/error-handler.js";
import type { AuthService } from "../../../app/auth-service.js";
import { UserExistsError, InvalidCredentialsError, UserInactiveError, InvalidTokenError } from "../../../app/auth-service.js";

// ---- Validation schemas ----

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: z.enum(["admin", "project_manager", "developer", "qa", "client"]).optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

// ---- Helpers ----

function sanitizeUser(user: Record<string, unknown>) {
  const { passwordHash: _, ...safe } = user;
  return safe;
}

// ---- Route factory ----

export function createAuthRoutes(authService: AuthService, tokenService: TokenService): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  // POST /api/v1/auth/register
  router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid registration data", parsed.error.flatten());
      }

      const result = await authService.register(parsed.data);
      res.status(201).json({
        user: sanitizeUser(result.user as unknown as Record<string, unknown>),
        ...result.tokens,
      });
    } catch (err) {
      if (err instanceof UserExistsError) {
        return next(new ConflictError(err.message));
      }
      next(err);
    }
  });

  // POST /api/v1/auth/login
  router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid login data", parsed.error.flatten());
      }

      const result = await authService.login(parsed.data.email, parsed.data.password);
      res.status(200).json({
        user: sanitizeUser(result.user as unknown as Record<string, unknown>),
        ...result.tokens,
      });
    } catch (err) {
      if (err instanceof InvalidCredentialsError || err instanceof UserInactiveError) {
        return next(new UnauthorizedError(err.message));
      }
      next(err);
    }
  });

  // POST /api/v1/auth/refresh
  router.post("/refresh", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = refreshSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid refresh token data", parsed.error.flatten());
      }

      const tokens = await authService.refreshToken(parsed.data.refreshToken);
      res.status(200).json(tokens);
    } catch (err) {
      if (err instanceof InvalidTokenError || err instanceof UserInactiveError) {
        return next(new UnauthorizedError(err.message));
      }
      next(err);
    }
  });

  // GET /api/v1/auth/profile (protected)
  router.get("/profile", auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Profile retrieval delegates to the user repo through the auth service's userRepo
      // For now, we re-use the service; the caller wires the userRepo lookup
      // This is a thin adapter - it calls whatever is provided
      const { userRepo } = authService as unknown as { userRepo: { findById(id: string): Promise<unknown> } };
      const user = await userRepo.findById(req.userId!);
      if (!user) {
        throw new NotFoundError("User", req.userId);
      }
      res.status(200).json(sanitizeUser(user as Record<string, unknown>));
    } catch (err) {
      next(err);
    }
  });

  return router;
}
