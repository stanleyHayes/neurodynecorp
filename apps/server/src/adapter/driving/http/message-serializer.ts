import type { Message, Thread } from "../../../domain/entity/message.js";

/** Dual-case thread payload — portals read `subject` / `participants` / `*_at`. */
export function toApiThread(thread: Thread, lastMessage = ""): Record<string, unknown> {
  return {
    ...thread,
    project_id: thread.projectId,
    subject: thread.title,
    title: thread.title,
    participants: thread.participantIds,
    participant_ids: thread.participantIds,
    last_message: lastMessage,
    last_message_at: thread.lastMessageAt,
    created_at: thread.createdAt,
    updated_at: thread.updatedAt,
  };
}

export function toApiMessage(message: Message, senderName?: string): Record<string, unknown> {
  const name = senderName?.trim() || undefined;
  return {
    ...message,
    thread_id: message.threadId,
    sender_id: message.senderId,
    senderId: message.senderId,
    sender_name: name,
    senderName: name,
    file_urls: message.attachments,
    created_at: message.createdAt,
    updated_at: message.updatedAt,
  };
}
