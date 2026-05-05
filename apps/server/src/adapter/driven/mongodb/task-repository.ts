import { ObjectId } from "mongodb";
import type { Collection, Filter } from "mongodb";
import type { Task, Sprint } from "../../../domain/entity/index.js";
import type {
  TaskRepository,
  TaskFilter,
  SprintRepository,
} from "../../../domain/port/index.js";
import type { MongoDBClient } from "./client.js";

// ── Task ─────────────────────────────────────────────────────────────────────

interface TaskDoc {
  _id: ObjectId;
  project_id: string;
  sprint_id?: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee_id?: string;
  reporter_id: string;
  labels: string[];
  story_points?: number;
  due_date?: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

function taskToDoc(t: Task): TaskDoc {
  return {
    _id: new ObjectId(t.id),
    project_id: t.projectId,
    sprint_id: t.sprintId,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    assignee_id: t.assigneeId,
    reporter_id: t.reporterId,
    labels: t.labels,
    story_points: t.storyPoints,
    due_date: t.dueDate,
    completed_at: t.completedAt,
    created_at: t.createdAt,
    updated_at: t.updatedAt,
  };
}

function taskFromDoc(d: TaskDoc): Task {
  return {
    id: d._id.toHexString(),
    projectId: d.project_id,
    sprintId: d.sprint_id,
    title: d.title,
    description: d.description,
    status: d.status as Task["status"],
    priority: d.priority as Task["priority"],
    assigneeId: d.assignee_id,
    reporterId: d.reporter_id,
    labels: d.labels,
    storyPoints: d.story_points,
    dueDate: d.due_date,
    completedAt: d.completed_at,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

export class MongoTaskRepository implements TaskRepository {
  private readonly col: Collection<TaskDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<TaskDoc>("tasks");
  }

  async findById(id: string): Promise<Task | null> {
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? taskFromDoc(doc) : null;
  }

  async findAll(filter?: TaskFilter): Promise<Task[]> {
    const query: Filter<TaskDoc> = {};

    if (filter?.projectId) {
      query.project_id = filter.projectId;
    }
    if (filter?.sprintId) {
      query.sprint_id = filter.sprintId;
    }
    if (filter?.status) {
      query.status = filter.status;
    }
    if (filter?.priority) {
      query.priority = filter.priority;
    }
    if (filter?.assigneeId) {
      query.assignee_id = filter.assigneeId;
    }
    if (filter?.reporterId) {
      query.reporter_id = filter.reporterId;
    }
    if (filter?.search) {
      query.$or = [
        { title: { $regex: filter.search, $options: "i" } },
        { description: { $regex: filter.search, $options: "i" } },
      ];
    }

    const docs = await this.col
      .find(query)
      .sort({ created_at: -1 })
      .toArray();

    return docs.map(taskFromDoc);
  }

  async findBySprintId(sprintId: string): Promise<Task[]> {
    const docs = await this.col
      .find({ sprint_id: sprintId })
      .sort({ priority: 1, created_at: -1 })
      .toArray();
    return docs.map(taskFromDoc);
  }

  async create(task: Task): Promise<Task> {
    await this.col.insertOne(taskToDoc(task));
    return task;
  }

  async update(task: Task): Promise<Task> {
    const doc = taskToDoc({ ...task, updatedAt: new Date() });
    await this.col.replaceOne({ _id: doc._id }, doc);
    return { ...task, updatedAt: doc.updated_at };
  }

  async delete(id: string): Promise<void> {
    await this.col.deleteOne({ _id: new ObjectId(id) });
  }
}

// ── Sprint ───────────────────────────────────────────────────────────────────

interface SprintDoc {
  _id: ObjectId;
  project_id: string;
  name: string;
  goal: string;
  start_date: Date;
  end_date: Date;
  status: string;
  created_at: Date;
  updated_at: Date;
}

function sprintToDoc(s: Sprint): SprintDoc {
  return {
    _id: new ObjectId(s.id),
    project_id: s.projectId,
    name: s.name,
    goal: s.goal,
    start_date: s.startDate,
    end_date: s.endDate,
    status: s.status,
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  };
}

function sprintFromDoc(d: SprintDoc): Sprint {
  return {
    id: d._id.toHexString(),
    projectId: d.project_id,
    name: d.name,
    goal: d.goal,
    startDate: d.start_date,
    endDate: d.end_date,
    status: d.status as Sprint["status"],
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  };
}

export class MongoSprintRepository implements SprintRepository {
  private readonly col: Collection<SprintDoc>;

  constructor(client: MongoDBClient) {
    this.col = client.collection<SprintDoc>("sprints");
  }

  async findById(id: string): Promise<Sprint | null> {
    const doc = await this.col.findOne({ _id: new ObjectId(id) });
    return doc ? sprintFromDoc(doc) : null;
  }

  async findByProjectId(projectId: string): Promise<Sprint[]> {
    const docs = await this.col
      .find({ project_id: projectId })
      .sort({ start_date: -1 })
      .toArray();
    return docs.map(sprintFromDoc);
  }

  async findActive(projectId: string): Promise<Sprint | null> {
    const doc = await this.col.findOne({
      project_id: projectId,
      status: "active",
    });
    return doc ? sprintFromDoc(doc) : null;
  }

  async create(sprint: Sprint): Promise<Sprint> {
    await this.col.insertOne(sprintToDoc(sprint));
    return sprint;
  }

  async update(sprint: Sprint): Promise<Sprint> {
    const doc = sprintToDoc({ ...sprint, updatedAt: new Date() });
    await this.col.replaceOne({ _id: doc._id }, doc);
    return { ...sprint, updatedAt: doc.updated_at };
  }

  async delete(id: string): Promise<void> {
    await this.col.deleteOne({ _id: new ObjectId(id) });
  }
}
