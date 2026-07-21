import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requirePermission, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";
import {
  createRfpSubmission,
  RFP_SLA_HOURS,
  RFP_STATUSES,
  type RfpSubmission,
  type RfpStatus,
} from "../../../domain/entity/rfp.js";

interface RfpRepository {
  create(r: RfpSubmission): Promise<RfpSubmission>;
  findAll(filter?: { status?: string; limit?: number }): Promise<RfpSubmission[]>;
  findById(id: string): Promise<RfpSubmission | null>;
  updateStatus(id: string, status: RfpStatus): Promise<RfpSubmission | null>;
}

interface Mailer {
  sendEmail(to: string, subject: string, html: string): Promise<unknown>;
}

const submitSchema = z.object({
  org: z.string().min(1).max(200),
  contactName: z.string().min(1).max(200),
  contactEmail: z.string().email(),
  contactPhone: z.string().max(40).optional(),
  sector: z.string().max(80).optional(),
  title: z.string().min(1).max(300),
  scope: z.string().min(10).max(8000),
  evaluationCriteria: z.string().max(4000).optional(),
  submissionRequirements: z.string().max(4000).optional(),
  // Lenient on purpose: an optional reference link must never 400 the whole
  // submission just because the user pasted a URL without a scheme.
  documentUrl: z.string().max(2000).optional(),
  estimatedValue: z.string().max(120).optional(),
  deadline: z.string().max(40).optional(),
});

const statusSchema = z.object({ status: z.enum(RFP_STATUSES as [RfpStatus, ...RfpStatus[]]) });

function escapeHtml(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] ?? c);
}

export function createRfpRoutes(
  repo: RfpRepository,
  tokenService: TokenService,
  mailer?: Mailer,
  notifyTo?: string,
): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  // POST /submit — PUBLIC: structured RFP/tender intake.
  router.post("/submit", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = submitSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());

      const record = createRfpSubmission(parsed.data as any);
      const created = await repo.create(record);

      // Best-effort notifications — never fail the submission on email.
      if (mailer) {
        if (notifyTo) {
          void mailer
            .sendEmail(
              notifyTo,
              `New RFP/Tender: ${created.title} — ${created.org}`,
              `<pre>${escapeHtml(JSON.stringify(parsed.data, null, 2))}</pre>`,
            )
            .catch(() => undefined);
        }
        // Acknowledge the submitter with the SLA commitment.
        void mailer
          .sendEmail(
            created.contactEmail,
            `We've received your RFP: ${created.title}`,
            `<p>Thank you — we've logged your submission and will acknowledge it within ${RFP_SLA_HOURS} hours.</p>`,
          )
          .catch(() => undefined);
      }

      res.status(201).json({ id: created.id, status: created.status, slaDueAt: created.slaDueAt, slaHours: RFP_SLA_HOURS });
    } catch (err) {
      next(err);
    }
  });

  // GET / — admin: list submissions (?status= & ?limit=).
  router.get("/", auth, requirePermission("rfp:read"), async (req: Request, res: Response, next: NextFunction) => {
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

  // GET /:id — admin: single submission.
  router.get("/:id", auth, requirePermission("rfp:read"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await repo.findById(String(req.params.id));
      if (!item) throw new NotFoundError("rfp", String(req.params.id));
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  // PATCH /:id — admin: advance status (acknowledge / review / decline / close).
  router.patch("/:id", auth, requirePermission("rfp:update"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = statusSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());
      const updated = await repo.updateStatus(String(req.params.id), parsed.data.status);
      if (!updated) throw new NotFoundError("rfp", String(req.params.id));
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
