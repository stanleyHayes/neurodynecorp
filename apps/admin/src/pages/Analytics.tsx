import { Alert, Box, Typography, Stack } from "@mui/material";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import ShowChartOutlinedIcon from "@mui/icons-material/ShowChartOutlined";
import PieChartOutlinedIcon from "@mui/icons-material/PieChartOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
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
  LineChart,
  Line,
} from "recharts";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import ChartCard from "@/components/shared/ChartCard";
import { AXIS_STYLE, GRID_STYLE, TOOLTIP_STYLE, fmtTooltipK, fmtTooltipPct } from "@/data/chartTheme";

// Empty until analytics aggregation API ships.
const revenueTimeSeries: { month: string; revenue: number; costs: number; profit: number }[] = [];

const projectsByStatus: { name: string; value: number; color: string }[] = [];

const projectsByType: { name: string; value: number; color: string }[] = [];

const clientAcquisition: { month: string; newClients: number; churned: number }[] = [];

const taskCompletion: { week: string; completed: number; created: number }[] = [];

const revenueByClient: { client: string; revenue: number; color: string }[] = [];

const pipelineConversion: { stage: string; count: number; rate: string }[] = [];

const team: { avatar: string; utilization: number }[] = [];

const fmtK = (v: number) => `$${(v / 1000).toFixed(0)}K`;

const kpiStats = [
  { label: "Revenue MTD", value: "—", change: "aggregation API pending", icon: <TrendingUpOutlinedIcon />, color: "#6C63FF" },
  { label: "Growth Rate", value: "—", change: "aggregation API pending", icon: <ShowChartOutlinedIcon />, color: "#00D4AA" },
  { label: "Avg Project Value", value: "—", change: "aggregation API pending", icon: <PieChartOutlinedIcon />, color: "#8B85FF" },
  { label: "Client Retention", value: "—", change: "aggregation API pending", icon: <GroupsOutlinedIcon />, color: "#10B981" },
];

export default function Analytics() {
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
          Metrics below are illustrative placeholders until the analytics aggregation API ships.
        </Alert>
      </Box>

      {/* KPI Stats */}
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

      {/* Revenue Analytics */}
      <SectionLabel>Revenue Analytics</SectionLabel>
      <ChartCard title="Revenue & Costs (12 Months)" color="#6C63FF" index="04" animDelay={0.4} height={320}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueTimeSeries}>
            <defs>
              <linearGradient id="aRevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6C63FF" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#6C63FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="aCostGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="aProfGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID_STYLE} />
            <XAxis dataKey="month" tick={AXIS_STYLE} />
            <YAxis tick={AXIS_STYLE} tickFormatter={fmtK} />
            <Tooltip {...TOOLTIP_STYLE} formatter={fmtTooltipK} />
            <Area type="monotone" dataKey="revenue" stroke="#6C63FF" fill="url(#aRevGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="costs" stroke="#EF4444" fill="url(#aCostGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="profit" stroke="#10B981" fill="url(#aProfGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        <ChartCard title="Revenue by Client" color="#00D4AA" index="05" colInRow={0} totalCols={2} animDelay={0.5} height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByClient} layout="vertical">
              <CartesianGrid {...GRID_STYLE} />
              <XAxis type="number" tick={AXIS_STYLE} tickFormatter={fmtK} />
              <YAxis type="category" dataKey="client" tick={AXIS_STYLE} width={90} />
              <Tooltip {...TOOLTIP_STYLE} formatter={fmtTooltipK} />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                {revenueByClient.map((entry) => (
                  <RCell key={entry.client} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Profit Margin Trend" color="#10B981" index="06" colInRow={1} totalCols={2} animDelay={0.6} height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueTimeSeries.map((d) => ({ ...d, margin: d.revenue ? Math.round((d.profit / d.revenue) * 100) : 0 }))}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="month" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} tickFormatter={(v) => `${v}%`} />
              <Tooltip {...TOOLTIP_STYLE} formatter={fmtTooltipPct} />
              <Line type="monotone" dataKey="margin" stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: "#10B981" }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </Box>

      {/* Project Analytics */}
      <SectionLabel>Project Analytics</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" } }}>
        <ChartCard title="By Status" color="#F59E0B" index="07" colInRow={0} totalCols={3} animDelay={0.7} height={220}>
          <ResponsiveContainer width="100%" height="100%">
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
        </ChartCard>

        <ChartCard title="By Type" color="#8B5CF6" index="08" colInRow={1} totalCols={3} animDelay={0.8} height={220}>
          <ResponsiveContainer width="100%" height="100%">
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
        </ChartCard>

        <ChartCard title="Task Completion Rate" color="#EF4444" index="09" colInRow={2} totalCols={3} animDelay={0.9} height={220}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={taskCompletion}>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="week" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="created" stroke="#6C63FF" strokeWidth={2} dot={false} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </Box>

      {/* Team & Pipeline */}
      <SectionLabel>Team & Pipeline</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        <ChartCard title="Team Utilization" color="#8B85FF" index="10" colInRow={0} totalCols={2} animDelay={1.0} height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={team.map((t) => ({ name: t.avatar, utilization: t.utilization, capacity: 100 - t.utilization }))} layout="vertical">
              <CartesianGrid {...GRID_STYLE} />
              <XAxis type="number" tick={AXIS_STYLE} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={AXIS_STYLE} width={40} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="utilization" stackId="a" fill="#8B85FF" radius={[0, 0, 0, 0]} />
              <Bar dataKey="capacity" stackId="a" fill="#8B85FF20" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Client Acquisition" color="#00D4AA" index="11" colInRow={1} totalCols={2} animDelay={1.1} height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={clientAcquisition}>
              <defs>
                <linearGradient id="newGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D4AA" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00D4AA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="month" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="newClients" stroke="#00D4AA" fill="url(#newGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="churned" stroke="#EF4444" fill="none" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </Box>

      {/* Pipeline Funnel */}
      <ChartCard title="Pipeline Funnel" color="#6C63FF" index="12" animDelay={1.2} height={220}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={pipelineConversion}>
            <CartesianGrid {...GRID_STYLE} />
            <XAxis dataKey="stage" tick={AXIS_STYLE} />
            <YAxis tick={AXIS_STYLE} />
            <Tooltip {...TOOLTIP_STYLE} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {pipelineConversion.map((_, i) => (
                <RCell key={i} fill={["#94A3B8", "#6C63FF", "#00D4AA", "#F59E0B", "#8B5CF6", "#10B981"][i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </Box>
  );
}
