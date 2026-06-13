import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { BudgetItem } from "../../../domain/entity/budget.js";
import type { MongoDBClient } from "./client.js";

interface BudgetDoc {
  _id: ObjectId;
  project_id: string;
  label: string;
  category: BudgetItem["category"];
  currency: BudgetItem["currency"];
  budget_amount: number;
  invoiced_amount: number;
  paid_amount: number;
  status: BudgetItem["status"];
  due_date?: Date;
  notes?: string;
  created_by_id: string;
  created_at: Date;
  updated_at: Date;
}

function toDoc(b: BudgetItem): BudgetDoc {
  return {
    _id: new ObjectId(b.id),
    project_id: b.projectId,
    label: b.label,
    category: b.category,
    currency: b.currency,
    budget_amount: b.budgetAmount,
    invoiced_amount: b.invoicedAmount,
    paid_amount: b.paidAmount,
    status: b.status,
    due_date: b.dueDate,
    notes: b.notes,
    created_by_id: b.createdById,
    created_at: b.createdAt,
    updated_at: b.updatedAt,
  };
}

function fromDoc(d: BudgetDoc): BudgetItem {
  return {
    id: d._id.toHexString(),
    projectId: d.project_id,
    label: d.label,
    category: d.category,
    currency: d.currency,
    budgetAmount: d.budget_amount,
    invoicedAmount: d.invoiced_amount,
    paidAmount: d.paid_amount,
    status: d.status,
    dueDate: d.due_date,
    notes: d.notes,
    createdById: d.created_by_id,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

export class MongoBudgetRepository {
  private readonly col: Collection<BudgetDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<BudgetDoc>("budget_items");
  }

  async findByProjectId(projectId: string): Promise<BudgetItem[]> {
    const docs = await this.col.find({ project_id: projectId }).sort({ created_at: 1 }).toArray();
    return docs.map(fromDoc);
  }

  async findById(id: string): Promise<BudgetItem | null> {
    if (!ObjectId.isValid(id)) return null;
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? fromDoc(doc) : null;
  }

  async create(item: BudgetItem): Promise<BudgetItem> {
    await this.col.insertOne(toDoc(item));
    return item;
  }

  async update(item: BudgetItem): Promise<BudgetItem> {
    const updated = { ...item, updatedAt: new Date() };
    await this.col.replaceOne({ _id: new ObjectId(item.id) }, toDoc(updated));
    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!ObjectId.isValid(id)) return;
    await this.col.deleteOne({ _id: new ObjectId(id) });
  }
}
