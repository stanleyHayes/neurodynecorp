import { ObjectId } from "mongodb";

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

export interface Feature {
  id: string;
  name: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
}

export interface BudgetRange {
  min: number;
  max: number;
  currency: string;
}

export interface Timeline {
  startDate: Date;
  endDate: Date;
  estimatedWeeks: number;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileURL: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  dueDate: Date;
  completedAt?: Date;
  status: "pending" | "in_progress" | "completed" | "overdue";
}

export interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string;
  status: ProjectStatus;
  type: ProjectType;
  features: Feature[];
  userRoles: string[];
  integrations: string[];
  budgetRange: BudgetRange;
  timeline: Timeline;
  attachments: Attachment[];
  assignedTeam: string[];
  specificationId?: string;
  progress: number;
  milestones: Milestone[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  name: string;
  description: string;
  clientId: string;
  type: ProjectType;
  features?: Feature[];
  userRoles?: string[];
  integrations?: string[];
  budgetRange: BudgetRange;
  timeline: Timeline;
}

const validTransitions: Record<ProjectStatus, ProjectStatus[]> = {
  lead: ["under_review"],
  under_review: ["approved", "lead"],
  approved: ["in_development"],
  in_development: ["qa"],
  qa: ["in_development", "delivered"],
  delivered: [],
};

export function createProject(input: CreateProjectInput): Project {
  const now = new Date();
  return {
    id: new ObjectId().toHexString(),
    name: input.name,
    description: input.description,
    clientId: input.clientId,
    status: "lead",
    type: input.type,
    features: input.features ?? [],
    userRoles: input.userRoles ?? [],
    integrations: input.integrations ?? [],
    budgetRange: input.budgetRange,
    timeline: input.timeline,
    attachments: [],
    assignedTeam: [],
    progress: 0,
    milestones: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function canTransitionTo(
  current: ProjectStatus,
  next: ProjectStatus,
): boolean {
  return validTransitions[current].includes(next);
}

export function transitionTo(project: Project, next: ProjectStatus): Project {
  if (!canTransitionTo(project.status, next)) {
    throw new Error(
      `Invalid status transition from "${project.status}" to "${next}"`,
    );
  }
  return {
    ...project,
    status: next,
    updatedAt: new Date(),
  };
}
