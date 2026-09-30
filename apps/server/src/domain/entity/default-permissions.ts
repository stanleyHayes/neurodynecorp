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
  // The portal ships a webhooks page whose routes are owner-scoped by an
  // explicit ownerId check on every handler. Without these a client account
  // could not open it at all, so the feature was unreachable by everyone it
  // was built for.
  perm("webhooks", "read"),
  perm("webhooks", "create"),
  perm("webhooks", "update"),
  perm("webhooks", "delete"),
];
