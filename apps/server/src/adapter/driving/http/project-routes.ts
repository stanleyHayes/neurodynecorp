import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requirePermission, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError, AppError } from "../../../middleware/error-handler.js";
import type { ProjectService } from "../../../app/project-service.js";
import { ProjectNotFoundError, InvalidStatusTransitionError } from "../../../app/project-service.js";
import type { Project } from "../../../domain/entity/project.js";

// Serialize Project entity to API response format (snake_case, title instead of name)
function toApiProject(p: Project) {
  return {
    id: p.id,
    client_id: p.clientId,
    title: p.name,
    description: p.description,
    type: p.type,
    status: p.status,
    features: p.features,
    user_roles: p.userRoles,
    integrations: p.integrations,
    budget_range: p.budgetRange,
    timeline: p.timeline,
    attachments: p.attachments,
    assigned_team: p.assignedTeam,
    specification_id: p.specificationId,
    progress: p.progress,
    milestones: p.milestones.map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      due_date: m.dueDate,
      completed_at: m.completedAt,
      status: m.status,
    })),
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

// ---- Validation schemas ----

const createProjectSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  type: z.string().min(1),
  features: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        priority: z.string(),
        complexity: z.string(),
      }),
    )
    .optional(),
  userRoles: z.array(z.string()).optional(),
  integrations: z.array(z.string()).optional(),
  budgetRange: z
    .object({
      min: z.number().nonnegative(),
      max: z.number().nonnegative(),
      currency: z.string().length(3),
    })
    .optional(),
  timeline: z
    .object({
      expectedStart: z.coerce.date().optional(),
      expectedEnd: z.coerce.date().optional(),
      durationWeeks: z.number().int().positive(),
      preferredUrgency: z.string(),
    })
    .optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["lead", "under_review", "approved", "in_development", "qa", "delivered"]),
});

const assignTeamSchema = z.object({
  teamMemberIds: z.array(z.string().min(1)),
});

const updateProgressSchema = z.object({
  progress: z.number().int().min(0).max(100),
});

const listProjectsSchema = z.object({
  status: z.enum(["lead", "under_review", "approved", "in_development", "qa", "delivered"]).optional(),
  type: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
});

// ---- Route factory ----

export function createProjectRoutes(projectService: ProjectService, tokenService: TokenService): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  // All project routes are protected
  router.use(auth);

  // POST /api/v1/projects
  router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid project data", parsed.error.flatten());
      }

      const project = await projectService.createProject({
        ...parsed.data,
        clientId: req.userId!,
      });
      res.status(201).json(toApiProject(project));
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/projects
  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = listProjectsSchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError("Invalid query parameters", parsed.error.flatten());
      }

      const filter: Record<string, unknown> = {
        status: parsed.data.status,
        type: parsed.data.type,
        search: parsed.data.search,
        page: parsed.data.page,
        pageSize: parsed.data.pageSize,
      };

      // Clients can only see their own projects
      if (req.userRole === "client") {
        filter["clientId"] = req.userId!;
      }

      const result = await projectService.listProjects(filter as Parameters<typeof projectService.listProjects>[0]);
      res.status(200).json({
        items: result.projects.map(toApiProject),
        total: result.total,
        page: parsed.data.page,
        page_size: parsed.data.pageSize,
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/projects/:id
  router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const project = await projectService.getProject(req.params.id!);
      res.status(200).json(toApiProject(project));
    } catch (err) {
      if (err instanceof ProjectNotFoundError) {
        return next(new NotFoundError("Project", req.params.id));
      }
      next(err);
    }
  });

  // PATCH /api/v1/projects/:id/status
  router.patch(
    "/:id/status",
    requirePermission("projects:update"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const parsed = updateStatusSchema.safeParse(req.body);
        if (!parsed.success) {
          throw new ValidationError("Invalid status data", parsed.error.flatten());
        }

        const project = await projectService.updateStatus(req.params.id!, parsed.data.status);
        res.status(200).json(toApiProject(project));
      } catch (err) {
        if (err instanceof ProjectNotFoundError) {
          return next(new NotFoundError("Project", req.params.id));
        }
        if (err instanceof InvalidStatusTransitionError) {
          return next(new AppError(err.message, 422));
        }
        next(err);
      }
    },
  );

  // PUT /api/v1/projects/:id/team
  router.put(
    "/:id/team",
    requirePermission("projects:update"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const parsed = assignTeamSchema.safeParse(req.body);
        if (!parsed.success) {
          throw new ValidationError("Invalid team data", parsed.error.flatten());
        }

        const project = await projectService.assignTeam(req.params.id!, parsed.data.teamMemberIds);
        res.status(200).json(toApiProject(project));
      } catch (err) {
        if (err instanceof ProjectNotFoundError) {
          return next(new NotFoundError("Project", req.params.id));
        }
        next(err);
      }
    },
  );

  // PATCH /api/v1/projects/:id/progress
  router.patch(
    "/:id/progress",
    requirePermission("projects:update"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const parsed = updateProgressSchema.safeParse(req.body);
        if (!parsed.success) {
          throw new ValidationError("Invalid progress data", parsed.error.flatten());
        }

        const project = await projectService.updateProgress(req.params.id!, parsed.data.progress);
        res.status(200).json(toApiProject(project));
      } catch (err) {
        if (err instanceof ProjectNotFoundError) {
          return next(new NotFoundError("Project", req.params.id));
        }
        next(err);
      }
    },
  );

  return router;
}
