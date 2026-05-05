import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";

interface PermissionGateProps {
  /** Single permission or array — all must be satisfied */
  permission: string | string[];
  /** If true, only one of the permissions needs to match */
  any?: boolean;
  /** Rendered when the user lacks the required permission(s) */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Conditionally renders children based on the current user's permissions.
 *
 * Usage:
 *   <PermissionGate permission="projects:delete">
 *     <DeleteButton />
 *   </PermissionGate>
 *
 *   <PermissionGate permission={["projects:update", "projects:delete"]} any>
 *     <ActionMenu />
 *   </PermissionGate>
 */
export default function PermissionGate({ permission, any = false, fallback = null, children }: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  const perms = Array.isArray(permission) ? permission : [permission];

  const allowed = perms.length === 1
    ? hasPermission(perms[0]!)
    : any
      ? hasAnyPermission(...perms)
      : hasAllPermissions(...perms);

  return allowed ? <>{children}</> : <>{fallback}</>;
}
