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
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlined";
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

  // Load threads from all projects
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await api.listThreads();
        const allThreads = ((res as any).threads ?? (res as any).items ?? []) as Thread[];

        allThreads.sort((a, b) => {
          const bt = new Date(b.created_at || b.createdAt || 0).getTime();
          const at = new Date(a.created_at || a.createdAt || 0).getTime();
          return bt - at;
        });

        if (!cancelled) {
          setThreads(allThreads);
          if (allThreads.length > 0) {
            setSelectedThread(allThreads[0].id);
          }
        }
      } catch {
        // handled by API client
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [api]);

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
                  description="When your project team starts a conversation, threads will appear here."
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
                              {isMine ? "You" : msg.sender_id}
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
