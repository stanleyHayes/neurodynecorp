import { ObjectId } from "mongodb";

export type TaskStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "in_review"
  | "done"
  | "cancelled";

export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface Task {
  id: string;
  projectId: string;
  sprintId?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  reporterId: string;
  labels: string[];
  storyPoints?: number;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal: string;
  startDate: Date;
  endDate: Date;
  status: "planning" | "active" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskInput {
  projectId: string;
  title: string;
  description: string;
  priority?: TaskPriority;
  assigneeId?: string;
  reporterId: string;
  labels?: string[];
  storyPoints?: number;
  dueDate?: Date;
  sprintId?: string;
}

export interface CreateSprintInput {
  projectId: string;
  name: string;
  goal: string;
  startDate: Date;
  endDate: Date;
}

export function createTask(input: CreateTaskInput): Task {
  const now = new Date();
  return {
    id: new ObjectId().toHexString(),
    projectId: input.projectId,
    sprintId: input.sprintId,
    title: input.title,
    description: input.description,
    status: "backlog",
    priority: input.priority ?? "medium",
    assigneeId: input.assigneeId,
    reporterId: input.reporterId,
    labels: input.labels ?? [],
    storyPoints: input.storyPoints,
    dueDate: input.dueDate,
    createdAt: now,
    updatedAt: now,
  };
}

export function createSprint(input: CreateSprintInput): Sprint {
  const now = new Date();
  return {
    id: new ObjectId().toHexString(),
    projectId: input.projectId,
    name: input.name,
    goal: input.goal,
    startDate: input.startDate,
    endDate: input.endDate,
    status: "planning",
    createdAt: now,
    updatedAt: now,
  };
}
