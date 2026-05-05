import { ObjectId } from "mongodb";
import type { Collection } from "mongodb";
import type { Question, QuestionnaireResponse } from "../../../domain/entity/index.js";
import type {
  QuestionRepository,
  QuestionnaireResponseRepository,
} from "../../../domain/port/index.js";
import type { MongoDBClient } from "./client.js";

// ── Question ─────────────────────────────────────────────────────────────────

interface QuestionDoc {
  _id: string;
  text: string;
  type: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  help_text?: string;
  depends_on?: { question_id: string; expected_value: string };
  order: number;
  section: string;
}

function questionToDoc(q: Question): QuestionDoc {
  return {
    _id: q.id,
    text: q.text,
    type: q.type,
    required: q.required,
    options: q.options,
    placeholder: q.placeholder,
    help_text: q.helpText,
    depends_on: q.dependsOn
      ? { question_id: q.dependsOn.questionId, expected_value: q.dependsOn.expectedValue }
      : undefined,
    order: q.order,
    section: q.section,
  };
}

function questionFromDoc(d: QuestionDoc): Question {
  return {
    id: d._id,
    text: d.text,
    type: d.type as Question["type"],
    required: d.required,
    options: d.options,
    placeholder: d.placeholder,
    helpText: d.help_text,
    dependsOn: d.depends_on
      ? { questionId: d.depends_on.question_id, expectedValue: d.depends_on.expected_value }
      : undefined,
    order: d.order,
    section: d.section,
  };
}

export class MongoQuestionRepository implements QuestionRepository {
  private readonly col: Collection<QuestionDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<QuestionDoc>("questions");
  }

  async findById(id: string): Promise<Question | null> {
    const doc = await this.col.findOne({ _id: id });
    return doc ? questionFromDoc(doc) : null;
  }

  async findAll(): Promise<Question[]> {
    const docs = await this.col.find().sort({ order: 1 }).toArray();
    return docs.map(questionFromDoc);
  }

  async findBySection(section: string): Promise<Question[]> {
    const docs = await this.col
      .find({ section })
      .sort({ order: 1 })
      .toArray();
    return docs.map(questionFromDoc);
  }

  async create(question: Question): Promise<Question> {
    await this.col.insertOne(questionToDoc(question));
    return question;
  }

  async update(question: Question): Promise<Question> {
    const doc = questionToDoc(question);
    await this.col.replaceOne({ _id: doc._id }, doc);
    return question;
  }

  async delete(id: string): Promise<void> {
    await this.col.deleteOne({ _id: id });
  }

  /** Upsert used by the seed function. */
  async upsert(question: Question): Promise<void> {
    const doc = questionToDoc(question);
    await this.col.replaceOne({ _id: doc._id }, doc, { upsert: true });
  }

  async findByCategory(category: string): Promise<Question[]> {
    return this.findBySection(category);
  }
}

// ── QuestionnaireResponse ────────────────────────────────────────────────────

interface ResponseDoc {
  _id: ObjectId;
  project_id: string;
  respondent_id: string;
  answers: Array<{
    question_id: string;
    value: string | string[] | number | boolean;
  }>;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

function responseToDoc(r: QuestionnaireResponse): ResponseDoc {
  return {
    _id: new ObjectId(r.id),
    project_id: r.projectId,
    respondent_id: r.respondentId,
    answers: r.answers.map((a) => ({ question_id: a.questionId, value: a.value })),
    completed_at: r.completedAt,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  };
}

function responseFromDoc(d: ResponseDoc): QuestionnaireResponse {
  return {
    id: d._id.toHexString(),
    projectId: d.project_id,
    respondentId: d.respondent_id,
    answers: d.answers.map((a) => ({ questionId: a.question_id, value: a.value })),
    completedAt: d.completed_at,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

export class MongoQuestionnaireResponseRepository
  implements QuestionnaireResponseRepository
{
  private readonly col: Collection<ResponseDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<ResponseDoc>("questionnaire_responses");
  }

  async findById(id: string): Promise<QuestionnaireResponse | null> {
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? responseFromDoc(doc) : null;
  }

  async findByProjectId(projectId: string): Promise<QuestionnaireResponse[]> {
    const docs = await this.col
      .find({ project_id: projectId })
      .sort({ created_at: -1 })
      .toArray();
    return docs.map(responseFromDoc);
  }

  async findByRespondentId(respondentId: string): Promise<QuestionnaireResponse[]> {
    const docs = await this.col
      .find({ respondent_id: respondentId })
      .sort({ created_at: -1 })
      .toArray();
    return docs.map(responseFromDoc);
  }

  async create(response: QuestionnaireResponse): Promise<QuestionnaireResponse> {
    await this.col.insertOne(responseToDoc(response));
    return response;
  }

  async update(response: QuestionnaireResponse): Promise<QuestionnaireResponse> {
    const doc = responseToDoc({ ...response, updatedAt: new Date() });
    await this.col.replaceOne({ _id: doc._id }, doc);
    return { ...response, updatedAt: doc.updated_at };
  }

  async upsertByProject(
    projectId: string,
    data: Partial<QuestionnaireResponse>,
  ): Promise<QuestionnaireResponse> {
    const existing = await this.col.findOne({ project_id: projectId });

    if (existing) {
      const merged = responseFromDoc(existing);
      const updated: QuestionnaireResponse = {
        ...merged,
        ...data,
        updatedAt: new Date(),
      };
      const doc = responseToDoc(updated);
      await this.col.replaceOne({ _id: existing._id }, doc);
      return updated;
    }

    const now = new Date();
    const newResponse: QuestionnaireResponse = {
      id: new ObjectId().toHexString(),
      projectId,
      respondentId: data.respondentId ?? "",
      answers: data.answers ?? [],
      completedAt: data.completedAt,
      createdAt: now,
      updatedAt: now,
      ...data,
    };
    await this.col.insertOne(responseToDoc(newResponse));
    return newResponse;
  }

  async delete(id: string): Promise<void> {
    await this.col.deleteOne({ _id: new ObjectId(id) });
  }
}
