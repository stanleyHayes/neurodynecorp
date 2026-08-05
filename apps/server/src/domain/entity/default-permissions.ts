import { perm } from "./permission.js";

/** Default permission set for self-registered and seeded client accounts. */
export const CLIENT_DEFAULT_PERMISSIONS: string[] = [
  perm("dashboard", "read"),
  perm("projects", "read"),
  perm("specifications", "read"),
  perm("specifications", "update"),
  perm("messages", "read"),
  perm("messages", "create"),
  perm("billing", "read"),
  perm("notifications", "read"),
  perm("documents", "read"),
  perm("settings", "read"),
  perm("settings", "update"),
];
