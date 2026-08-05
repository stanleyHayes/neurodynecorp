import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Typography, Chip, Stack, Skeleton } from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import {
  PieChart,
  Pie,
  Cell as RCell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import ChartCard from "@/components/shared/ChartCard";
import { TOOLTIP_STYLE } from "@/data/chartTheme";
import { useAuth } from "@/context/AuthContext";

const STATUS_COLORS: Record<string, string> = {
  lead: "#94A3B8",
  under_review: "#6C63FF",
  approved: "#00D4AA",
  in_development: "#F59E0B",
  qa: "#8B5CF6",
  delivered: "#10B981",
  on_hold: "#EF4444",
  cancelled: "#64748B",
  in_progress: "#F59E0B",
  completed: "#10B981",
  pending: "#94A3B8",
  overdue: "#EF4444",
};

function labelStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Dashboard() {
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState(0);
  const [projects, setProjects] = useState<any[]>([]);
  const [teamCount, setTeamCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [intakeRes, projectRes, usersRes, tasksRes] = await Promise.all([
          api.listProjectIntakes().catch(() => ({ items: [] })),
          api.listProjects().catch(() => ({ items: [] })),
          api.listUsers().catch(() => ({ users: [] })),
          api.get<{ items?: any[]; tasks?: any[]; total?: number }>("/api/v1/tasks").catch(() => ({ items: [], total: 0 })),
        ]);
        if (cancelled) return;

        const projectItems = (projectRes as any).items ?? [];
        setProjects(projectItems);
        setLeads(((intakeRes as any).items ?? []).length);
        const users = (usersRes as any).users ?? (usersRes as any).items ?? [];
        setTeamCount(users.filter((u: any) => u.role && u.role !== "client").length);
        setTaskCount(
          (tasksRes as any).total ??
            ((tasksRes as any).items ?? (tasksRes as any).tasks ?? []).length,
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api]);

  const activeProjects = projects.filter((p) => {
    const s = (p.status ?? "").toLowerCase();
    return s !== "delivered" && s !== "completed" && s !== "cancelled";
  }).length;

  const projectsByStatus = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) {
      const s = String(p.status ?? "unknown");
      counts.set(s, (counts.get(s) ?? 0) + 1);
    }
    return [...counts.entries()].map(([status, value]) => ({
      name: labelStatus(status),
      value,
      color: STATUS_COLORS[status] ?? "#6C63FF",
      status,
    }));
  }, [projects]);

  const pipeline = projectsByStatus.map((s) => ({
    stage: s.name,
    count: s.value,
    color: s.color,
  }));

  const recentProjects = [...projects]
    .sort((a, b) => {
      const bt = new Date(b.updated_at ?? b.updatedAt ?? b.created_at ?? 0).getTime();
      const at = new Date(a.updated_at ?? a.updatedAt ?? a.created_at ?? 0).getTime();
      return bt - at;
    })
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      title: p.title ?? "Untitled",
      client: p.client_id ?? p.clientId ?? "—",
      status: labelStatus(String(p.status ?? "unknown")),
      rawStatus: String(p.status ?? ""),
      progress: Number(p.progress ?? 0),
    }));

  const stats = [
    {
      label: "Total Leads",
      value: loading ? "…" : String(leads),
      change: "project intakes",
      icon: <TrendingUpOutlinedIcon />,
      color: "#6C63FF",
    },
    {
      label: "Active Projects",
      value: loading ? "…" : String(activeProjects),
      change: `${projects.length} total`,
      icon: <FolderOutlinedIcon />,
      color: "#00D4AA",
    },
    {
      label: "Team Members",
      value: loading ? "…" : String(teamCount),
      change: "non-client users",
      icon: <GroupsOutlinedIcon />,
      color: "#8B85FF",
    },
    {
      label: "Open Tasks",
      value: loading ? "…" : String(taskCount),
      change: "across all boards",
      icon: <AssignmentOutlinedIcon />,
      color: "#F59E0B",
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <PageBanner
        icon={<DashboardOutlinedIcon />}
        title="Admin Dashboard"
        description="Overview of your projects, team, and key metrics at a glance."
        tag="ADMIN // DASHBOARD"
        accentWord="Dashboard"
        iconColor="#6C63FF"
        iconLabel="DASHBOARD ACTIVE"
      />

      <Box sx={{ px: 3, pt: 2 }}>
        <Alert severity="info">
          Headline counts and project charts use live API data. Revenue time-series still requires a finance aggregation API.
        </Alert>
      </Box>

      <SectionLabel>Key Metrics</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" } }}>
        {stats.map((stat, i) => (
          <Cell key={stat.label} color={stat.color} index={String(i).padStart(2, "0")} colInRow={i} totalCols={4} animDelay={i * 0.1} minH={140}>
            <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 32 }, color: stat.color, filter: `drop-shadow(0 0 12px ${stat.color}40)`, mb: 1.5 }}>
              {stat.icon}
            </Box>
            <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6, mb: 0.5 }}>
              {stat.label}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>{stat.value}</Typography>
            <Typography variant="caption" sx={{ color: stat.color, opacity: 0.8 }}>{stat.change}</Typography>
          </Cell>
        ))}
      </Box>

      <SectionLabel>Analytics Overview</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        <ChartCard title="Projects by Status" color="#00D4AA" index="04" colInRow={0} totalCols={2} animDelay={0.4} height={300}>
          {projectsByStatus.length === 0 ? (
            <Box sx={{ height: "100%", display: "grid", placeItems: "center", px: 2 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                {loading ? "Loading projects…" : "No projects yet."}
              </Typography>
            </Box>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="70%">
                <PieChart>
                  <Pie data={projectsByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3} stroke="none">
                    {projectsByStatus.map((entry) => (
                      <RCell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <Stack spacing={0.5} sx={{ mt: 1 }}>
                {projectsByStatus.map((s) => (
                  <Stack sx={{ alignItems: "center" }} key={s.name} direction="row" spacing={1}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: s.color, flexShrink: 0 }} />
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", color: "text.secondary", flex: 1 }}>{s.name}</Typography>
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", color: s.color }}>{s.value}</Typography>
                  </Stack>
                ))}
              </Stack>
            </>
          )}
        </ChartCard>

        <Box>
          <SectionLabel>Project Pipeline</SectionLabel>
          <Cell color="#6C63FF" index="05" animDelay={0.5}>
            {pipeline.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {loading ? "Loading…" : "No pipeline stages yet."}
              </Typography>
            ) : (
              <Stack spacing={2}>
                {pipeline.map((stage) => (
                  <Stack sx={{ alignItems: "center" }} key={stage.stage} direction="row" spacing={2}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: stage.color, flexShrink: 0, filter: `drop-shadow(0 0 4px ${stage.color}60)` }} />
                    <Typography variant="body2" sx={{ flex: 1, fontFamily: "'Outfit', sans-serif", fontSize: "0.8rem" }}>{stage.stage}</Typography>
                    <Chip label={stage.count} size="small" sx={{ fontFamily: "'Outfit', sans-serif", bgcolor: `${stage.color}18`, color: stage.color, border: `1px solid ${stage.color}30` }} />
                  </Stack>
                ))}
              </Stack>
            )}
          </Cell>
        </Box>
      </Box>

      <SectionLabel>Recent Projects</SectionLabel>
      {recentProjects.length === 0 ? (
        <Box sx={{ px: 3, pb: 4 }}>
          <Typography variant="body2" color="text.secondary">
            {loading ? "Loading projects…" : "No projects to show yet."}
          </Typography>
        </Box>
      ) : (
        recentProjects.map((project, i) => {
          const color = STATUS_COLORS[project.rawStatus] ?? "#6C63FF";
          return (
            <Cell
              key={project.id}
              color={color}
              index={String(i + 6).padStart(2, "0")}
              animDelay={0.6 + i * 0.08}
            >
              <Stack sx={{ justifyContent: "space-between", alignItems: "center" }} direction="row">
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{project.title}</Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem" }}>{project.client}</Typography>
                </Box>
                <Stack sx={{ alignItems: "center" }} direction="row" spacing={1.5}>
                  <Chip label={project.status} size="small" variant="outlined" />
                  {project.progress > 0 ? (
                    <Box sx={{ width: 80 }}>
                      <Skeleton
                        variant="rectangular"
                        width={`${Math.min(100, project.progress)}%`}
                        height={6}
                        sx={{
                          borderRadius: 1,
                          bgcolor: color,
                          "&::after": { display: "none" },
                        }}
                        animation={false}
                      />
                    </Box>
                  ) : (
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: "text.secondary", opacity: 0.4, width: 80, textAlign: "right" }}>PENDING</Typography>
                  )}
                </Stack>
              </Stack>
            </Cell>
          );
        })
      )}
    </Box>
  );
}
