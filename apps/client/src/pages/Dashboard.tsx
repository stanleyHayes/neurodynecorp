import { useEffect, useState } from "react";
import { Box, Typography, Chip, Stack, Skeleton } from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import FolderOffOutlinedIcon from "@mui/icons-material/FolderOffOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import EmptyState from "@/components/shared/EmptyState";
import { useAuth } from "@/context/AuthContext";

const statusColors: Record<string, "default" | "primary" | "secondary" | "success" | "warning"> = {
  planning: "primary",
  lead: "primary",
  under_review: "primary",
  approved: "primary",
  development: "warning",
  in_development: "warning",
  testing: "secondary",
  qa: "secondary",
  deployment: "success",
  delivered: "success",
};

const activityIcons = [
  <CheckCircleOutlinedIcon sx={{ color: "#00D4AA" }} />,
  <BuildOutlinedIcon sx={{ color: "#FFB547" }} />,
  <PendingOutlinedIcon sx={{ color: "#6C63FF" }} />,
];

const activityColors = ["#00D4AA", "#FFB547", "#6C63FF"];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Dashboard() {
  const { api, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [projectRes, invoiceRes, notifRes] = await Promise.all([
          api.listProjects(),
          api.listInvoices(),
          api.listNotifications(),
        ]);

        if (cancelled) return;

        const projectItems = projectRes.items ?? [];
        setProjects(projectItems);
        setPendingInvoices(
          (invoiceRes.items ?? []).filter((inv: any) =>
            ["sent", "overdue", "pending"].includes(String(inv.status ?? "").toLowerCase()),
          ).length,
        );
        setUnreadMessages(notifRes.unread ?? 0);

        let docs = 0;
        await Promise.all(
          projectItems.map(async (p: any) => {
            try {
              const filesRes = await api.listFiles(p.id);
              const files = Array.isArray(filesRes) ? filesRes : (filesRes.items ?? []);
              docs += files.length;
            } catch {
              docs += p.attachments?.length ?? 0;
            }
          }),
        );
        if (!cancelled) setDocumentCount(docs);
      } catch {
        // Errors are handled by the API client (e.g. redirect on 401)
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [api]);

  const activeProjects = projects.filter((p) => p.status !== "delivered");
  const firstName = user?.first_name ?? "there";

  const statCards = [
    { label: "Active Projects", value: String(activeProjects.length), icon: <AssignmentOutlinedIcon />, color: "#6C63FF" },
    { label: "Pending Invoices", value: String(pendingInvoices), icon: <ReceiptLongOutlinedIcon />, color: "#00D4AA" },
    { label: "Unread Notifications", value: String(unreadMessages), icon: <MailOutlinedIcon />, color: "#8B85FF" },
    { label: "Documents", value: String(documentCount), icon: <InsertDriveFileOutlinedIcon />, color: "#33DDBB" },
  ];

  // Derive recent activity from the most recently updated projects
  const recentActivity = [...projects]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3)
    .map((p, i) => ({
      icon: activityIcons[i % activityIcons.length],
      text: `${p.title} — ${p.status.replace(/_/g, " ")} (${p.progress}% complete)`,
      time: timeAgo(p.updated_at),
    }));

  return (
    <Box>
      <PageBanner
        icon={<HomeOutlinedIcon />}
        title={`Welcome back, ${firstName}`}
        description="Here's an overview of your projects, messages, and recent activity."
        tag="DASHBOARD // OVERVIEW"
        accentWord={firstName}
        iconColor="#6C63FF"
        iconLabel="DASH ACTIVE"
      />

      {/* Stats grid */}
      <SectionLabel>System Stats</SectionLabel>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
        }}
      >
        {statCards.map((stat, i) => (
          <Cell
            key={stat.label}
            color={stat.color}
            index={String(i + 1).padStart(2, "0")}
            colInRow={i % 4}
            totalCols={4}
            animDelay={i * 0.1}
          >
            {loading ? (
              <Box>
                <Skeleton variant="circular" width={36} height={36} sx={{ mb: 1.5 }} />
                <Skeleton variant="text" width={80} />
                <Skeleton variant="text" width={40} height={40} />
              </Box>
            ) : (
              <Box>
                <Box
                  sx={{
                    "& .MuiSvgIcon-root": { fontSize: 32 },
                    color: stat.color,
                    filter: `drop-shadow(0 0 10px ${stat.color}50) drop-shadow(0 0 30px ${stat.color}20)`,
                    mb: 1.5,
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.6rem",
                    letterSpacing: "0.15em",
                    color: "text.secondary",
                    opacity: 0.5,
                    textTransform: "uppercase",
                    mb: 0.5,
                  }}
                >
                  {stat.label}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: "text.primary" }}>
                  {stat.value}
                </Typography>
              </Box>
            )}
          </Cell>
        ))}
      </Box>

      {/* Projects section */}
      <SectionLabel>Your Projects</SectionLabel>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
        }}
      >
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Cell key={i} color="#6C63FF" index={String(i + 5).padStart(2, "0")} colInRow={i} totalCols={3} animDelay={0.4 + i * 0.1}>
                <Box>
                  <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="40%" sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" height={6} sx={{ borderRadius: 1 }} />
                </Box>
              </Cell>
            ))
          : activeProjects.length === 0
            ? (
              <Box sx={{ gridColumn: "1 / -1" }}>
                <EmptyState
                  icon={<FolderOffOutlinedIcon />}
                  title="No active projects"
                  description="When a project is created for your account, it will show up here with live progress tracking."
                  color="#6C63FF"
                />
              </Box>
            )
            : activeProjects.slice(0, 6).map((project, i) => (
              <Cell
                key={project.id}
                color={
                  project.status === "in_development"
                    ? "#FFB547"
                    : project.status === "qa"
                      ? "#00D4AA"
                      : "#6C63FF"
                }
                index={String(i + 5).padStart(2, "0")}
                colInRow={i % 3}
                totalCols={3}
                animDelay={0.4 + i * 0.1}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1 }}>
                  <Box
                    sx={{
                      color:
                        project.status === "in_development"
                          ? "#FFB547"
                          : project.status === "qa"
                            ? "#00D4AA"
                            : "#6C63FF",
                      "& .MuiSvgIcon-root": { fontSize: 22 },
                      filter: `drop-shadow(0 0 6px ${project.status === "in_development" ? "#FFB54740" : project.status === "qa" ? "#00D4AA40" : "#6C63FF40"})`,
                    }}
                  >
                    <FolderOutlinedIcon />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {project.title}
                  </Typography>
                </Stack>
                <Stack sx={{ alignItems: "center" }} direction="row" spacing={1}>
                  <Chip
                    label={project.status.replace(/_/g, " ")}
                    size="small"
                    color={statusColors[project.status] ?? "default"}
                    variant="outlined"
                    sx={{ fontSize: "0.65rem", fontFamily: "monospace" }}
                  />
                  <Typography
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.65rem",
                      color: "text.secondary",
                      opacity: 0.6,
                    }}
                  >
                    {project.progress}%
                  </Typography>
                </Stack>
                {/* Progress bar */}
                <Box
                  sx={{
                    mt: 1.5,
                    height: 3,
                    borderRadius: 2,
                    bgcolor: "rgba(108, 99, 255, 0.08)",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      width: `${project.progress}%`,
                      borderRadius: 2,
                      background:
                        project.status === "in_development"
                          ? "linear-gradient(90deg, #FFB547, #FFD080)"
                          : project.status === "qa"
                            ? "linear-gradient(90deg, #00D4AA, #33DDBB)"
                            : "linear-gradient(90deg, #6C63FF, #8B85FF)",
                      boxShadow:
                        project.status === "in_development"
                          ? "0 0 8px #FFB54760"
                          : project.status === "qa"
                            ? "0 0 8px #00D4AA60"
                            : "0 0 8px #6C63FF60",
                    }}
                  />
                </Box>
              </Cell>
            ))}
      </Box>

      {/* Recent activity section */}
      <SectionLabel>Recent Activity</SectionLabel>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
        }}
      >
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Cell key={i} color="#6C63FF" index={String(i + 8).padStart(2, "0")} colInRow={i} totalCols={3} animDelay={0.7 + i * 0.1}>
                <Box>
                  <Skeleton variant="circular" width={24} height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="30%" />
                </Box>
              </Cell>
            ))
          : recentActivity.length === 0
            ? (
              <Box sx={{ gridColumn: "1 / -1" }}>
                <EmptyState
                  icon={<EventNoteOutlinedIcon />}
                  title="No recent activity"
                  description="Activity from your projects will appear here as your team makes progress."
                  color="#00D4AA"
                />
              </Box>
            )
            : recentActivity.map((activity, i) => (
              <Cell
                key={i}
                color={activityColors[i % activityColors.length]}
                index={String(i + 8).padStart(2, "0")}
                colInRow={i}
                totalCols={3}
                animDelay={0.7 + i * 0.1}
              >
                <Stack sx={{ alignItems: "flex-start" }} direction="row" spacing={1.5}>
                  <Box
                    sx={{
                      "& .MuiSvgIcon-root": { fontSize: 22 },
                      filter: `drop-shadow(0 0 6px ${activityColors[i % activityColors.length]}40)`,
                      flexShrink: 0,
                      mt: 0.25,
                    }}
                  >
                    {activity.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ mb: 0.5, lineHeight: 1.5 }}>
                      {activity.text}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.6rem",
                        color: "text.secondary",
                        opacity: 0.4,
                        letterSpacing: "0.1em",
                      }}
                    >
                      {activity.time}
                    </Typography>
                  </Box>
                </Stack>
              </Cell>
            ))}
      </Box>
    </Box>
  );
}
