import { API_URL } from "../config";
import { authStorage } from "../storage/auth-storage";

async function getToken(): Promise<string | null> {
  return authStorage.getToken();
}

async function request<T>(path: string, options: { method?: string; body?: any } = {}): Promise<T> {
  const { method = "GET", body } = options;
  const token = await getToken();

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && token) {
    await authStorage.clearSession();
    throw new Error("Your session has expired. Please sign in again.");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error ?? `Request failed (${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────

export function getProfile() {
  return request<any>("/api/v1/auth/profile");
}

export function updateProfile(data: {
  first_name?: string;
  last_name?: string;
  phone?: string;
  company?: string;
}) {
  return request<any>("/api/v1/auth/profile", { method: "PATCH", body: data });
}

export function createPrivacyRequest(type: "export" | "erasure", email?: string) {
  return request<any>("/api/v1/privacy/requests", { method: "POST", body: { type, email } });
}

export function listMyPrivacyRequests() {
  return request<{ items: any[]; total: number }>("/api/v1/privacy/requests/mine");
}

// ── Projects ──────────────────────────────────────────────────────────────

export function listProjects(params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<{ items: any[]; total: number }>(`/api/v1/projects${qs}`);
}

export function getProject(id: string) {
  return request<any>(`/api/v1/projects/${id}`);
}

// ── Invoices ──────────────────────────────────────────────────────────────

export function listInvoices(params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<{ items: any[]; total: number }>(`/api/v1/invoices${qs}`);
}

// ── Notifications ─────────────────────────────────────────────────────────

export function listNotifications() {
  return request<{ items: any[]; total: number; unread: number }>("/api/v1/notifications");
}

export function markNotificationRead(id: string) {
  return request<void>(`/api/v1/notifications/${id}/read`, { method: "PATCH" });
}

export function markAllNotificationsRead() {
  return request<void>("/api/v1/notifications/read-all", { method: "POST" });
}

export function getUnreadNotificationCount() {
  return request<{ unread: number }>("/api/v1/notifications/unread-count");
}

// ── Messages ──────────────────────────────────────────────────────────────

export function listThreads(projectId: string) {
  return request<{ threads: any[] }>(`/api/v1/messages/threads?projectId=${projectId}`);
}

export function getMessages(threadId: string) {
  // Thread routes live under the /api/v1/messages mount: the /threads segment
  // is required, and POSTing a message goes to that thread's collection.
  return request<{ items: any[] }>(`/api/v1/messages/threads/${threadId}/messages`);
}

export function sendMessage(threadId: string, content: string) {
  return request<any>(`/api/v1/messages/threads/${threadId}/messages`, {
    method: "POST",
    body: { content },
  });
}
