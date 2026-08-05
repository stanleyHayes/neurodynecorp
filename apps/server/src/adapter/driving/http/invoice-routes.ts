import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, requirePermission, type TokenService } from "../../../middleware/auth.js";
import { isClientActor } from "../../../middleware/rbac-helpers.js";
import { ValidationError, NotFoundError, AppError } from "../../../middleware/error-handler.js";
import type { BillingService } from "../../../app/billing-service.js";
import { InvoiceNotFoundError, InvoiceAlreadyPaidError } from "../../../app/billing-service.js";
import type { InvoiceLineItem } from "../../../app/billing-service.js";
import type { PaymentGateway } from "../../../domain/port/index.js";

export interface InvoiceRouteDeps {
  paymentGateway?: PaymentGateway;
  paymentProvider?: string;
  /** Resolve payer email for Paystack initialize / Stripe receipts. */
  findUserEmail?: (userId: string) => Promise<string | null>;
}

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

function toApiInvoice(invoice: Record<string, any>) {
  const lineItems = invoice.lineItems ?? invoice.items ?? [];
  const items = lineItems.map((li: any) => ({
    description: li.description,
    quantity: li.quantity,
    unit_price: li.unitPrice ?? li.unit_price ?? 0,
    total: li.amount ?? li.total ?? 0,
  }));
  return {
    id: invoice.id,
    project_id: invoice.projectId,
    client_id: invoice.clientId,
    invoice_number: invoice.invoiceNumber,
    status: invoice.status,
    items,
    subtotal: invoice.subtotal,
    tax: invoice.tax,
    total: invoice.total,
    currency: invoice.currency,
    due_date: invoice.dueDate,
    paid_at: invoice.paidAt,
    payment_id: invoice.paymentId ?? invoice.paymentReference,
    created_at: invoice.createdAt,
    updated_at: invoice.updatedAt,
    // camelCase retained for existing consumers
    projectId: invoice.projectId,
    clientId: invoice.clientId,
    invoiceNumber: invoice.invoiceNumber,
    dueDate: invoice.dueDate,
    paidAt: invoice.paidAt,
  };
}

// ---- Route factory ----

export function createInvoiceRoutes(
  billingService: BillingService,
  tokenService: TokenService,
  deps: InvoiceRouteDeps = {},
): Router {
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
        res.status(201).json(toApiInvoice(invoice as unknown as Record<string, any>));
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
      if (isClientActor(req.userRole)) {
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
      const items = result.invoices.map((inv) => toApiInvoice(inv as unknown as Record<string, any>));
      res.status(200).json({
        items,
        invoices: items,
        total: result.total,
        page: parsed.data.page,
        page_size: parsed.data.pageSize,
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/invoices/:id
  router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invoice = await billingService.getById(String(req.params.id));
      if (isClientActor(req.userRole)) {
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
      res.status(200).json(toApiInvoice(invoice as unknown as Record<string, any>));
    } catch (err) {
      if (err instanceof InvoiceNotFoundError) {
        return next(new NotFoundError("Invoice", String(req.params.id)));
      }
      next(err);
    }
  });

  // POST /api/v1/invoices/:id/checkout — create a provider payment intent for this invoice
  router.post("/:id/checkout", async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!deps.paymentGateway) {
        res.status(503).json({ error: "Payment provider is not configured" });
        return;
      }

      const invoice = await billingService.getById(String(req.params.id));
      if (isClientActor(req.userRole)) {
        if (invoice.clientId !== req.userId) {
          return next(new NotFoundError("Invoice", String(req.params.id)));
        }
      } else {
        const perms = req.userPermissions ?? [];
        if (!perms.includes("finance:create") && !perms.includes("billing:create")) {
          res.status(403).json({ error: "Insufficient permissions", missing: ["finance:create"] });
          return;
        }
      }

      if (invoice.status === "paid") {
        return next(new AppError("Invoice is already paid", 409));
      }
      const blocked = new Set(["cancelled", "canceled", "refunded"]);
      if (blocked.has(String(invoice.status))) {
        return next(new AppError("Invoice cannot be paid in its current status", 409));
      }
      if (!Number.isFinite(invoice.total) || invoice.total <= 0) {
        throw new ValidationError("Invoice total must be positive to start checkout");
      }

      const email =
        (deps.findUserEmail ? await deps.findUserEmail(invoice.clientId) : null) ??
        "customer@neurodynecorp.com";

      const intent = await deps.paymentGateway.createPaymentIntent(
        invoice.total,
        invoice.currency,
        {
          invoiceId: invoice.id,
          invoice_id: invoice.id,
          clientId: invoice.clientId,
          email,
        },
      );

      res.status(200).json({
        provider: deps.paymentProvider ?? "unknown",
        clientSecret: intent.clientSecret,
        client_secret: intent.clientSecret,
        paymentIntentId: intent.paymentIntentId,
        payment_intent_id: intent.paymentIntentId,
        invoiceId: invoice.id,
        invoice_id: invoice.id,
        amount: invoice.total,
        currency: invoice.currency,
      });
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
        res.status(200).json(toApiInvoice(invoice as unknown as Record<string, any>));
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
