import { useState, useEffect, useCallback } from "react";
import { Box, Typography, Chip, Avatar, Stack, Alert } from "@mui/material";
import { useParams, useNavigate } from "react-router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import PageSkeleton from "@/components/shared/PageSkeleton";
import { useAuth } from "@/context/AuthContext";

interface ApiUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  avatar?: string;
  phone?: string;
  company?: string;
  is_active: boolean;
  created_at: string;
}

interface ApiProject {
  id: string;
  client_id: string;
  title: string;
  type: string;
  status: string;
  progress: number;
  assigned_team: string[];
}

const AVATAR_COLORS = ["#6C63FF", "#00D4AA", "#8B85FF", "#F59E0B", "#EF4444", "#10B981", "#8B5CF6"];

const statusColors: Record<string, string> = {
  "In Progress": "#F59E0B",
  in_progress: "#F59E0B",
  active: "#F59E0B",
  Completed: "#10B981",
  completed: "#10B981",
  "On Hold": "#EF4444",
  on_hold: "#EF4444",
  Planning: "#94A3B8",
  planning: "#94A3B8",
  draft: "#94A3B8",
  Review: "#8B5CF6",
  review: "#8B5CF6",
};

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [userData, projectsRes] = await Promise.all([
        api.getUser(id),
        api.listProjects({ clientId: id }),
      ]);
      setUser(userData as unknown as ApiUser);
      setProjects((projectsRes.items ?? []) as unknown as ApiProject[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load client");
    } finally {
      setLoading(false);
    }
  }, [api, id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <PageSkeleton stats={3} rows={4} />;
  }

  if (error || !user) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Typography variant="h5" color="text.secondary">Client not found</Typography>
        )}
      </Box>
    );
  }

  const clientName = `${user.first_name} ${user.last_name}`;
  const avatarColor = AVATAR_COLORS[clientName.length % AVATAR_COLORS.length];
  const clientStatus = user.is_active ? "Active" : "Inactive";

  const stats = [
    { label: "Total Revenue", value: "—", icon: <AttachMoneyOutlinedIcon />, color: "#F59E0B" },
    { label: "Active Projects", value: String(projects.length), icon: <FolderOutlinedIcon />, color: "#6C63FF" },
    { label: "Total Budget", value: "—", icon: <AttachMoneyOutlinedIcon />, color: "#10B981" },
    { label: "Client Since", value: user.created_at?.slice(0, 10) ?? "—", icon: <CalendarTodayOutlinedIcon />, color: "#8B85FF" },
  ];

  return (
    <Box>
      <Box
        onClick={() => navigate("/clients")}
        sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 3, py: 1.5, cursor: "pointer", color: "text.secondary", "&:hover": { color: "#6C63FF" }, transition: "color 0.2s" }}
      >
        <ArrowBackIcon sx={{ fontSize: 18 }} />
        <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem", letterSpacing: "0.1em" }}>BACK TO CLIENTS</Typography>
      </Box>

      <PageBanner
        icon={<PersonOutlinedIcon />}
        title={clientName}
        description={`${user.company ?? ""} — ${user.role}`}
        tag={`CLIENT // ${(user.company ?? "").toUpperCase()}`}
        accentWord={user.first_name}
        iconColor={avatarColor}
        iconLabel={clientStatus.toUpperCase()}
      />

      {/* Stats */}
      <SectionLabel>Overview</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" } }}>
        {stats.map((stat, i) => (
          <Cell key={stat.label} color={stat.color} index={String(i).padStart(2, "0")} colInRow={i} totalCols={4} animDelay={i * 0.1} minH={120}>
            <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 28 }, color: stat.color, filter: `drop-shadow(0 0 12px ${stat.color}40)`, mb: 1 }}>
              {stat.icon}
            </Box>
            <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6, mb: 0.5 }}>
              {stat.label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{stat.value}</Typography>
          </Cell>
        ))}
      </Box>

      {/* Projects + Contact */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "7fr 5fr" } }}>
        <Box>
          <SectionLabel>Projects</SectionLabel>
          {projects.length === 0 ? (
            <Cell color="#94A3B8" index="--">
              <Typography color="text.secondary" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.8rem", opacity: 0.5 }}>No projects yet</Typography>
            </Cell>
          ) : (
            projects.map((project, i) => {
              const color = statusColors[project.status] ?? "#94A3B8";
              const displayStatus = formatStatus(project.status);
              return (
                <Cell key={project.id} color={color} index={String(i + 4).padStart(2, "0")} animDelay={0.4 + i * 0.1}>
                  <Stack sx={{ justifyContent: "space-between", alignItems: "center" }} direction="row">
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{project.title}</Typography>
                      <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", color: "text.secondary", opacity: 0.6 }}>{project.type}</Typography>
                    </Box>
                    <Stack sx={{ alignItems: "center" }} direction="row" spacing={1}>
                      <Chip label={displayStatus} size="small" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", bgcolor: `${color}18`, color, border: `1px solid ${color}30` }} />
                      <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem", color, fontWeight: 600 }}>{project.progress}%</Typography>
                    </Stack>
                  </Stack>
                  <Stack direction="row" spacing={3} sx={{ mt: 1.5 }}>
                    <Box>
                      <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>Type</Typography>
                      <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>{project.type}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>Team</Typography>
                      <Stack direction="row" spacing={0.5}>
                        {(project.assigned_team ?? []).map((t) => (
                          <Avatar key={t} sx={{ width: 22, height: 22, fontSize: 9, bgcolor: "rgba(108,99,255,0.2)", color: "#6C63FF" }}>{t.slice(0, 2).toUpperCase()}</Avatar>
                        ))}
                      </Stack>
                    </Box>
                  </Stack>
                </Cell>
              );
            })
          )}
        </Box>

        <Box>
          <SectionLabel>Contact Info</SectionLabel>
          <Cell color={avatarColor} index="C0" animDelay={0.5}>
            <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center" }}>
              <Avatar sx={{ width: 72, height: 72, fontSize: 24, fontWeight: 700, bgcolor: `${avatarColor}20`, color: avatarColor, border: `2px solid ${avatarColor}30` }}>
                {clientName.split(" ").map((n) => n[0]).join("")}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{clientName}</Typography>
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem", color: "text.secondary" }}>{user.email}</Typography>
              </Box>
              <Chip label={clientStatus} size="small" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", bgcolor: `${avatarColor}18`, color: avatarColor, border: `1px solid ${avatarColor}30` }} />
            </Stack>
          </Cell>
          <Cell color="#00D4AA" index="C1" animDelay={0.6}>
            <Stack spacing={1.5}>
              {[
                { label: "Company", value: user.company ?? "—" },
                { label: "Role", value: user.role },
                { label: "Joined", value: user.created_at?.slice(0, 10) ?? "—" },
                { label: "Phone", value: user.phone ?? "—" },
              ].map((field) => (
                <Box key={field.label}>
                  <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {field.label}
                  </Typography>
                  <Typography variant="body2">{field.value}</Typography>
                </Box>
              ))}
            </Stack>
          </Cell>
        </Box>
      </Box>
    </Box>
  );
}
