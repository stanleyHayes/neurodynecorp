import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import { ApiClient } from "@neurodyne/shared";
import { API_URL } from "@/config";

const ALLOWED_ROLES = ["admin", "project_manager"];

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  role_id?: string;
  permissions: string[];
  avatar?: string;
  phone?: string;
  company?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  api: ApiClient;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { first_name: string; last_name: string; phone?: string; company?: string }) => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (...permissions: string[]) => boolean;
  hasAllPermissions: (...permissions: string[]) => boolean;
  permissions: string[];
}

const AuthContext = createContext<AuthState | null>(null);

const TOKEN_KEY = "neurodyne_admin_access_token";
const REFRESH_KEY = "neurodyne_admin_refresh_token";
const USER_KEY = "neurodyne_admin_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored) as User;
      return ALLOWED_ROLES.includes(parsed.role) ? parsed : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const getToken = useCallback(() => localStorage.getItem(TOKEN_KEY), []);

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    window.location.href = "/login";
  }, []);

  const [api] = useState(
    () =>
      new ApiClient({
        baseUrl: API_URL,
        getToken,
        onUnauthorized: handleUnauthorized,
      })
  );

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const res = await api.login(email, password);
        const loginUser = res.user as User;

        if (!ALLOWED_ROLES.includes(loginUser.role)) {
          throw new Error("Access denied. Admin or project manager role required.");
        }

        localStorage.setItem(TOKEN_KEY, res.access_token ?? res.accessToken);
        localStorage.setItem(REFRESH_KEY, res.refresh_token ?? res.refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(loginUser));
        setUser(loginUser);
      } finally {
        setIsLoading(false);
      }
    },
    [api]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: { first_name: string; last_name: string; phone?: string; company?: string }) => {
    const updated = (await api.updateProfile(data)) as User;
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    setUser(updated);
  }, [api]);

  const hasRole = useCallback(
    (role: string) => user?.role === role,
    [user]
  );

  const permissions = useMemo(() => user?.permissions ?? [], [user?.permissions]);

  // Fail closed: empty permissions means no access (never treat missing RBAC as admin).
  const hasPermission = useCallback(
    (permission: string) => permissions.includes(permission),
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (...perms: string[]) => perms.some((p) => permissions.includes(p)),
    [permissions]
  );

  const hasAllPermissions = useCallback(
    (...perms: string[]) => perms.every((p) => permissions.includes(p)),
    [permissions]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        api,
        login,
        logout,
        updateProfile,
        hasRole,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        permissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/**
 * Hook for checking permissions in components.
 * Usage:
 *   const can = usePermission();
 *   if (can("projects:read")) { ... }
 *   if (can("projects:delete")) { ... }
 */
export function usePermission() {
  const { hasPermission } = useAuth();
  return hasPermission;
}
