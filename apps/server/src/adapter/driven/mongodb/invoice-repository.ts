import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { Invoice } from "../../../domain/entity/index.js";
import type { InvoiceRepository } from "../../../domain/port/index.js";
import type { MongoDBClient } from "./client.js";

interface InvoiceDoc {
  _id: ObjectId;
  project_id: string;
  client_id: string;
  invoice_number: string;
  status: string;
  line_items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  due_date: Date;
  paid_at?: Date;
  payment_provider?: string;
  payment_reference?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

/** Accept domain Invoice or BillingService shape (`items` / `total` / `paymentId`). */
function toDoc(invoice: Invoice | Record<string, any>): InvoiceDoc {
  const i = invoice as Record<string, any>;
  const lineItems =
    Array.isArray(i.lineItems) && i.lineItems.length > 0
      ? i.lineItems
      : Array.isArray(i.items)
        ? i.items.map((li: any) => ({
            id: li.id ?? new ObjectId().toHexString(),
            description: li.description,
            quantity: li.quantity,
            unitPrice: li.unitPrice ?? li.unit_price ?? 0,
            amount: li.amount ?? li.total ?? 0,
          }))
        : [];

  return {
    _id: new ObjectId(i.id),
    project_id: i.projectId,
    client_id: i.clientId,
    invoice_number: i.invoiceNumber,
    status: i.status,
    line_items: lineItems.map((li: any) => ({
      id: li.id ?? new ObjectId().toHexString(),
      description: li.description,
      quantity: li.quantity,
      unit_price: li.unitPrice ?? li.unit_price ?? 0,
      amount: li.amount ?? li.total ?? 0,
    })),
    subtotal: i.subtotal,
    tax: i.tax,
    total: i.total,
    currency: i.currency,
    due_date: i.dueDate,
    paid_at: i.paidAt,
    payment_provider: i.paymentProvider,
    payment_reference: i.paymentReference ?? i.paymentId,
    notes: i.notes,
    created_at: i.createdAt,
    updated_at: i.updatedAt,
  };
}

function fromDoc(d: InvoiceDoc): Invoice {
  return {
    id: d._id.toHexString(),
    projectId: d.project_id,
    clientId: d.client_id,
    invoiceNumber: d.invoice_number,
    status: d.status as Invoice["status"],
    lineItems: d.line_items.map((li) => ({
      id: li.id,
      description: li.description,
      quantity: li.quantity,
      unitPrice: li.unit_price,
      amount: li.amount,
    })),
    subtotal: d.subtotal,
    tax: d.tax,
    total: d.total,
    currency: d.currency,
    dueDate: d.due_date,
    paidAt: d.paid_at,
    paymentProvider: d.payment_provider as Invoice["paymentProvider"],
    paymentReference: d.payment_reference,
    notes: d.notes,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

export class MongoInvoiceRepository implements InvoiceRepository {
  private readonly col: Collection<InvoiceDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<InvoiceDoc>("invoices");
  }

  async findById(id: string): Promise<Invoice | null> {
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? fromDoc(doc) : null;
  }

  async findByProjectId(projectId: string): Promise<Invoice[]> {
    const docs = await this.col
      .find({ project_id: projectId })
      .sort({ created_at: -1 })
      .toArray();
    return docs.map(fromDoc);
  }

  async findByClientId(clientId: string): Promise<Invoice[]> {
    const docs = await this.col
      .find({ client_id: clientId })
      .sort({ created_at: -1 })
      .toArray();
    return docs.map(fromDoc);
  }

  async listByClient(
    clientId: string,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<{ invoices: Invoice[]; total: number }> {
    const query = { client_id: clientId };
    const total = await this.col.countDocuments(query);
    const docs = await this.col
      .find(query)
      .sort({ created_at: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();
    return { invoices: docs.map(fromDoc), total };
  }

  async create(invoice: Invoice): Promise<Invoice> {
    await this.col.insertOne(toDoc(invoice));
    return invoice;
  }

  async update(idOrInvoice: string | Invoice, data?: Partial<Invoice>): Promise<Invoice> {
    if (typeof idOrInvoice === "string") {
      const existing = await this.findById(idOrInvoice);
      if (!existing) throw new Error(`Invoice not found: ${idOrInvoice}`);
      const merged = { ...existing, ...data, updatedAt: new Date() };
      const doc = toDoc(merged);
      await this.col.replaceOne({ _id: doc._id }, doc);
      return merged;
    }
    const doc = toDoc({ ...idOrInvoice, updatedAt: new Date() });
    await this.col.replaceOne({ _id: doc._id }, doc);
    return { ...idOrInvoice, updatedAt: doc.updated_at };
  }

  /**
   * Conditionally set status=paid only when the invoice is not already paid.
   * Returns the updated invoice, or null if missing / already paid.
   */
  async markPaidIfUnpaid(id: string, paymentId: string, paidAt: Date): Promise<Invoice | null> {
    const doc = await this.col.findOneAndUpdate(
      { _id: new ObjectId(id), status: { $ne: "paid" } },
      {
        $set: {
          status: "paid",
          paid_at: paidAt,
          payment_reference: paymentId,
          updated_at: paidAt,
        },
      },
      { returnDocument: "after" },
    );
    return doc ? fromDoc(doc) : null;
  }

  async delete(id: string): Promise<void> {
    await this.col.deleteOne({ _id: new ObjectId(id) });
  }
}
