import { Server as SocketIOServer, Socket } from "socket.io";
import type { Server } from "http";
import type { Logger } from "pino";
import type { TokenService } from "../../../middleware/auth.js";

// ---- Types ----

export interface SIOMessage {
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

// ---- Hub class ----

export class SocketIOHub {
  private io: SocketIOServer | null = null;
  private userSockets = new Map<string, Socket>();
  private projectUsers = new Map<string, Set<string>>();

  constructor(
    private readonly tokenService: TokenService,
    private readonly logger: Logger,
  ) {}

  start(server: Server): void {
    this.io = new SocketIOServer(server, {
      path: "/socket.io",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    this.io.use((socket, next) => {
      const token = socket.handshake.auth["token"] as string | undefined;
      if (!token) {
        return next(new Error("Missing authentication token"));
      }

      try {
        const payload = this.tokenService.validateAccessToken(token);
        socket.data["userId"] = payload.userId;
        next();
      } catch {
        next(new Error("Invalid authentication token"));
      }
    });

    this.io.on("connection", (socket) => {
      const userId = socket.data["userId"] as string;

      // Close existing connection for this user
      const existing = this.userSockets.get(userId);
      if (existing) {
        existing.disconnect(true);
        this.cleanupUser(userId);
      }

      this.userSockets.set(userId, socket);
      this.logger.info({ userId }, "Socket.IO client connected");

      socket.emit("status", { connected: true });

      // Subscribe to a project room
      socket.on("subscribe_project", (projectId: string) => {
        socket.join(`project:${projectId}`);
        if (!this.projectUsers.has(projectId)) {
          this.projectUsers.set(projectId, new Set());
        }
        this.projectUsers.get(projectId)!.add(userId);
        this.logger.debug({ userId, projectId }, "Subscribed to project");
      });

      // Unsubscribe from a project room
      socket.on("unsubscribe_project", (projectId: string) => {
        socket.leave(`project:${projectId}`);
        const users = this.projectUsers.get(projectId);
        if (users) {
          users.delete(userId);
          if (users.size === 0) this.projectUsers.delete(projectId);
        }
      });

      // Typing indicator
      socket.on("typing", (data: { projectId: string; threadId?: string }) => {
        socket.to(`project:${data.projectId}`).emit("typing", {
          userId,
          threadId: data.threadId,
          timestamp: new Date().toISOString(),
        });
      });

      // Chat message — broadcast to project room
      socket.on("message", (data: { projectId: string; threadId: string; message: Record<string, unknown> }) => {
        this.io!.to(`project:${data.projectId}`).emit("message", {
          ...data.message,
          threadId: data.threadId,
          timestamp: new Date().toISOString(),
        });
      });

      socket.on("disconnect", () => {
        this.cleanupUser(userId);
        this.userSockets.delete(userId);
        this.logger.info({ userId }, "Socket.IO client disconnected");
      });

      socket.on("error", (err) => {
        this.logger.error({ err, userId }, "Socket.IO error");
      });
    });

    this.logger.info("Socket.IO hub started");
  }

  private cleanupUser(userId: string): void {
    for (const [projectId, users] of this.projectUsers) {
      users.delete(userId);
      if (users.size === 0) this.projectUsers.delete(projectId);
    }
  }

  broadcastToProject(projectId: string, message: SIOMessage): void {
    this.io?.to(`project:${projectId}`).emit(message.type, message.payload);
  }

  sendToUser(userId: string, event: string, data: unknown): void {
    const socket = this.userSockets.get(userId);
    if (socket) socket.emit(event, data);
  }

  shutdown(): void {
    if (this.io) {
      this.io.disconnectSockets(true);
      this.io.close();
      this.userSockets.clear();
      this.projectUsers.clear();
      this.logger.info("Socket.IO hub shut down");
    }
  }
}
