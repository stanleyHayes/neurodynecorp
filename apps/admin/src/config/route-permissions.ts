/**
 * Map from admin route path prefix to the permission required to view it.
 * Used by the sidebar (hide links) and ProtectedRoute (block direct URL access).
 */
export const ROUTE_PERMISSIONS: Record<string, string> = {
  "/": "dashboard:read",
  "/pipeline": "pipeline:read",
  "/project-intakes": "projects:read",
  "/analytics": "analytics:read",
  "/clients": "clients:read",
  "/projects": "projects:read",
  "/specifications": "specifications:read",
  "/tasks": "tasks:read",
  "/blog": "blog:read",
  "/portfolio": "portfolio:read",
  "/testimonials": "testimonials:read",
  "/services": "services:read",
  "/contact-submissions": "contact_submissions:read",
  "/team": "team:read",
  "/messages": "messages:read",
  "/notifications": "notifications:read",
  "/finance": "finance:read",
  "/roles": "roles:read",
  "/status": "incidents:read",
  "/feature-flags": "feature_flags:read",
  "/audit-log": "audit:read",
  "/feedback": "feedback:read",
  "/diagnostics": "diagnostic:read",
  "/rfp": "rfp:read",
  "/bookings": "booking:read",
  "/tickets": "tickets:read",
  "/knowledge-base": "kb:read",
  "/glossary": "kb:read",
  "/newsletter": "newsletter:read",
  "/privacy-requests": "dsr:read",
  "/changelog": "changelog:read",
  "/settings": "settings:read",
};

/** Longest-prefix match so `/projects/new` inherits `/projects`. */
export function permissionForPath(pathname: string): string | undefined {
  if (ROUTE_PERMISSIONS[pathname]) return ROUTE_PERMISSIONS[pathname];
  const match = Object.keys(ROUTE_PERMISSIONS)
    .filter((path) => path !== "/" && (pathname === path || pathname.startsWith(`${path}/`)))
    .sort((a, b) => b.length - a.length)[0];
  return match ? ROUTE_PERMISSIONS[match] : undefined;
}
