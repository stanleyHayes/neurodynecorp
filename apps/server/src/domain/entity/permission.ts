/**
 * RBAC Permission system.
 *
 * Permissions follow the format "resource:action".
 * Actions have a weight hierarchy: read(1) < create(2) < update(3) < delete(4).
 * Higher-weight actions require all lower-weight actions to be present.
 */

// ── Actions (ordered by weight) ────────────────────────────────────────────

export const ACTIONS = ["read", "create", "update", "delete"] as const;
export type Action = (typeof ACTIONS)[number];

export const ACTION_WEIGHT: Record<Action, number> = {
  read: 1,
  create: 2,
  update: 3,
  delete: 4,
};

// ── Resources ──────────────────────────────────────────────────────────────

export const RESOURCES = [
  "dashboard",
  "pipeline",
  "analytics",
  "clients",
  "projects",
  "specifications",
  "tasks",
  "blog",
  "portfolio",
  "testimonials",
  "services",
  "contact_submissions",
  "team",
  "messages",
  "finance",
  "billing",
  "notifications",
  "documents",
  "settings",
  "roles",
] as const;

export type Resource = (typeof RESOURCES)[number];

// ── Permission string helpers ──────────────────────────────────────────────

export type Permission = `${Resource}:${Action}`;

export function perm(resource: Resource, action: Action): Permission {
  return `${resource}:${action}`;
}

export function parsePermission(p: string): { resource: Resource; action: Action } | null {
  const [resource, action] = p.split(":") as [string, string];
  if (
    RESOURCES.includes(resource as Resource) &&
    ACTIONS.includes(action as Action)
  ) {
    return { resource: resource as Resource, action: action as Action };
  }
  return null;
}

/**
 * All valid permission strings.
 */
export const ALL_PERMISSIONS: Permission[] = RESOURCES.flatMap((r) =>
  ACTIONS.map((a) => perm(r, a)),
);

// ── Weight validation ──────────────────────────────────────────────────────

/**
 * Returns the required lower-weight permissions for a given permission.
 * e.g. "projects:delete" requires ["projects:read", "projects:create", "projects:update"]
 */
export function requiredPermissions(p: Permission): Permission[] {
  const parsed = parsePermission(p);
  if (!parsed) return [];

  const weight = ACTION_WEIGHT[parsed.action];
  return ACTIONS
    .filter((a) => ACTION_WEIGHT[a] < weight)
    .map((a) => perm(parsed.resource, a));
}

/**
 * Validates that a permission set respects action weight constraints.
 * Returns missing permissions that need to be added.
 */
export function validatePermissionWeights(permissions: string[]): string[] {
  const missing: Set<string> = new Set();
  for (const p of permissions) {
    const required = requiredPermissions(p as Permission);
    for (const req of required) {
      if (!permissions.includes(req)) {
        missing.add(req);
      }
    }
  }
  return Array.from(missing);
}

/**
 * Normalizes a permission set by adding any missing lower-weight permissions.
 * e.g. ["projects:delete"] -> ["projects:read", "projects:create", "projects:update", "projects:delete"]
 */
export function normalizePermissions(permissions: string[]): string[] {
  const result = new Set(permissions);
  for (const p of permissions) {
    const required = requiredPermissions(p as Permission);
    for (const req of required) {
      result.add(req);
    }
  }
  return Array.from(result);
}
