import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requirePermission, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";
import type { Task, Sprint } from "../../../domain/entity/task.js";
import type { TaskFilter } from "../../../domain/port/repository.js";

// ---- Validation schemas ----

const createTaskSchema = z.object({
  projectId: z.string().min(1),
  sprintId: z.string().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional().default(""),
  assigneeId: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional().default("medium"),
  labels: z.array(z.string()).optional(),
  storyPoints: z.number().positive().optional(),
  dueDate: z.coerce.date().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  assigneeId: z.string().nullable().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  status: z.enum(["backlog", "todo", "in_progress", "in_review", "done", "cancelled"]).optional(),
  labels: z.array(z.string()).optional(),
  storyPoints: z.number().positive().nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  sprintId: z.string().nullable().optional(),
});

const createSprintSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1).max(100),
  goal: z.string().max(1000).optional().default(""),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

const updateSprintSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  goal: z.string().max(1000).optional(),
  status: z.enum(["planning", "active", "completed"]).optional(),
});

const listTasksSchema = z.object({
  projectId: z.string().optional(),
  sprintId: z.string().optional(),
  assigneeId: z.string().optional(),
  status: z.enum(["backlog", "todo", "in_progress", "in_review", "done", "cancelled"]).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  search: z.string().optional(),
});

// ---- Service interface ----

export interface TaskService {
  createTask(task: Task): Promise<Task>;
  findTask(id: string): Promise<Task | null>;
  listTasks(filter?: TaskFilter): Promise<Task[]>;
  updateTask(task: Task): Promise<Task>;
  deleteTask(id: string): Promise<void>;

  createSprint(sprint: Sprint): Promise<Sprint>;
  findSprint(id: string): Promise<Sprint | null>;
  listSprints(projectId: string): Promise<Sprint[]>;
  updateSprint(sprint: Sprint): Promise<Sprint>;
  deleteSprint(id: string): Promise<void>;
}

// ---- Route factory ----

export function createTaskRoutes(taskService: TaskService, tokenService: TokenService): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  router.use(auth);

  // ---- Sprints (must be before /:id to avoid conflict) ----

  // POST /api/v1/tasks/sprints
  router.post(
    "/sprints",
    requirePermission("tasks:create"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const parsed = createSprintSchema.safeParse(req.body);
        if (!parsed.success) {
          throw new ValidationError("Invalid sprint data", parsed.error.flatten());
        }

        const { createSprint: buildSprint } = await import("../../../domain/entity/task.js");
        const sprint = buildSprint(parsed.data as any);
        const created = await taskService.createSprint(sprint);
        res.status(201).json(created);
      } catch (err) {
        next(err);
      }
    },
  );

  // GET /api/v1/tasks/sprints?projectId=
  router.get("/sprints", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = req.query["projectId"] as string;
      if (!projectId) {
        throw new ValidationError("projectId query parameter is required");
      }

      const sprints = await taskService.listSprints(projectId);
      res.status(200).json({ sprints, items: sprints, total: sprints.length });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/tasks/sprints/:id
  router.get("/sprints/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sprint = await taskService.findSprint(String(req.params.id));
      if (!sprint) {
        throw new NotFoundError("Sprint", String(req.params.id));
      }
      res.status(200).json(sprint);
    } catch (err) {
      next(err);
    }
  });

  // PATCH /api/v1/tasks/sprints/:id
  router.patch(
    "/sprints/:id",
    requirePermission("tasks:create"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const parsed = updateSprintSchema.safeParse(req.body);
        if (!parsed.success) {
          throw new ValidationError("Invalid sprint update data", parsed.error.flatten());
        }

        const existing = await taskService.findSprint(String(req.params.id));
        if (!existing) {
          throw new NotFoundError("Sprint", String(req.params.id));
        }

        const updated = await taskService.updateSprint({
          ...existing,
          ...(parsed.data as any),
          updatedAt: new Date(),
        });
        res.status(200).json(updated);
      } catch (err) {
        next(err);
      }
    },
  );

  // DELETE /api/v1/tasks/sprints/:id
  router.delete(
    "/sprints/:id",
    requirePermission("tasks:create"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await taskService.deleteSprint(String(req.params.id));
        res.status(204).end();
      } catch (err) {
        next(err);
      }
    },
  );

  // ---- Tasks ----

  // POST /api/v1/tasks
  router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createTaskSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid task data", parsed.error.flatten());
      }

      const { createTask: buildTask } = await import("../../../domain/entity/task.js");
      const task = buildTask({
        ...(parsed.data as any),
        description: parsed.data.description ?? "",
        reporterId: req.userId!,
      });
      const created = await taskService.createTask(task);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/tasks
  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = listTasksSchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError("Invalid query parameters", parsed.error.flatten());
      }

      const tasks = await taskService.listTasks(parsed.data as TaskFilter);
      // `items` mirrors every other list endpoint (the admin Kanban reads it);
      // `tasks` is kept for existing consumers.
      res.status(200).json({ tasks, items: tasks, total: tasks.length });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/tasks/:id
  router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const task = await taskService.findTask(String(req.params.id));
      if (!task) {
        throw new NotFoundError("Task", String(req.params.id));
      }
      res.status(200).json(task);
    } catch (err) {
      next(err);
    }
  });

  // PATCH /api/v1/tasks/:id
  router.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateTaskSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid task update data", parsed.error.flatten());
      }

      const existing = await taskService.findTask(String(req.params.id));
      if (!existing) {
        throw new NotFoundError("Task", String(req.params.id));
      }

      const merged: Task = {
        ...existing,
        ...(parsed.data as any),
        assigneeId: parsed.data.assigneeId === null ? undefined : (parsed.data.assigneeId ?? existing.assigneeId),
        storyPoints: parsed.data.storyPoints === null ? undefined : (parsed.data.storyPoints ?? existing.storyPoints),
        dueDate: parsed.data.dueDate === null ? undefined : (parsed.data.dueDate ?? existing.dueDate),
        sprintId: parsed.data.sprintId === null ? undefined : (parsed.data.sprintId ?? existing.sprintId),
        updatedAt: new Date(),
      } as Task;

      const updated = await taskService.updateTask(merged);
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/v1/tasks/:id
  router.delete(
    "/:id",
    requirePermission("tasks:create"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await taskService.deleteTask(String(req.params.id));
        res.status(204).end();
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
