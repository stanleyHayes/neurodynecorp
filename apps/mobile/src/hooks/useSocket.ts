import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { API_URL } from "../config";
import { authStorage } from "../storage/auth-storage";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let socket: Socket | null = null;

    async function connect() {
      const token = await authStorage.getToken();
      if (!token) return;

      socket = io(API_URL, {
        path: "/socket.io",
        auth: { token },
        transports: ["websocket"],
      });

      socket.on("connect", () => setConnected(true));
      socket.on("disconnect", () => setConnected(false));

      socketRef.current = socket;
    }

    connect();

    return () => {
      socket?.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, []);

  const subscribeProject = useCallback((projectId: string) => {
    socketRef.current?.emit("subscribe_project", projectId);
  }, []);

  const unsubscribeProject = useCallback((projectId: string) => {
    socketRef.current?.emit("unsubscribe_project", projectId);
  }, []);

  const sendMessage = useCallback(
    (projectId: string, threadId: string, message: Record<string, unknown>) => {
      socketRef.current?.emit("message", { projectId, threadId, message });
    },
    [],
  );

  const sendTyping = useCallback((projectId: string, threadId?: string) => {
    socketRef.current?.emit("typing", { projectId, threadId });
  }, []);

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    socketRef.current?.on(event, handler);
    return () => {
      socketRef.current?.off(event, handler);
    };
  }, []);

  return { socket: socketRef, connected, subscribeProject, unsubscribeProject, sendMessage, sendTyping, on };
}
