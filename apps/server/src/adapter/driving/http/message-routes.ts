import { Router } from "express";
import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { authMiddleware, type TokenService } from "../../../middleware/auth.js";
import { isClientActor, isStaffRole } from "../../../middleware/rbac-helpers.js";
import { ValidationError, NotFoundError } from "../../../middleware/error-handler.js";
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

/** Returns the owning client's userId for a project, or null if unknown. */
type ProjectOwnerLookup = (projectId: string) => Promise<string | null>;

export function createMessageRoutes(
  messageService: MessageService,
  tokenService: TokenService,
  realtime?: RealtimeEmitter,
  getProjectOwnerId?: ProjectOwnerLookup,
): Router {
  const router = Router();
  const auth = authMiddleware(tokenService);

  router.use(auth);

  // POST /api/v1/messages/threads

  // Threads are private to their participants. POST /threads deliberately forces
  // the creator into participantIds, which shows membership is the intended
  // authorization boundary — but it was never enforced on read or reply, so any
  // authenticated user could read (or post into) any thread by id.
  // Staff roles retain cross-thread visibility for support purposes.
  function isStaff(req: Request): boolean {
    return isStaffRole(req.userRole);
  }

  async function assertProjectAccess(req: Request, projectId: string): Promise<void> {
    if (isClientActor(req.userRole) && getProjectOwnerId) {
      const ownerId = await getProjectOwnerId(projectId);
      if (!ownerId || ownerId !== req.userId) {
        throw new NotFoundError("project", projectId);
      }
    }
  }

  async function loadThreadForCaller(req: Request) {
    const thread = await messageService.getThread(String(req.params.threadId));
    if (!thread) return { thread: null, allowed: false };
    const isParticipant = !!req.userId && thread.participantIds.includes(req.userId);
    return { thread, allowed: isStaff(req) || isParticipant };
  }

  router.post("/threads", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createThreadSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError("Invalid thread data", parsed.error.flatten());
      }

      await assertProjectAccess(req, parsed.data.projectId);

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

      if (projectId) {
        await assertProjectAccess(req, projectId);
      }

      let threads = projectId
        ? await messageService.listThreadsByProject(projectId)
        : await messageService.listThreadsByParticipant(req.userId!);

      // Non-staff must never see other projects' threads via ?projectId=.
      if (!isStaff(req)) {
        threads = threads.filter((t) => t.participantIds.includes(req.userId!));
      }

      res.status(200).json({ threads });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/v1/messages/threads/:threadId
  router.get("/threads/:threadId", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { thread, allowed } = await loadThreadForCaller(req);
      if (!thread || !allowed) {
        // 404 rather than 403 so thread ids cannot be probed for existence.
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

      // Without this, any authenticated user could inject a message into any
      // thread — and it would then be broadcast to that project's whole room.
      const { thread: target, allowed } = await loadThreadForCaller(req);
      if (!target || !allowed) {
        res.status(404).json({ error: "Thread not found" });
        return;
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
      const { thread, allowed } = await loadThreadForCaller(req);
      if (!thread || !allowed) {
        res.status(404).json({ error: "Thread not found" });
        return;
      }
      const messages = await messageService.getMessages(String(req.params.threadId));
      // `items` matches ApiClient / portal list consumers; `messages` kept as alias.
      res.status(200).json({ messages, items: messages, total: messages.length });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
