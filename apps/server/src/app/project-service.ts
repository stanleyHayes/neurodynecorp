import type { Logger } from "pino";
import { ObjectId } from "mongodb";
import type { EventPublisher, CacheService } from "./auth-service";

// ---------------------------------------------------------------------------
// Domain types (server-side representation)
// ---------------------------------------------------------------------------

export type ProjectStatus =
  | "lead"
  | "under_review"
  | "approved"
  | "in_development"
  | "qa"
  | "delivered";

export interface Project {
  id: string;
  clientId: string;
  title: string;
  description: string;
  type: string;
  status: ProjectStatus;
  features: Feature[];
  userRoles: string[];
  integrations: string[];
  budgetRange: { min: number; max: number; currency: string };
  timeline: {
    expectedStart?: Date;
    expectedEnd?: Date;
    durationWeeks: number;
    preferredUrgency: string;
  };
  progress: number;
  assignedTeam: string[];
  specificationId?: string;
  milestones: Milestone[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  priority: string;
  complexity: string;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
}

// ---------------------------------------------------------------------------
// Port interfaces
// ---------------------------------------------------------------------------

export interface ProjectRepository {
  findById(id: string): Promise<Project | null>;
  create(project: Project): Promise<Project>;
  update(id: string, data: Partial<Project>): Promise<Project>;
  list(filter: ProjectFilter): Promise<{ projects: Project[]; total: number }>;
}

export interface SpecificationRepository {
  findById(id: string): Promise<unknown | null>;
  findByProjectId(projectId: string): Promise<unknown | null>;
  create(spec: unknown): Promise<unknown>;
  update(id: string, data: unknown): Promise<unknown>;
}

export interface ProjectFilter {
  clientId?: string;
  status?: ProjectStatus;
  type?: string;
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface CreateProjectInput {
  clientId: string;
  title: string;
  description: string;
  type: string;
  features?: Feature[];
  userRoles?: string[];
  integrations?: string[];
  budgetRange?: { min: number; max: number; currency: string };
  timeline?: {
    expectedStart?: Date;
    expectedEnd?: Date;
    durationWeeks: number;
    preferredUrgency: string;
  };
}

// ---------------------------------------------------------------------------
// Valid status transitions
// ---------------------------------------------------------------------------

const STATUS_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  lead: ["under_review"],
  under_review: ["approved", "lead"],
  approved: ["in_development"],
  in_development: ["qa"],
  qa: ["in_development", "delivered"],
  delivered: [],
};

// ---------------------------------------------------------------------------
// Custom errors
// ---------------------------------------------------------------------------

export class ProjectNotFoundError extends Error {
  constructor(id: string) {
    super(`Project "${id}" not found`);
    this.name = "ProjectNotFoundError";
  }
}

export class InvalidStatusTransitionError extends Error {
  constructor(from: ProjectStatus, to: ProjectStatus) {
    super(`Cannot transition project from "${from}" to "${to}"`);
    this.name = "InvalidStatusTransitionError";
  }
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class ProjectService {
  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly specRepo: SpecificationRepository,
    private readonly events: EventPublisher,
    private readonly cache: CacheService,
    private readonly logger: Logger,
  ) {}

  async createProject(input: CreateProjectInput): Promise<Project> {
    this.logger.info({ title: input.title, clientId: input.clientId }, "Creating project");

    const now = new Date();
    const project: Project = {
      id: new ObjectId().toHexString(),
      clientId: input.clientId,
      title: input.title,
      description: input.description,
      type: input.type,
      status: "lead",
      features: input.features ?? [],
      userRoles: input.userRoles ?? [],
      integrations: input.integrations ?? [],
      budgetRange: input.budgetRange ?? { min: 0, max: 0, currency: "USD" },
      timeline: input.timeline ?? { durationWeeks: 0, preferredUrgency: "normal" },
      progress: 0,
      assignedTeam: [],
      milestones: [],
      createdAt: now,
      updatedAt: now,
    };

    const created = await this.projectRepo.create(project);

    await this.events.publish("project.created", {
      projectId: created.id,
      clientId: created.clientId,
      title: created.title,
    });

    this.logger.info({ projectId: created.id }, "Project created");
    return created;
  }

  async getProject(id: string): Promise<Project> {
    const cached = await this.cache.get<Project>(`project:${id}`);
    if (cached) return cached;

    const project = await this.projectRepo.findById(id);
    if (!project) {
      throw new ProjectNotFoundError(id);
    }

    await this.cache.set(`project:${id}`, project, 300);
    return project;
  }

  async listProjects(filter: ProjectFilter): Promise<{ projects: Project[]; total: number }> {
    return this.projectRepo.list(filter);
  }

  async updateStatus(projectId: string, newStatus: ProjectStatus): Promise<Project> {
    this.logger.info({ projectId, newStatus }, "Updating project status");

    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundError(projectId);
    }

    const allowed = STATUS_TRANSITIONS[project.status];
    if (!allowed.includes(newStatus)) {
      throw new InvalidStatusTransitionError(project.status, newStatus);
    }

    const updated = await this.projectRepo.update(projectId, {
      status: newStatus,
      updatedAt: new Date(),
    });

    await this.cache.delete(`project:${projectId}`);

    await this.events.publish("project.status_changed", {
      projectId,
      previousStatus: project.status,
      newStatus,
    });

    this.logger.info({ projectId, from: project.status, to: newStatus }, "Project status updated");
    return updated;
  }

  async assignTeam(projectId: string, teamIds: string[]): Promise<Project> {
    this.logger.info({ projectId, teamIds }, "Assigning team to project");

    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundError(projectId);
    }

    const updated = await this.projectRepo.update(projectId, {
      assignedTeam: teamIds,
      updatedAt: new Date(),
    });

    await this.cache.delete(`project:${projectId}`);
    return updated;
  }

  async updateProgress(projectId: string, progress: number): Promise<Project> {
    this.logger.info({ projectId, progress }, "Updating project progress");

    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundError(projectId);
    }

    const clamped = Math.min(100, Math.max(0, progress));

    const updated = await this.projectRepo.update(projectId, {
      progress: clamped,
      updatedAt: new Date(),
    });

    await this.cache.delete(`project:${projectId}`);
    return updated;
  }
}
