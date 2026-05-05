import { ObjectId } from "mongodb";

export type NotificationType =
  | "project_update"
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
