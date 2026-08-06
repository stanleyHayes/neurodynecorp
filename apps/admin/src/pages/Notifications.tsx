import { useEffect, useState, useCallback } from "react";
import { Box, Typography, Chip, Stack, Button } from "@mui/material";
import { motion } from "framer-motion";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DoneAllOutlinedIcon from "@mui/icons-material/DoneAllOutlined";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import PageSkeleton from "@/components/shared/PageSkeleton";
import EmptyState from "@/components/shared/EmptyState";
import { useAuth } from "@/context/AuthContext";

const MotionBox = motion.create(Box);

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  resourceId?: string;
  resourceType?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  project_update: <InfoOutlinedIcon sx={{ fontSize: 20 }} />,
  task_assigned: <TaskAltOutlinedIcon sx={{ fontSize: 20 }} />,
  task_completed: <CheckCircleOutlinedIcon sx={{ fontSize: 20 }} />,
  message_received: <ChatOutlinedIcon sx={{ fontSize: 20 }} />,
  invoice_sent: <ReceiptOutlinedIcon sx={{ fontSize: 20 }} />,
  invoice_paid: <ReceiptOutlinedIcon sx={{ fontSize: 20 }} />,
  spec_generated: <DescriptionOutlinedIcon sx={{ fontSize: 20 }} />,
  spec_approved: <CheckCircleOutlinedIcon sx={{ fontSize: 20 }} />,
  status_change: <InfoOutlinedIcon sx={{ fontSize: 20 }} />,
  system: <InfoOutlinedIcon sx={{ fontSize: 20 }} />,
};

const colorMap: Record<string, string> = {
  project_update: "#6C63FF",
  task_assigned: "#F59E0B",
  task_completed: "#10B981",
  message_received: "#33DDBB",
  invoice_sent: "#EF4444",
  invoice_paid: "#10B981",
  spec_generated: "#8B5CF6",
  spec_approved: "#10B981",
  status_change: "#00D4AA",
  system: "#94A3B8",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Notifications() {
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const load = useCallback(async () => {
    try {
      const res = await api.listNotifications();
      const items = (res.items ?? []).map((n: any) => ({
        id: n.id,
        type: n.type ?? "system",
        title: n.title ?? "",
        message: n.message ?? n.body ?? "",
        read: Boolean(n.read),
        createdAt: n.createdAt ?? n.created_at ?? new Date().toISOString(),
        resourceId: n.resourceId ?? n.resource_id,
        resourceType: n.resourceType ?? n.resource_type,
      })) as NotificationItem[];
      setNotifications(items);
    } catch {
      // handled by API client
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { load(); }, [load]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch { /* silent */ }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    } catch { /* silent */ }
  };

  if (loading) return <PageSkeleton stats={0} rows={8} />;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Box>
      <PageBanner
        icon={<NotificationsIcon />}
        title="Notifications"
        description={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
      />

      <Box
        sx={{
          borderBottom: "1px solid rgba(108, 99, 255, 0.12)",
          py: 2,
          px: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "0.7rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "#6C63FF",
            opacity: 0.5,
          }}
        >
          All Notifications
        </Typography>
        {unreadCount > 0 && (
          <Button
            size="small"
            startIcon={<DoneAllOutlinedIcon />}
            onClick={handleMarkAllRead}
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "0.6rem",
              letterSpacing: "0.05em",
              textTransform: "none",
              color: "#6C63FF",
            }}
          >
            Mark all read
          </Button>
        )}
      </Box>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<NotificationsOffOutlinedIcon />}
          title="No notifications"
          description="You're all caught up! Notifications about projects, tasks, and messages will appear here."
          color="#6C63FF"
          onRefresh={load}
        />
      ) : (
        <Box>
          {notifications.map((notif, i) => {
            const color = colorMap[notif.type] ?? "#94A3B8";
            return (
              <MotionBox
                key={notif.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Cell
                  color={color}
                  index={String(i + 1).padStart(2, "0")}
                  animDelay={0.1 + i * 0.03}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    onClick={() => !notif.read && handleMarkRead(notif.id)}
                    sx={{ alignItems: "flex-start", cursor: notif.read ? "default" : "pointer" }}
                  >
                    <Box sx={{ color, opacity: notif.read ? 0.4 : 0.8, mt: 0.3 }}>
                      {iconMap[notif.type] ?? <InfoOutlinedIcon sx={{ fontSize: 20 }} />}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.3 }}>
                        <Typography
                          sx={{
                            fontWeight: notif.read ? 500 : 700,
                            fontSize: "0.85rem",
                            opacity: notif.read ? 0.5 : 1,
                          }}
                        >
                          {notif.title}
                        </Typography>
                        {!notif.read && (
                          <Chip
                            label="NEW"
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: "0.5rem",
                              fontFamily: "'Outfit', sans-serif",
                              fontWeight: 700,
                              letterSpacing: "0.1em",
                              bgcolor: `${color}20`,
                              color,
                              border: `1px solid ${color}30`,
                            }}
                          />
                        )}
                      </Stack>
                      <Typography
                        sx={{
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: "0.75rem",
                          color: "text.secondary",
                          opacity: notif.read ? 0.4 : 0.7,
                          lineHeight: 1.5,
                        }}
                      >
                        {notif.message}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: "0.6rem",
                        color: "text.secondary",
                        opacity: 0.4,
                        whiteSpace: "nowrap",
                        mt: 0.3,
                      }}
                    >
                      {timeAgo(notif.createdAt)}
                    </Typography>
                  </Stack>
                </Cell>
              </MotionBox>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
