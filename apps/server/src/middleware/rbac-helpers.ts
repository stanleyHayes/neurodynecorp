import type { Role } from "../domain/entity/user.js";

/** Built-in staff roles that may access any project's data (subject to permissions). */
export const STAFF_ROLES = new Set<string>([
  "admin",
  "project_manager",
  "developer",
  "qa",
]);

export const KNOWN_ROLES = new Set<string>([
  "admin",
  "project_manager",
  "developer",
  "qa",
  "client",
]);

export function isStaffRole(role?: string | null): boolean {
  return !!role && STAFF_ROLES.has(role);
}

/**
 * Tenancy helper: anyone who is not a known staff role is treated as a
 * client for ownership checks — including custom role names that would
 * otherwise bypass `role === "client"` gates.
 */
export function isClientActor(role?: string | null): boolean {
  return !isStaffRole(role);
}

export function asKnownRole(name: string): Role | null {
  return KNOWN_ROLES.has(name) ? (name as Role) : null;
}
