import type { Logger } from "pino";
import type { EventPublisher } from "./auth-service";

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

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
  helpText?: string;
  dependsOn?: { questionId: string; answer: string };
}

export interface QuestionnaireAnswer {
  questionId: string;
  value: unknown;
}

export interface QuestionnaireResponse {
  id: string;
  projectId: string;
  clientId: string;
  answers: QuestionnaireAnswer[];
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Port interfaces
// ---------------------------------------------------------------------------

export interface QuestionRepository {
  findAll(): Promise<Question[]>;
  findByCategory(category: string): Promise<Question[]>;
  findById(id: string): Promise<Question | null>;
}

export interface QuestionnaireResponseRepository {
  findById(id: string): Promise<QuestionnaireResponse | null>;
  findByProjectId(projectId: string): Promise<QuestionnaireResponse | null>;
  create(response: QuestionnaireResponse): Promise<QuestionnaireResponse>;
  update(id: string, data: Partial<QuestionnaireResponse>): Promise<QuestionnaireResponse>;
  upsertByProject(
    projectId: string,
    data: Partial<QuestionnaireResponse>,
  ): Promise<QuestionnaireResponse>;
}

export interface ProjectLookup {
  findById(id: string): Promise<{ id: string; clientId: string } | null>;
}

// ---------------------------------------------------------------------------
// Custom errors
// ---------------------------------------------------------------------------

export class QuestionnaireNotFoundError extends Error {
  constructor(projectId: string) {
    super(`Questionnaire response for project "${projectId}" not found`);
    this.name = "QuestionnaireNotFoundError";
  }
}

export class ProjectNotFoundError extends Error {
  constructor(id: string) {
    super(`Project "${id}" not found`);
    this.name = "ProjectNotFoundError";
  }
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class QuestionnaireService {
  constructor(
    private readonly questionRepo: QuestionRepository,
    private readonly responseRepo: QuestionnaireResponseRepository,
    private readonly projectRepo: ProjectLookup,
    private readonly events: EventPublisher,
    private readonly logger: Logger,
  ) {}

  async getQuestions(category?: string): Promise<Question[]> {
    if (category) {
      return this.questionRepo.findByCategory(category);
    }
    return this.questionRepo.findAll();
  }

  async getAdaptiveQuestions(answers: QuestionnaireAnswer[]): Promise<Question[]> {
    const allQuestions = await this.questionRepo.findAll();
    const answeredMap = new Map(answers.map((a) => [a.questionId, a.value]));

    return allQuestions.filter((q) => {
      if (!q.dependsOn) return true;

      const parentAnswer = answeredMap.get(q.dependsOn.questionId);
      if (parentAnswer === undefined) return false;

      return String(parentAnswer) === q.dependsOn.answer;
    });
  }

  async saveResponse(
    projectId: string,
    clientId: string,
    answers: QuestionnaireAnswer[],
  ): Promise<QuestionnaireResponse> {
    this.logger.info({ projectId, answerCount: answers.length }, "Saving questionnaire response");

    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundError(projectId);
    }

    const now = new Date();

    const response = await this.responseRepo.upsertByProject(projectId, {
      projectId,
      clientId,
      answers,
      completed: false,
      updatedAt: now,
    });

    this.logger.info({ responseId: response.id, projectId }, "Questionnaire response saved");
    return response;
  }

  async completeQuestionnaire(projectId: string): Promise<QuestionnaireResponse> {
    this.logger.info({ projectId }, "Completing questionnaire");

    const existing = await this.responseRepo.findByProjectId(projectId);
    if (!existing) {
      throw new QuestionnaireNotFoundError(projectId);
    }

    const now = new Date();
    const updated = await this.responseRepo.update(existing.id, {
      completed: true,
      completedAt: now,
      updatedAt: now,
    });

    await this.events.publish("questionnaire.completed", {
      projectId,
      responseId: updated.id,
    });

    this.logger.info({ responseId: updated.id, projectId }, "Questionnaire completed");
    return updated;
  }
}
