import { Router } from "express";
import { z } from "zod";
import { randomBytes, createHmac } from "crypto";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requirePermission, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";
import {
  createWebhookSubscription,
  createWebhookDelivery,
  type WebhookSubscription,
} from "../../../domain/entity/webhook.js";
import type { MongoWebhookRepository } from "../../../adapter/driven/mongodb/webhook-repository.js";
import { assertSafeOutboundUrl } from "./url-safety.js";

// ---- Validation schemas ----

const createSubscriptionSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
});

const updateSubscriptionSchema = z.object({
  url: z.string().url().optional(),
  events: z.array(z.string()).min(1).optional(),
  active: z.boolean().optional(),
});

// ---- Helpers ----

function maskSecret(secret: string): string {
  return "...." + secret.slice(-4);
}

function toMasked(sub: WebhookSubscription): WebhookSubscription {
  return { ...sub, secret: maskSecret(sub.secret) };
}

// ---- Route factory ----

export function createWebhookRoutes(repo: MongoWebhookRepository, tokenService: TokenService): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  router.use(auth);

  // GET / — list owner's subscriptions (secret masked)
  router.get("/", requirePermission("webhooks:read"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subs = await repo.listByOwner(req.userId!);
      res.status(200).json({ items: subs.map(toMasked), total: subs.length });
    } catch (err) {
      next(err);
    }
  });

  // POST / — create subscription (full secret shown once)
  router.post("/", requirePermission("webhooks:create"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createSubscriptionSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid data", parsed.error.flatten());
      }

      await assertSafeOutboundUrl(parsed.data.url);

      const secret = "whsec_" + randomBytes(24).toString("hex");
      const subscription = createWebhookSubscription({
        ownerId: req.userId!,
        url: parsed.data.url,
        events: parsed.data.events,
        secret,
        active: true,
      });

      const created = await repo.create(subscription);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  // PATCH /:id — update url/events/active (owner-scoped)
  router.patch("/:id", requirePermission("webhooks:update"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateSubscriptionSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid data", parsed.error.flatten());
      }

      const existing = await repo.getById(String(req.params.id));
      if (!existing || existing.ownerId !== req.userId!) {
        throw new NotFoundError("webhook", String(req.params.id));
      }

      if (parsed.data.url) {
        await assertSafeOutboundUrl(parsed.data.url);
      }

      const updated = await repo.update({
        ...existing,
        url: parsed.data.url ?? existing.url,
        events: parsed.data.events ?? existing.events,
        active: parsed.data.active ?? existing.active,
        updatedAt: new Date(),
      });

      res.status(200).json(toMasked(updated));
    } catch (err) {
      next(err);
    }
  });

  // DELETE /:id — delete subscription (owner-scoped)
  router.delete("/:id", requirePermission("webhooks:delete"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await repo.getById(String(req.params.id));
      if (!existing || existing.ownerId !== req.userId!) {
        throw new NotFoundError("webhook", String(req.params.id));
      }
      await repo.delete(existing.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  // GET /:id/deliveries — list deliveries (owner-scoped)
  router.get("/:id/deliveries", requirePermission("webhooks:read"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await repo.getById(String(req.params.id));
      if (!existing || existing.ownerId !== req.userId!) {
        throw new NotFoundError("webhook", String(req.params.id));
      }
      const deliveries = await repo.listDeliveries(existing.id);
      res.status(200).json({ items: deliveries, total: deliveries.length });
    } catch (err) {
      next(err);
    }
  });

  // POST /:id/test — send a ping delivery (owner-scoped)
  router.post("/:id/test", requirePermission("webhooks:create"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sub = await repo.getById(String(req.params.id));
      if (!sub || sub.ownerId !== req.userId!) {
        throw new NotFoundError("webhook", String(req.params.id));
      }

      // Re-check at delivery time — DNS/IP may have changed since create.
      await assertSafeOutboundUrl(sub.url);

      let delivery = await repo.createDelivery(
        createWebhookDelivery({
          subscriptionId: sub.id,
          event: "ping",
          status: "pending",
          attempts: 1,
        }),
      );

      const body = JSON.stringify({ event: "ping", at: new Date().toISOString() });
      const signature = createHmac("sha256", sub.secret).update(body).digest("hex");

      try {
        const response = await fetch(sub.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Signature": signature,
          },
          body,
          redirect: "manual",
          signal: AbortSignal.timeout(5_000),
        });
        delivery = await repo.updateDelivery({
          ...delivery,
          status: response.ok ? "success" : "failed",
          responseCode: response.status,
        });
      } catch {
        delivery = await repo.updateDelivery({
          ...delivery,
          status: "failed",
        });
      }

      res.status(200).json(delivery);
    } catch (err) {
      next(err);
    }
  });

  // POST /:id/rotate-secret — generate a new secret (shown once, owner-scoped)
  router.post("/:id/rotate-secret", requirePermission("webhooks:update"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await repo.getById(String(req.params.id));
      if (!existing || existing.ownerId !== req.userId!) {
        throw new NotFoundError("webhook", String(req.params.id));
      }

      const secret = "whsec_" + randomBytes(24).toString("hex");
      const updated = await repo.update({
        ...existing,
        secret,
        updatedAt: new Date(),
      });

      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
