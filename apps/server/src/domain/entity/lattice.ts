import { ObjectId } from "mongodb";

/**
 * Capability Lattice Tracker (spec §7.2).
 *
 * Project-scoped, staff-write / client-read. Tracks each capability mapped to a
 * standard capability map and where it sits in the delivery lattice:
 * delivered → in-flight → queued → deferred.
 */

export type LatticeStatus = "delivered" | "in_flight" | "queued" | "deferred";
export const LATTICE_STATUSES: LatticeStatus[] = ["delivered", "in_flight", "queued", "deferred"];

export interface LatticeItem {
  id: string;
  projectId: string;
  /** The capability being tracked (e.g. "Identity & Access", "Observability"). */
  capability: string;
  /** The standard capability-map grouping this capability belongs to. */
  category: string;
  status: LatticeStatus;
  description?: string;
  owner?: string;
  /** Target completion for in-flight / queued items. */
  targetDate?: Date;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export function createLatticeItem(input: Omit<LatticeItem, "id" | "createdAt" | "updatedAt">): LatticeItem {
  const now = new Date();
  return { id: new ObjectId().toHexString(), ...input, createdAt: now, updatedAt: now };
}
