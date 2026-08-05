import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Typography, Stack } from "@mui/material";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import ShowChartOutlinedIcon from "@mui/icons-material/ShowChartOutlined";
import PieChartOutlinedIcon from "@mui/icons-material/PieChartOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell as RCell,
  BarChart,
  Bar,
} from "recharts";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import ChartCard from "@/components/shared/ChartCard";
import { AXIS_STYLE, GRID_STYLE, TOOLTIP_STYLE } from "@/data/chartTheme";
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
};

const TYPE_COLORS = ["#6C63FF", "#00D4AA", "#8B85FF", "#F59E0B", "#EF4444", "#10B981"];
const TASK_COLORS: Record<string, string> = {
  backlog: "#94A3B8",
  todo: "#6C63FF",
  in_progress: "#F59E0B",
  in_review: "#8B5CF6",
  done: "#10B981",
  cancelled: "#64748B",
};

function label(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function countBy(items: any[], keyFn: (item: any) => string) {
  const map = new Map<string, number>();
  for (const item of items) {
    const k = keyFn(item) || "unknown";
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return map;
}

export default function Analytics() {
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [projectRes, usersRes, tasksRes, invoiceRes] = await Promise.all([
          api.listProjects().catch(() => ({ items: [] })),
          api.listUsers().catch(() => ({ users: [] })),
          api.get<{ items?: any[]; tasks?: any[] }>("/api/v1/tasks").catch(() => ({ items: [] })),
          api.listInvoices({ pageSize: "100" }).catch(() => ({ items: [] })),
        ]);
        if (cancelled) return;
        setProjects((projectRes as any).items ?? []);
        setUsers((usersRes as any).users ?? (usersRes as any).items ?? []);
        setTasks((tasksRes as any).items ?? (tasksRes as any).tasks ?? []);
        setInvoices((invoiceRes as any).items ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api]);

  const projectsByStatus = useMemo(() => {
    const counts = countBy(projects, (p) => String(p.status ?? "unknown"));
    return [...counts.entries()].map(([status, value]) => ({
      name: label(status),
      value,
      color: STATUS_COLORS[status] ?? "#6C63FF",
    }));
  }, [projects]);

  const projectsByType = useMemo(() => {
    const counts = countBy(projects, (p) => String(p.type ?? "other"));
    return [...counts.entries()].map(([type, value], i) => ({
      name: label(type),
      value,
      color: TYPE_COLORS[i % TYPE_COLORS.length],
    }));
  }, [projects]);

  const tasksByStatus = useMemo(() => {
    const counts = countBy(tasks, (t) => String(t.status === "review" ? "in_review" : t.status ?? "backlog"));
    return [...counts.entries()].map(([status, value]) => ({
      status: label(status),
      count: value,
      color: TASK_COLORS[status] ?? "#6C63FF",
    }));
  }, [tasks]);

  const pipelineConversion = projectsByStatus.map((s) => ({
    stage: s.name,
    count: s.value,
    color: s.color,
  }));

  const clients = users.filter((u) => u.role === "client");
  const team = users.filter((u) => u.role && u.role !== "client");
  const paid = invoices.filter((i) => i.status === "paid");
  const paidTotal = paid.reduce((s, i) => s + Number(i.total ?? 0), 0);
  const delivered = projects.filter((p) => ["delivered", "completed"].includes(String(p.status))).length;
  const avgProjectValue =
    paid.length > 0 ? paidTotal / paid.length : projects.length > 0 ? paidTotal / projects.length : 0;

  const kpiStats = [
    {
      label: "Paid Revenue",
      value: loading ? "…" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact" }).format(paidTotal),
      change: `${paid.length} paid invoices`,
      icon: <TrendingUpOutlinedIcon />,
      color: "#6C63FF",
    },
    {
      label: "Active Projects",
      value: loading ? "…" : String(projects.filter((p) => !["delivered", "cancelled", "completed"].includes(String(p.status))).length),
      change: `${projects.length} total`,
      icon: <ShowChartOutlinedIcon />,
      color: "#00D4AA",
    },
    {
      label: "Avg Paid Invoice",
      value: loading
        ? "…"
        : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact" }).format(avgProjectValue),
      change: "from paid invoices",
      icon: <PieChartOutlinedIcon />,
      color: "#8B85FF",
    },
    {
      label: "Clients / Team",
      value: loading ? "…" : `${clients.length} / ${team.length}`,
      change: `${delivered} delivered projects`,
      icon: <GroupsOutlinedIcon />,
      color: "#10B981",
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <PageBanner
        icon={<BarChartOutlinedIcon />}
        title="Analytics"
        description="Deep dive into business metrics, trends, and performance indicators."
        tag="ADMIN // ANALYTICS"
        accentWord="Analytics"
        iconColor="#8B85FF"
        iconLabel="DATA LIVE"
      />

      <Box sx={{ px: 3, pt: 2 }}>
        <Alert severity="info">
          KPIs and charts below are aggregated from live projects, users, tasks, and invoices.
        </Alert>
      </Box>

      <SectionLabel>Key Indicators</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" } }}>
        {kpiStats.map((stat, i) => (
          <Cell key={stat.label} color={stat.color} index={String(i).padStart(2, "0")} colInRow={i} totalCols={4} animDelay={i * 0.1} minH={130}>
            <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 28 }, color: stat.color, filter: `drop-shadow(0 0 12px ${stat.color}40)`, mb: 1 }}>
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

      <SectionLabel>Project Analytics</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" } }}>
        <ChartCard title="By Status" color="#F59E0B" index="04" colInRow={0} totalCols={3} animDelay={0.4} height={240}>
          {projectsByStatus.length === 0 ? (
            <Box sx={{ height: "100%", display: "grid", placeItems: "center" }}>
              <Typography variant="body2" color="text.secondary">{loading ? "Loading…" : "No projects"}</Typography>
            </Box>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="70%">
                <PieChart>
                  <Pie data={projectsByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3} stroke="none">
                    {projectsByStatus.map((entry) => <RCell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <Stack spacing={0.3}>
                {projectsByStatus.map((s) => (
                  <Stack sx={{ alignItems: "center" }} key={s.name} direction="row" spacing={1}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: s.color }} />
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: "text.secondary", flex: 1 }}>{s.name}</Typography>
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: s.color }}>{s.value}</Typography>
                  </Stack>
                ))}
              </Stack>
            </>
          )}
        </ChartCard>

        <ChartCard title="By Type" color="#8B5CF6" index="05" colInRow={1} totalCols={3} animDelay={0.5} height={240}>
          {projectsByType.length === 0 ? (
            <Box sx={{ height: "100%", display: "grid", placeItems: "center" }}>
              <Typography variant="body2" color="text.secondary">{loading ? "Loading…" : "No projects"}</Typography>
            </Box>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="70%">
                <PieChart>
                  <Pie data={projectsByType} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3} stroke="none">
                    {projectsByType.map((entry) => <RCell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <Stack spacing={0.3}>
                {projectsByType.map((s) => (
                  <Stack sx={{ alignItems: "center" }} key={s.name} direction="row" spacing={1}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: s.color }} />
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: "text.secondary", flex: 1 }}>{s.name}</Typography>
                    <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: s.color }}>{s.value}</Typography>
                  </Stack>
                ))}
              </Stack>
            </>
          )}
        </ChartCard>

        <ChartCard title="Tasks by Status" color="#EF4444" index="06" colInRow={2} totalCols={3} animDelay={0.6} height={240}>
          {tasksByStatus.length === 0 ? (
            <Box sx={{ height: "100%", display: "grid", placeItems: "center" }}>
              <Typography variant="body2" color="text.secondary">{loading ? "Loading…" : "No tasks"}</Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tasksByStatus}>
                <CartesianGrid {...GRID_STYLE} />
                <XAxis dataKey="status" tick={AXIS_STYLE} />
                <YAxis tick={AXIS_STYLE} allowDecimals={false} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {tasksByStatus.map((entry) => (
                    <RCell key={entry.status} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </Box>

      <SectionLabel>Pipeline Funnel</SectionLabel>
      <ChartCard title="Projects per stage" color="#6C63FF" index="07" animDelay={0.7} height={220}>
        {pipelineConversion.length === 0 ? (
          <Box sx={{ height: "100%", display: "grid", placeItems: "center" }}>
            <Typography variant="body2" color="text.secondary">{loading ? "Loading…" : "No pipeline data"}</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pipelineConversion}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="stage" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} allowDecimals={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {pipelineConversion.map((entry) => (
                  <RCell key={entry.stage} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </Box>
  );
}
