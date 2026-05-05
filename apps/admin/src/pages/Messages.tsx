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

// ---- Mock data ----

const ADMIN_ID = "admin-001";

const mockThreads: Thread[] = [
  {
    id: "t1",
    projectId: "p1",
    title: "E-Commerce Platform",
    lastMessage: "We'll integrate Stripe for the checkout flow",
    time: "2h ago",
    unread: 3,
    avatar: "JD",
    participants: ["John Doe", "You"],
  },
  {
    id: "t2",
    projectId: "p1",
    title: "Mobile Banking App",
    lastMessage: "Wireframes look great, approved!",
    time: "5h ago",
    unread: 0,
    avatar: "SK",
    participants: ["Sarah Kim", "You"],
  },
  {
    id: "t3",
    projectId: "p2",
    title: "AI Dashboard: Data Pipeline",
    lastMessage: "The ETL process needs optimization",
    time: "1d ago",
    unread: 1,
    avatar: "DK",
    participants: ["David Kim", "You"],
  },
  {
    id: "t4",
    projectId: "p2",
    title: "Healthcare Portal",
    lastMessage: "Can we schedule a call tomorrow?",
    time: "2d ago",
    unread: 0,
    avatar: "MC",
    participants: ["Maria Chen", "You"],
  },
  {
    id: "t5",
    projectId: "p3",
    title: "Supply Chain Tracker",
    lastMessage: "The logistics module is ready for QA",
    time: "3d ago",
    unread: 5,
    avatar: "TL",
    participants: ["Tom Lee", "You"],
  },
];

const mockMessages: Record<string, ChatMessage[]> = {
  t1: [
    { id: "m1", sender: "John Doe", senderId: "u1", content: "Hi, we've completed the product listing module. Ready for review.", time: "10:30 AM", isMine: false, avatar: "JD" },
    { id: "m2", sender: "You", senderId: ADMIN_ID, content: "Great work! I'll review it this afternoon. Any blockers on the payment integration?", time: "11:15 AM", isMine: true, avatar: "AM" },
    { id: "m3", sender: "John Doe", senderId: "u1", content: "We'll integrate Stripe for the checkout flow. Should be done by end of sprint.", time: "11:45 AM", isMine: false, avatar: "JD" },
    { id: "m4", sender: "You", senderId: ADMIN_ID, content: "Perfect. Let me know if the Stripe test keys are working properly.", time: "12:00 PM", isMine: true, avatar: "AM" },
  ],
  t2: [
    { id: "m5", sender: "Sarah Kim", senderId: "u2", content: "I've uploaded the wireframes for the mobile banking app.", time: "9:00 AM", isMine: false, avatar: "SK" },
    { id: "m6", sender: "You", senderId: ADMIN_ID, content: "Wireframes look great, approved!", time: "9:30 AM", isMine: true, avatar: "AM" },
  ],
  t3: [
    { id: "m7", sender: "David Kim", senderId: "u3", content: "The ETL process needs optimization. We're seeing latency spikes.", time: "Yesterday", isMine: false, avatar: "DK" },
    { id: "m8", sender: "You", senderId: ADMIN_ID, content: "Can you share the metrics dashboard link? I'll take a look.", time: "Yesterday", isMine: true, avatar: "AM" },
    { id: "m9", sender: "David Kim", senderId: "u3", content: "Sure, I'll send it over now. The bottleneck seems to be in the transformation step.", time: "Yesterday", isMine: false, avatar: "DK" },
  ],
  t4: [
    { id: "m10", sender: "Maria Chen", senderId: "u4", content: "Can we schedule a call tomorrow to discuss the HIPAA compliance requirements?", time: "2 days ago", isMine: false, avatar: "MC" },
  ],
  t5: [
    { id: "m11", sender: "Tom Lee", senderId: "u5", content: "The logistics module is ready for QA. All unit tests passing.", time: "3 days ago", isMine: false, avatar: "TL" },
    { id: "m12", sender: "You", senderId: ADMIN_ID, content: "Excellent! I'll assign the QA team to it right away.", time: "3 days ago", isMine: true, avatar: "AM" },
  ],
};

