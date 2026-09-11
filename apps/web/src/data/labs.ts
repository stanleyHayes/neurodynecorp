// Neurodyne Labs content.
//
// Labs is no longer a separate hand-written list. It is a view over the project
// portfolio: every entry in `@/content/projects` carrying `tier: "labs"` is an
// experiment or concept, always labelled RESEARCH until it graduates. Keeping a
// second source of truth here is how a page ends up claiming a stage the work
// has not reached, so this module only re-exports and looks up.

import { LABS, type Project } from "@/content/projects";

export type LabsProduct = Project;

export const LABS_PRODUCTS: LabsProduct[] = LABS;

export function getLabsProduct(slug: string): LabsProduct | undefined {
  return LABS_PRODUCTS.find((p) => p.slug === slug);
}
