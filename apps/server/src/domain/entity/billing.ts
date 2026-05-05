import { ObjectId } from "mongodb";

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "cancelled"
  | "refunded";

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  projectId: string;
  clientId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  dueDate: Date;
  paidAt?: Date;
  paymentProvider?: "stripe" | "paystack";
  paymentReference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvoiceInput {
  projectId: string;
  clientId: string;
  invoiceNumber: string;
  lineItems: LineItem[];
  tax: number;
  currency?: string;
  dueDate: Date;
  notes?: string;
}

export function createInvoice(input: CreateInvoiceInput): Invoice {
  const subtotal = input.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const now = new Date();
  return {
    id: new ObjectId().toHexString(),
    projectId: input.projectId,
    clientId: input.clientId,
    invoiceNumber: input.invoiceNumber,
    status: "draft",
    lineItems: input.lineItems,
    subtotal,
    tax: input.tax,
    total: subtotal + input.tax,
    currency: input.currency ?? "USD",
    dueDate: input.dueDate,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
  };
}
