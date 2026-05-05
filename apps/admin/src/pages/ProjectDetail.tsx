import { useState, useEffect, useCallback } from "react";
import { Box, Typography, Chip, Avatar, AvatarGroup, Stack, Skeleton, Alert } from "@mui/material";
import { useParams, useNavigate } from "react-router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import PageSkeleton from "@/components/shared/PageSkeleton";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import { useAuth } from "@/context/AuthContext";

interface ApiProject {
  id: string;
  client_id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  features: unknown[];
  progress: number;
  assigned_team: string[];
  specification_id?: string;
  created_at: string;
  updated_at: string;
}

interface ApiUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  company?: string;
  is_active: boolean;
}

interface ApiSpec {
  id: string;
  project_id: string;
  version: number;
  status: string;
  overview: string;
  created_at: string;
}

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

const specStatusColors: Record<string, string> = {
  Draft: "#94A3B8",
  draft: "#94A3B8",
  Generated: "#6C63FF",
  generated: "#6C63FF",
  "Under Review": "#F59E0B",
  under_review: "#F59E0B",
  Approved: "#10B981",
  approved: "#10B981",
  Rejected: "#EF4444",
  rejected: "#EF4444",
};

const AVATAR_COLORS = ["#6C63FF", "#00D4AA", "#8B85FF", "#F59E0B", "#EF4444", "#10B981", "#8B5CF6"];

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [project, setProject] = useState<ApiProject | null>(null);
  const [client, setClient] = useState<ApiUser | null>(null);
  const [specs, setSpecs] = useState<ApiSpec[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const projectData = (await api.getProject(id)) as unknown as ApiProject;
      setProject(projectData);

      // Fetch client and spec in parallel
      const promises: Promise<void>[] = [];

      if (projectData.client_id) {
        promises.push(
          api.getUser(projectData.client_id)
            .then((u: any) => setClient(u as unknown as ApiUser))
            .catch(() => setClient(null))
        );
      }

      if (projectData.specification_id) {
        promises.push(
          api.getSpec(projectData.specification_id)
            .then((s: any) => setSpecs([s as unknown as ApiSpec]))
            .catch(() => setSpecs([]))
        );
      }

      await Promise.all(promises);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [api, id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <PageSkeleton stats={4} rows={4} />;
  }

  if (error || !project) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Typography variant="h5" color="text.secondary">Project not found</Typography>
        )}
      </Box>
    );
  }

  const color = statusColors[project.status] ?? "#94A3B8";
  const displayStatus = formatStatus(project.status);
  const clientName = client ? `${client.first_name} ${client.last_name}` : project.client_id;
  const clientCompany = client?.company ?? "";
  const clientAvatarColor = AVATAR_COLORS[(clientName?.length ?? 0) % AVATAR_COLORS.length];
  const team = project.assigned_team ?? [];
  const teamInitials = team.map((t) => t.slice(0, 2).toUpperCase());

  const stats = [
    { label: "Progress", value: `${project.progress}%`, icon: <TrendingUpOutlinedIcon />, color },
    { label: "Type", value: project.type || "General", icon: <AttachMoneyOutlinedIcon />, color: "#10B981" },
    { label: "Team Size", value: String(team.length), icon: <GroupOutlinedIcon />, color: "#6C63FF" },
    { label: "Created", value: project.created_at?.slice(0, 10) ?? "—", icon: <CalendarTodayOutlinedIcon />, color: "#8B85FF" },
  ];

  return (
    <Box>
      <Box
        onClick={() => navigate("/projects")}
        sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 3, py: 1.5, cursor: "pointer", color: "text.secondary", "&:hover": { color: "#6C63FF" }, transition: "color 0.2s" }}
      >
        <ArrowBackIcon sx={{ fontSize: 18 }} />
        <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.1em" }}>BACK TO PROJECTS</Typography>
      </Box>

      <PageBanner
        icon={<FolderOutlinedIcon />}
        title={project.title}
        description={`${project.type} for ${clientName}`}
        tag={`PROJECT // ${(project.type || "GENERAL").toUpperCase()}`}
        accentWord={project.title.split(" ")[0]}
        iconColor={color}
        iconLabel={displayStatus.toUpperCase()}
      />

      {/* Stats */}
      <SectionLabel>Overview</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" } }}>
        {stats.map((stat, i) => (
          <Cell key={stat.label} color={stat.color} index={String(i).padStart(2, "0")} colInRow={i} totalCols={4} animDelay={i * 0.1} minH={120}>
            <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 28 }, color: stat.color, filter: `drop-shadow(0 0 12px ${stat.color}40)`, mb: 1 }}>
              {stat.icon}
            </Box>
            <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6, mb: 0.5 }}>
              {stat.label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{stat.value}</Typography>
          </Cell>
        ))}
      </Box>

      {/* Progress bar */}
      <Cell color={color} index="04" animDelay={0.4}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Progress
          </Typography>
          <Typography sx={{ fontFamily: "monospace", fontSize: "0.8rem", color, fontWeight: 700 }}>
            {project.progress}%
          </Typography>
        </Stack>
        <Box sx={{ width: "100%", bgcolor: "rgba(108,99,255,0.08)", borderRadius: 1, height: 8 }}>
          <Skeleton variant="rectangular" width={`${project.progress}%`} height={8} sx={{ borderRadius: 1, bgcolor: color, "&::after": { display: "none" } }} animation={false} />
        </Box>
      </Cell>

      {/* Details grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "7fr 5fr" } }}>
        {/* Left column */}
        <Box>
          {/* Timeline */}
          <SectionLabel>Timeline</SectionLabel>
          <Cell color="#6C63FF" index="05" animDelay={0.5}>
            <Stack spacing={2}>
              <Box>
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.55rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>Created</Typography>
                <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>{project.created_at?.slice(0, 10) ?? "—"}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.55rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>Updated</Typography>
                <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>{project.updated_at?.slice(0, 10) ?? "—"}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.55rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>Status</Typography>
                <Chip label={displayStatus} size="small" sx={{ mt: 0.5, fontFamily: "monospace", fontSize: "0.6rem", bgcolor: `${color}18`, color, border: `1px solid ${color}30` }} />
              </Box>
            </Stack>
          </Cell>

          {/* Specifications */}
          <SectionLabel>Specifications</SectionLabel>
          {specs.length === 0 ? (
            <Cell color="#94A3B8" index="--">
              <Typography color="text.secondary" sx={{ fontFamily: "monospace", fontSize: "0.8rem", opacity: 0.5 }}>No specifications yet</Typography>
            </Cell>
          ) : (
            specs.map((spec, i) => {
              const sColor = specStatusColors[spec.status] ?? "#94A3B8";
              const sDisplayStatus = formatStatus(spec.status);
              return (
                <Cell key={spec.id} color={sColor} index={String(i + 6).padStart(2, "0")} animDelay={0.6 + i * 0.1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{project.title}</Typography>
                      <Typography sx={{ fontFamily: "monospace", fontSize: "0.65rem", color: "text.secondary", opacity: 0.6 }}>v{spec.version} &middot; {spec.created_at?.slice(0, 10) ?? ""}</Typography>
                    </Box>
                    <Chip label={sDisplayStatus} size="small" sx={{ fontFamily: "monospace", fontSize: "0.6rem", bgcolor: `${sColor}18`, color: sColor, border: `1px solid ${sColor}30` }} />
                  </Stack>
                </Cell>
              );
            })
          )}
        </Box>

        {/* Right column */}
        <Box>
          {/* Client info */}
          <SectionLabel>Client</SectionLabel>
          <Cell color={clientAvatarColor} index="C0" animDelay={0.5}>
            {client ? (
              <Stack
                spacing={2}
                alignItems="center"
                sx={{ textAlign: "center", cursor: "pointer" }}
                onClick={() => navigate(`/clients/${client.id}`)}
              >
                <Avatar sx={{ width: 64, height: 64, fontSize: 22, fontWeight: 700, bgcolor: `${clientAvatarColor}20`, color: clientAvatarColor, border: `2px solid ${clientAvatarColor}30` }}>
                  {clientName.split(" ").map((n) => n[0]).join("")}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{clientName}</Typography>
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "text.secondary" }}>{clientCompany}</Typography>
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.65rem", color: "text.secondary", opacity: 0.5 }}>{client.email}</Typography>
                </Box>
                <Chip label={client.is_active ? "Active" : "Inactive"} size="small" sx={{ fontFamily: "monospace", fontSize: "0.6rem", bgcolor: `${clientAvatarColor}18`, color: clientAvatarColor, border: `1px solid ${clientAvatarColor}30` }} />
              </Stack>
            ) : (
              <Typography color="text.secondary" sx={{ fontFamily: "monospace", fontSize: "0.8rem", opacity: 0.5 }}>Unknown client</Typography>
            )}
          </Cell>

          {/* Team */}
          <SectionLabel>Team</SectionLabel>
          <Cell color="#00D4AA" index="T0" animDelay={0.6}>
            <Stack spacing={1.5}>
              <AvatarGroup max={6} sx={{ justifyContent: "center", "& .MuiAvatar-root": { width: 36, height: 36, fontSize: 12, bgcolor: "rgba(108,99,255,0.2)", color: "#6C63FF" } }}>
                {teamInitials.map((t) => <Avatar key={t}>{t}</Avatar>)}
              </AvatarGroup>
              <Typography sx={{ fontFamily: "monospace", fontSize: "0.65rem", color: "text.secondary", opacity: 0.6, textAlign: "center" }}>
                {team.length} member{team.length !== 1 ? "s" : ""} assigned
              </Typography>
            </Stack>
          </Cell>

          {/* Description */}
          {project.description && (
            <>
              <SectionLabel>Description</SectionLabel>
              <Cell color="#10B981" index="B0" animDelay={0.7}>
                <MarkdownRenderer content={project.description} color="#10B981" />
              </Cell>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
