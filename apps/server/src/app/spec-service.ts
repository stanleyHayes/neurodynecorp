import type { Logger } from "pino";
import { ObjectId } from "mongodb";
import type { EventPublisher } from "./auth-service";
import type { QuestionnaireResponse } from "./questionnaire-service";

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export type SpecStatus = "draft" | "generated" | "reviewed" | "approved" | "rejected";

export interface FeatureSpec {
  name: string;
  description: string;
  subFeatures: string[];
  priority: string;
  estimatedHours: number;
}

export interface TimelineEstimate {
  totalWeeks: number;
  phases: { name: string; weeks: number; details?: string }[];
}

export interface CostEstimate {
  totalMin: number;
  totalMax: number;
  currency: string;
  breakdown: { category: string; min: number; max: number }[];
}

export interface Risk {
  description: string;
  impact: string;
  mitigation: string;
}

export interface InternalNote {
  id: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

export interface Specification {
  id: string;
  projectId: string;
  version: number;
  status: SpecStatus;
  overview: string;
  objectives: string[];
  featureBreakdown: FeatureSpec[];
  timelineEstimate: TimelineEstimate;
  costEstimate: CostEstimate;
  assumptions: string[];
  risks: Risk[];
  internalNotes: InternalNote[];
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Port interfaces
// ---------------------------------------------------------------------------

export interface SpecificationRepository {
  findById(id: string): Promise<Specification | null>;
  findByProjectId(projectId: string): Promise<Specification | null>;
  create(spec: Specification): Promise<Specification>;
  update(id: string, data: Partial<Specification>): Promise<Specification>;
}

export interface QuestionnaireResponseRepository {
  findByProjectId(projectId: string): Promise<QuestionnaireResponse | null>;
}

export interface ProjectLookup {
  findById(
    id: string,
  ): Promise<{
    id: string;
    title: string;
    description: string;
    type: string;
    features: { id: string; name: string; description: string; priority: string; complexity: string }[];
    budgetRange: { min: number; max: number; currency: string };
    timeline: { durationWeeks: number; preferredUrgency: string };
  } | null>;
}

// ---------------------------------------------------------------------------
// Custom errors
// ---------------------------------------------------------------------------

export class SpecNotFoundError extends Error {
  constructor(identifier: string) {
    super(`Specification "${identifier}" not found`);
    this.name = "SpecNotFoundError";
  }
}

export class ProjectNotFoundError extends Error {
  constructor(id: string) {
    super(`Project "${id}" not found`);
    this.name = "ProjectNotFoundError";
  }
}

export class QuestionnaireIncompleteError extends Error {
  constructor(projectId: string) {
    super(`Questionnaire for project "${projectId}" is not yet completed`);
    this.name = "QuestionnaireIncompleteError";
  }
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class SpecService {
  constructor(
    private readonly specRepo: SpecificationRepository,
    private readonly responseRepo: QuestionnaireResponseRepository,
    private readonly projectRepo: ProjectLookup,
    private readonly events: EventPublisher,
    private readonly logger: Logger,
  ) {}

  async generateSpec(projectId: string): Promise<Specification> {
    this.logger.info({ projectId }, "Generating specification");

    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundError(projectId);
    }

    const questionnaire = await this.responseRepo.findByProjectId(projectId);
    if (!questionnaire || !questionnaire.completed) {
      throw new QuestionnaireIncompleteError(projectId);
    }

    const featureBreakdown = this.buildFeatureBreakdown(project.features);
    const timelineEstimate = this.buildTimelineEstimate(project.timeline.durationWeeks, featureBreakdown);
    const costEstimate = this.buildCostEstimate(project.budgetRange, featureBreakdown);

    const now = new Date();
    const spec: Specification = {
      id: new ObjectId().toHexString(),
      projectId,
      version: 1,
      status: "generated",
      overview: `Technical specification for "${project.title}" - ${project.description}`,
      objectives: this.extractObjectives(questionnaire),
      featureBreakdown,
      timelineEstimate,
      costEstimate,
      assumptions: [
        "Requirements are based on the completed questionnaire and may evolve.",
        "Third-party API availability and pricing are subject to change.",
        "Team availability aligns with the proposed timeline.",
      ],
      risks: [
        {
          description: "Scope creep due to evolving requirements",
          impact: "high",
          mitigation: "Strict change-request process with impact analysis",
        },
        {
          description: "Integration complexity with third-party services",
          impact: "medium",
          mitigation: "Early proof-of-concept for critical integrations",
        },
      ],
      internalNotes: [],
      createdAt: now,
      updatedAt: now,
    };

    const created = await this.specRepo.create(spec);

    await this.events.publish("spec.generated", {
      specId: created.id,
      projectId,
    });

    this.logger.info({ specId: created.id, projectId }, "Specification generated");
    return created;
  }

  async getSpec(id: string): Promise<Specification> {
    const spec = await this.specRepo.findById(id);
    if (!spec) {
      throw new SpecNotFoundError(id);
    }
    return spec;
  }

  async getByProject(projectId: string): Promise<Specification> {
    const spec = await this.specRepo.findByProjectId(projectId);
    if (!spec) {
      throw new SpecNotFoundError(`project:${projectId}`);
    }
    return spec;
  }

