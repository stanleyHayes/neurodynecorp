import type { Notification } from "../../../domain/entity/notification.js";

/** Dual-case notification payload — portals read `body` / `created_at`. */
export function toApiNotification(n: Notification): Record<string, unknown> {
  return {
    ...n,
    user_id: n.userId,
    body: n.message,
    message: n.message,
    resource_id: n.resourceId,
    resource_type: n.resourceType,
    read_at: n.readAt,
    created_at: n.createdAt,
  };
}
