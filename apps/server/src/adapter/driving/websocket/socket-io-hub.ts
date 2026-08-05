import { Server as SocketIOServer, Socket } from "socket.io";
import type { Server } from "http";
import type { Logger } from "pino";
import type { TokenService } from "../../../middleware/auth.js";
import type { ProjectAccessChecker } from "./hub.js";

// ---- Types ----

export interface SIOMessage {
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

// ---- Hub class ----

export interface SocketIOHubOptions {
  /** Explicit CORS allowlist (production). */
  corsOrigins: string[];
  /** When true, also allow any localhost / 127.0.0.1 origin. */
  allowLocalhost?: boolean;
}

export class SocketIOHub {
  private io: SocketIOServer | null = null;
  private userSockets = new Map<string, Socket>();
  private projectUsers = new Map<string, Set<string>>();

  constructor(
    private readonly tokenService: TokenService,
    private readonly logger: Logger,
    private readonly canAccessProject: ProjectAccessChecker,
    private readonly options: SocketIOHubOptions = { corsOrigins: [] },
  ) {}

  start(server: Server): void {
    const allowLocalhost = this.options.allowLocalhost ?? false;
    const allowed = new Set(this.options.corsOrigins);

    this.io = new SocketIOServer(server, {
      path: "/socket.io",
      cors: {
        origin: (origin, cb) => {
          if (!origin) return cb(null, true);
          if (allowLocalhost && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            return cb(null, true);
          }
          if (allowed.has(origin)) return cb(null, true);
          return cb(new Error(`CORS: origin ${origin} not allowed`), false);
        },
        methods: ["GET", "POST"],
        credentials: true,
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
        socket.data["role"] = payload.role;
        next();
      } catch {
        next(new Error("Invalid authentication token"));
      }
    });

    this.io.on("connection", (socket) => {
      const userId = socket.data["userId"] as string;
      const role = socket.data["role"] as string;

      // Close existing connection for this user
      const existing = this.userSockets.get(userId);
      if (existing) {
        existing.disconnect(true);
        this.cleanupUser(userId);
      }

      this.userSockets.set(userId, socket);
      this.logger.info({ userId }, "Socket.IO client connected");

      socket.emit("status", { connected: true });

      // Subscribe to a project room (ownership / staff gated)
      socket.on("subscribe_project", (projectId: string) => {
        void (async () => {
          if (!projectId || typeof projectId !== "string") return;
          const allowed = await this.canAccessProject({ userId, role, projectId });
          if (!allowed) {
            socket.emit("error", { error: "Project not found" });
            return;
          }
          socket.join(`project:${projectId}`);
          if (!this.projectUsers.has(projectId)) {
            this.projectUsers.set(projectId, new Set());
          }
          this.projectUsers.get(projectId)!.add(userId);
          this.logger.debug({ userId, projectId }, "Subscribed to project");
        })();
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

      // Typing indicator — only if already subscribed to the project room
      socket.on("typing", (data: { projectId: string; threadId?: string }) => {
        if (!data?.projectId) return;
        if (!this.projectUsers.get(data.projectId)?.has(userId)) return;
        socket.to(`project:${data.projectId}`).emit("typing", {
          userId,
          threadId: data.threadId,
          timestamp: new Date().toISOString(),
        });
      });

      // Chat messages must go through HTTP (authz + persistence). Do not accept
      // client-originated "message" broadcasts — that bypassed thread membership.

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
