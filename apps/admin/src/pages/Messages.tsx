import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  IconButton,
  Stack,
  Badge,
  InputAdornment,
  Chip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import SearchIcon from "@mui/icons-material/Search";
import CircleIcon from "@mui/icons-material/Circle";
import PageBanner from "@/components/shared/PageBanner";
import SectionLabel from "@/components/shared/AnimatedGrid";
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/context/AuthContext";

// ---- Types ----

interface Thread {
  id: string;
  projectId: string;
  title: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  participants: string[];
}

interface ChatMessage {
  id: string;
  sender: string;
  senderId: string;
  content: string;
  time: string;
  isMine: boolean;
  avatar: string;
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatClock(dateStr?: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function initials(id: string): string {
  return (id || "??").slice(0, 2).toUpperCase();
}

// ---- Constants ----

const BORDER = "rgba(108, 99, 255, 0.12)";
const THREAD_WIDTH = 340;

// ---- Component ----

export default function Messages() {
  const { api, user } = useAuth();
  const myId = user?.id ?? "";
  const myAvatar = initials(user?.first_name || user?.email || "ME");

  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string>("");
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { connected, subscribeProject, sendTyping, on } = useSocket();

  const loadThreads = useCallback(async () => {
    const res = await api.listThreads();
    const raw = (res as any).threads ?? (res as any).items ?? [];
    const mapped: Thread[] = raw.map((t: any) => ({
      id: t.id,
      projectId: t.project_id ?? t.projectId,
      title: t.subject ?? t.title ?? "Thread",
      lastMessage: t.last_message ?? "",
      time: timeAgo(t.updated_at ?? t.created_at ?? t.updatedAt ?? t.createdAt),
      unread: 0,
      avatar: initials(t.subject ?? t.title ?? t.id),
      participants: t.participants ?? t.participant_ids ?? t.participantIds ?? [],
    }));
    setThreads(mapped);
    setSelectedThread((prev) => prev || mapped[0]?.id || "");
  }, [api]);

  const loadMessages = useCallback(
    async (threadId: string) => {
      if (!threadId) return;
      const res = await api.getMessages(threadId);
      const items = (res as any).items ?? (res as any).messages ?? [];
      const mapped: ChatMessage[] = items.map((m: any) => {
        const senderId = m.sender_id ?? m.senderId ?? "";
        const mine = senderId === myId;
        return {
          id: m.id,
          sender: mine ? "You" : senderId.slice(0, 8),
          senderId,
          content: m.content,
          time: formatClock(m.created_at ?? m.createdAt),
          isMine: mine,
          avatar: mine ? myAvatar : initials(senderId),
        };
      });
      setMessages((prev) => ({ ...prev, [threadId]: mapped }));
    },
    [api, myId, myAvatar],
  );

  useEffect(() => {
    void loadThreads().catch(() => setThreads([]));
  }, [loadThreads]);

  useEffect(() => {
    if (selectedThread) void loadMessages(selectedThread).catch(() => undefined);
  }, [selectedThread, loadMessages]);

  // Subscribe to project rooms for live updates
  useEffect(() => {
    if (!connected) return;
    const projectIds = [...new Set(threads.map((t) => t.projectId).filter(Boolean))];
    projectIds.forEach(subscribeProject);
  }, [connected, subscribeProject, threads]);

  useEffect(() => {
    const off = on("message", (data: unknown) => {
      const msg = data as {
        threadId?: string;
        thread_id?: string;
        id?: string;
        senderId?: string;
        sender_id?: string;
        content: string;
      };
      const threadId = msg.threadId ?? msg.thread_id;
      const senderId = msg.senderId ?? msg.sender_id ?? "";
      if (!threadId || senderId === myId) return;

      const newMsg: ChatMessage = {
        id: msg.id ?? `rt-${Date.now()}`,
        sender: senderId.slice(0, 8) || "Client",
        senderId,
        content: msg.content,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isMine: false,
        avatar: initials(senderId),
      };

      setMessages((prev) => ({
        ...prev,
        [threadId]: [...(prev[threadId] ?? []), newMsg],
      }));
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? { ...t, lastMessage: msg.content, time: "just now" }
            : t,
        ),
      );
    });
    return off;
  }, [on, myId]);

  useEffect(() => {
    const off = on("typing", (data: unknown) => {
      const { userId, threadId } = data as { userId: string; threadId?: string };
      if (threadId === selectedThread) {
        setTypingUser(userId);
        setTimeout(() => setTypingUser(null), 3000);
      }
    });
    return off;
  }, [on, selectedThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedThread]);

