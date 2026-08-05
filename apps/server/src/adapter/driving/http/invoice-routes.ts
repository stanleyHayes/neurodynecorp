import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requirePermission, type TokenService } from "../../../middleware/auth.js";
import { ValidationError, NotFoundError, AppError } from "../../../middleware/error-handler.js";
import type { BillingService } from "../../../app/billing-service.js";
import { InvoiceNotFoundError, InvoiceAlreadyPaidError } from "../../../app/billing-service.js";
import type { InvoiceLineItem } from "../../../app/billing-service.js";

// ---- Validation schemas ----

const createInvoiceSchema = z
  .object({
    projectId: z.string().min(1).optional(),
    project_id: z.string().min(1).optional(),
    clientId: z.string().min(1).optional(),
    client_id: z.string().min(1).optional(),
    items: z
      .array(
        z.object({
          description: z.string().min(1),
          quantity: z.number().positive(),
          unitPrice: z.number().nonnegative().optional(),
          unit_price: z.number().nonnegative().optional(),
          total: z.number().nonnegative().optional(),
        }),
      )
      .min(1),
    tax: z.number().nonnegative().optional().default(0),
    currency: z.string().length(3).optional().default("USD"),
    dueDate: z.coerce.date().optional(),
    due_date: z.coerce.date().optional(),
  })
  .refine((d) => d.projectId ?? d.project_id, { message: "projectId is required" })
  .refine((d) => d.clientId ?? d.client_id, { message: "clientId is required" })
  .refine((d) => d.dueDate ?? d.due_date, { message: "dueDate is required" })
  .transform((d) => ({
    projectId: (d.projectId ?? d.project_id)!,
    clientId: (d.clientId ?? d.client_id)!,
    items: d.items.map((item) => {
      const unitPrice = item.unitPrice ?? item.unit_price ?? 0;
      const total = item.total ?? unitPrice * item.quantity;
      return { description: item.description, quantity: item.quantity, unitPrice, total };
    }),
    tax: d.tax,
    currency: d.currency,
    dueDate: (d.dueDate ?? d.due_date)!,
  }));

const listInvoicesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
});

const markPaidSchema = z
  .object({
    paymentId: z.string().min(1).optional(),
    payment_id: z.string().min(1).optional(),
  })
  .refine((d) => d.paymentId ?? d.payment_id, { message: "paymentId is required" })
  .transform((d) => ({ paymentId: (d.paymentId ?? d.payment_id)! }));

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

      let clientId: string;
      if (req.userRole === "client") {
        // Clients always see their own invoices — ignore any clientId query.
        clientId = req.userId!;
      } else {
        // Staff need finance:read; arbitrary clientId without it was an IDOR.
        const perms = req.userPermissions ?? [];
        if (!perms.includes("finance:read") && !perms.includes("billing:read")) {
          res.status(403).json({ error: "Insufficient permissions", missing: ["finance:read"] });
          return;
        }
        const requested = req.query["clientId"] as string | undefined;
        if (!requested) {
          throw new ValidationError("clientId query parameter is required");
        }
        clientId = requested;
      }

      const result = await billingService.listByClient(clientId, parsed.data.page, parsed.data.pageSize);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/invoices/:id
  router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invoice = await billingService.getById(String(req.params.id));
      if (req.userRole === "client") {
        if (invoice.clientId !== req.userId) {
          return next(new NotFoundError("Invoice", String(req.params.id)));
        }
      } else {
        const perms = req.userPermissions ?? [];
        if (!perms.includes("finance:read") && !perms.includes("billing:read")) {
          res.status(403).json({ error: "Insufficient permissions", missing: ["finance:read"] });
          return;
        }
      }
      res.status(200).json(invoice);
    } catch (err) {
      if (err instanceof InvoiceNotFoundError) {
        return next(new NotFoundError("Invoice", String(req.params.id)));
      }
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
