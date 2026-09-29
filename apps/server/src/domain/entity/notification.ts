import { ObjectId } from "mongodb";

export type NotificationType =
  | "project_update"
  // Emitted by WorkflowEngine on a project status transition, and mapped by
  // both the mobile and client notification screens. It was missing from this
  // union only because the engine declared its own Notification type and so
  // never type-checked against it.
  | "status_change"
  | "task_assigned"
  | "task_completed"
  | "comment_added"
  | "invoice_sent"
  | "invoice_paid"
  | "spec_generated"
  | "spec_approved"
  | "message_received"
  | "system";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  resourceId?: string;
  resourceType?: string;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  resourceId?: string;
  resourceType?: string;
}

export function createNotification(
  input: CreateNotificationInput,
): Notification {
  return {
    id: new ObjectId().toHexString(),
    userId: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    resourceId: input.resourceId,
    resourceType: input.resourceType,
    read: false,
    createdAt: new Date(),
  };
}
