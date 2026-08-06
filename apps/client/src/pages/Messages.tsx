import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  Stack,
  Divider,
  Badge,
  CardContent,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Alert,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import PageBanner from "@/components/shared/PageBanner";
import AnimatedCard from "@/components/shared/AnimatedCard";
import EmptyState from "@/components/shared/EmptyState";
import { useAuth } from "@/context/AuthContext";

interface Thread {
  id: string;
  project_id: string;
  subject?: string;
  title?: string;
  participants: string[];
  last_message: string;
  created_at?: string;
  createdAt?: string;
}

interface Msg {
  id: string;
  sender_id?: string;
  senderId?: string;
  sender_name?: string;
  senderName?: string;
  content: string;
  created_at?: string;
  createdAt?: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function Messages() {
  const { api, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [newProjectId, setNewProjectId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const reloadThreads = useCallback(async () => {
    const res = await api.listThreads();
    const allThreads = ((res as any).threads ?? (res as any).items ?? []) as Thread[];
    allThreads.sort((a, b) => {
      const bt = new Date(b.created_at || b.createdAt || 0).getTime();
      const at = new Date(a.created_at || a.createdAt || 0).getTime();
      return bt - at;
    });
    setThreads(allThreads);
    return allThreads;
  }, [api]);

  // Load threads from all projects
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const allThreads = await reloadThreads();
        if (!cancelled && allThreads.length > 0) {
          setSelectedThread(allThreads[0].id);
        }
      } catch {
        // handled by API client
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [reloadThreads]);

  // Load messages when thread changes
  const loadMessages = useCallback(async (threadId: string) => {
    setMessagesLoading(true);
    try {
      const res = await api.getMessages(threadId);
      setMessages((res.items ?? []) as Msg[]);
    } catch {
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread);
    }
  }, [selectedThread, loadMessages]);

  const openCreate = async () => {
    setCreateError("");
    setNewTitle("");
    setNewProjectId("");
    try {
      const res = await api.listProjects({ pageSize: "100" });
      const items = ((res as any).items ?? []).map((p: any) => ({
        id: p.id,
        title: p.title ?? p.name ?? p.id,
      }));
      setProjects(items);
      if (items[0]) {
        setNewProjectId(items[0].id);
        setNewTitle(`${items[0].title} — discussion`);
      }
    } catch {
      setProjects([]);
    }
    setCreateOpen(true);
  };

  const handleCreateThread = async () => {
    if (!newProjectId || !newTitle.trim()) return;
    setCreating(true);
    setCreateError("");
    try {
      const created = await api.createThread(newProjectId, newTitle.trim(), []);
      setCreateOpen(false);
      const all = await reloadThreads();
      const id = (created as any).id ?? all[0]?.id;
      if (id) setSelectedThread(id);
    } catch (err: any) {
      setCreateError(err?.message ?? "Failed to create thread");
    } finally {
      setCreating(false);
    }
  };

  const handleSend = async () => {
    const text = newMessage.trim();
    if (!text || !selectedThread) return;

    const thread = threads.find((t) => t.id === selectedThread);
    if (!thread) return;

    try {
      const sent = await api.sendMessage(selectedThread, text);
      setMessages((prev) => [...prev, sent as Msg]);
      setNewMessage("");
    } catch {
      // send failed
    }
  };

  const currentUserId = user?.id;

  return (
    <Box>
      <PageBanner
        icon={<ChatIcon />}
        title="Messages"
        description="Communicate with your project team in real-time threads."
      />

      <Box sx={{ px: 3, pb: 1, display: "flex", justifyContent: "flex-end" }}>
        <Button
          size="small"
          startIcon={<AddOutlinedIcon />}
          onClick={() => void openCreate()}
        >
          New Thread
        </Button>
      </Box>

      <Dialog open={createOpen} onClose={() => !creating && setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Start a conversation</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {createError && <Alert severity="error">{createError}</Alert>}
            <TextField
              select
              label="Project"
              value={newProjectId}
              onChange={(e) => {
                const project = projects.find((p) => p.id === e.target.value);
                setNewProjectId(e.target.value);
                if (project) setNewTitle(`${project.title} — discussion`);
              }}
              fullWidth
              size="small"
            >
              {projects.length === 0 ? (
                <MenuItem value="" disabled>No projects available</MenuItem>
              ) : (
                projects.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>
                ))
              )}
            </TextField>
            <TextField
              label="Subject"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              fullWidth
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)} disabled={creating}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => void handleCreateThread()}
            disabled={creating || !newProjectId || !newTitle.trim()}
          >
            {creating ? "Creating…" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <AnimatedCard animDelay={0}>
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <Box sx={{ display: "flex", minHeight: 480, maxHeight: "calc(100vh - 420px)" }}>
            {/* Thread sidebar */}
            <Box sx={{ width: 320, borderRight: "1px solid", borderColor: "divider", overflowY: "auto" }}>
              {loading ? (
                <Box sx={{ p: 2 }}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Box key={i} sx={{ display: "flex", gap: 2, mb: 2 }}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="80%" />
                        <Skeleton variant="text" width="60%" />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : threads.length === 0 ? (
                <EmptyState
                  icon={<ChatBubbleOutlineIcon />}
                  title="No message threads yet"
                  description="Start a conversation on one of your projects, or wait for your team to open a thread."
                  color="#00D4AA"
                />
              ) : (
                <List disablePadding>
                  {threads.map((thread) => (
                    <ListItemButton
                      key={thread.id}
                      selected={selectedThread === thread.id}
                      onClick={() => setSelectedThread(thread.id)}
                    >
                      <ListItemAvatar>
                        <Badge badgeContent={0} color="primary">
                          <Avatar sx={{ bgcolor: "primary.dark" }}>
                            {(thread.subject || thread.title || "?").charAt(0)}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText slotProps={{ primary: { variant: "subtitle2", noWrap: true } }}
                        primary={thread.subject || thread.title || "Thread"}
                        secondary={
                          <Box component="span" sx={{ display: "flex", flexDirection: "column" }}>
                            <Typography variant="caption" noWrap component="span">
                              {thread.last_message || ""}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" component="span" sx={{ opacity: 0.6 }}>
                              {timeAgo(thread.created_at || thread.createdAt || new Date().toISOString())}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  ))}
                </List>
              )}
            </Box>

            {/* Conversation panel */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                <Typography sx={{ fontWeight: 600 }} variant="subtitle1">
                  {(() => {
                    const t = threads.find((x) => x.id === selectedThread);
                    return t?.subject || t?.title || "Select a thread";
                  })()}
                </Typography>
              </Box>

              <Box sx={{ flex: 1, p: 2, overflowY: "auto" }}>
                {messagesLoading ? (
                  <Stack spacing={2}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Box key={i} sx={{ display: "flex", justifyContent: i % 2 === 0 ? "flex-start" : "flex-end" }}>
                        <Skeleton variant="rounded" width="60%" height={60} />
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Stack spacing={2}>
                    {messages.map((msg) => {
                      const isMine = (msg.sender_id ?? msg.senderId) === currentUserId;
                      return (
                        <Box
                          key={msg.id}
                          sx={{
                            display: "flex",
                            justifyContent: isMine ? "flex-end" : "flex-start",
                          }}
                        >
                          <Box
                            sx={{
                              maxWidth: "70%",
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: isMine ? "primary.dark" : "background.default",
                            }}
                          >
                            <Typography sx={{ fontWeight: 600 }} variant="caption">
                              {isMine
                                ? "You"
                                : (msg.sender_name ?? msg.senderName ?? "Team member")}
                            </Typography>
                            <Typography variant="body2">{msg.content}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(msg.created_at || msg.createdAt || new Date().toISOString())}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Box>

              <Divider />
              <Box sx={{ p: 2 }}>
                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button variant="contained" endIcon={<SendIcon />} onClick={handleSend}>
                    Send
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </AnimatedCard>
    </Box>
  );
}
