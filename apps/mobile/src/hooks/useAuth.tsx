import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from "react";
import { API_URL } from "../config";
import { authStorage } from "../storage/auth-storage";
import { updateProfile as updateProfileRequest } from "../api/client";

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { first_name: string; last_name: string; phone?: string; company?: string }) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  permissions: string[];
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authStorage.getUser().then((stored) => {
      if (!active) return;
      if (stored) {
        try { setUser(JSON.parse(stored) as User); } catch { void authStorage.clearSession(); }
      }
      setIsLoading(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => authStorage.onSessionCleared(() => setUser(null)), []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Login failed" }));
        throw new Error(err.error ?? "Login failed");
      }

      const data = await res.json();
      await authStorage.setSession(data.accessToken ?? data.access_token, data.user);
      setUser(data.user as User);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authStorage.clearSession();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: { first_name: string; last_name: string; phone?: string; company?: string }) => {
    const updated = (await updateProfileRequest(data)) as User;
    await authStorage.setUser(updated);
    setUser(updated);
  }, []);

  const permissions = useMemo(() => user?.permissions ?? [], [user?.permissions]);
  const hasPermsData = permissions.length > 0;

  const hasPermission = useCallback(
    (permission: string) => !hasPermsData || permissions.includes(permission),
    [permissions, hasPermsData],
  );

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout, updateProfile, hasPermission, permissions }}
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
