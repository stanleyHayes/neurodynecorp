// User types
export type Role = "admin" | "project_manager" | "developer" | "qa" | "client";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  role_id?: string;
  permissions: string[];
  avatar?: string;
  phone?: string;
  company?: string;
  is_active: boolean;
  created_at: string;
}

// RBAC types
export interface RBACRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export const RESOURCES = [
  "dashboard", "pipeline", "analytics", "clients", "projects",
  "specifications", "tasks", "blog", "portfolio", "testimonials",
  "services", "contact_submissions", "team", "messages", "finance",
  "billing", "notifications", "documents", "settings", "roles",
] as const;

export const ACTIONS = ["read", "create", "update", "delete"] as const;

export type Resource = (typeof RESOURCES)[number];
export type Action = (typeof ACTIONS)[number];
export type Permission = `${Resource}:${Action}`;

// Project types
export type ProjectStatus =
  | "lead"
  | "under_review"
  | "approved"
  | "in_development"
  | "qa"
  | "delivered";

export type ProjectType =
  | "web_app"
  | "mobile_app"
  | "ai_system"
  | "blockchain";

export interface Project {
  id: string;
  client_id: string;
  title: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  features: Feature[];
  user_roles: string[];
  integrations: string[];
  budget_range: BudgetRange;
  timeline: Timeline;
  progress: number;
  assigned_team: string[];
  specification_id?: string;
  milestones: Milestone[];
  created_at: string;
  updated_at: string;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  priority: string;
  complexity: string;
}

export interface BudgetRange {
  min: number;
  max: number;
  currency: string;
}

export interface Timeline {
  expected_start?: string;
  expected_end?: string;
  duration_weeks: number;
  preferred_urgency: string;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  completed: boolean;
  completed_at?: string;
}

// Specification types
export type SpecStatus =
  | "draft"
  | "generated"
  | "reviewed"
  | "approved"
  | "rejected";

export interface Specification {
  id: string;
  project_id: string;
  version: number;
  status: SpecStatus;
  overview: string;
  objectives: string[];
  feature_breakdown: FeatureSpec[];
  timeline_estimate: TimelineEstimate;
  cost_estimate: CostEstimate;
  assumptions: string[];
  risks: Risk[];
  created_at: string;
  updated_at: string;
}

export interface FeatureSpec {
  name: string;
  description: string;
  sub_features: string[];
  priority: string;
  estimated_hours: number;
}

export interface TimelineEstimate {
  total_weeks: number;
  phases: { name: string; weeks: number; details?: string }[];
}

export interface CostEstimate {
  total_min: number;
  total_max: number;
  currency: string;
  breakdown: { category: string; min: number; max: number }[];
}

export interface Risk {
  description: string;
  impact: string;
  mitigation: string;
}

// Questionnaire types
export type QuestionType =
  | "boolean"
  | "multi_choice"
  | "dropdown"
  | "free_text"
  | "file_upload"
  | "budget_selector"
  | "timeline_selector";

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
  order: number;
  category: string;
  help_text?: string;
  depends_on?: { question_id: string; answer: string };
}

// Invoice types
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface Invoice {
  id: string;
  project_id: string;
  client_id: string;
  invoice_number: string;
  status: InvoiceStatus;
  total: number;
  currency: string;
  due_date: string;
  paid_at?: string;
  created_at: string;
}

// Notification types
export type NotificationType =
  | "project_update"
  | "status_change"
  | "new_message"
  | "invoice"
  | "approval"
  | "system";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

// Task types
export type TaskStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "review"
  | "done";

export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface Task {
  id: string;
  project_id: string;
  sprint_id?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id?: string;
  labels: string[];
  due_date?: string;
  created_at: string;
  updated_at: string;
}

// Auth types
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

// API pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}
