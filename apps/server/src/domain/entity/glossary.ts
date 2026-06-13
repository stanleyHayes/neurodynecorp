import { ObjectId } from "mongodb";

/**
 * Glossary of Practice (spec §10).
 *
 * Public-read / staff-write definitions of the firm's language (leverage points,
 * capability lattice, sovereign-by-default…). A dedicated collection — kept
 * separate from the Help Center knowledge base so glossary terms never leak into
 * help-article listings.
 */

export type GlossaryStatus = "published" | "draft";
export const GLOSSARY_STATUSES: GlossaryStatus[] = ["published", "draft"];

export interface GlossaryTerm {
  id: string;
  term: string;
  slug: string;
  definition: string;
  /** Optional grouping, e.g. "Methodology", "Capability", "Governance". */
  category?: string;
  /** Alternative names / acronyms that should also match this term in search. */
  aliases: string[];
  status: GlossaryStatus;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export function slugifyTerm(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function createGlossaryTerm(input: Omit<GlossaryTerm, "id" | "createdAt" | "updatedAt">): GlossaryTerm {
  const now = new Date();
  return { id: new ObjectId().toHexString(), ...input, createdAt: now, updatedAt: now };
}
