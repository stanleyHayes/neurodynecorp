import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import type { Logger } from "pino";
import type { TokenService } from "../../../middleware/auth.js";
import type { URL } from "url";

// ---- Message types ----

export type WSMessageType = "message" | "notification" | "typing" | "status" | "error";

export interface WSMessage {
  type: WSMessageType;
  payload: Record<string, unknown>;
  timestamp: string;
}

// ---- Client entry ----

interface ClientEntry {
  ws: WebSocket;
  userId: string;
  projectIds: Set<string>;
}

// ---- Hub class ----

export class WebSocketHub {
  private wss: WebSocketServer | null = null;
  private clients = new Map<string, ClientEntry>();
  private projectClients = new Map<string, Set<string>>();

  constructor(
    private readonly tokenService: TokenService,
    private readonly logger: Logger,
  ) {}

  start(server: Server): void {
    this.wss = new WebSocketServer({ server, path: "/ws" });

    this.wss.on("connection", (ws, req) => {
      const url = new globalThis.URL(req.url ?? "/", `http://${req.headers.host}`);
      const token = url.searchParams.get("token");

      if (!token) {
        ws.close(4001, "Missing authentication token");
        return;
      }

      let userId: string;
      try {
        const payload = this.tokenService.validateAccessToken(token);
        userId = payload.userId;
      } catch {
        ws.close(4001, "Invalid authentication token");
        return;
      }

      this.registerClient(userId, ws);
      this.logger.info({ userId }, "WebSocket client connected");

      ws.on("message", (data) => {
        this.handleMessage(userId, data);
      });

      ws.on("close", () => {
        this.unregisterClient(userId);
        this.logger.info({ userId }, "WebSocket client disconnected");
      });

      ws.on("error", (err) => {
        this.logger.error({ err, userId }, "WebSocket error");
      });

      // Send welcome message
      this.sendToUser(userId, {
        type: "status",
        payload: { connected: true },
        timestamp: new Date().toISOString(),
      });
    });

    this.logger.info("WebSocket hub started");
  }

  private registerClient(userId: string, ws: WebSocket): void {
    // Close existing connection for user if any
    const existing = this.clients.get(userId);
    if (existing) {
      existing.ws.close(4000, "Replaced by new connection");
      this.cleanupClient(userId);
    }

    this.clients.set(userId, {
      ws,
      userId,
      projectIds: new Set(),
    });
  }

  private unregisterClient(userId: string): void {
    this.cleanupClient(userId);
    this.clients.delete(userId);
  }

  private cleanupClient(userId: string): void {
    const client = this.clients.get(userId);
    if (!client) return;

    for (const projectId of client.projectIds) {
      const projectSet = this.projectClients.get(projectId);
      if (projectSet) {
        projectSet.delete(userId);
        if (projectSet.size === 0) {
          this.projectClients.delete(projectId);
        }
      }
    }
  }

  private handleMessage(userId: string, data: unknown): void {
    try {
      const raw = typeof data === "string" ? data : String(data);
      const msg = JSON.parse(raw) as { type: string; payload?: Record<string, unknown> };

      switch (msg.type) {
        case "subscribe_project": {
          const projectId = msg.payload?.["projectId"] as string;
          if (projectId) {
            this.subscribeToProject(userId, projectId);
          }
          break;
        }
        case "unsubscribe_project": {
          const projectId = msg.payload?.["projectId"] as string;
          if (projectId) {
            this.unsubscribeFromProject(userId, projectId);
          }
          break;
        }
        case "typing": {
          const projectId = msg.payload?.["projectId"] as string;
          const threadId = msg.payload?.["threadId"] as string;
          if (projectId) {
            this.broadcastToProject(projectId, {
              type: "typing",
              payload: { userId, threadId },
              timestamp: new Date().toISOString(),
            }, userId);
          }
          break;
        }
        default:
          this.logger.debug({ userId, type: msg.type }, "Unknown WS message type");
      }
    } catch {
      this.logger.warn({ userId }, "Failed to parse WebSocket message");
    }
  }

  subscribeToProject(userId: string, projectId: string): void {
    const client = this.clients.get(userId);
    if (!client) return;

    client.projectIds.add(projectId);

    if (!this.projectClients.has(projectId)) {
      this.projectClients.set(projectId, new Set());
    }
    this.projectClients.get(projectId)!.add(userId);
  }

  unsubscribeFromProject(userId: string, projectId: string): void {
    const client = this.clients.get(userId);
    if (!client) return;

    client.projectIds.delete(projectId);

    const projectSet = this.projectClients.get(projectId);
    if (projectSet) {
      projectSet.delete(userId);
      if (projectSet.size === 0) {
        this.projectClients.delete(projectId);
      }
    }
  }

  broadcastToProject(projectId: string, message: WSMessage, excludeUserId?: string): void {
    const userIds = this.projectClients.get(projectId);
    if (!userIds) return;

    const payload = JSON.stringify(message);

    for (const uid of userIds) {
      if (uid === excludeUserId) continue;
      const client = this.clients.get(uid);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    }
  }

  sendToUser(userId: string, message: WSMessage): void {
    const client = this.clients.get(userId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  getConnectedUserCount(): number {
    return this.clients.size;
  }

  shutdown(): void {
    if (this.wss) {
      for (const client of this.clients.values()) {
        client.ws.close(1001, "Server shutting down");
      }
      this.clients.clear();
      this.projectClients.clear();
      this.wss.close();
      this.logger.info("WebSocket hub shut down");
    }
  }
}
