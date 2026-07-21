import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, type TokenService } from "../../../middleware/auth.js";
import { ValidationError } from "../../../middleware/error-handler.js";
import type { Notification } from "../../../domain/entity/notification.js";

// ---- Validation schemas ----

const listNotificationsSchema = z.object({
  unreadOnly: z.coerce.boolean().optional().default(false),
});

// ---- Service interface ----
// Notification CRUD is thin enough to operate directly on the repository.

export interface NotificationService {
  findByUserId(userId: string): Promise<Notification[]>;
  findUnreadByUserId(userId: string): Promise<Notification[]>;
  countUnreadByUserId(userId: string): Promise<number>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  delete(id: string): Promise<void>;
}

// ---- Route factory ----

export function createNotificationRoutes(notificationService: NotificationService, tokenService: TokenService): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  router.use(auth);

  // GET /api/v1/notifications
  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = listNotificationsSchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError("Invalid query parameters", parsed.error.flatten());
      }

      const notifications = parsed.data.unreadOnly
        ? await notificationService.findUnreadByUserId(req.userId!)
        : await notificationService.findByUserId(req.userId!);

      const unread = await notificationService.countUnreadByUserId(req.userId!);

      res.status(200).json({ items: notifications, total: notifications.length, unread });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/notifications/unread-count
  router.get("/unread-count", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await notificationService.countUnreadByUserId(req.userId!);
      res.status(200).json({ unread: count });
    } catch (err) {
      next(err);
    }
  });

  // PATCH /api/v1/notifications/:id/read
  router.patch("/:id/read", async (req: Request, res: Response, next: NextFunction) => {
    try {
      await notificationService.markAsRead(String(req.params.id));
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  // POST /api/v1/notifications/read-all
  router.post("/read-all", async (req: Request, res: Response, next: NextFunction) => {
    try {
      await notificationService.markAllAsRead(req.userId!);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/v1/notifications/:id
  router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      await notificationService.delete(String(req.params.id));
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
