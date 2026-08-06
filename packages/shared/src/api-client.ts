const DEFAULT_BASE_URL = "http://localhost:4000";

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  /** Internal: set after a successful refresh retry to avoid loops. */
  _retried?: boolean;
}

export class ApiClient {
  private baseUrl: string;
  private getToken: () => string | null;
  private getRefreshToken?: () => string | null;
  private onTokensRefreshed?: (accessToken: string, refreshToken: string) => void;
  private onUnauthorized?: () => void;
  private refreshInFlight: Promise<boolean> | null = null;

  constructor(config: {
    baseUrl?: string;
    getToken: () => string | null;
    getRefreshToken?: () => string | null;
    onTokensRefreshed?: (accessToken: string, refreshToken: string) => void;
    onUnauthorized?: () => void;
  }) {
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
    this.getToken = config.getToken;
    this.getRefreshToken = config.getRefreshToken;
    this.onTokensRefreshed = config.onTokensRefreshed;
    this.onUnauthorized = config.onUnauthorized;
  }

  private async tryRefresh(): Promise<boolean> {
    if (this.refreshInFlight) return this.refreshInFlight;

    this.refreshInFlight = (async () => {
      const refreshToken = this.getRefreshToken?.();
      if (!refreshToken) return false;

      try {
        const res = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return false;

        const data = (await res.json()) as {
          accessToken?: string;
          refreshToken?: string;
          access_token?: string;
          refresh_token?: string;
        };
        const access = data.accessToken ?? data.access_token;
        const nextRefresh = data.refreshToken ?? data.refresh_token ?? refreshToken;
        if (!access) return false;

        this.onTokensRefreshed?.(access, nextRefresh);
        return true;
      } catch {
        return false;
      } finally {
        this.refreshInFlight = null;
      }
    })();

    return this.refreshInFlight;
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {}, params, _retried } = options;
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
      // Public auth endpoints must surface their own errors (no logout/redirect).
      const isAuthPublic =
        path.startsWith("/api/v1/auth/login") ||
        path.startsWith("/api/v1/auth/register") ||
        path.startsWith("/api/v1/auth/refresh") ||
        path.startsWith("/api/v1/auth/forgot-password") ||
        path.startsWith("/api/v1/auth/reset-password");

      if (token && !isAuthPublic && !_retried) {
        const refreshed = await this.tryRefresh();
        if (refreshed) {
          return this.request<T>(path, { ...options, _retried: true });
        }
        this.onUnauthorized?.();
      } else if (token && !isAuthPublic) {
        this.onUnauthorized?.();
      }

