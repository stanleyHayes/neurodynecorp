import { useEffect, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { API_URL } from "../config";
import { authStorage } from "../storage/auth-storage";

/**
 * The app's realtime connection.
 *
 * One socket per signed-in user, shared by every caller. This previously had
 * three defects that between them meant realtime did not work at all:
 *
 *   1. `socketRef.current` was assigned AFTER `await getToken()`, while
 *      consumers call `on(...)` synchronously in their mount effect. The ref
 *      was still null at that point, so handlers were never registered and the
 *      returned cleanup was a no-op. Live notifications never arrived.
 *
 *   2. `auth: { token }` captured the access token once. Access tokens expire
 *      in 15 minutes, so any reconnect after that — backgrounding the app,
 *      switching networks — handshook with a dead token and stayed down.
 *
 *   3. Each `useSocket()` call built its own `io(...)`. Two call sites meant
 *      two sockets per user, and the server evicts older connections.
 *
 * The fixes are, in order: hold the socket in state so `on` changes identity
 * once it exists and consumer effects re-run; pass `auth` as a callback so
 * every reconnect reads current storage; and refcount a module-level instance
 * so callers share one connection.
 */

let shared: Socket | null = null;
let refCount = 0;
/** Notifies hook instances when `shared` is replaced, so they can re-register. */
const subscribers = new Set<(s: Socket | null) => void>();

function publish(s: Socket | null) {
  shared = s;
  subscribers.forEach((fn) => fn(s));
}

function acquire(): Socket {
  if (!shared) {
    publish(
      io(API_URL, {
        path: "/socket.io",
        transports: ["websocket"],
        // A callback, not a value: socket.io invokes this on every connection
        // attempt, so a reconnect after the access token expires picks up the
        // refreshed one instead of replaying a dead handshake.
        auth: (cb: (data: Record<string, unknown>) => void) => {
          authStorage
            .getToken()
            .then((token) => cb({ token: token ?? "" }))
            .catch(() => cb({ token: "" }));
        },
      }),
    );
  }
  refCount += 1;
  return shared!;
}

function release() {
  refCount = Math.max(0, refCount - 1);
  if (refCount === 0 && shared) {
    shared.disconnect();
    publish(null);
  }
}

/** Drops the shared socket outright — call on sign-out. */
export function resetSocket() {
  refCount = 0;
  if (shared) {
    shared.disconnect();
    publish(null);
  }
}

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(shared);
  const [connected, setConnected] = useState(shared?.connected ?? false);

  useEffect(() => {
    const instance = acquire();
    setSocket(instance);
    setConnected(instance.connected);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    instance.on("connect", onConnect);
    instance.on("disconnect", onDisconnect);

    const onShared = (s: Socket | null) => setSocket(s);
    subscribers.add(onShared);

    return () => {
      instance.off("connect", onConnect);
      instance.off("disconnect", onDisconnect);
      subscribers.delete(onShared);
      release();
    };
  }, []);

  const emit = useCallback(
    (event: string, payload: unknown) => {
      socket?.emit(event, payload);
    },
    [socket],
  );

  const subscribeProject = useCallback((projectId: string) => emit("subscribe_project", projectId), [emit]);
  const unsubscribeProject = useCallback((projectId: string) => emit("unsubscribe_project", projectId), [emit]);
  const sendMessage = useCallback(
    (projectId: string, threadId: string, message: Record<string, unknown>) =>
      emit("message", { projectId, threadId, message }),
    [emit],
  );
  const sendTyping = useCallback(
    (projectId: string, threadId?: string) => emit("typing", { projectId, threadId }),
    [emit],
  );

  /**
   * Registers an event handler.
   *
   * Depends on `socket`, so its identity changes the moment the connection
   * exists — which is what makes a consumer's `useEffect(..., [on])` re-run and
   * actually attach. That dependency is the fix for defect 1; do not memoise
   * this with an empty dependency array.
   */
  const on = useCallback(
    (event: string, handler: (...args: unknown[]) => void) => {
      if (!socket) return () => {};
      socket.on(event, handler);
      return () => {
        socket.off(event, handler);
      };
    },
    [socket],
  );

  return { socket, connected, subscribeProject, unsubscribeProject, sendMessage, sendTyping, on };
}
