import { Alert, Box, Typography, Chip, Stack, Skeleton } from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import {
  AreaChart,
  Area,
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
import { AXIS_STYLE, GRID_STYLE, TOOLTIP_STYLE, fmtTooltipK } from "@/data/chartTheme";

// Empty until analytics aggregation API ships — do not invent metrics.
const revenueTimeSeries: { month: string; revenue: number; costs: number; profit: number }[] = [];
const projectsByStatus: { name: string; value: number; color: string }[] = [];
const taskCompletion: { week: string; completed: number; created: number }[] = [];

const stats = [
  { label: "Total Leads", value: "—", change: "aggregation API pending", icon: <TrendingUpOutlinedIcon />, color: "#6C63FF" },
  { label: "Active Projects", value: "—", change: "aggregation API pending", icon: <FolderOutlinedIcon />, color: "#00D4AA" },
  { label: "Team Members", value: "—", change: "aggregation API pending", icon: <GroupsOutlinedIcon />, color: "#8B85FF" },
  { label: "Revenue (MTD)", value: "—", change: "aggregation API pending", icon: <AttachMoneyOutlinedIcon />, color: "#F59E0B" },
];

const pipeline: { stage: string; count: number; color: string }[] = [];
const recentProjects: { title: string; client: string; status: string; progress: number }[] = [];

const fmtK = (v: number) => `$${(v / 1000).toFixed(0)}K`;

export default function Dashboard() {
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
          Charts and headline stats below are illustrative placeholders until the analytics aggregation API ships.
        </Alert>
      </Box>

      {/* Stats */}
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

      {/* Charts */}
      <SectionLabel>Analytics Overview</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "7fr 5fr" } }}>
        <ChartCard title="Revenue Trend" color="#6C63FF" index="04" colInRow={0} totalCols={2} animDelay={0.4}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTimeSeries}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C63FF" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6C63FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="month" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} tickFormatter={fmtK} />
              <Tooltip {...TOOLTIP_STYLE} formatter={fmtTooltipK} />
              <Area type="monotone" dataKey="revenue" stroke="#6C63FF" fill="url(#revGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="profit" stroke="#10B981" fill="url(#profGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Projects by Status" color="#00D4AA" index="05" colInRow={1} totalCols={2} animDelay={0.5} height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={projectsByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3} stroke="none">
                {projectsByStatus.map((entry) => (
                  <RCell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <Stack spacing={0.5} sx={{ mt: -1 }}>
            {projectsByStatus.map((s) => (
              <Stack sx={{ alignItems: "center" }} key={s.name} direction="row" spacing={1}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: s.color, flexShrink: 0 }} />
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", color: "text.secondary", flex: 1 }}>{s.name}</Typography>
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", color: s.color }}>{s.value}</Typography>
              </Stack>
            ))}
          </Stack>
        </ChartCard>
      </Box>

      {/* Task Completion */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr" } }}>
        <ChartCard title="Task Velocity (12 Weeks)" color="#8B85FF" index="06" animDelay={0.6} height={200}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={taskCompletion}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="week" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="completed" fill="#10B981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="created" fill="#6C63FF" radius={[3, 3, 0, 0]} opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </Box>

      {/* Pipeline + Recent Projects */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "5fr 7fr" } }}>
        <Box>
          <SectionLabel>Project Pipeline</SectionLabel>
          <Cell color="#6C63FF" index="07" animDelay={0.7}>
            <Stack spacing={2}>
              {pipeline.map((stage) => (
                <Stack sx={{ alignItems: "center" }} key={stage.stage} direction="row" spacing={2}>
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: stage.color, flexShrink: 0, filter: `drop-shadow(0 0 4px ${stage.color}60)` }} />
                  <Typography variant="body2" sx={{ flex: 1, fontFamily: "'Outfit', sans-serif", fontSize: "0.8rem" }}>{stage.stage}</Typography>
                  <Chip label={stage.count} size="small" sx={{ fontFamily: "'Outfit', sans-serif", bgcolor: `${stage.color}18`, color: stage.color, border: `1px solid ${stage.color}30` }} />
                </Stack>
              ))}
            </Stack>
          </Cell>
        </Box>

        <Box>
          <SectionLabel>Recent Projects</SectionLabel>
          {recentProjects.map((project, i) => (
            <Cell
              key={project.title}
              color={project.status === "In Development" ? "#F59E0B" : project.status === "QA" ? "#8B5CF6" : project.status === "Under Review" ? "#6C63FF" : "#94A3B8"}
              index={String(i + 8).padStart(2, "0")}
              animDelay={0.8 + i * 0.1}
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
                        width={`${project.progress}%`}
                        height={6}
                        sx={{
                          borderRadius: 1,
                          bgcolor: project.status === "QA" ? "#8B5CF6" : project.status === "In Development" ? "#F59E0B" : "#6C63FF",
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
          ))}
        </Box>
      </Box>
    </Box>
  );
}