      const error = await res.json().catch(() => ({ error: "Unauthorized" }));
      throw new ApiError(error.error ?? "Unauthorized", 401);
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Request failed" }));
      throw new ApiError(error.error ?? "Request failed", res.status);
    }

    if (res.status === 204) return undefined as T;
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
    return this.request<{ accessToken: string; refreshToken: string }>("/api/v1/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    });
  }
  forgotPassword(email: string) {
    return this.request<{ message: string }>("/api/v1/auth/forgot-password", {
      method: "POST",
      body: { email },
    });
  }
  resetPassword(token: string, password: string) {
    return this.request<{ message: string }>("/api/v1/auth/reset-password", {
      method: "POST",
      body: { token, password },
    });
  }
  getProfile() {
    return this.request<UserData>("/api/v1/auth/profile");
  }
  updateProfile(data: { first_name?: string; last_name?: string; phone?: string; company?: string }) {
    return this.request<UserData>("/api/v1/auth/profile", { method: "PATCH", body: data });
  }

  // Projects
  listProjects(params?: Record<string, string>) {
    return this.request<PaginatedResponse<Project>>("/api/v1/projects", { params });
  }
  getProject(id: string) {
    return this.request<Project>(`/api/v1/projects/${id}`);
  }
  createProject(data: CreateProjectData) {
    // Server validates camelCase; map shared snake_case fields before send.
    const body: Record<string, unknown> = {
      title: data.title,
      description: data.description,
      type: data.type,
      features: data.features ?? [],
    };
    if (data.client_id) body.clientId = data.client_id;
    if (data.user_roles) body.userRoles = data.user_roles;
    if (data.budget_range) body.budgetRange = data.budget_range;
    if (data.timeline) {
      body.timeline = {
        durationWeeks: data.timeline.duration_weeks,
        preferredUrgency: data.timeline.preferred_urgency,
      };
    }
    return this.request<Project>("/api/v1/projects", { method: "POST", body });
  }
  updateProjectStatus(id: string, status: string) {
    return this.request<Project>(`/api/v1/projects/${id}/status`, { method: "PATCH", body: { status } });
  }
  assignTeam(id: string, teamMemberIds: string[]) {
    return this.request<{ status: string }>(`/api/v1/projects/${id}/team`, {
      method: "PUT",
      body: { teamMemberIds },
    });
  }
  updateProgress(id: string, progress: number) {
    return this.request<{ status: string }>(`/api/v1/projects/${id}/progress`, { method: "PATCH", body: { progress } });
  }

  // Specifications
  generateSpec(projectId: string) {
    return this.request<Specification>("/api/v1/specifications", { method: "POST", body: { projectId } });
  }
  getSpec(id: string) {
    return this.request<Specification>(`/api/v1/specifications/${id}`);
  }
  getSpecByProject(projectId: string) {
    // Server accepts project_id (documented) and projectId.
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
    return this.request<{ questions: Question[] }>("/api/v1/questionnaire/adaptive", {
      method: "POST",
      body: {
        answers: answers.map((a) => ({
          questionId: a.question_id,
          question_id: a.question_id,
          value: a.value,
          values: a.values,
        })),
      },
    });
  }
  saveQuestionnaireResponse(projectId: string, answers: AnswerInput[]) {
    return this.request<QuestionnaireResponse>("/api/v1/questionnaire/responses", {
      method: "POST",
      body: {
        projectId,
        answers: answers.map((a) => ({
          questionId: a.question_id,
          question_id: a.question_id,
          value: a.value,
          values: a.values,
        })),
      },
    });
  }
  completeQuestionnaire(projectId: string) {
    return this.request<QuestionnaireResponse>("/api/v1/questionnaire/complete", {
      method: "POST",
      body: { projectId },
    });
  }

  // Project discovery intakes
  createProjectIntake(data: Record<string, unknown>, accountBound = false) {
    return this.request<import("./project-intake").ProjectIntakeRecord>(`/api/v1/project-intakes/${accountBound ? "mine" : "drafts"}`, { method: "POST", body: data });
  }
  updateProjectIntake(id: string, data: Record<string, unknown>, accountBound = false) {
    return this.request<import("./project-intake").ProjectIntakeRecord>(`/api/v1/project-intakes/${accountBound ? `mine/${id}` : `drafts/${id}`}`, { method: "PATCH", body: data });
  }
  submitProjectIntake(id: string, resumeToken?: string, accountBound = false) {
    return this.request<import("./project-intake").ProjectIntakeRecord>(`/api/v1/project-intakes/${accountBound ? `mine/${id}` : `drafts/${id}`}/submit`, { method: "POST", body: resumeToken ? { resumeToken } : {} });
  }
  listMyProjectIntakes() { return this.request<{ items: import("./project-intake").ProjectIntakeRecord[] }>("/api/v1/project-intakes/mine"); }
  listProjectIntakes(status?: "draft" | "submitted") { return this.request<{ items: import("./project-intake").ProjectIntakeRecord[] }>("/api/v1/project-intakes/admin", { params: status ? { status } : undefined }); }
  getProjectIntake(id: string) { return this.request<import("./project-intake").ProjectIntakeRecord>(`/api/v1/project-intakes/admin/${id}`); }
  askProjectCopilot(data: { category: string; section: string; message: string; answers: Record<string, unknown> }) {
    return this.request<{ reply: string; poweredByAI: boolean }>("/api/v1/project-intakes/copilot", { method: "POST", body: data });
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
  deleteNotification(id: string) {
    return this.request<void>(`/api/v1/notifications/${id}`, { method: "DELETE" });
  }
  getUnreadNotificationCount() {
    return this.request<{ unread: number }>("/api/v1/notifications/unread-count");
  }

  // Messages
  //
  // The message router is mounted at /api/v1/messages and declares its thread
  // routes inside it, so every path is /api/v1/messages/threads[...]. These
  // used to point at /api/v1/threads, which 404s — messaging was dead in both
  // portals. The server also validates camelCase bodies.
  listThreads(projectId?: string) {
    return this.request<{ threads: Thread[] }>("/api/v1/messages/threads", {
      params: projectId ? { projectId } : undefined,
    });
  }
  createThread(projectId: string, title: string, participantIds: string[]) {
    return this.request<Thread>("/api/v1/messages/threads", {
      method: "POST",
      body: { projectId, title, participantIds },
    });
  }
  getMessages(threadId: string, page = 1) {
    return this.request<PaginatedResponse<Message>>(
      `/api/v1/messages/threads/${threadId}/messages`,
      { params: { page: String(page) } },
    );
  }
  sendMessage(threadId: string, content: string, attachments?: string[]) {
    return this.request<Message>(`/api/v1/messages/threads/${threadId}/messages`, {
      method: "POST",
      body: { content, attachments },
    });
  }

  // Tasks — server validates camelCase and uses PATCH for updates.
  listTasks(projectId: string, params?: Record<string, string>) {
    return this.request<PaginatedResponse<Task>>("/api/v1/tasks", {
      params: { projectId, ...params },
    });
  }
  createTask(data: {
    project_id: string;
    title: string;
    description?: string;
    priority: string;
    assignee_id?: string;
    sprint_id?: string;
  }) {
    return this.request<Task>("/api/v1/tasks", {
      method: "POST",
      body: {
        projectId: data.project_id,
        title: data.title,
        description: data.description,
        priority: data.priority,
        assigneeId: data.assignee_id,
        sprintId: data.sprint_id,
      },
    });
  }
  updateTask(id: string, data: Partial<Task>) {
    return this.request<Task>(`/api/v1/tasks/${id}`, { method: "PATCH", body: data });
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
    return this.request<Invoice>("/api/v1/invoices", {
      method: "POST",
      body: {
        projectId: data.project_id,
        clientId: data.client_id,
        items: data.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          total: item.quantity * item.unit_price,
        })),
        tax: data.tax ?? 0,
        currency: data.currency,
        dueDate: data.due_date,
      },
    });
  }
  markInvoicePaid(id: string, paymentId?: string) {
    return this.request<Invoice>(`/api/v1/invoices/${id}/paid`, {
      method: "POST",
      body: { paymentId: paymentId ?? `manual-${Date.now()}` },
    });
  }
  sendInvoice(id: string) {
    return this.request<Invoice>(`/api/v1/invoices/${id}/send`, { method: "POST" });
  }
  checkoutInvoice(id: string) {
    return this.request<{
      provider: string;
      clientSecret: string;
      client_secret: string;
      paymentIntentId: string;
      payment_intent_id: string;
      invoiceId: string;
      amount: number;
      currency: string;
    }>(`/api/v1/invoices/${id}/checkout`, { method: "POST" });
  }

  // File Upload
  async uploadFile(
    file: File,
    folder = "uploads",
    projectId?: string,
  ): Promise<{ url: string; filename: string; size: number; id?: string }> {
    const formData = new FormData();
    formData.append("file", file);
    if (folder) formData.append("folder", folder);
    if (projectId) formData.append("projectId", projectId);
    const token = this.getToken();
    const res = await fetch(`${this.baseUrl}/api/v1/files/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new ApiError("Upload failed", res.status);
    const data = (await res.json()) as Record<string, unknown>;
    return {
      id: data.id ? String(data.id) : undefined,
      url: String(data.url ?? data.fileURL ?? data.file_url ?? ""),
      filename: String(data.filename ?? data.fileName ?? data.file_name ?? ""),
      size: Number(data.size ?? data.fileSize ?? data.file_size ?? 0),
    };
  }
  listFiles(projectId: string) {
    return this.request<{ items: any[]; total: number }>("/api/v1/files", {
      params: { projectId },
    });
  }

  // Contact
  submitContact(data: { name: string; email: string; message: string; phone?: string; company?: string; subject?: string; projectType?: string }) {
    return this.request<{ message: string; id: string }>("/api/v1/contact", { method: "POST", body: data });
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

  // Engagement Readiness Diagnostic (Layer 02 intake)
  getDiagnosticQuestions() {
    return this.request<{ questions: DiagnosticQuestion[] }>("/api/v1/diagnostic/questions");
  }
  submitDiagnostic(data: { answers: { questionId: string; value: string | string[] }[]; respondentName?: string; email?: string; org?: string }) {
    return this.request<{ recordId: string; result: DiagnosticResult }>("/api/v1/diagnostic/submit", { method: "POST", body: data });
  }
  listDiagnostics(params?: Record<string, string>) {
    return this.request<{ items: DiagnosticRecord[]; total: number }>("/api/v1/diagnostic", { params });
  }
  getDiagnostic(id: string) {
    return this.request<DiagnosticRecord>(`/api/v1/diagnostic/${id}`);
  }

  // RFP / Tender Submission Portal (Layer 02 intake)
  submitRfp(data: RfpSubmissionInput) {
    return this.request<{ id: string; status: string; slaDueAt: string; slaHours: number }>("/api/v1/rfp/submit", { method: "POST", body: data });
  }
  listRfps(params?: Record<string, string>) {
    return this.request<{ items: RfpSubmission[]; total: number }>("/api/v1/rfp", { params });
  }
  getRfp(id: string) {
    return this.request<RfpSubmission>(`/api/v1/rfp/${id}`);
  }
  updateRfpStatus(id: string, status: string) {
    return this.request<RfpSubmission>(`/api/v1/rfp/${id}`, { method: "PATCH", body: { status } });
  }

  // Book a Reading (Layer 02 intake)
  getBookingDuration(route?: string) {
    return this.request<{ durationMins: number }>("/api/v1/booking/duration", { params: route ? { route } : undefined });
  }
  submitBooking(data: BookingRequestInput) {
    return this.request<{ id: string; status: string; durationMins: number }>("/api/v1/booking/submit", { method: "POST", body: data });
  }
  listBookings(params?: Record<string, string>) {
    return this.request<{ items: BookingRequest[]; total: number }>("/api/v1/booking", { params });
  }
  getBooking(id: string) {
    return this.request<BookingRequest>(`/api/v1/booking/${id}`);
  }
  updateBookingStatus(id: string, status: string) {
    return this.request<BookingRequest>(`/api/v1/booking/${id}`, { method: "PATCH", body: { status } });
  }

  // Decision Log (Layer 03 client portal — project-scoped, staff-write / client-read)
  listDecisions(projectId: string) {
    return this.request<{ items: Decision[]; total: number }>("/api/v1/decisions", { params: { projectId } });
  }
  getDecision(id: string) {
    return this.request<Decision>(`/api/v1/decisions/${id}`);
  }
  createDecision(data: DecisionInput) {
    return this.request<Decision>("/api/v1/decisions", { method: "POST", body: data });
  }
  updateDecision(id: string, data: Partial<DecisionInput>) {
    return this.request<Decision>(`/api/v1/decisions/${id}`, { method: "PATCH", body: data });
  }
  deleteDecision(id: string) {
    return this.request<void>(`/api/v1/decisions/${id}`, { method: "DELETE" });
  }

  // Risk Register (Layer 03 client portal — project-scoped, staff-write / client-read)
  listRisks(projectId: string) {
    return this.request<{ items: Risk[]; total: number }>("/api/v1/risks", { params: { projectId } });
  }
  getRisk(id: string) {
    return this.request<Risk>(`/api/v1/risks/${id}`);
  }
  createRisk(data: RiskInput) {
    return this.request<Risk>("/api/v1/risks", { method: "POST", body: data });
  }
  updateRisk(id: string, data: Partial<RiskInput>) {
    return this.request<Risk>(`/api/v1/risks/${id}`, { method: "PATCH", body: data });
  }
  deleteRisk(id: string) {
    return this.request<void>(`/api/v1/risks/${id}`, { method: "DELETE" });
  }

  // Support Tickets (Layer 03 client portal — client-write / staff-respond, SLA-tracked)
  listProjectTickets(projectId: string) {
    return this.request<{ items: SupportTicket[]; total: number }>("/api/v1/tickets", { params: { projectId } });
  }
  listAllTickets(params?: Record<string, string>) {
    return this.request<{ items: SupportTicket[]; total: number }>("/api/v1/tickets", { params });
  }
  getTicket(id: string) {
    return this.request<SupportTicket>(`/api/v1/tickets/${id}`);
  }
  createTicket(data: TicketInput) {
    return this.request<SupportTicket>("/api/v1/tickets", { method: "POST", body: data });
  }
  replyTicket(id: string, body: string) {
    return this.request<SupportTicket>(`/api/v1/tickets/${id}/replies`, { method: "POST", body: { body } });
  }
  updateTicketStatus(id: string, status: string) {
    return this.request<SupportTicket>(`/api/v1/tickets/${id}`, { method: "PATCH", body: { status } });
  }

  // Approval Workflows (Layer 03 client portal — staff request, owning client signs off)
  listApprovals(projectId: string) {
    return this.request<{ items: Approval[]; total: number }>("/api/v1/approvals", { params: { projectId } });
  }
  getApproval(id: string) {
    return this.request<Approval>(`/api/v1/approvals/${id}`);
  }
  createApproval(data: ApprovalInput) {
    return this.request<Approval>("/api/v1/approvals", { method: "POST", body: data });
  }
  decideApproval(id: string, decision: string, comment?: string) {
    return this.request<Approval>(`/api/v1/approvals/${id}/decision`, { method: "POST", body: { decision, comment } });
  }
  deleteApproval(id: string) {
    return this.request<void>(`/api/v1/approvals/${id}`, { method: "DELETE" });
  }

  // Stakeholder Map (Layer 03 client portal — project-scoped, staff-write / client-read)
  listStakeholders(projectId: string) {
    return this.request<{ items: Stakeholder[]; total: number }>("/api/v1/stakeholders", { params: { projectId } });
  }
  getStakeholder(id: string) {
    return this.request<Stakeholder>(`/api/v1/stakeholders/${id}`);
  }
  createStakeholder(data: StakeholderInput) {
    return this.request<Stakeholder>("/api/v1/stakeholders", { method: "POST", body: data });
  }
  updateStakeholder(id: string, data: Partial<StakeholderInput>) {
    return this.request<Stakeholder>(`/api/v1/stakeholders/${id}`, { method: "PATCH", body: data });
  }
  deleteStakeholder(id: string) {
    return this.request<void>(`/api/v1/stakeholders/${id}`, { method: "DELETE" });
  }

  // Capability Lattice Tracker (Layer 03 client portal — project-scoped, staff-write / client-read)
  listLattice(projectId: string) {
    return this.request<{ items: LatticeItem[]; total: number }>("/api/v1/lattice", { params: { projectId } });
  }
  getLatticeItem(id: string) {
    return this.request<LatticeItem>(`/api/v1/lattice/${id}`);
  }
  createLatticeItem(data: LatticeItemInput) {
    return this.request<LatticeItem>("/api/v1/lattice", { method: "POST", body: data });
  }
  updateLatticeItem(id: string, data: Partial<LatticeItemInput>) {
    return this.request<LatticeItem>(`/api/v1/lattice/${id}`, { method: "PATCH", body: data });
  }
  deleteLatticeItem(id: string) {
    return this.request<void>(`/api/v1/lattice/${id}`, { method: "DELETE" });
  }

  // Reports Library (Layer 03 client portal — project-scoped, staff-write / client sees published only)
  listReports(projectId: string) {
    return this.request<{ items: Report[]; total: number }>("/api/v1/reports", { params: { projectId } });
  }
  getReport(id: string) {
    return this.request<Report>(`/api/v1/reports/${id}`);
  }
  createReport(data: ReportInput) {
    return this.request<Report>("/api/v1/reports", { method: "POST", body: data });
  }
  updateReport(id: string, data: Partial<ReportInput>) {
    return this.request<Report>(`/api/v1/reports/${id}`, { method: "PATCH", body: data });
  }
  deleteReport(id: string) {
    return this.request<void>(`/api/v1/reports/${id}`, { method: "DELETE" });
  }

  // Team Directory (Layer 03 client portal — project-scoped, staff-write / client-read)
  listTeam(projectId: string) {
    return this.request<{ items: EngagementMember[]; total: number }>("/api/v1/team", { params: { projectId } });
  }
  getTeamMember(id: string) {
    return this.request<EngagementMember>(`/api/v1/team/${id}`);
  }
  createTeamMember(data: EngagementMemberInput) {
    return this.request<EngagementMember>("/api/v1/team", { method: "POST", body: data });
  }
  updateTeamMember(id: string, data: Partial<EngagementMemberInput>) {
    return this.request<EngagementMember>(`/api/v1/team/${id}`, { method: "PATCH", body: data });
  }
  deleteTeamMember(id: string) {
    return this.request<void>(`/api/v1/team/${id}`, { method: "DELETE" });
  }

  // Budget & Milestone Tracker (Layer 03 client portal — project-scoped, staff-write / client-read)
  listBudget(projectId: string) {
    return this.request<{ items: BudgetItem[]; total: number }>("/api/v1/budget", { params: { projectId } });
  }
  getBudgetItem(id: string) {
    return this.request<BudgetItem>(`/api/v1/budget/${id}`);
  }
  createBudgetItem(data: BudgetItemInput) {
    return this.request<BudgetItem>("/api/v1/budget", { method: "POST", body: data });
  }
  updateBudgetItem(id: string, data: Partial<BudgetItemInput>) {
    return this.request<BudgetItem>(`/api/v1/budget/${id}`, { method: "PATCH", body: data });
  }
  deleteBudgetItem(id: string) {
    return this.request<void>(`/api/v1/budget/${id}`, { method: "DELETE" });
  }

  // Glossary of Practice (Layer 06 — public read, staff write)
  listGlossary(params?: { category?: string; q?: string }) {
    const p: Record<string, string> = {};
    if (params?.category) p.category = params.category;
    if (params?.q) p.q = params.q;
    return this.request<{ items: GlossaryTerm[]; total: number }>("/api/v1/glossary", { params: p });
  }
  listAllGlossary(params?: { status?: string; category?: string; q?: string }) {
    const p: Record<string, string> = {};
    if (params?.status) p.status = params.status;
    if (params?.category) p.category = params.category;
    if (params?.q) p.q = params.q;
    return this.request<{ items: GlossaryTerm[]; total: number }>("/api/v1/glossary/all", { params: p });
  }
  glossaryCategories() {
    return this.request<{ categories: string[] }>("/api/v1/glossary/categories");
  }
  getGlossaryTermBySlug(slug: string) {
    return this.request<GlossaryTerm>(`/api/v1/glossary/slug/${slug}`);
  }
  createGlossaryTerm(data: GlossaryTermInput) {
    return this.request<GlossaryTerm>("/api/v1/glossary", { method: "POST", body: data });
  }
  updateGlossaryTerm(id: string, data: Partial<GlossaryTermInput>) {
    return this.request<GlossaryTerm>(`/api/v1/glossary/${id}`, { method: "PATCH", body: data });
  }
  deleteGlossaryTerm(id: string) {
    return this.request<void>(`/api/v1/glossary/${id}`, { method: "DELETE" });
  }

  // Client-exportable activity log (Layer 03 — the caller's OWN audit trail; userId forced server-side)
  getMyActivity(params?: { from?: string; to?: string; limit?: number }) {
    const q: Record<string, string> = {};
    if (params?.from) q.from = params.from;
    if (params?.to) q.to = params.to;
    if (params?.limit != null) q.limit = String(params.limit);
    return this.request<{ items: ActivityEntry[]; total: number }>("/api/v1/audit/me", { params: q });
  }

  // Users (admin)
  async listUsers(params?: Record<string, string>) {
    const res = await this.request<{ users?: UserData[]; items?: UserData[] }>("/api/v1/users", { params });
    const users = res.users ?? res.items ?? [];
    return { users, items: users };
  }
  getUser(id: string) {
    return this.request<UserData>(`/api/v1/users/${id}`);
  }
  updateUser(id: string, data: Partial<UserData> & { isActive?: boolean; firstName?: string; lastName?: string }) {
    const body: Record<string, unknown> = {};
    const firstName = data.firstName ?? data.first_name;
    const lastName = data.lastName ?? data.last_name;
    const isActive = data.isActive ?? data.is_active;
    if (firstName !== undefined) body.firstName = firstName;
    if (lastName !== undefined) body.lastName = lastName;
    if (data.phone !== undefined) body.phone = data.phone;
    if (data.company !== undefined) body.company = data.company;
    if (isActive !== undefined) body.isActive = isActive;
    return this.request<UserData>(`/api/v1/users/${id}`, { method: "PATCH", body });
  }
  deleteUser(id: string) {
    return this.request<void>(`/api/v1/users/${id}`, { method: "DELETE" });
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

  // ── Generic helpers ──────────────────────────────────────────────────────
  // Public passthroughs so feature surfaces can call any endpoint without a
  // bespoke typed method. Path is relative to baseUrl (e.g. "/api/v1/status").
  get<T = unknown>(path: string, params?: Record<string, string>) {
    return this.request<T>(path, { params });
  }
  post<T = unknown>(path: string, body?: unknown) {
    return this.request<T>(path, { method: "POST", body });
  }
  put<T = unknown>(path: string, body?: unknown) {
    return this.request<T>(path, { method: "PUT", body });
  }
  patch<T = unknown>(path: string, body?: unknown) {
    return this.request<T>(path, { method: "PATCH", body });
  }
  del<T = unknown>(path: string) {
    return this.request<T>(path, { method: "DELETE" });
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
interface Project { id: string; client_id: string; title: string; description: string; type: string; status: string; features: unknown[]; progress: number; assigned_team: string[]; assigned_team_members?: { id: string; first_name: string; last_name: string; email: string; role: string; avatar?: string }[]; specification_id?: string; milestones: Milestone[]; attachments: Attachment[]; created_at: string; updated_at: string }
interface CreateProjectData { title: string; description: string; type: string; features?: unknown[]; client_id?: string; user_roles?: string[]; budget_range?: { min: number; max: number; currency: string }; timeline?: { duration_weeks: number; preferred_urgency: string } }
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
interface CreateInvoiceData { project_id: string; client_id: string; items: { description: string; quantity: number; unit_price: number }[]; tax?: number; currency?: string; due_date: string }
interface ContentList { items: any[]; total: number }
interface DiagnosticOption { value: string; label: string }
interface DiagnosticQuestion { id: string; text: string; helpText?: string; type: "single" | "multi"; options: DiagnosticOption[]; dependsOn?: { questionId: string; expectedValue: string }; order: number }
interface DiagnosticResult { route: string; routeLabel: string; scores: Record<string, number>; confidence: number; lowConfidence: boolean; summary: string; reasons: string[]; nextStep: string }
interface DiagnosticRecord { id: string; respondentName?: string; email?: string; org?: string; answers: { questionId: string; value: string | string[] }[]; result: DiagnosticResult; createdAt: string }
interface RfpSubmissionInput { org: string; contactName: string; contactEmail: string; contactPhone?: string; sector?: string; title: string; scope: string; evaluationCriteria?: string; submissionRequirements?: string; documentUrl?: string; estimatedValue?: string; deadline?: string }
interface RfpSubmission extends RfpSubmissionInput { id: string; status: string; slaDueAt: string; acknowledgedAt?: string; createdAt: string }
interface BookingRequestInput { name: string; email: string; org?: string; topic?: string; route?: string; diagnosticId?: string; preferredTimes?: string; timezone?: string }
interface BookingRequest extends BookingRequestInput { id: string; durationMins: number; status: string; createdAt: string }
interface DecisionInput { projectId: string; title: string; rationale: string; alternatives?: string[]; decisionMaker: string; linkedArtifacts?: string[]; status?: string; decidedAt?: string }
interface Decision { id: string; projectId: string; title: string; rationale: string; alternatives: string[]; decisionMaker: string; linkedArtifacts: string[]; status: string; decidedAt: string; createdById: string; createdAt: string; updatedAt: string }
interface RiskInput { projectId: string; title: string; description: string; owner: string; severity: string; mitigation?: string; residualRating?: string; escalation?: string; status?: string }
interface Risk { id: string; projectId: string; title: string; description: string; owner: string; severity: string; mitigation: string; residualRating: string; escalation: string; status: string; createdById: string; createdAt: string; updatedAt: string }
interface TicketInput { projectId: string; subject: string; body: string; category?: string; priority?: string }
interface TicketReply { id: string; authorId: string; authorName?: string; body: string; staff: boolean; createdAt: string }
interface SupportTicket { id: string; projectId: string; subject: string; body: string; category: string; priority: string; status: string; slaDueAt: string; firstRespondedAt?: string; createdById: string; createdByStaff: boolean; replies: TicketReply[]; createdAt: string; updatedAt: string }
interface ApprovalInput { projectId: string; title: string; description?: string; deliverableRef?: string }
interface Approval { id: string; projectId: string; title: string; description: string; deliverableRef?: string; status: string; requestedById: string; decidedById?: string; decidedAt?: string; decisionComment?: string; createdAt: string; updatedAt: string }
interface StakeholderInput { projectId: string; name: string; role: string; side: "client" | "firm"; authority?: "decision_maker" | "influencer" | "contributor" | "informed"; briefed?: boolean; email?: string; notes?: string }
interface Stakeholder { id: string; projectId: string; name: string; role: string; side: "client" | "firm"; authority: "decision_maker" | "influencer" | "contributor" | "informed"; briefed: boolean; email?: string; notes?: string; createdById: string; createdAt: string; updatedAt: string }
interface LatticeItemInput { projectId: string; capability: string; category: string; status?: "delivered" | "in_flight" | "queued" | "deferred"; description?: string; owner?: string; targetDate?: string }
interface LatticeItem { id: string; projectId: string; capability: string; category: string; status: "delivered" | "in_flight" | "queued" | "deferred"; description?: string; owner?: string; targetDate?: string; createdById: string; createdAt: string; updatedAt: string }
type ReportType = "quarterly_review" | "status_memo" | "board_pack" | "handover" | "post_engagement" | "other";
interface ReportInput { projectId: string; title: string; type?: ReportType; summary?: string; url?: string; period?: string; status?: "draft" | "published" }
interface Report { id: string; projectId: string; title: string; type: ReportType; summary?: string; url?: string; period?: string; status: "draft" | "published"; publishedAt?: string; createdById: string; createdAt: string; updatedAt: string }
type MemberAvailability = "full_time" | "part_time" | "on_call" | "unavailable";
interface EngagementMemberInput { projectId: string; name: string; role: string; email?: string; availability?: MemberAvailability; focus?: string; bio?: string }
interface EngagementMember { id: string; projectId: string; name: string; role: string; email?: string; availability: MemberAvailability; focus?: string; bio?: string; createdById: string; createdAt: string; updatedAt: string }
type BudgetCurrency = "USD" | "GHS" | "EUR" | "GBP";
type BudgetCategory = "milestone" | "workstream" | "retainer" | "expense";
type BudgetStatus = "planned" | "in_progress" | "invoiced" | "paid" | "overdue";
interface BudgetItemInput { projectId: string; label: string; category?: BudgetCategory; currency?: BudgetCurrency; budgetAmount: number; invoicedAmount?: number; paidAmount?: number; status?: BudgetStatus; dueDate?: string; notes?: string }
interface BudgetItem { id: string; projectId: string; label: string; category: BudgetCategory; currency: BudgetCurrency; budgetAmount: number; invoicedAmount: number; paidAmount: number; status: BudgetStatus; dueDate?: string; notes?: string; createdById: string; createdAt: string; updatedAt: string }
interface ActivityEntry { id: string; userId?: string; userRole?: string; action: string; method: string; path: string; statusCode?: number; ip?: string; createdAt: string }
interface GlossaryTermInput { term: string; slug?: string; definition: string; category?: string; aliases?: string[]; status?: "published" | "draft"; order?: number }
interface GlossaryTerm { id: string; term: string; slug: string; definition: string; category?: string; aliases: string[]; status: "published" | "draft"; order: number; createdAt: string; updatedAt: string }
