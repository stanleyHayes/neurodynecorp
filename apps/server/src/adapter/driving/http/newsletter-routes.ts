import { Router } from "express";
import { z } from "zod";
import { randomBytes } from "crypto";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requirePermission, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";
import { createNewsletterSubscriber, type NewsletterSubscriber } from "../../../domain/entity/newsletter.js";
import type { MongoNewsletterRepository } from "../../driven/mongodb/newsletter-repository.js";

// ── Email service interface ────────────────────────────────────────────────

interface EmailService {
  sendEmail(to: string, subject: string, html: string): Promise<any>;
}

// ── Validation schemas ──────────────────────────────────────────────────────

const subscribeSchema = z.object({
  email: z.string().email(),
  segments: z.array(z.string()).optional(),
});

const preferencesSchema = z.object({
  token: z.string(),
  segments: z.array(z.string()),
});

const unsubscribeSchema = z.object({
  token: z.string().min(16),
});

function publicSubscriber(s: NewsletterSubscriber) {
  const { token: _token, ...rest } = s;
  return rest;
}

// ── Route factory ────────────────────────────────────────────────────────────

export function createNewsletterRoutes(
  repo: MongoNewsletterRepository,
  emailService: EmailService,
  tokenService: TokenService,
): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  // POST /subscribe — PUBLIC
  router.post("/subscribe", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = subscribeSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());

      const { email, segments } = parsed.data;
      const existing = await repo.findByEmail(email);

      if (existing && existing.status === "confirmed") {
        res.json({ status: "already_subscribed" });
        return;
      }

      const token = randomBytes(24).toString("hex");

      if (existing) {
        await repo.update({
          ...existing,
          status: "pending",
          segments: segments ?? existing.segments,
          token,
          confirmedAt: undefined,
        });
      } else {
        await repo.create(
          createNewsletterSubscriber({
            email,
            status: "pending",
            segments: segments ?? [],
            token,
          }),
        );
      }

      await emailService
        .sendEmail(
          email,
          "Confirm your subscription",
          '<p>Confirm: <a href="' +
            (process.env.NEURODYNE_SITE_URL ?? "https://neurodyne.dev") +
            "/newsletter/confirm?token=" +
            token +
            '">Confirm</a></p>',
        )
        .catch(() => {});

      res.json({ status: "pending" });
    } catch (err) {
      next(err);
    }
  });

  // GET /confirm — PUBLIC
  router.get("/confirm", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.query.token as string;
      const subscriber = await repo.findByToken(token);
      if (!subscriber) throw new NotFoundError("newsletter subscriber", token);

      const updated = await repo.update({
        ...subscriber,
        status: "confirmed",
        confirmedAt: new Date(),
      });

      res.json({ status: "confirmed", email: updated.email });
    } catch (err) {
      next(err);
    }
  });

  // POST /preferences — PUBLIC
  router.post("/preferences", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = preferencesSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());

      const subscriber = await repo.findByToken(parsed.data.token);
      if (!subscriber) throw new NotFoundError("newsletter subscriber", parsed.data.token);

      const updated = await repo.update({ ...subscriber, segments: parsed.data.segments });
      res.json(publicSubscriber(updated));
    } catch (err) {
      next(err);
    }
  });

  // POST /unsubscribe — PUBLIC (token required; email-only would let anyone drop any address)
  router.post("/unsubscribe", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = unsubscribeSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());

      const subscriber = await repo.findByToken(parsed.data.token);
      if (!subscriber) throw new NotFoundError("newsletter subscriber", parsed.data.token);

      await repo.update({ ...subscriber, status: "unsubscribed" });
      res.json({ status: "unsubscribed" });
    } catch (err) {
      next(err);
    }
  });

  // GET / — admin list (newsletter:read) — never expose preference tokens
  router.get("/", auth, requirePermission("newsletter:read"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter: { status?: string } = {};
      if (req.query.status) filter.status = req.query.status as string;
      const items = (await repo.findAll(Object.keys(filter).length ? filter : undefined)).map(publicSubscriber);
      res.json({ items, total: items.length });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
