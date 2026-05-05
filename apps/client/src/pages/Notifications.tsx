import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Stack,
  Skeleton,
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";
import PageBanner from "@/components/shared/PageBanner";
import AnimatedCard from "@/components/shared/AnimatedCard";
import EmptyState from "@/components/shared/EmptyState";
import { useAuth } from "@/context/AuthContext";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

const iconMap: Record<string, React.ReactNode> = {
  status_change: <InfoIcon color="primary" />,
  new_message: <NotificationsActiveIcon color="secondary" />,
  invoice: <WarningIcon color="warning" />,
  project_update: <CheckCircleIcon color="success" />,
  approval: <CheckCircleIcon color="success" />,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
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
      setNotifications((res.items ?? []) as NotificationItem[]);
    } catch {
      // handled by API client
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silent
    }
  };

  return (
    <Box>
      <PageBanner
        icon={<NotificationsIcon />}
        title="Notifications"
        description="Stay updated on project status changes, messages, and important alerts."
        action={<Button variant="outlined" size="small" onClick={handleMarkAllRead}>Mark All as Read</Button>}
      />

      <AnimatedCard delay={0}>
        <CardContent>
          {loading ? (
            <Box>
              {Array.from({ length: 5 }).map((_, i) => (
                <Box key={i} sx={{ display: "flex", gap: 2, mb: 2 }}>
                  <Skeleton variant="circular" width={24} height={24} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width="70%" />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={<NotificationsOffOutlinedIcon />}
              title="No notifications"
              description="You're all caught up! Notifications about project updates, messages, and alerts will appear here."
              color="#6C63FF"
              onRefresh={load}
            />
          ) : (
            <List disablePadding>
              {notifications.map((notif) => (
                <ListItem
                  key={notif.id}
                  sx={{
                    bgcolor: notif.read ? "transparent" : "rgba(108, 99, 255, 0.05)",
                    borderRadius: 2,
                    mb: 1,
                  }}
                >
                  <ListItemIcon>{iconMap[notif.type] ?? <InfoIcon />}</ListItemIcon>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2">{notif.title}</Typography>
                        {!notif.read && <Chip label="New" size="small" color="primary" sx={{ height: 20, fontSize: 10 }} />}
                      </Stack>
                    }
                    secondary={
                      <>
                        {notif.body}
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          {timeAgo(notif.created_at)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </AnimatedCard>
    </Box>
  );
}
