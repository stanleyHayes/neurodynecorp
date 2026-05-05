const DEFAULT_BASE_URL = "http://localhost:8080";

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

export class ApiClient {
  private baseUrl: string;
  private getToken: () => string | null;
  private onUnauthorized?: () => void;

  constructor(config: {
    baseUrl?: string;
    getToken: () => string | null;
    onUnauthorized?: () => void;
  }) {
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
    this.getToken = config.getToken;
    this.onUnauthorized = config.onUnauthorized;
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {}, params } = options;
    let url = `${this.baseUrl}${path}`;
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value) searchParams.set(key, value);
      }
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    const token = this.getToken();
    const reqHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };
    if (token) {
      reqHeaders["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      method,
      headers: reqHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
      this.onUnauthorized?.();
      throw new ApiError("Unauthorized", 401);
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Request failed" }));
      throw new ApiError(error.error ?? "Request failed", res.status);
    }

    return res.json();
  }

  // Auth
  register(data: { email: string; password: string; first_name: string; last_name: string; role?: string; company?: string; phone?: string }) {
    return this.request<AuthResponse>("/api/v1/auth/register", { method: "POST", body: data });
  }
  login(email: string, password: string) {
    return this.request<AuthResponse>("/api/v1/auth/login", { method: "POST", body: { email, password } });
  }
  refreshToken(refreshToken: string) {
    return this.request<{ access_token: string; refresh_token: string }>("/api/v1/auth/refresh", { method: "POST", body: { refresh_token: refreshToken } });
  }
  getProfile() {
    return this.request<{ user_id: string }>("/api/v1/auth/profile");
  }

  // Projects
  listProjects(params?: Record<string, string>) {
    return this.request<PaginatedResponse<Project>>("/api/v1/projects", { params });
  }
  getProject(id: string) {
    return this.request<Project>(`/api/v1/projects/${id}`);
  }
  createProject(data: CreateProjectData) {
    return this.request<Project>("/api/v1/projects", { method: "POST", body: data });
  }
  updateProjectStatus(id: string, status: string) {
    return this.request<Project>(`/api/v1/projects/${id}/status`, { method: "PATCH", body: { status } });
  }
  assignTeam(id: string, teamMemberIds: string[]) {
    return this.request<{ status: string }>(`/api/v1/projects/${id}/team`, { method: "PUT", body: { team_member_ids: teamMemberIds } });
  }
  updateProgress(id: string, progress: number) {
    return this.request<{ status: string }>(`/api/v1/projects/${id}/progress`, { method: "PATCH", body: { progress } });
  }

  // Specifications
  generateSpec(projectId: string) {
    return this.request<Specification>("/api/v1/specifications", { method: "POST", body: { project_id: projectId } });
  }
  getSpec(id: string) {
    return this.request<Specification>(`/api/v1/specifications/${id}`);
  }
  getSpecByProject(projectId: string) {
    return this.request<Specification>("/api/v1/specifications", { params: { project_id: projectId } });
  }
  approveSpec(id: string) {
    return this.request<{ status: string }>(`/api/v1/specifications/${id}/approve`, { method: "POST" });
  }
  rejectSpec(id: string) {
    return this.request<{ status: string }>(`/api/v1/specifications/${id}/reject`, { method: "POST" });
  }
  addSpecNote(id: string, content: string) {
    return this.request<{ status: string }>(`/api/v1/specifications/${id}/notes`, { method: "POST", body: { content } });
  }

  // Questionnaire
  getQuestions(category?: string) {
    return this.request<{ questions: Question[] }>("/api/v1/questionnaire/questions", { params: category ? { category } : undefined });
  }
  getAdaptiveQuestions(answers: AnswerInput[]) {
    return this.request<{ questions: Question[] }>("/api/v1/questionnaire/adaptive", { method: "POST", body: { answers } });
  }
  saveQuestionnaireResponse(projectId: string, answers: AnswerInput[]) {
    return this.request<QuestionnaireResponse>("/api/v1/questionnaire/responses", { method: "POST", body: { project_id: projectId, answers } });
  }
  completeQuestionnaire(projectId: string) {
    return this.request<QuestionnaireResponse>("/api/v1/questionnaire/complete", { method: "POST", body: { project_id: projectId } });
  }

  // Notifications
  listNotifications(page = 1, pageSize = 20) {
    return this.request<NotificationListResponse>("/api/v1/notifications", { params: { page: String(page), page_size: String(pageSize) } });
  }
  markNotificationRead(id: string) {
    return this.request<{ status: string }>(`/api/v1/notifications/${id}/read`, { method: "PATCH" });
  }
  markAllNotificationsRead() {
    return this.request<{ status: string }>("/api/v1/notifications/read-all", { method: "POST" });
  }
  getUnreadNotificationCount() {
    return this.request<{ unread: number }>("/api/v1/notifications/unread-count");
  }

  // Messages
  listThreads(projectId: string) {
    return this.request<{ threads: Thread[] }>("/api/v1/threads", { params: { project_id: projectId } });
  }
  createThread(projectId: string, subject: string, participants: string[]) {
    return this.request<Thread>("/api/v1/threads", { method: "POST", body: { project_id: projectId, subject, participants } });
  }
  getMessages(threadId: string, page = 1) {
    return this.request<PaginatedResponse<Message>>(`/api/v1/threads/${threadId}/messages`, { params: { page: String(page) } });
  }
  sendMessage(projectId: string, threadId: string, content: string, fileUrls?: string[]) {
    return this.request<Message>("/api/v1/messages", { method: "POST", body: { project_id: projectId, thread_id: threadId, content, file_urls: fileUrls } });
  }

  // Tasks
  listTasks(projectId: string, params?: Record<string, string>) {
    return this.request<PaginatedResponse<Task>>("/api/v1/tasks", { params: { project_id: projectId, ...params } });
  }
  createTask(data: { project_id: string; title: string; description?: string; priority: string; assignee_id?: string; sprint_id?: string }) {
    return this.request<Task>("/api/v1/tasks", { method: "POST", body: data });
  }
  updateTask(id: string, data: Partial<Task>) {
    return this.request<Task>(`/api/v1/tasks/${id}`, { method: "PUT", body: data });
  }
  deleteTask(id: string) {
    return this.request<{ status: string }>(`/api/v1/tasks/${id}`, { method: "DELETE" });
  }

  // Invoices
  listInvoices(params?: Record<string, string>) {
    return this.request<PaginatedResponse<Invoice>>("/api/v1/invoices", { params });
  }
  getInvoice(id: string) {
    return this.request<Invoice>(`/api/v1/invoices/${id}`);
  }
  createInvoice(data: CreateInvoiceData) {
    return this.request<Invoice>("/api/v1/invoices", { method: "POST", body: data });
  }
  markInvoicePaid(id: string, paymentId?: string) {
    return this.request<Invoice>(`/api/v1/invoices/${id}/pay`, { method: "POST", body: { payment_id: paymentId } });
  }

  // File Upload
  async uploadFile(file: File, folder = "uploads"): Promise<{ url: string; filename: string; size: number }> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const token = this.getToken();
    const res = await fetch(`${this.baseUrl}/api/v1/files/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new ApiError("Upload failed", res.status);
    return res.json();
  }

  // Contact
  submitContact(data: { name: string; email: string; message: string; phone?: string; company?: string; subject?: string; projectType?: string }) {
    return this.request<{ status: string; message: string }>("/api/v1/contact", { method: "POST", body: data });
  }

  // Blog Posts
  listBlogPosts(params?: Record<string, string>) {
    return this.request<ContentList>("/api/v1/blog", { params });
  }
  getBlogPost(id: string) {
    return this.request<any>(`/api/v1/blog/${id}`);
  }
  createBlogPost(data: any) {
    return this.request<any>("/api/v1/blog", { method: "POST", body: data });
  }
  updateBlogPost(id: string, data: any) {
    return this.request<any>(`/api/v1/blog/${id}`, { method: "PATCH", body: data });
  }
  deleteBlogPost(id: string) {
    return this.request<void>(`/api/v1/blog/${id}`, { method: "DELETE" });
  }

  // Testimonials
  listTestimonials(params?: Record<string, string>) {
    return this.request<ContentList>("/api/v1/testimonials", { params });
  }
  createTestimonial(data: any) {
    return this.request<any>("/api/v1/testimonials", { method: "POST", body: data });
  }
  updateTestimonial(id: string, data: any) {
    return this.request<any>(`/api/v1/testimonials/${id}`, { method: "PATCH", body: data });
  }
  deleteTestimonial(id: string) {
    return this.request<void>(`/api/v1/testimonials/${id}`, { method: "DELETE" });
  }

  // Services
  listServices(params?: Record<string, string>) {
    return this.request<ContentList>("/api/v1/services", { params });
  }
  createService(data: any) {
    return this.request<any>("/api/v1/services", { method: "POST", body: data });
  }
  updateService(id: string, data: any) {
    return this.request<any>(`/api/v1/services/${id}`, { method: "PATCH", body: data });
  }
  deleteService(id: string) {
    return this.request<void>(`/api/v1/services/${id}`, { method: "DELETE" });
  }

  // Portfolio / Case Studies
  listCaseStudies(params?: Record<string, string>) {
    return this.request<ContentList>("/api/v1/portfolio", { params });
  }
  createCaseStudy(data: any) {
    return this.request<any>("/api/v1/portfolio", { method: "POST", body: data });
  }
  updateCaseStudy(id: string, data: any) {
    return this.request<any>(`/api/v1/portfolio/${id}`, { method: "PATCH", body: data });
  }
  deleteCaseStudy(id: string) {
    return this.request<void>(`/api/v1/portfolio/${id}`, { method: "DELETE" });
  }

  // Contact Submissions
  listContactSubmissions(params?: Record<string, string>) {
    return this.request<ContentList>("/api/v1/contact-submissions", { params });
  }
  updateContactSubmission(id: string, data: any) {
    return this.request<any>(`/api/v1/contact-submissions/${id}`, { method: "PATCH", body: data });
  }
  deleteContactSubmission(id: string) {
    return this.request<void>(`/api/v1/contact-submissions/${id}`, { method: "DELETE" });
  }

  // Users (admin)
  listUsers(params?: Record<string, string>) {
    return this.request<{ users: UserData[] }>("/api/v1/users", { params });
  }
  getUser(id: string) {
    return this.request<UserData>(`/api/v1/users/${id}`);
  }
  updateUser(id: string, data: Partial<UserData>) {
    return this.request<UserData>(`/api/v1/users/${id}`, { method: "PATCH", body: data });
  }

  // Roles (RBAC)
  listRoles() {
    return this.request<{ roles: RBACRole[] }>("/api/v1/roles");
  }
  getRole(id: string) {
    return this.request<RBACRole>(`/api/v1/roles/${id}`);
  }
  createRole(data: { name: string; description?: string; permissions: string[] }) {
    return this.request<RBACRole>("/api/v1/roles", { method: "POST", body: data });
  }
  updateRole(id: string, data: { name?: string; description?: string; permissions?: string[] }) {
    return this.request<RBACRole>(`/api/v1/roles/${id}`, { method: "PATCH", body: data });
  }
  deleteRole(id: string) {
    return this.request<void>(`/api/v1/roles/${id}`, { method: "DELETE" });
  }
  listAllPermissions() {
    return this.request<{ permissions: string[]; resources: string[]; actions: string[] }>("/api/v1/roles/permissions");
  }
  assignRole(userId: string, roleId: string) {
    return this.request<UserData>(`/api/v1/roles/assign/${userId}`, { method: "POST", body: { roleId } });
  }
  updateUserPermissions(userId: string, permissions: string[]) {
    return this.request<UserData>(`/api/v1/roles/user-permissions/${userId}`, { method: "PATCH", body: { permissions } });
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// Types used by the client
interface AuthResponse { user: UserData; access_token: string; refresh_token: string; accessToken?: string; refreshToken?: string }
interface UserData { id: string; email: string; first_name: string; last_name: string; role: string; role_id?: string; permissions: string[]; avatar?: string; phone?: string; company?: string; is_active: boolean; created_at: string }
interface RBACRole { id: string; name: string; description: string; permissions: string[]; is_system: boolean; created_at: string; updated_at: string }
interface PaginatedResponse<T> { items: T[]; total: number; page: number; page_size: number }
interface Milestone { id: string; name: string; description: string; due_date: string; completed_at?: string; status: "pending" | "in_progress" | "completed" | "overdue" }
interface Attachment { id: string; file_name: string; file_url: string; file_size: number; mime_type: string; uploaded_at: string }
interface Project { id: string; client_id: string; title: string; description: string; type: string; status: string; features: unknown[]; progress: number; assigned_team: string[]; specification_id?: string; milestones: Milestone[]; attachments: Attachment[]; created_at: string; updated_at: string }
interface CreateProjectData { title: string; description: string; type: string; features?: unknown[]; user_roles?: string[]; budget_range?: { min: number; max: number; currency: string }; timeline?: { duration_weeks: number; preferred_urgency: string } }
interface Specification { id: string; project_id: string; version: number; status: string; overview: string; objectives: string[]; feature_breakdown: unknown[]; created_at: string; updated_at: string }
interface Question { id: string; text: string; type: string; options?: string[]; required: boolean; order: number; category: string; help_text?: string }
interface AnswerInput { question_id: string; value: string; values?: string[] }
interface QuestionnaireResponse { id: string; project_id: string; client_id: string; answers: unknown[]; completed: boolean }
interface NotificationListResponse { items: Notification[]; total: number; unread: number; page: number; page_size: number }
interface Notification { id: string; user_id: string; type: string; title: string; body: string; read: boolean; created_at: string }
interface Thread { id: string; project_id: string; subject: string; participants: string[]; last_message: string; created_at: string }
interface Message { id: string; project_id: string; thread_id: string; sender_id: string; content: string; file_urls?: string[]; created_at: string }
interface Task { id: string; project_id: string; sprint_id?: string; title: string; description?: string; status: string; priority: string; assignee_id?: string; labels: string[]; created_at: string; updated_at: string }
interface Invoice { id: string; project_id: string; client_id: string; invoice_number: string; status: string; total: number; currency: string; due_date: string; paid_at?: string; created_at: string }
interface CreateInvoiceData { project_id: string; client_id: string; invoice_number: string; items: { description: string; quantity: number; unit_price: number }[]; tax: number; currency?: string; due_date?: string }
interface ContentList { items: any[]; total: number }
