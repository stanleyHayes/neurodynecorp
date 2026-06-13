import { ObjectId } from "mongodb";

/**
 * Team Directory (spec §7).
 *
 * Project-scoped, staff-write / client-read. The firm's delivery team on an
 * engagement — who they are, their role, how to reach them, and their
 * allocation/availability. Distinct from `project.assigned_team` (a flat list
 * of ids) and from the Stakeholder Map (decision authority across both sides):
 * this is the contactable, curated roster the client sees for their engagement.
 */

export type MemberAvailability = "full_time" | "part_time" | "on_call" | "unavailable";
export const MEMBER_AVAILABILITIES: MemberAvailability[] = ["full_time", "part_time", "on_call", "unavailable"];

export interface EngagementMember {
  id: string;
  projectId: string;
  name: string;
  role: string;
  email?: string;
  /** Allocation / availability on this engagement. */
  availability: MemberAvailability;
  /** Area of focus on the engagement. */
  focus?: string;
  bio?: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export function createEngagementMember(
  input: Omit<EngagementMember, "id" | "createdAt" | "updatedAt">,
): EngagementMember {
  const now = new Date();
  return { id: new ObjectId().toHexString(), ...input, createdAt: now, updatedAt: now };
}
