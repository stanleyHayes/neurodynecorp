import { useState, useEffect, useCallback } from "react";
import { Box, Typography, Chip, Stack, Alert } from "@mui/material";
import { useParams, useNavigate } from "react-router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import PageSkeleton from "@/components/shared/PageSkeleton";
import { useAuth } from "@/context/AuthContext";

interface ApiSpec {
  id: string;
  project_id: string;
  version: number;
  status: string;
  overview: string;
  objectives: string[];
  feature_breakdown: unknown[];
  created_at: string;
  updated_at: string;
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

const statusColors: Record<string, string> = {
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

const projectStatusColors: Record<string, string> = {
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

export default function SpecDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [spec, setSpec] = useState<ApiSpec | null>(null);
  const [project, setProject] = useState<ApiProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const specData = (await api.getSpec(id)) as unknown as ApiSpec;
      setSpec(specData);

      if (specData.project_id) {
        try {
          const projectData = (await api.getProject(specData.project_id)) as unknown as ApiProject;
          setProject(projectData);
        } catch {
          setProject(null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load specification");
    } finally {
      setLoading(false);
    }
  }, [api, id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <PageSkeleton stats={0} rows={6} />;
  }

  if (error || !spec) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Typography variant="h5" color="text.secondary">Specification not found</Typography>
        )}
      </Box>
    );
  }

  const color = statusColors[spec.status] ?? "#94A3B8";
  const displayStatus = formatStatus(spec.status);
  const projectTitle = project?.title ?? "Unknown Project";
  const clientId = project?.client_id ?? "";

  const metaCards = [
    { label: "Version", value: `v${spec.version}`, icon: <DescriptionOutlinedIcon />, color: "#8B5CF6" },
    { label: "Date", value: spec.created_at?.slice(0, 10) ?? "—", icon: <CalendarTodayOutlinedIcon />, color: "#6C63FF" },
    { label: "Status", value: displayStatus, icon: <ScheduleOutlinedIcon />, color: "#00D4AA" },
    { label: "Updated", value: spec.updated_at?.slice(0, 10) ?? "—", icon: <AttachMoneyOutlinedIcon />, color: "#F59E0B" },
  ];

  const features = (spec.feature_breakdown ?? []).map((f: unknown) => {
    if (typeof f === "string") return f;
    if (typeof f === "object" && f !== null && "name" in f) return (f as { name: string }).name;
    return String(f);
  });

  return (
    <Box>
      <Box
        onClick={() => navigate("/specifications")}
        sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 3, py: 1.5, cursor: "pointer", color: "text.secondary", "&:hover": { color: "#8B5CF6" }, transition: "color 0.2s" }}
      >
        <ArrowBackIcon sx={{ fontSize: 18 }} />
        <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem", letterSpacing: "0.1em" }}>BACK TO SPECIFICATIONS</Typography>
      </Box>

      <PageBanner
        icon={<DescriptionOutlinedIcon />}
        title={projectTitle}
        description={`${clientId} — Specification Document v${spec.version}`}
        tag={`SPEC // ${clientId.toUpperCase()}`}
        accentWord={projectTitle.split(" ")[0]}
        iconColor={color}
        iconLabel={displayStatus.toUpperCase()}
      />

      {/* Meta cards */}
      <SectionLabel color={color}>Document Info</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" } }}>
        {metaCards.map((card, i) => (
          <Cell key={card.label} color={card.color} index={String(i).padStart(2, "0")} colInRow={i} totalCols={4} animDelay={i * 0.1} minH={100}>
            <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 24 }, color: card.color, filter: `drop-shadow(0 0 10px ${card.color}40)`, mb: 1 }}>
              {card.icon}
            </Box>
            <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6, mb: 0.5 }}>
              {card.label}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{card.value}</Typography>
          </Cell>
        ))}
      </Box>

      {/* Overview */}
      {spec.overview && (
        <>
          <SectionLabel color="#6C63FF">Overview</SectionLabel>
          <Cell color="#6C63FF" index="04" animDelay={0.4}>
            <Typography variant="body1" sx={{ lineHeight: 1.9, color: "text.secondary", opacity: 0.85, maxWidth: 800 }}>
              {spec.overview}
            </Typography>
          </Cell>
        </>
      )}

      {/* Objectives + Features side by side */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "5fr 7fr" } }}>
        {/* Objectives */}
        {spec.objectives && spec.objectives.length > 0 && (
          <Box>
            <SectionLabel color="#00D4AA">Objectives</SectionLabel>
            <Cell color="#00D4AA" index="05" colInRow={0} totalCols={2} animDelay={0.5}>
              <Stack spacing={1}>
                {spec.objectives.map((obj, i) => (
                  <Stack sx={{ alignItems: "flex-start" }} key={i} direction="row" spacing={1.5}>
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", color: "#00D4AA", opacity: 0.5, mt: 0.3, minWidth: 20 }}>
                      {String(i + 1).padStart(2, "0")}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
                      {obj}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Cell>
          </Box>
        )}

        {/* Features */}
        {features.length > 0 && (
          <Box>
            <SectionLabel color="#8B85FF">Features</SectionLabel>
            <Cell color="#8B85FF" index="06" colInRow={1} totalCols={2} animDelay={0.6}>
              <Stack spacing={1.5}>
                {features.map((feature, i) => (
                  <Stack sx={{ alignItems: "flex-start" }} key={i} direction="row" spacing={1.5}>
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", color: "#8B85FF", opacity: 0.5, mt: 0.3, minWidth: 20 }}>
                      {String(i + 1).padStart(2, "0")}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
                      {feature}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Cell>
          </Box>
        )}
      </Box>

      {/* Project Link */}
      {project && (
        <>
          <SectionLabel color="#94A3B8">Related Project</SectionLabel>
          <Cell color={projectStatusColors[project.status] ?? "#94A3B8"} index="--" animDelay={1.0}>
            <Stack sx={{ justifyContent: "space-between", alignItems: "center" }} direction="row">
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{project.title}</Typography>
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", color: "text.secondary", opacity: 0.6 }}>
                  {project.client_id} — {project.type}
                </Typography>
              </Box>
              <Stack sx={{ alignItems: "center" }} direction="row" spacing={1}>
                <Chip
                  label={formatStatus(project.status)}
                  size="small"
                  sx={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "0.6rem",
                    bgcolor: `${projectStatusColors[project.status] ?? "#94A3B8"}18`,
                    color: projectStatusColors[project.status] ?? "#94A3B8",
                    border: `1px solid ${projectStatusColors[project.status] ?? "#94A3B8"}30`,
                  }}
                />
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem", color: projectStatusColors[project.status] ?? "#94A3B8", fontWeight: 600 }}>
                  {project.progress}%
                </Typography>
              </Stack>
            </Stack>
          </Cell>
        </>
      )}
    </Box>
  );
}
