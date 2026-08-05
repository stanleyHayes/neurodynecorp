import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError, ConflictError, UnauthorizedError } from "../../../middleware/error-handler.js";
import { rateLimit } from "../../../middleware/rate-limit.js";
import type { AuthService } from "../../../app/auth-service.js";
import { UserExistsError, InvalidCredentialsError, UserInactiveError, InvalidTokenError } from "../../../app/auth-service.js";

// ---- Validation schemas ----

// NOTE: `role` is deliberately NOT accepted here. This endpoint is public, so
// honouring a client-supplied role would let anyone self-register as an admin
// and walk straight through every requireRole() guard. Roles are assigned only
// via POST /api/v1/roles/assign/:userId, which is permission-gated.
//
// Names accept snake_case as well as camelCase: the client portal and admin
// console post first_name/last_name, which previously failed validation with a
// 400 and made registration impossible from those apps.
const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8).max(128),
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    first_name: z.string().min(1).max(100).optional(),
    last_name: z.string().min(1).max(100).optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
  })
  .refine((d) => (d.firstName ?? d.first_name) && (d.lastName ?? d.last_name), {
    message: "firstName and lastName are required",
  });

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z
  .object({
    refreshToken: z.string().min(1).optional(),
    refresh_token: z.string().min(1).optional(),
  })
  .refine((d) => d.refreshToken ?? d.refresh_token, { message: "refreshToken is required" })
  .transform((d) => ({ refreshToken: (d.refreshToken ?? d.refresh_token)! }));

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

const updateProfileSchema = z.object({
  first_name: z.string().trim().min(1).max(100).optional(),
  last_name: z.string().trim().min(1).max(100).optional(),
  phone: z.string().trim().max(30).optional(),
  company: z.string().trim().max(200).optional(),
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: "At least one profile field is required",
});

import { toApiUser } from "./user-serializer.js";

// ---- Helpers ----

function sanitizeUser(user: Record<string, unknown>) {
  return toApiUser(user);
}

// ---- Route factory ----

export function createAuthRoutes(authService: AuthService, tokenService: TokenService): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);
  const authPublicLimit = rateLimit("auth-public", {
    max: 20,
    windowMs: 60_000,
    message: "Too many auth attempts. Please try again shortly.",
  });

  // POST /api/v1/auth/register
  router.post("/register", authPublicLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid registration data", parsed.error.flatten());
      }

      const d = parsed.data as Record<string, string | undefined>;
      const result = await authService.register({
        email: d["email"],
        password: d["password"],
        firstName: d["firstName"] ?? d["first_name"],
        lastName: d["lastName"] ?? d["last_name"],
        phone: d["phone"],
        company: d["company"],
        // Self-service registration is always a client. Never trust a body role.
        role: "client",
      } as any);
      res.status(201).json({
        user: sanitizeUser(result.user as unknown as Record<string, unknown>),
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        access_token: result.tokens.accessToken,
        refresh_token: result.tokens.refreshToken,
      });
    } catch (err) {
      if (err instanceof UserExistsError) {
        return next(new ConflictError(err.message));
      }
      next(err);
    }
  });

  // POST /api/v1/auth/login
  router.post("/login", authPublicLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid login data", parsed.error.flatten());
      }

      const result = await authService.login(parsed.data.email, parsed.data.password);
      res.status(200).json({
        user: sanitizeUser(result.user as unknown as Record<string, unknown>),
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        access_token: result.tokens.accessToken,
        refresh_token: result.tokens.refreshToken,
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
      res.status(200).json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });
    } catch (err) {
      if (err instanceof InvalidTokenError || err instanceof UserInactiveError) {
        return next(new UnauthorizedError(err.message));
      }
      next(err);
    }
  });

  // POST /api/v1/auth/forgot-password — always 200 (no email enumeration)
  router.post("/forgot-password", authPublicLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = forgotPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid email", parsed.error.flatten());
      }
      await authService.requestPasswordReset(parsed.data.email);
      res.status(200).json({
        message: "If an account exists for that email, a reset link has been sent.",
      });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/v1/auth/reset-password
  router.post("/reset-password", authPublicLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = resetPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid reset data", parsed.error.flatten());
      }
      await authService.resetPassword(parsed.data.token, parsed.data.password);
      res.status(200).json({ message: "Password updated. You can sign in with your new password." });
    } catch (err) {
      if (err instanceof InvalidTokenError) {
        return next(new UnauthorizedError(err.message));
      }
      next(err);
    }
  });

  // GET /api/v1/auth/profile (protected)
  router.get("/profile", auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.getProfile(req.userId!);
      if (!user) {
        throw new NotFoundError("User", req.userId);
      }
      res.status(200).json(sanitizeUser(user as unknown as Record<string, unknown>));
    } catch (err) {
      next(err);
    }
  });

  // PATCH /api/v1/auth/profile (protected, self-service)
  router.patch("/profile", auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid profile update data", parsed.error.flatten());
      }

      const user = await authService.updateProfile(req.userId!, {
        firstName: parsed.data.first_name,
        lastName: parsed.data.last_name,
        phone: parsed.data.phone || undefined,
        company: parsed.data.company || undefined,
      });
      if (!user) {
        throw new NotFoundError("User", req.userId);
      }
      res.status(200).json(sanitizeUser(user as unknown as Record<string, unknown>));
    } catch (err) {
      next(err);
    }
  });

  return router;
}
