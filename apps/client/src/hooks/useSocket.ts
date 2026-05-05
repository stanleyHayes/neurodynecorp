import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const TOKEN_KEY = "neurodyne_access_token";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;

    const socket = io(API_URL, {
      path: "/socket.io",
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
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

  const on = useCallback((event: string, handler: (...args: unknown[]) => void) => {
    socketRef.current?.on(event, handler);
    return () => {
      socketRef.current?.off(event, handler);
    };
  }, []);

  return { socket: socketRef, connected, subscribeProject, unsubscribeProject, sendMessage, sendTyping, on };
}
