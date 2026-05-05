export const PROJECT_STATUSES = {
  lead: { label: "Lead", color: "#94A3B8" },
  under_review: { label: "Under Review", color: "#6C63FF" },
  approved: { label: "Approved", color: "#00D4AA" },
  in_development: { label: "In Development", color: "#F59E0B" },
  qa: { label: "QA", color: "#8B5CF6" },
  delivered: { label: "Delivered", color: "#10B981" },
} as const;

export const PROJECT_TYPES = {
  web_app: { label: "Web Application", icon: "code" },
  mobile_app: { label: "Mobile Application", icon: "phone_iphone" },
  ai_system: { label: "AI/ML System", icon: "psychology" },
  blockchain: { label: "Blockchain Platform", icon: "token" },
} as const;

export const TASK_PRIORITIES = {
  low: { label: "Low", color: "#94A3B8" },
  medium: { label: "Medium", color: "#6C63FF" },
  high: { label: "High", color: "#F59E0B" },
  critical: { label: "Critical", color: "#EF4444" },
} as const;

export const TASK_STATUSES = {
  backlog: { label: "Backlog", color: "#94A3B8" },
  todo: { label: "To Do", color: "#6C63FF" },
  in_progress: { label: "In Progress", color: "#F59E0B" },
  review: { label: "Review", color: "#8B5CF6" },
  done: { label: "Done", color: "#10B981" },
} as const;

export const ROLES = {
  admin: { label: "Admin" },
  project_manager: { label: "Project Manager" },
  developer: { label: "Developer" },
  qa: { label: "QA" },
  client: { label: "Client" },
} as const;

export const BUDGET_RANGES = [
  "$10,000 - $25,000",
  "$25,000 - $50,000",
  "$50,000 - $100,000",
  "$100,000 - $250,000",
  "$250,000+",
] as const;

export const TIMELINES = [
  "1-2 months",
  "2-4 months",
  "4-6 months",
  "6-12 months",
  "12+ months",
] as const;
