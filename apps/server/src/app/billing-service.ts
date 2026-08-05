import type { Logger } from "pino";
import { ObjectId } from "mongodb";
import type { EventPublisher } from "./auth-service";

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  projectId: string;
  clientId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  items: InvoiceLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  dueDate: Date;
  paidAt?: Date;
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Port interfaces
// ---------------------------------------------------------------------------

export interface InvoiceRepository {
  findById(id: string): Promise<Invoice | null>;
  create(invoice: Invoice): Promise<Invoice>;
  update(id: string, data: Partial<Invoice>): Promise<Invoice>;
  /** Atomically mark unpaid → paid. Returns null if missing or already paid. */
  markPaidIfUnpaid(id: string, paymentId: string, paidAt: Date): Promise<Invoice | null>;
  listByClient(
    clientId: string,
    page: number,
    pageSize: number,
  ): Promise<{ invoices: Invoice[]; total: number }>;
  listAll(page: number, pageSize: number): Promise<{ invoices: Invoice[]; total: number }>;
}

// ---------------------------------------------------------------------------
// Custom errors
// ---------------------------------------------------------------------------

export class InvoiceNotFoundError extends Error {
  constructor(id: string) {
    super(`Invoice "${id}" not found`);
    this.name = "InvoiceNotFoundError";
  }
}

export class InvoiceAlreadyPaidError extends Error {
  constructor(id: string) {
    super(`Invoice "${id}" has already been paid`);
    this.name = "InvoiceAlreadyPaidError";
  }
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class BillingService {
  constructor(
    private readonly invoiceRepo: InvoiceRepository,
    private readonly events: EventPublisher,
    private readonly logger: Logger,
  ) {}

  async createInvoice(
    projectId: string,
    clientId: string,
    items: InvoiceLineItem[],
    tax: number,
    currency: string,
    dueDate: Date,
  ): Promise<Invoice> {
    this.logger.info({ projectId, clientId, itemCount: items.length }, "Creating invoice");

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal + tax;

    const now = new Date();
    const invoice: Invoice = {
      id: new ObjectId().toHexString(),
      projectId,
      clientId,
      invoiceNumber: this.generateInvoiceNumber(),
      status: "draft",
      items,
      subtotal,
      tax,
      total,
      currency,
      dueDate,
      createdAt: now,
      updatedAt: now,
    };

    const created = await this.invoiceRepo.create(invoice);

    await this.events.publish("invoice.created", {
      invoiceId: created.id,
      projectId,
      clientId,
      total,
      currency,
    });

    this.logger.info({ invoiceId: created.id, total, currency }, "Invoice created");
    return created;
  }

  async markPaid(invoiceId: string, paymentId: string): Promise<Invoice> {
    this.logger.info({ invoiceId, paymentId }, "Marking invoice as paid");

    const now = new Date();
    // Atomic conditional update avoids concurrent double invoice.paid events.
    const updated = await this.invoiceRepo.markPaidIfUnpaid(invoiceId, paymentId, now);
    if (!updated) {
      const existing = await this.invoiceRepo.findById(invoiceId);
      if (!existing) {
        throw new InvoiceNotFoundError(invoiceId);
      }
      if (existing.status === "paid") {
        throw new InvoiceAlreadyPaidError(invoiceId);
      }
      throw new InvoiceNotFoundError(invoiceId);
    }

    await this.events.publish("invoice.paid", {
      invoiceId,
      projectId: updated.projectId,
      clientId: updated.clientId,
      paymentId,
      total: updated.total,
      currency: updated.currency,
    });

    this.logger.info({ invoiceId, paymentId }, "Invoice marked as paid");
    return updated;
  }

  async listByClient(
    clientId: string,
    page = 1,
    pageSize = 20,
  ): Promise<{ invoices: Invoice[]; total: number }> {
    return this.invoiceRepo.listByClient(clientId, page, pageSize);
  }

  async listAll(
    page = 1,
    pageSize = 20,
  ): Promise<{ invoices: Invoice[]; total: number }> {
    return this.invoiceRepo.listAll(page, pageSize);
  }

  async getById(invoiceId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findById(invoiceId);
    if (!invoice) {
      throw new InvoiceNotFoundError(invoiceId);
    }
    return invoice;
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private generateInvoiceNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `INV-${year}${month}-${random}`;
  }
}
