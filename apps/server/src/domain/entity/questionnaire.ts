import { ObjectId } from "mongodb";

export type QuestionType =
  | "text"
  | "textarea"
  | "select"
  | "multi_select"
  | "radio"
  | "checkbox"
  | "number"
  | "date"
  | "file";

export interface DependsOn {
  questionId: string;
  expectedValue: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
  dependsOn?: DependsOn;
  order: number;
  section: string;
}

export interface Answer {
  questionId: string;
  value: string | string[] | number | boolean;
}

export interface QuestionnaireResponse {
  id: string;
  projectId: string;
  respondentId: string;
  answers: Answer[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateQuestionnaireResponseInput {
  projectId: string;
  respondentId: string;
  answers?: Answer[];
}

export function createQuestionnaireResponse(
  input: CreateQuestionnaireResponseInput,
): QuestionnaireResponse {
  const now = new Date();
  return {
    id: new ObjectId().toHexString(),
    projectId: input.projectId,
    respondentId: input.respondentId,
    answers: input.answers ?? [],
    createdAt: now,
    updatedAt: now,
  };
}
