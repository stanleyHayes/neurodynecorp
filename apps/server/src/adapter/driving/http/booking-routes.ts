import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requirePermission, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";
import {
  createBookingRequest,
  bookingDurationForRoute,
  BOOKING_STATUSES,
  type BookingRequest,
  type BookingStatus,
} from "../../../domain/entity/booking.js";

interface BookingRepository {
  create(b: BookingRequest): Promise<BookingRequest>;
  findAll(filter?: { status?: string; limit?: number }): Promise<BookingRequest[]>;
  findById(id: string): Promise<BookingRequest | null>;
  updateStatus(id: string, status: BookingStatus): Promise<BookingRequest | null>;
}

interface Mailer {
  sendEmail(to: string, subject: string, html: string): Promise<unknown>;
}

const submitSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  org: z.string().max(200).optional(),
  topic: z.string().max(2000).optional(),
  route: z.string().max(60).optional(),
  diagnosticId: z.string().max(64).optional(),
  preferredTimes: z.string().max(2000).optional(),
  timezone: z.string().max(80).optional(),
});

const statusSchema = z.object({ status: z.enum(BOOKING_STATUSES as [BookingStatus, ...BookingStatus[]]) });

function escapeHtml(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] ?? c);
}

export function createBookingRoutes(
  repo: BookingRepository,
  tokenService: TokenService,
  mailer?: Mailer,
  notifyTo?: string,
): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  // GET /duration?route= — PUBLIC helper so the web form can show the right length.
  router.get("/duration", (req: Request, res: Response) => {
    const route = req.query.route ? String(req.query.route) : undefined;
    res.json({ durationMins: bookingDurationForRoute(route) });
  });

  // POST /submit — PUBLIC: request a reading.
  router.post("/submit", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = submitSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());

      const record = createBookingRequest({ ...parsed.data });
      const created = await repo.create(record);

      if (mailer) {
        if (notifyTo) {
          void mailer
            .sendEmail(
              notifyTo,
              `New reading request: ${created.name}${created.org ? ` — ${created.org}` : ""} (${created.durationMins}m)`,
              `<pre>${escapeHtml(JSON.stringify({ ...parsed.data, durationMins: created.durationMins }, null, 2))}</pre>`,
            )
            .catch(() => undefined);
        }
        void mailer
          .sendEmail(
            created.email,
            `We've received your request for a ${created.durationMins}-minute reading`,
            `<p>Thank you — we've logged your request and will confirm a time shortly.</p>`,
          )
          .catch(() => undefined);
      }

      res.status(201).json({ id: created.id, status: created.status, durationMins: created.durationMins });
    } catch (err) {
      next(err);
    }
  });

  // GET / — admin: list (?status= & ?limit=).
  router.get("/", auth, requirePermission("booking:read"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter: { status?: string; limit?: number } = {};
      if (req.query.status) filter.status = String(req.query.status);
      if (req.query.limit) filter.limit = Number(req.query.limit);
      const items = await repo.findAll(Object.keys(filter).length ? filter : undefined);
      res.json({ items, total: items.length });
    } catch (err) {
      next(err);
    }
  });

  // GET /:id — admin.
  router.get("/:id", auth, requirePermission("booking:read"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await repo.findById(req.params.id!);
      if (!item) throw new NotFoundError("booking", req.params.id);
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  // PATCH /:id — admin: confirm / decline / complete.
  router.patch("/:id", auth, requirePermission("booking:update"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = statusSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());
      const updated = await repo.updateStatus(req.params.id!, parsed.data.status);
      if (!updated) throw new NotFoundError("booking", req.params.id);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