  const handleSend = useCallback(async () => {
    if (!newMessage.trim() || !selectedThread) return;
    const thread = threads.find((t) => t.id === selectedThread);
    if (!thread) return;
    const text = newMessage.trim();
    setNewMessage("");

    try {
      const sent = await api.sendMessage(selectedThread, text);
      const senderId = (sent as any).sender_id ?? (sent as any).senderId ?? myId;
      const newMsg: ChatMessage = {
        id: (sent as any).id ?? `local-${Date.now()}`,
        sender: "You",
        senderId,
        content: text,
        time: formatClock((sent as any).created_at ?? (sent as any).createdAt ?? new Date().toISOString()),
        isMine: true,
        avatar: myAvatar,
      };
      setMessages((prev) => ({
        ...prev,
        [selectedThread]: [...(prev[selectedThread] ?? []), newMsg],
      }));
      setThreads((prev) =>
        prev.map((t) =>
          t.id === selectedThread ? { ...t, lastMessage: text, time: "just now" } : t,
        ),
      );
    } catch {
      setNewMessage(text);
    }
  }, [newMessage, selectedThread, threads, api, myId, myAvatar]);

  const handleTyping = useCallback(() => {
    const thread = threads.find((t) => t.id === selectedThread);
    if (thread) sendTyping(thread.projectId, selectedThread);
  }, [selectedThread, sendTyping, threads]);