// ---- Constants ----

const BORDER = "rgba(108, 99, 255, 0.12)";
const THREAD_WIDTH = 340;

// ---- Component ----

export default function Messages() {
  const [selectedThread, setSelectedThread] = useState(mockThreads[0].id);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { connected, subscribeProject, sendMessage: emitMessage, sendTyping, on } = useSocket();

  // Subscribe to project rooms
  useEffect(() => {
    if (!connected) return;
    const projectIds = [...new Set(mockThreads.map((t) => t.projectId))];
    projectIds.forEach(subscribeProject);
  }, [connected, subscribeProject]);

  // Listen for incoming messages
  useEffect(() => {
    const off = on("message", (data: unknown) => {
      const msg = data as { threadId: string; senderId: string; sender: string; content: string; avatar?: string };
      if (msg.senderId === ADMIN_ID) return;

      const newMsg: ChatMessage = {
        id: `rt-${Date.now()}`,
        sender: msg.sender ?? "Client",
        senderId: msg.senderId,
        content: msg.content,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isMine: false,
        avatar: msg.avatar ?? "??",
      };

      setMessages((prev) => ({
        ...prev,
        [msg.threadId]: [...(prev[msg.threadId] ?? []), newMsg],
      }));
    });
    return off;
  }, [on]);

  // Typing indicator
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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedThread]);

  const handleSend = useCallback(() => {
    if (!newMessage.trim()) return;

    const thread = mockThreads.find((t) => t.id === selectedThread);
    if (!thread) return;

    const msg: ChatMessage = {
      id: `local-${Date.now()}`,
      sender: "You",
      senderId: ADMIN_ID,
      content: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMine: true,
      avatar: "AM",
    };

    setMessages((prev) => ({
      ...prev,
      [selectedThread]: [...(prev[selectedThread] ?? []), msg],
    }));

    emitMessage(thread.projectId, selectedThread, {
      senderId: ADMIN_ID,
      sender: "Admin",
      content: msg.content,
      avatar: "AM",
    });

    setNewMessage("");
  }, [newMessage, selectedThread, emitMessage]);

  const handleTyping = useCallback(() => {
    const thread = mockThreads.find((t) => t.id === selectedThread);
    if (thread) sendTyping(thread.projectId, selectedThread);
  }, [selectedThread, sendTyping]);

  const filtered = search
    ? mockThreads.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.lastMessage.toLowerCase().includes(search.toLowerCase()),
      )
    : mockThreads;

  const currentMessages = messages[selectedThread] ?? [];
  const currentThread = mockThreads.find((t) => t.id === selectedThread);

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
                    fontFamily: "monospace",
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
                      sx={{ "& .MuiBadge-badge": { fontFamily: "monospace", fontSize: "0.6rem" } }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: thread.unread > 0 ? "primary.dark" : "rgba(108, 99, 255, 0.15)",
                          width: 40,
                          height: 40,
                          fontSize: 14,
                          fontFamily: "monospace",
                        }}
                      >
                        {thread.avatar}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={thread.title}
                    secondary={thread.lastMessage}
                    primaryTypographyProps={{
                      variant: "subtitle2",
                      noWrap: true,
                      fontWeight: thread.unread > 0 ? 700 : 500,
                      fontSize: "0.85rem",
                    }}
                    secondaryTypographyProps={{
                      variant: "caption",
                      noWrap: true,
                      sx: { opacity: 0.6, fontFamily: "monospace", fontSize: "0.7rem" },
                    }}
                  />
                  <Typography
                    sx={{
                      fontFamily: "monospace",
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
              <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: "0.95rem" }}>
                {currentThread?.title}
              </Typography>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <CircleIcon sx={{ fontSize: 8, color: connected ? "#10B981" : "#EF4444" }} />
                <Typography
                  sx={{
                    fontFamily: "monospace",
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
                fontFamily: "monospace",
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
                        fontFamily: "monospace",
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
                            fontFamily: "monospace",
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
                        fontFamily: "monospace",
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
                        fontFamily: "monospace",
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
                      fontFamily: "monospace",
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
            <Stack direction="row" spacing={1} alignItems="center">
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
