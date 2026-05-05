import { ObjectId } from "mongodb";

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  attachments: string[];
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Thread {
  id: string;
  projectId: string;
  title: string;
  participantIds: string[];
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMessageInput {
  threadId: string;
  senderId: string;
  content: string;
  attachments?: string[];
}

export interface CreateThreadInput {
  projectId: string;
  title: string;
  participantIds: string[];
}

export function createMessage(input: CreateMessageInput): Message {
  const now = new Date();
  return {
    id: new ObjectId().toHexString(),
    threadId: input.threadId,
    senderId: input.senderId,
    content: input.content,
    attachments: input.attachments ?? [],
    readBy: [input.senderId],
    createdAt: now,
    updatedAt: now,
  };
}

export function createThread(input: CreateThreadInput): Thread {
  const now = new Date();
  return {
    id: new ObjectId().toHexString(),
    projectId: input.projectId,
    title: input.title,
    participantIds: input.participantIds,
    createdAt: now,
    updatedAt: now,
  };
}