  async updateSpec(spec: Partial<Specification> & { id: string }): Promise<Specification> {
    this.logger.info({ specId: spec.id }, "Updating specification");

    const existing = await this.specRepo.findById(spec.id);
    if (!existing) {
      throw new SpecNotFoundError(spec.id);
    }

    const updated = await this.specRepo.update(spec.id, {
      ...spec,
      updatedAt: new Date(),
    });

    return updated;
  }

  async approveSpec(specId: string, approverId: string): Promise<Specification> {
    this.logger.info({ specId, approverId }, "Approving specification");

    const spec = await this.specRepo.findById(specId);
    if (!spec) {
      throw new SpecNotFoundError(specId);
    }

    const now = new Date();
    const updated = await this.specRepo.update(specId, {
      status: "approved",
      approvedBy: approverId,
      approvedAt: now,
      updatedAt: now,
    });

    await this.events.publish("spec.approved", {
      specId,
      projectId: spec.projectId,
      approverId,
    });

    this.logger.info({ specId, projectId: spec.projectId }, "Specification approved");
    return updated;
  }

  async rejectSpec(specId: string): Promise<Specification> {
    this.logger.info({ specId }, "Rejecting specification");

    const spec = await this.specRepo.findById(specId);
    if (!spec) {
      throw new SpecNotFoundError(specId);
    }

    const updated = await this.specRepo.update(specId, {
      status: "rejected",
      updatedAt: new Date(),
    });

    await this.events.publish("spec.rejected", {
      specId,
      projectId: spec.projectId,
    });

    return updated;
  }

  async addInternalNote(
    specId: string,
    authorId: string,
    content: string,
  ): Promise<Specification> {
    this.logger.info({ specId, authorId }, "Adding internal note to specification");

    const spec = await this.specRepo.findById(specId);
    if (!spec) {
      throw new SpecNotFoundError(specId);
    }

    const note: InternalNote = {
      id: new ObjectId().toHexString(),
      authorId,
      content,
      createdAt: new Date(),
    };

    const updated = await this.specRepo.update(specId, {
      internalNotes: [...spec.internalNotes, note],
      updatedAt: new Date(),
    });

    return updated;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private buildFeatureBreakdown(
    features: { name: string; description: string; priority: string; complexity: string }[],
  ): FeatureSpec[] {
    const complexityHours: Record<string, number> = {
      low: 20,
      medium: 60,
      high: 120,
      critical: 200,
    };

    return features.map((f) => ({
      name: f.name,
      description: f.description,
      subFeatures: [],
      priority: f.priority,
      estimatedHours: complexityHours[f.complexity] ?? 60,
    }));
  }

  private buildTimelineEstimate(
    durationWeeks: number,
    features: FeatureSpec[],
  ): TimelineEstimate {
    const totalHours = features.reduce((sum, f) => sum + f.estimatedHours, 0);
    const estimatedWeeks = durationWeeks || Math.max(4, Math.ceil(totalHours / 40));

    return {
      totalWeeks: estimatedWeeks,
      phases: [
        { name: "Discovery & Planning", weeks: Math.ceil(estimatedWeeks * 0.15), details: "Requirements analysis and architecture design" },
        { name: "Design", weeks: Math.ceil(estimatedWeeks * 0.15), details: "UI/UX design and prototyping" },
        { name: "Development", weeks: Math.ceil(estimatedWeeks * 0.45), details: "Core feature implementation" },
        { name: "Testing & QA", weeks: Math.ceil(estimatedWeeks * 0.15), details: "Quality assurance and bug fixes" },
        { name: "Deployment & Launch", weeks: Math.ceil(estimatedWeeks * 0.1), details: "Production deployment and handover" },
      ],
    };
  }

  private buildCostEstimate(
    budgetRange: { min: number; max: number; currency: string },
    features: FeatureSpec[],
  ): CostEstimate {
    const totalHours = features.reduce((sum, f) => sum + f.estimatedHours, 0);
    const rateMin = 80;
    const rateMax = 150;

    const calculatedMin = totalHours * rateMin;
    const calculatedMax = totalHours * rateMax;

    const totalMin = budgetRange.min > 0 ? Math.max(budgetRange.min, calculatedMin) : calculatedMin;
    const totalMax = budgetRange.max > 0 ? Math.min(budgetRange.max, calculatedMax) : calculatedMax;

    return {
      totalMin,
      totalMax: Math.max(totalMin, totalMax),
      currency: budgetRange.currency || "USD",
      breakdown: [
        { category: "Development", min: Math.round(totalMin * 0.5), max: Math.round(totalMax * 0.5) },
        { category: "Design", min: Math.round(totalMin * 0.2), max: Math.round(totalMax * 0.2) },
        { category: "QA & Testing", min: Math.round(totalMin * 0.15), max: Math.round(totalMax * 0.15) },
        { category: "Project Management", min: Math.round(totalMin * 0.1), max: Math.round(totalMax * 0.1) },
        { category: "DevOps & Infrastructure", min: Math.round(totalMin * 0.05), max: Math.round(totalMax * 0.05) },
      ],
    };
  }

  private extractObjectives(questionnaire: QuestionnaireResponse): string[] {
    const objectives: string[] = [
      "Deliver a production-ready solution meeting all functional requirements.",
      "Ensure scalability and maintainability through modern architecture patterns.",
      "Provide comprehensive documentation and knowledge transfer.",
    ];

    if (questionnaire.answers.length > 0) {
      objectives.push(
        "Address all client-specified requirements captured during the discovery questionnaire.",
      );
    }

    return objectives;
  }
}
