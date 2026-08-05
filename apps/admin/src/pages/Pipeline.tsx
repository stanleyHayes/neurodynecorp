import { useEffect, useMemo, useState } from "react";
import { Box, Typography, Chip, Stack, Alert } from "@mui/material";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import { useAuth } from "@/context/AuthContext";

const STAGE_ORDER = [
  "lead",
  "under_review",
  "approved",
  "in_development",
  "qa",
  "delivered",
  "on_hold",
  "cancelled",
] as const;

const STAGE_COLORS: Record<string, string> = {
  lead: "#94A3B8",
  under_review: "#6C63FF",
  approved: "#00D4AA",
  in_development: "#F59E0B",
  qa: "#8B5CF6",
  delivered: "#10B981",
  on_hold: "#EF4444",
  cancelled: "#64748B",
};

function labelStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatBudget(p: any): string {
  const range = p.budget_range ?? p.budgetRange;
  if (!range) return "—";
  const min = range.min ?? 0;
  const max = range.max ?? min;
  const currency = range.currency ?? "USD";
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 0,
    }).format(n);
  return min === max ? fmt(min) : `${fmt(min)}-${fmt(max)}`;
}

export default function Pipeline() {
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.listProjects();
        if (!cancelled) setProjects((res as any).items ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api]);

  const pipelineStages = useMemo(() => {
    const byStatus = new Map<string, any[]>();
    for (const p of projects) {
      const status = String(p.status ?? "lead");
      if (!byStatus.has(status)) byStatus.set(status, []);
      byStatus.get(status)!.push(p);
    }
    const known = STAGE_ORDER.filter((s) => byStatus.has(s) || ["lead", "under_review", "approved", "in_development", "qa", "delivered"].includes(s));
    const extras = [...byStatus.keys()].filter((s) => !STAGE_ORDER.includes(s as any));
    return [...known, ...extras].map((status) => ({
      name: labelStatus(status),
      status,
      color: STAGE_COLORS[status] ?? "#6C63FF",
      projects: (byStatus.get(status) ?? []).map((p) => ({
        id: p.id,
        title: p.title ?? p.name ?? "Untitled",
        client: (p.client_id ?? p.clientId ?? "—").toString().slice(0, 12),
        type: p.type ?? "Project",
        budget: formatBudget(p),
      })),
    }));
  }, [projects]);

  const totalInPipeline = projects.filter((p) => {
    const s = String(p.status ?? "");
    return s !== "delivered" && s !== "cancelled";
  }).length;
  const newLeads = projects.filter((p) => String(p.status) === "lead").length;
  const delivered = projects.filter((p) => String(p.status) === "delivered").length;
  const conversion =
    projects.length > 0 ? `${Math.round((delivered / projects.length) * 100)}%` : "—";

  const stats = [
    { label: "In Pipeline", value: loading ? "…" : String(totalInPipeline), change: "active opportunities", icon: <TimelineOutlinedIcon />, color: "#6C63FF" },
    { label: "Conversion Rate", value: loading ? "…" : conversion, change: "lead to delivery", icon: <TrendingUpOutlinedIcon />, color: "#00D4AA" },
    { label: "Total Projects", value: loading ? "…" : String(projects.length), change: "all stages", icon: <FolderOutlinedIcon />, color: "#F59E0B" },
    { label: "New Leads", value: loading ? "…" : String(newLeads), change: "lead stage", icon: <PersonAddOutlinedIcon />, color: "#10B981" },
  ];

  return (
    <Box>
      <PageBanner
        icon={<TimelineOutlinedIcon />}
        title="Project Pipeline"
        description="Visualize project flow from lead to delivery across all stages."
        tag="ADMIN // PIPELINE"
        accentWord="Pipeline"
        iconColor="#8B85FF"
        iconLabel="FLOW ACTIVE"
      />

      <Box sx={{ px: 3, pt: 2 }}>
        <Alert severity="info">Pipeline columns are grouped from live project statuses.</Alert>
      </Box>

      <SectionLabel>Pipeline Metrics</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" } }}>
        {stats.map((stat, i) => (
          <Cell key={stat.label} color={stat.color} index={String(i).padStart(2, "0")} colInRow={i} totalCols={4} animDelay={i * 0.1} minH={120}>
            <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 28 }, color: stat.color, filter: `drop-shadow(0 0 12px ${stat.color}40)`, mb: 1 }}>
              {stat.icon}
            </Box>
            <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6, mb: 0.5 }}>
              {stat.label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>{stat.value}</Typography>
            <Typography variant="caption" sx={{ color: stat.color, opacity: 0.8 }}>{stat.change}</Typography>
          </Cell>
        ))}
      </Box>

      <SectionLabel>Pipeline Board</SectionLabel>
      <Box sx={{ overflowX: "auto", pb: 2 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${pipelineStages.length}, minmax(200px, 1fr))`, minWidth: 1100 }}>
          {pipelineStages.map((stage, si) => (
            <Box key={stage.status}>
              <Cell color={stage.color} index={String(si + 4).padStart(2, "0")} colInRow={si} totalCols={pipelineStages.length} animDelay={0.4 + si * 0.05} minH={40}>
                <Stack sx={{ alignItems: "center" }} direction="row" spacing={1}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: stage.color, filter: `drop-shadow(0 0 4px ${stage.color}60)` }} />
                  <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.05em" }}>{stage.name}</Typography>
                  <Chip label={stage.projects.length} size="small" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", height: 20, bgcolor: `${stage.color}18`, color: stage.color, border: `1px solid ${stage.color}30` }} />
                </Stack>
              </Cell>
              {stage.projects.length === 0 ? (
                <Cell color={stage.color} colInRow={si} totalCols={pipelineStages.length} animDelay={0.5 + si * 0.05}>
                  <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", color: "text.secondary", opacity: 0.5 }}>
                    {loading ? "…" : "Empty"}
                  </Typography>
                </Cell>
              ) : (
                stage.projects.map((project, pi) => (
                  <Cell key={project.id} color={stage.color} colInRow={si} totalCols={pipelineStages.length} animDelay={0.5 + (si + pi) * 0.05}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, fontSize: "0.8rem" }}>{project.title}</Typography>
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: "text.secondary", opacity: 0.6, mb: 1 }}>{project.client}</Typography>
                    <Stack direction="row" spacing={0.5}>
                      <Chip label={project.type} size="small" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.5rem", height: 20 }} variant="outlined" />
                      <Chip label={project.budget} size="small" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.5rem", height: 20, bgcolor: `${stage.color}15`, color: stage.color }} />
                    </Stack>
                  </Cell>
                ))
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
