import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requirePermission, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError, AppError } from "../../../middleware/error-handler.js";
import type { BillingService } from "../../../app/billing-service.js";
import { InvoiceNotFoundError, InvoiceAlreadyPaidError } from "../../../app/billing-service.js";
import type { InvoiceLineItem } from "../../../app/billing-service.js";

// ---- Validation schemas ----

const createInvoiceSchema = z.object({
  projectId: z.string().min(1),
  clientId: z.string().min(1),
  items: z.array(
    z.object({
      description: z.string().min(1),
      quantity: z.number().positive(),
      unitPrice: z.number().nonnegative(),
      total: z.number().nonnegative(),
    }),
  ).min(1),
  tax: z.number().nonnegative().optional().default(0),
  currency: z.string().length(3).optional().default("USD"),
  dueDate: z.coerce.date(),
});

const listInvoicesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
});

const markPaidSchema = z.object({
  paymentId: z.string().min(1),
});

// ---- Route factory ----

export function createInvoiceRoutes(billingService: BillingService, tokenService: TokenService): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  router.use(auth);

  // POST /api/v1/invoices
  router.post(
    "/",
    requirePermission("finance:create"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const parsed = createInvoiceSchema.safeParse(req.body);
        if (!parsed.success) {
          throw new ValidationError("Invalid invoice data", parsed.error.flatten());
        }

        const invoice = await billingService.createInvoice(
          parsed.data.projectId,
          parsed.data.clientId,
          parsed.data.items as InvoiceLineItem[],
          parsed.data.tax,
          parsed.data.currency,
          parsed.data.dueDate,
        );
        res.status(201).json(invoice);
      } catch (err) {
        next(err);
      }
    },
  );

  // GET /api/v1/invoices
  router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = listInvoicesSchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError("Invalid query parameters", parsed.error.flatten());
      }

      // Clients see their own invoices; admins/PMs can pass clientId
      const clientId = req.userRole === "client"
        ? req.userId!
        : (req.query["clientId"] as string ?? req.userId!);

      const result = await billingService.listByClient(clientId, parsed.data.page, parsed.data.pageSize);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/v1/invoices/:id/paid
  router.post(
    "/:id/paid",
    requirePermission("finance:create"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const parsed = markPaidSchema.safeParse(req.body);
        if (!parsed.success) {
          throw new ValidationError("Invalid payment data", parsed.error.flatten());
        }

        const invoice = await billingService.markPaid(String(req.params.id), parsed.data.paymentId);
        res.status(200).json(invoice);
      } catch (err) {
        if (err instanceof InvoiceNotFoundError) {
          return next(new NotFoundError("Invoice", String(req.params.id)));
        }
        if (err instanceof InvoiceAlreadyPaidError) {
          return next(new AppError(err.message, 409));
        }
        next(err);
      }
    },
  );

  return router;
}
