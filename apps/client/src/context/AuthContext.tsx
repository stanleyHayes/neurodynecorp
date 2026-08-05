import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { ApiClient } from "@neurodyne/shared";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  role_id?: string;
  permissions: string[];
  avatar?: string;
  company?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  api: ApiClient;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; first_name: string; last_name: string; company?: string; phone?: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { first_name: string; last_name: string; phone?: string; company?: string }) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  permissions: string[];
}

const AuthContext = createContext<AuthState | null>(null);

const TOKEN_KEY = "neurodyne_access_token";
const REFRESH_KEY = "neurodyne_refresh_token";
const USER_KEY = "neurodyne_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const getToken = useCallback(() => localStorage.getItem(TOKEN_KEY), []);
  const getRefreshToken = useCallback(() => localStorage.getItem(REFRESH_KEY), []);

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    window.location.href = "/login";
  }, []);

  const handleTokensRefreshed = useCallback((accessToken: string, refreshToken: string) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  }, []);

  const [api] = useState(
    () =>
      new ApiClient({
        baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:4000",
        getToken,
        getRefreshToken,
        onTokensRefreshed: handleTokensRefreshed,
        onUnauthorized: handleUnauthorized,
      })
  );

  // Rehydrate permissions/profile from the API so seed/role changes stick.
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    let cancelled = false;
    (async () => {
      try {
        const profile = (await api.getProfile()) as User;
        if (cancelled) return;
        localStorage.setItem(USER_KEY, JSON.stringify(profile));
        setUser(profile);
      } catch {
        // 401 path is handled by ApiClient refresh / onUnauthorized.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const res = await api.login(email, password);
        localStorage.setItem(TOKEN_KEY, res.access_token ?? res.accessToken);
        localStorage.setItem(REFRESH_KEY, res.refresh_token ?? res.refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        setUser(res.user as User);
      } finally {
        setIsLoading(false);
      }
    },
    [api]
  );

  const register = useCallback(
    async (data: { email: string; password: string; first_name: string; last_name: string; company?: string; phone?: string }) => {
      setIsLoading(true);
      try {
        const res = await api.register({ ...data, role: "client" });
        localStorage.setItem(TOKEN_KEY, res.access_token ?? res.accessToken);
        localStorage.setItem(REFRESH_KEY, res.refresh_token ?? res.refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        setUser(res.user as User);
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

  const permissions = user?.permissions ?? [];

  // Fail closed: empty permissions means no access.
  const hasPermission = useCallback(
    (permission: string) => permissions.includes(permission),
    [permissions]
  );

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, api, login, register, logout, updateProfile, hasPermission, permissions }}
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
