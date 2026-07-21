import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requirePermission, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";
import {
  DIAGNOSTIC_QUESTIONS,
  visibleDiagnosticQuestions,
  scoreDiagnostic,
  createDiagnosticRecord,
  ROUTE_LABELS,
  type DiagnosticRecord,
  type DiagnosticAnswer,
} from "../../../domain/entity/diagnostic.js";

// ── Ports ─────────────────────────────────────────────────────────────────────

interface DiagnosticRepository {
  create(record: DiagnosticRecord): Promise<DiagnosticRecord>;
  findAll(filter?: { route?: string; limit?: number }): Promise<DiagnosticRecord[]>;
  findById(id: string): Promise<DiagnosticRecord | null>;
}

interface Mailer {
  sendEmail(to: string, subject: string, html: string): Promise<unknown>;
}

// ── Validation ─────────────────────────────────────────────────────────────────

const answerSchema = z.object({
  questionId: z.string().min(1),
  value: z.union([z.string(), z.array(z.string())]),
});

const nextSchema = z.object({ answers: z.array(answerSchema).default([]) });

const submitSchema = z.object({
  answers: z.array(answerSchema).min(1),
  respondentName: z.string().max(200).optional(),
  email: z.string().email().optional(),
  org: z.string().max(200).optional(),
});

// ── Route factory ────────────────────────────────────────────────────────────

export function createDiagnosticRoutes(
  repo: DiagnosticRepository,
  tokenService: TokenService,
  mailer?: Mailer,
  notifyTo?: string,
): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  // GET /questions — PUBLIC: the full static question tree.
  router.get("/questions", (_req: Request, res: Response) => {
    res.json({ questions: DIAGNOSTIC_QUESTIONS });
  });

  // POST /next — PUBLIC: given answers so far, return the questions that should show.
  router.post("/next", (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = nextSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());
      res.json({ questions: visibleDiagnosticQuestions(parsed.data.answers as DiagnosticAnswer[]) });
    } catch (err) {
      next(err);
    }
  });

  // POST /submit — PUBLIC: score answers, persist, return the routing result.
  router.post("/submit", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = submitSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());

      const { answers, respondentName, email, org } = parsed.data;
      const result = scoreDiagnostic(answers as DiagnosticAnswer[], { respondentName, org });
      const record = createDiagnosticRecord({ respondentName, email, org, answers: answers as DiagnosticAnswer[], result });
      const created = await repo.create(record);

      // Best-effort staff notification — never block or fail the submission on email.
      if (mailer && notifyTo) {
        mailer
          .sendEmail(
            notifyTo,
            `New diagnostic: ${ROUTE_LABELS[result.route]}${org ? ` — ${org}` : ""}`,
            `<pre>${escapeHtml(result.summary)}</pre>`,
          )
          .catch(() => undefined);
      }

      res.status(201).json({ recordId: created.id, result });
    } catch (err) {
      next(err);
    }
  });

  // GET / — admin: list submissions (optional ?route= & ?limit=).
  router.get("/", auth, requirePermission("diagnostic:read"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter: { route?: string; limit?: number } = {};
      if (req.query.route) filter.route = String(req.query.route);
      if (req.query.limit) filter.limit = Number(req.query.limit);
      const items = await repo.findAll(Object.keys(filter).length ? filter : undefined);
      res.json({ items, total: items.length });
    } catch (err) {
      next(err);
    }
  });

  // GET /:id — admin: single submission incl. one-page summary.
  router.get("/:id", auth, requirePermission("diagnostic:read"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await repo.findById(String(req.params.id));
      if (!item) throw new NotFoundError("diagnostic", String(req.params.id));
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] ?? c);
}
