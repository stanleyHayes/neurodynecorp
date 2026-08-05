import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";
import type { QuestionnaireService } from "../../../app/questionnaire-service.js";
import { QuestionnaireNotFoundError, ProjectNotFoundError } from "../../../app/questionnaire-service.js";
import type { QuestionnaireAnswer } from "../../../app/questionnaire-service.js";

// ---- Validation schemas ----

const adaptiveSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      value: z.unknown(),
    }),
  ),
});

const saveResponseSchema = z
  .object({
    projectId: z.string().min(1).optional(),
    project_id: z.string().min(1).optional(),
    answers: z.array(
      z.object({
        questionId: z.string().min(1),
        value: z.unknown(),
      }),
    ),
  })
  .refine((d) => d.projectId ?? d.project_id, { message: "projectId is required" })
  .transform((d) => ({
    projectId: (d.projectId ?? d.project_id)!,
    answers: d.answers,
  }));

const completeSchema = z
  .object({
    projectId: z.string().min(1).optional(),
    project_id: z.string().min(1).optional(),
  })
  .refine((d) => d.projectId ?? d.project_id, { message: "projectId is required" })
  .transform((d) => ({ projectId: (d.projectId ?? d.project_id)! }));

const STAFF_ROLES = new Set(["admin", "project_manager", "developer", "qa"]);

// ---- Route factory ----

export function createQuestionnaireRoutes(
  questionnaireService: QuestionnaireService,
  tokenService: TokenService,
): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  function isStaff(req: Request): boolean {
    return !!req.userRole && STAFF_ROLES.has(req.userRole);
  }

  // GET /api/v1/questionnaire/questions (public)
  router.get("/questions", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = req.query["category"] as string | undefined;
      const questions = await questionnaireService.getQuestions(category);
      res.status(200).json(questions);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/v1/questionnaire/adaptive (public)
  router.post("/adaptive", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = adaptiveSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid adaptive request data", parsed.error.flatten());
      }

      const questions = await questionnaireService.getAdaptiveQuestions(
        parsed.data.answers as QuestionnaireAnswer[],
      );
      res.status(200).json(questions);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/v1/questionnaire/responses (protected)
  router.post("/responses", auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = saveResponseSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid response data", parsed.error.flatten());
      }

      const response = await questionnaireService.saveResponse(
        parsed.data.projectId,
        req.userId!,
        parsed.data.answers as QuestionnaireAnswer[],
        { isStaff: isStaff(req) },
      );
      res.status(201).json(response);
    } catch (err) {
      if (err instanceof ProjectNotFoundError) {
        return next(new NotFoundError("Project"));
      }
      next(err);
    }
  });

  // POST /api/v1/questionnaire/complete (protected)
  router.post("/complete", auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = completeSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid completion data", parsed.error.flatten());
      }

      const response = await questionnaireService.completeQuestionnaire(
        parsed.data.projectId,
        req.userId!,
        { isStaff: isStaff(req) },
      );
      res.status(200).json(response);
    } catch (err) {
      if (err instanceof ProjectNotFoundError) {
        return next(new NotFoundError("Project"));
      }
      if (err instanceof QuestionnaireNotFoundError) {
        return next(new NotFoundError("Questionnaire response"));
      }
      next(err);
    }
  });

  return router;
}
