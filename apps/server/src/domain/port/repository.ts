import type {
  User,
  Project,
  Specification,
  Question,
  QuestionnaireResponse,
  Invoice,
  Task,
  Sprint,
  Notification,
  Message,
  Thread,
  ProjectStatus,
  ProjectType,
  TaskStatus,
  TaskPriority,
} from "../entity/index.js";
import type { Role as UserRole } from "../entity/user.js";
import type { RBACRole } from "../entity/role.js";

// ── Filters ──────────────────────────────────────────────────────────────────

export interface UserFilter {
  role?: UserRole;
  isActive?: boolean;
  company?: string;
  search?: string;
}

export interface ProjectFilter {
  clientId?: string;
  status?: ProjectStatus;
  type?: ProjectType;
  assignedTeamMember?: string;
  search?: string;
}

export interface TaskFilter {
  projectId?: string;
  sprintId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  reporterId?: string;
  search?: string;
}

// ── Repository Interfaces ────────────────────────────────────────────────────

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(filter?: UserFilter): Promise<User[]>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}

export interface ProjectRepository {
  findById(id: string): Promise<Project | null>;
  findAll(filter?: ProjectFilter): Promise<Project[]>;
  findByClientId(clientId: string): Promise<Project[]>;
  create(project: Project): Promise<Project>;
  update(project: Project): Promise<Project>;
  delete(id: string): Promise<void>;
}

export interface SpecificationRepository {
  findById(id: string): Promise<Specification | null>;
  findByProjectId(projectId: string): Promise<Specification | null>;
  create(spec: Specification): Promise<Specification>;
  update(spec: Specification): Promise<Specification>;
  delete(id: string): Promise<void>;
}

export interface QuestionRepository {
  findById(id: string): Promise<Question | null>;
  findAll(): Promise<Question[]>;
  findBySection(section: string): Promise<Question[]>;
  create(question: Question): Promise<Question>;
  update(question: Question): Promise<Question>;
  delete(id: string): Promise<void>;
}

export interface QuestionnaireResponseRepository {
  findById(id: string): Promise<QuestionnaireResponse | null>;
  findByProjectId(projectId: string): Promise<QuestionnaireResponse[]>;
  findByRespondentId(respondentId: string): Promise<QuestionnaireResponse[]>;
  create(response: QuestionnaireResponse): Promise<QuestionnaireResponse>;
  update(response: QuestionnaireResponse): Promise<QuestionnaireResponse>;
  delete(id: string): Promise<void>;
}

export interface InvoiceRepository {
  findById(id: string): Promise<Invoice | null>;
  findByProjectId(projectId: string): Promise<Invoice[]>;
  findByClientId(clientId: string): Promise<Invoice[]>;
  create(invoice: Invoice): Promise<Invoice>;
  update(invoice: Invoice): Promise<Invoice>;
  delete(id: string): Promise<void>;
}

export interface TaskRepository {
  findById(id: string): Promise<Task | null>;
  findAll(filter?: TaskFilter): Promise<Task[]>;
  findBySprintId(sprintId: string): Promise<Task[]>;
  create(task: Task): Promise<Task>;
  update(task: Task): Promise<Task>;
  delete(id: string): Promise<void>;
}

export interface SprintRepository {
  findById(id: string): Promise<Sprint | null>;
  findByProjectId(projectId: string): Promise<Sprint[]>;
  findActive(projectId: string): Promise<Sprint | null>;
  create(sprint: Sprint): Promise<Sprint>;
  update(sprint: Sprint): Promise<Sprint>;
  delete(id: string): Promise<void>;
}

export interface NotificationRepository {
  findById(id: string): Promise<Notification | null>;
  findByUserId(userId: string): Promise<Notification[]>;
  findUnreadByUserId(userId: string): Promise<Notification[]>;
  countUnreadByUserId(userId: string): Promise<number>;
  create(notification: Notification): Promise<Notification>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface MessageRepository {
  findById(id: string): Promise<Message | null>;
  findByThreadId(threadId: string): Promise<Message[]>;
  create(message: Message): Promise<Message>;
  update(message: Message): Promise<Message>;
  delete(id: string): Promise<void>;
}

export interface ThreadRepository {
  findById(id: string): Promise<Thread | null>;
  findAll(): Promise<Thread[]>;
  findByProjectId(projectId: string): Promise<Thread[]>;
  findByParticipantId(participantId: string): Promise<Thread[]>;
  create(thread: Thread): Promise<Thread>;
  update(thread: Thread): Promise<Thread>;
  delete(id: string): Promise<void>;
}

export interface RoleRepository {
  findById(id: string): Promise<RBACRole | null>;
  findByName(name: string): Promise<RBACRole | null>;
  findAll(): Promise<RBACRole[]>;
  create(role: RBACRole): Promise<RBACRole>;
  update(role: RBACRole): Promise<RBACRole>;
  delete(id: string): Promise<void>;
}
