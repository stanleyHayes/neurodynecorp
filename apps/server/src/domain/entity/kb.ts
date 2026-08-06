import { ObjectId } from "mongodb";

// ── Knowledge Base Article ───────────────────────────────────────────────────

export interface KbArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  body: string;
  tags: string[];
  status: "published" | "draft";
  helpfulYes: number;
  helpfulNo: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export function createKbArticle(input: Omit<KbArticle, "id" | "createdAt" | "updatedAt">): KbArticle {
  const now = new Date();
  return { ...input, id: new ObjectId().toHexString(), createdAt: now, updatedAt: now };
}
