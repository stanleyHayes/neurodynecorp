import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requireRole, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";
import {
  createBudgetItem,
  BUDGET_CURRENCIES,
  BUDGET_CATEGORIES,
  BUDGET_STATUSES,
  type BudgetItem,
  type BudgetCurrency,
  type BudgetCategory,
  type BudgetStatus,
} from "../../../domain/entity/budget.js";

interface BudgetRepository {
  findByProjectId(projectId: string): Promise<BudgetItem[]>;
  findById(id: string): Promise<BudgetItem | null>;
  create(b: BudgetItem): Promise<BudgetItem>;
  update(b: BudgetItem): Promise<BudgetItem>;
  delete(id: string): Promise<void>;
}

type ProjectOwnerLookup = (projectId: string) => Promise<string | null>;

const currencyEnum = z.enum(BUDGET_CURRENCIES as [BudgetCurrency, ...BudgetCurrency[]]);
const categoryEnum = z.enum(BUDGET_CATEGORIES as [BudgetCategory, ...BudgetCategory[]]);
const statusEnum = z.enum(BUDGET_STATUSES as [BudgetStatus, ...BudgetStatus[]]);

// Money amounts: finite, non-negative, sanely bounded.
const money = z.number().nonnegative().finite().max(1_000_000_000_000);

const createSchema = z.object({
  projectId: z.string().min(1),
  label: z.string().min(1).max(300),
  category: categoryEnum.optional(),
  currency: currencyEnum.optional(),
  budgetAmount: money,
  invoicedAmount: money.optional(),
  paidAmount: money.optional(),
  status: statusEnum.optional(),
  dueDate: z.coerce.date().optional(),
  notes: z.string().max(2000).optional(),
});

const updateSchema = z.object({
  label: z.string().min(1).max(300).optional(),
  category: categoryEnum.optional(),
  currency: currencyEnum.optional(),
  budgetAmount: money.optional(),
  invoicedAmount: money.optional(),
  paidAmount: money.optional(),
  status: statusEnum.optional(),
  dueDate: z.coerce.date().optional(),
  notes: z.string().max(2000).optional(),
});

export function createBudgetRoutes(
  repo: BudgetRepository,
  tokenService: TokenService,
  getProjectOwnerId: ProjectOwnerLookup,
): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);
  router.use(auth);

  async function assertProjectAccess(req: Request, projectId: string): Promise<void> {
    if (req.userRole === "client") {
      const ownerId = await getProjectOwnerId(projectId);
      if (!ownerId || ownerId !== req.userId) throw new NotFoundError("project", projectId);
    }
  }

  // POST / — staff only.
  router.post("/", requireRole("admin", "project_manager"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());
      const b = parsed.data;
      const item = createBudgetItem({
        projectId: b.projectId,
        label: b.label,
        category: b.category ?? "milestone",
        currency: b.currency ?? "USD",
        budgetAmount: b.budgetAmount,
        invoicedAmount: b.invoicedAmount ?? 0,
        paidAmount: b.paidAmount ?? 0,
        status: b.status ?? "planned",
        dueDate: b.dueDate,
        notes: b.notes,
        createdById: req.userId!,
      });
      const created = await repo.create(item);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  // GET /?projectId= — owning client or staff.
  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = req.query.projectId ? String(req.query.projectId) : "";
      if (!projectId) throw new ValidationError("projectId is required", {});
      await assertProjectAccess(req, projectId);
      const items = await repo.findByProjectId(projectId);
      res.json({ items, total: items.length });
    } catch (err) {
      next(err);
    }
  });

  // GET /:id — owning client or staff; not-owned indistinguishable from not-found.
  router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await repo.findById(req.params.id!);
      if (!item) throw new NotFoundError("budget item", req.params.id);
      try {
        await assertProjectAccess(req, item.projectId);
      } catch {
        throw new NotFoundError("budget item", req.params.id);
      }
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  // PATCH /:id — staff only.
  router.patch("/:id", requireRole("admin", "project_manager"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError("Invalid data", parsed.error.flatten());
      const existing = await repo.findById(req.params.id!);
      if (!existing) throw new NotFoundError("budget item", req.params.id);
      const updated = await repo.update({ ...existing, ...parsed.data, id: existing.id });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /:id — staff only.
  router.delete("/:id", requireRole("admin", "project_manager"), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await repo.findById(req.params.id!);
      if (!existing) throw new NotFoundError("budget item", req.params.id);
      await repo.delete(existing.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  });

  return router;
}
