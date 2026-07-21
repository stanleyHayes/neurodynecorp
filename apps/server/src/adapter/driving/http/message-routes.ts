import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, type TokenService } from "../../../middleware/auth.js";
import { ValidationError } from "../../../middleware/error-handler.js";
import type { Thread, Message } from "../../../domain/entity/message.js";

// ---- Validation schemas ----

const createThreadSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1).max(200),
  participantIds: z.array(z.string().min(1)),
});

const sendMessageSchema = z.object({
  content: z.string().min(1).max(10000),
  attachments: z.array(z.string()).optional(),
});

// ---- Service interface ----

export interface MessageService {
  createThread(input: { projectId: string; title: string; participantIds: string[] }): Promise<Thread>;
  listThreadsByProject(projectId: string): Promise<Thread[]>;
  listThreadsByParticipant(userId: string): Promise<Thread[]>;
  getThread(threadId: string): Promise<Thread | null>;
  sendMessage(threadId: string, senderId: string, content: string, attachments?: string[]): Promise<Message>;
  getMessages(threadId: string): Promise<Message[]>;
}

/** Allows pushing real-time events to connected users */
interface RealtimeEmitter {
  sendToUser(userId: string, event: string, data: unknown): void;
  broadcastToProject(projectId: string, message: { type: string; payload: Record<string, unknown>; timestamp: string }): void;
}

// ---- Route factory ----

export function createMessageRoutes(
  messageService: MessageService,
  tokenService: TokenService,
  realtime?: RealtimeEmitter,
): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  router.use(auth);

  // POST /api/v1/messages/threads
  router.post("/threads", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createThreadSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid thread data", parsed.error.flatten());
      }

      const thread = await messageService.createThread({
        ...(parsed.data as any),
        participantIds: [...new Set([req.userId!, ...(parsed.data as any).participantIds])],
      });
      res.status(201).json(thread);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/messages/threads
  router.get("/threads", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = req.query["projectId"] as string | undefined;

      const threads = projectId
        ? await messageService.listThreadsByProject(projectId)
        : await messageService.listThreadsByParticipant(req.userId!);

      res.status(200).json({ threads });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/messages/threads/:threadId
  router.get("/threads/:threadId", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const thread = await messageService.getThread(String(req.params.threadId));
      if (!thread) {
        res.status(404).json({ error: "Thread not found" });
        return;
      }
      res.status(200).json(thread);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/v1/messages/threads/:threadId/messages
  router.post("/threads/:threadId/messages", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = sendMessageSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid message data", parsed.error.flatten());
      }

      const message = await messageService.sendMessage(
        String(req.params.threadId),
        req.userId!,
        parsed.data.content,
        parsed.data.attachments,
      );

      // Broadcast message to project room and notify participants
      if (realtime) {
        const thread = await messageService.getThread(String(req.params.threadId));
        if (thread) {
          realtime.broadcastToProject(thread.projectId, {
            type: "message",
            payload: { ...message, threadId: thread.id } as unknown as Record<string, unknown>,
            timestamp: new Date().toISOString(),
          });

          // Send notification event to other participants
          for (const participantId of thread.participantIds) {
            if (participantId !== req.userId!) {
              realtime.sendToUser(participantId, "notification", {
                type: "message_received",
                title: "New Message",
                body: parsed.data.content.slice(0, 100),
                threadId: thread.id,
                timestamp: new Date().toISOString(),
              });
            }
          }
        }
      }

      res.status(201).json(message);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/messages/threads/:threadId/messages
  router.get("/threads/:threadId/messages", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const messages = await messageService.getMessages(String(req.params.threadId));
      res.status(200).json({ messages });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
