import type { Logger } from "pino";
import type { EventPublisher, EmailService } from "./auth-service";

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Port interfaces
// ---------------------------------------------------------------------------

export interface ProjectRepository {
  findById(
    id: string,
  ): Promise<{
    id: string;
    clientId: string;
    title: string;
    assignedTeam: string[];
  } | null>;
}

export interface NotificationRepository {
  create(notification: Notification): Promise<Notification>;
}

export interface UserLookup {
  findById(id: string): Promise<{ id: string; email: string; firstName: string } | null>;
}

export interface EventSubscriber {
  subscribe(topic: string, handler: (payload: unknown) => Promise<void>): Promise<void>;
  close(): Promise<void>;
}

/** Allows pushing real-time events to connected users */
export interface RealtimeEmitter {
  sendToUser(userId: string, event: string, data: unknown): void;
}

// ---------------------------------------------------------------------------
// Event payload types
// ---------------------------------------------------------------------------

interface ProjectCreatedEvent {
  projectId: string;
  clientId: string;
  title: string;
}

interface ProjectStatusChangedEvent {
  projectId: string;
  previousStatus: string;
  newStatus: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class WorkflowEngine {
  private running = false;
  private realtime: RealtimeEmitter | null = null;

  constructor(
    private readonly projectRepo: ProjectRepository,
    private readonly notificationRepo: NotificationRepository,
    private readonly emailService: EmailService,
    private readonly events: EventPublisher,
    private readonly subscriber: EventSubscriber,
    private readonly logger: Logger,
  ) {}

  /** Inject after Socket.IO hub is started */
  setRealtimeEmitter(emitter: RealtimeEmitter): void {
    this.realtime = emitter;
  }

  async start(): Promise<void> {
    if (this.running) {
      this.logger.warn("WorkflowEngine is already running");
      return;
    }

    this.logger.info("Starting WorkflowEngine");

    await this.subscriber.subscribe("project.created", async (payload) => {
      await this.handleProjectCreated(payload as ProjectCreatedEvent);
    });

    await this.subscriber.subscribe("project.status_changed", async (payload) => {
      await this.handleStatusChanged(payload as ProjectStatusChangedEvent);
    });

    this.running = true;
    this.logger.info("WorkflowEngine started");
  }

  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    this.logger.info("Stopping WorkflowEngine");
    await this.subscriber.close();
    this.running = false;
    this.logger.info("WorkflowEngine stopped");
  }

  // ---------------------------------------------------------------------------
  // Event handlers
  // ---------------------------------------------------------------------------

  private async handleProjectCreated(event: ProjectCreatedEvent): Promise<void> {
    this.logger.info({ projectId: event.projectId }, "Handling project.created event");

    try {
      const notification: Notification = {
        id: crypto.randomUUID(),
        userId: "admin",
        type: "project_update",
        title: "New Project Created",
        body: `A new project "${event.title}" has been created and requires review.`,
        read: false,
        createdAt: new Date(),
      };

      await this.notificationRepo.create(notification);
      this.realtime?.sendToUser(notification.userId, "notification", notification);

      this.logger.info(
        { projectId: event.projectId, notificationId: notification.id },
        "Admin notification created for new project",
      );
    } catch (err) {
      this.logger.error(
        { err, projectId: event.projectId },
        "Failed to handle project.created event",
      );
    }
  }

  private async handleStatusChanged(event: ProjectStatusChangedEvent): Promise<void> {
    this.logger.info(
      { projectId: event.projectId, from: event.previousStatus, to: event.newStatus },
      "Handling project.status_changed event",
    );

    try {
      const project = await this.projectRepo.findById(event.projectId);
      if (!project) {
        this.logger.warn({ projectId: event.projectId }, "Project not found for status change");
        return;
      }

      // Create a notification for the client
      const clientNotification: Notification = {
        id: crypto.randomUUID(),
        userId: project.clientId,
        type: "status_change",
        title: "Project Status Updated",
        body: `Your project "${project.title}" status has changed from "${event.previousStatus}" to "${event.newStatus}".`,
        read: false,
        createdAt: new Date(),
      };

      await this.notificationRepo.create(clientNotification);
      this.realtime?.sendToUser(clientNotification.userId, "notification", clientNotification);

      // Send email when project is approved
      if (event.newStatus === "approved") {
        await this.emailService.send(
          project.clientId, // In production this would be resolved to an email
          `Project "${project.title}" Approved`,
          `Great news! Your project "${project.title}" has been approved and will move into development.`,
        );

        this.logger.info(
          { projectId: event.projectId },
          "Approval email sent to client",
        );
      }

      this.logger.info(
        { projectId: event.projectId, notificationId: clientNotification.id },
        "Client notification created for status change",
      );
    } catch (err) {
      this.logger.error(
        { err, projectId: event.projectId },
        "Failed to handle project.status_changed event",
      );
    }
  }
}
