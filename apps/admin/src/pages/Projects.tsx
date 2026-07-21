import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Avatar,
  AvatarGroup,
  Skeleton,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router";
import SearchIcon from "@mui/icons-material/Search";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import PauseCircleOutlinedIcon from "@mui/icons-material/PauseCircleOutlined";
import PageBanner from "@/components/shared/PageBanner";
import ActionBar from "@/components/shared/ActionBar";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import Pagination from "@/components/shared/Pagination";
import PageSkeleton from "@/components/shared/PageSkeleton";
import EmptyState from "@/components/shared/EmptyState";
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

interface ProjectDisplay {
  id: string;
  name: string;
  clientId: string;
  client: string;
  type: string;
  status: string;
  progress: number;
  team: string[];
  budget: number;
}

function mapApiProject(p: ApiProject): ProjectDisplay {
  return {
    id: p.id,
    name: p.title ?? "",
    clientId: p.client_id,
    client: p.client_id ?? "",
    type: p.type ?? "",
    status: p.status ?? "planning",
    progress: p.progress ?? 0,
    team: (p.assigned_team ?? []).map((id) => id.slice(0, 2).toUpperCase()),
    budget: 0,
  };
}

const PER_PAGE = 9;

const statusColors: Record<string, string> = {
  "In Progress": "#F59E0B",
  in_progress: "#F59E0B",
  Completed: "#10B981",
  completed: "#10B981",
  "On Hold": "#EF4444",
  on_hold: "#EF4444",
  Planning: "#94A3B8",
  planning: "#94A3B8",
  Review: "#8B5CF6",
  review: "#8B5CF6",
  draft: "#94A3B8",
  active: "#F59E0B",
};

function formatStatus(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function Projects() {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [projects, setProjects] = useState<ProjectDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listProjects({ pageSize: "100" });
      setProjects((res.items ?? []).map((p) => mapApiProject(p as unknown as ApiProject)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filtered = useMemo(
    () => projects.filter((p) => (p.name ?? "").toLowerCase().includes(search.toLowerCase()) || (p.client ?? "").toLowerCase().includes(search.toLowerCase())),
    [search, projects],
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageItems = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const inProgress = projects.filter((p) => p.status === "In Progress" || p.status === "in_progress" || p.status === "active").length;
  const completed = projects.filter((p) => p.status === "Completed" || p.status === "completed").length;
  const onHold = projects.filter((p) => p.status === "On Hold" || p.status === "on_hold").length;

  const stats = [
    { label: "Total Projects", value: String(projects.length), change: `${inProgress} active`, icon: <FolderOutlinedIcon />, color: "#6C63FF" },
    { label: "In Progress", value: String(inProgress), change: "across clients", icon: <TrendingUpOutlinedIcon />, color: "#F59E0B" },
    { label: "Completed", value: String(completed), change: "this quarter", icon: <CheckCircleOutlinedIcon />, color: "#10B981" },
    { label: "On Hold", value: String(onHold), change: "pending review", icon: <PauseCircleOutlinedIcon />, color: "#EF4444" },
  ];

  if (loading) {
    return <PageSkeleton stats={4} rows={6} />;
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageBanner
        icon={<FolderOutlinedIcon />}
        title="Projects"
        description="View and manage all active, planned, and completed engineering projects."
        tag="ADMIN // PROJECTS"
        accentWord="Projects"
        iconColor="#F59E0B"
        iconLabel="PROJECT HUB"
      />

      <ActionBar label="New Project" subtitle="INITIATE BUILD" color="#F59E0B" onClick={() => navigate("/projects/new")} />

      <SectionLabel>Project Metrics</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" } }}>
        {stats.map((stat, i) => (
          <Cell key={stat.label} color={stat.color} index={String(i).padStart(2, "0")} colInRow={i} totalCols={4} animDelay={i * 0.1} minH={120}>
            <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 28 }, color: stat.color, filter: `drop-shadow(0 0 12px ${stat.color}40)`, mb: 1 }}>
              {stat.icon}
            </Box>
            <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6, mb: 0.5 }}>
              {stat.label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>{stat.value}</Typography>
            <Typography variant="caption" sx={{ color: stat.color, opacity: 0.8 }}>{stat.change}</Typography>
          </Cell>
        ))}
      </Box>

      <SectionLabel>All Projects</SectionLabel>
      <Cell color="#6C63FF" index="04">
        <TextField
          fullWidth
          size="small"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "text.secondary" }} /></InputAdornment>,
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "rgba(108, 99, 255, 0.04)",
              "& fieldset": { borderColor: "rgba(108,99,255,0.15)" },
              "&:hover fieldset": { borderColor: "rgba(108,99,255,0.3)" },
              "&.Mui-focused fieldset": { borderColor: "#6C63FF" },
            },
          }}
        />
      </Cell>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FolderOutlinedIcon />}
          title={search ? "No projects match your search" : "No projects yet"}
          description={search ? "Try adjusting your search terms or clearing the filter." : "Create your first project to start tracking progress across your engineering pipeline."}
          color="#F59E0B"
          onRefresh={fetchProjects}
          onAdd={() => navigate("/projects/new")}
          addLabel="New Project"
          isFiltered={!!search}
        />
      ) : (
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" } }}>
        {pageItems.map((project, i) => {
          const color = statusColors[project.status] ?? "#94A3B8";
          const displayStatus = formatStatus(project.status);
          return (
            <Cell key={project.id} color={color} index={String(page * PER_PAGE + i + 5).padStart(2, "0")} colInRow={i % 3} totalCols={3} animDelay={0.3 + i * 0.05}>
              <Box onClick={() => navigate(`/projects/${project.id}`)} sx={{ cursor: "pointer" }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{project.name}</Typography>
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.65rem", color: "text.secondary", opacity: 0.6 }}>{project.client}</Typography>
                </Box>
                <Chip label={displayStatus} size="small" sx={{ fontFamily: "monospace", fontSize: "0.55rem", bgcolor: `${color}18`, color, border: `1px solid ${color}30`, ml: 1 }} />
              </Stack>

              <Chip label={project.type || "General"} size="small" variant="outlined" sx={{ fontFamily: "monospace", fontSize: "0.6rem", mb: 1.5 }} />

              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5 }}>PROGRESS</Typography>
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color, fontWeight: 600 }}>{project.progress}%</Typography>
              </Stack>
              <Box sx={{ width: "100%", bgcolor: "rgba(108,99,255,0.08)", borderRadius: 1, height: 6, mb: 2 }}>
                <Skeleton variant="rectangular" width={`${project.progress}%`} height={6} sx={{ borderRadius: 1, bgcolor: color, "&::after": { display: "none" } }} animation={false} />
              </Box>

              <Stack sx={{ justifyContent: "space-between", alignItems: "center" }} direction="row">
                <AvatarGroup max={4} sx={{ "& .MuiAvatar-root": { width: 24, height: 24, fontSize: 9, bgcolor: "rgba(108,99,255,0.2)", color: "#6C63FF" } }}>
                  {project.team.map((t) => <Avatar key={t}>{t}</Avatar>)}
                </AvatarGroup>
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5 }}>
                  {project.type}
                </Typography>
              </Stack>
              </Box>
            </Cell>
          );
        })}
      </Box>
      )}

      {filtered.length > 0 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} />}
    </Box>
  );
}
