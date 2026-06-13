import { ObjectId } from "mongodb";

/**
 * Budget & Milestone Tracker (spec §7).
 *
 * Project-scoped, staff-write / client-read. Extends Billing (invoices only)
 * with the engagement budget picture: burn vs budget, milestones
 * invoiced/outstanding, USD↔GHS exposure, and a forward forecast. Each item is
 * a budgeted line (milestone, workstream, retainer, or expense) with its
 * contracted budget plus amounts invoiced and paid to date.
 *
 * Amounts are stored as plain decimal numbers in the item's own `currency`
 * (no implicit conversion — currency exposure is reported per-currency).
 */

export type BudgetCurrency = "USD" | "GHS" | "EUR" | "GBP";
export const BUDGET_CURRENCIES: BudgetCurrency[] = ["USD", "GHS", "EUR", "GBP"];

export type BudgetCategory = "milestone" | "workstream" | "retainer" | "expense";
export const BUDGET_CATEGORIES: BudgetCategory[] = ["milestone", "workstream", "retainer", "expense"];

export type BudgetStatus = "planned" | "in_progress" | "invoiced" | "paid" | "overdue";
export const BUDGET_STATUSES: BudgetStatus[] = ["planned", "in_progress", "invoiced", "paid", "overdue"];

export interface BudgetItem {
  id: string;
  projectId: string;
  label: string;
  category: BudgetCategory;
  currency: BudgetCurrency;
  /** Contracted / budgeted amount for this line. */
  budgetAmount: number;
  /** Amount invoiced to date. */
  invoicedAmount: number;
  /** Amount paid to date. */
  paidAmount: number;
  status: BudgetStatus;
  /** Expected invoice/completion date — used for the forward forecast. */
  dueDate?: Date;
  notes?: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export function createBudgetItem(input: Omit<BudgetItem, "id" | "createdAt" | "updatedAt">): BudgetItem {
  const now = new Date();
  return { id: new ObjectId().toHexString(), ...input, createdAt: now, updatedAt: now };
}