  const filtered = search
    ? threads.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.lastMessage.toLowerCase().includes(search.toLowerCase()),
      )
    : threads;

  const currentMessages = messages[selectedThread] ?? [];
  const currentThread = threads.find((t) => t.id === selectedThread);

  return (
    <Box>
      <PageBanner
        icon={<ChatOutlinedIcon />}
        title="Messages"
        description="Real-time communication with clients and team members across all projects."
        tag="ADMIN // MESSAGES"
        accentWord="Messages"
        iconColor="#00D4AA"
        iconLabel="SOCKET.IO ACTIVE"
      />

      <SectionLabel>Active Conversations</SectionLabel>

      <Box
        sx={{
          display: "flex",
          height: { xs: 500, md: 620 },
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        {/* ── Thread sidebar ── */}
        <Box
          sx={{
            width: THREAD_WIDTH,
            borderRight: `1px solid ${BORDER}`,
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          {/* Search */}
          <Box sx={{ p: 1.5, borderBottom: `1px solid ${BORDER}` }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: "text.secondary", opacity: 0.5 }} />
                    </InputAdornment>
                  ),
                  sx: {
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "0.8rem",
                    bgcolor: "rgba(108, 99, 255, 0.04)",
                    borderRadius: 1,
                    "& fieldset": { borderColor: BORDER },
                  },
                },
              }}
            />
          </Box>

          {/* Thread list */}
          <Box sx={{ flex: 1, overflowY: "auto" }}>
            <List disablePadding>
              {filtered.map((thread) => (
                <ListItemButton
                  key={thread.id}
                  selected={selectedThread === thread.id}
                  onClick={() => setSelectedThread(thread.id)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderBottom: `1px solid ${BORDER}`,
                    position: "relative",
                    "&.Mui-selected": {
                      bgcolor: "rgba(108, 99, 255, 0.06)",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        top: "15%",
                        bottom: "15%",
                        width: 3,
                        borderRadius: 1,
                        bgcolor: "#6C63FF",
                        boxShadow: "0 0 8px #6C63FF80",
                      },
                    },
                    "&:hover": { bgcolor: "rgba(108, 99, 255, 0.04)" },
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      badgeContent={thread.unread}
                      color="primary"
                      sx={{ "& .MuiBadge-badge": { fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem" } }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: thread.unread > 0 ? "primary.dark" : "rgba(108, 99, 255, 0.15)",
                          width: 40,
                          height: 40,
                          fontSize: 14,
                          fontFamily: "'Outfit', sans-serif",
                        }}
                      >
                        {thread.avatar}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText slotProps={{ primary: { sx: { fontWeight: thread.unread > 0 ? 700 : 500, fontSize: "0.85rem" },
                      variant: "subtitle2",
                      noWrap: true,
                    }, secondary: {
                      variant: "caption",
                      noWrap: true,
                      sx: { opacity: 0.6, fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem" },
                    } }}
                    primary={thread.title}
                    secondary={thread.lastMessage}
                  />
                  <Typography
                    sx={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "0.6rem",
                      color: "text.secondary",
                      opacity: 0.5,
                      whiteSpace: "nowrap",
                      ml: 1,
                    }}
                  >
                    {thread.time}
                  </Typography>
                </ListItemButton>
              ))}
            </List>
          </Box>
        </Box>

        {/* ── Chat area ── */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Header */}
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              borderBottom: `1px solid ${BORDER}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: "rgba(108, 99, 255, 0.02)",
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                {currentThread?.title}
              </Typography>
              <Stack sx={{ alignItems: "center" }} direction="row" spacing={0.5}>
                <CircleIcon sx={{ fontSize: 8, color: connected ? "#10B981" : "#EF4444" }} />
                <Typography
                  sx={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "0.6rem",
                    color: "text.secondary",
                    opacity: 0.6,
                    letterSpacing: "0.1em",
                  }}
                >
                  {connected ? "CONNECTED" : "OFFLINE"} &middot; {currentThread?.participants.join(", ")}
                </Typography>
              </Stack>
            </Box>
            <Chip
              label={`${currentMessages.length} msgs`}
              size="small"
              sx={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "0.6rem",
                bgcolor: "rgba(108, 99, 255, 0.08)",
                color: "#6C63FF",
                border: `1px solid rgba(108, 99, 255, 0.15)`,
              }}
            />
          </Box>

          {/* Messages */}
          <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2 }}>
            <Stack spacing={1.5}>
              {currentMessages.map((msg) => (
                <Box
                  key={msg.id}
                  sx={{
                    display: "flex",
                    justifyContent: msg.isMine ? "flex-end" : "flex-start",
                    gap: 1,
                  }}
                >
                  {!msg.isMine && (
                    <Avatar
                      sx={{
                        width: 30,
                        height: 30,
                        fontSize: 11,
                        bgcolor: "rgba(0, 212, 170, 0.15)",
                        color: "#00D4AA",
                        fontFamily: "'Outfit', sans-serif",
                        mt: 0.5,
                      }}
                    >
                      {msg.avatar}
                    </Avatar>
                  )}
                  <Box sx={{ maxWidth: "65%" }}>
                    <Box
                      sx={{
                        px: 2,
                        py: 1.2,
                        borderRadius: msg.isMine ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                        bgcolor: msg.isMine
                          ? "rgba(108, 99, 255, 0.12)"
                          : "rgba(255, 255, 255, 0.04)",
                        border: `1px solid ${msg.isMine ? "rgba(108, 99, 255, 0.2)" : BORDER}`,
                      }}
                    >
                      {!msg.isMine && (
                        <Typography
                          sx={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: "0.6rem",
                            fontWeight: 700,
                            color: "#00D4AA",
                            letterSpacing: "0.05em",
                            mb: 0.3,
                          }}
                        >
                          {msg.sender}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ fontSize: "0.85rem", lineHeight: 1.5 }}>
                        {msg.content}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: "0.55rem",
                        color: "text.secondary",
                        opacity: 0.4,
                        mt: 0.3,
                        textAlign: msg.isMine ? "right" : "left",
                        px: 0.5,
                      }}
                    >
                      {msg.time}
                    </Typography>
                  </Box>
                  {msg.isMine && (
                    <Avatar
                      sx={{
                        width: 30,
                        height: 30,
                        fontSize: 11,
                        bgcolor: "rgba(108, 99, 255, 0.15)",
                        color: "#6C63FF",
                        fontFamily: "'Outfit', sans-serif",
                        mt: 0.5,
                      }}
                    >
                      {msg.avatar}
                    </Avatar>
                  )}
                </Box>
              ))}

              {typingUser && (
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Typography
                    sx={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "0.65rem",
                      color: "#00D4AA",
                      opacity: 0.7,
                      fontStyle: "italic",
                    }}
                  >
                    Someone is typing...
                  </Typography>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Stack>
          </Box>

          {/* Input */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderTop: `1px solid ${BORDER}`,
              bgcolor: "rgba(108, 99, 255, 0.02)",
            }}
          >
            <Stack sx={{ alignItems: "center" }} direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                slotProps={{
                  input: {
                    sx: {
                      fontSize: "0.85rem",
                      bgcolor: "rgba(108, 99, 255, 0.04)",
                      borderRadius: 1,
                      "& fieldset": { borderColor: BORDER },
                    },
                  },
                }}
              />
              <IconButton
                onClick={handleSend}
                disabled={!newMessage.trim()}
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  width: 40,
                  height: 40,
                  "&:hover": { bgcolor: "primary.dark" },
                  "&.Mui-disabled": { bgcolor: "rgba(108, 99, 255, 0.1)", color: "text.secondary" },
                }}
              >
                <SendIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
