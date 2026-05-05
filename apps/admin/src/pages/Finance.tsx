import { Box, Typography, Chip, Stack } from "@mui/material";
import ActionBar from "@/components/shared/ActionBar";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell as RCell,
} from "recharts";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import ChartCard from "@/components/shared/ChartCard";
import { AXIS_STYLE, GRID_STYLE, TOOLTIP_STYLE, fmtTooltipK } from "@/data/chartTheme";

// TODO: Replace with analytics aggregation API when available
const revenueTimeSeries = [
  { month: "Apr", revenue: 42000, costs: 28000, profit: 14000 },
  { month: "May", revenue: 55000, costs: 34000, profit: 21000 },
  { month: "Jun", revenue: 48000, costs: 31000, profit: 17000 },
  { month: "Jul", revenue: 62000, costs: 38000, profit: 24000 },
  { month: "Aug", revenue: 58000, costs: 35000, profit: 23000 },
  { month: "Sep", revenue: 71000, costs: 42000, profit: 29000 },
  { month: "Oct", revenue: 68000, costs: 40000, profit: 28000 },
  { month: "Nov", revenue: 82000, costs: 48000, profit: 34000 },
  { month: "Dec", revenue: 78000, costs: 45000, profit: 33000 },
  { month: "Jan", revenue: 95000, costs: 55000, profit: 40000 },
  { month: "Feb", revenue: 110000, costs: 62000, profit: 48000 },
  { month: "Mar", revenue: 125000, costs: 68000, profit: 57000 },
];

const revenueByClient = [
  { client: "SkyBridge AI", revenue: 180000, color: "#6C63FF" },
  { client: "Apex Finance", revenue: 125000, color: "#00D4AA" },
  { client: "NexGen", revenue: 95000, color: "#8B85FF" },
  { client: "LogiTrack", revenue: 75000, color: "#F59E0B" },
  { client: "MedCore", revenue: 50000, color: "#EF4444" },
  { client: "GreenPulse", revenue: 40000, color: "#10B981" },
];

const financials = [
  { project: "Apex Trading Platform", revenue: 75000, cost: 45000, profit: 30000, margin: 40, color: "#6C63FF" },
  { project: "MedCore Patient Portal", revenue: 50000, cost: 32000, profit: 18000, margin: 36, color: "#00D4AA" },
  { project: "SkyBridge ML Pipeline", revenue: 120000, cost: 70000, profit: 50000, margin: 42, color: "#8B85FF" },
  { project: "FitLife Tracker", revenue: 25000, cost: 15000, profit: 10000, margin: 40, color: "#F59E0B" },
  { project: "GreenPulse Monitor", revenue: 40000, cost: 22000, profit: 18000, margin: 45, color: "#10B981" },
];

const totalRev = financials.reduce((s, f) => s + f.revenue, 0);
const totalCost = financials.reduce((s, f) => s + f.cost, 0);
const totalProfit = financials.reduce((s, f) => s + f.profit, 0);
const avgMargin = Math.round(financials.reduce((s, f) => s + f.margin, 0) / financials.length);
const fmtK = (v: number) => `$${(v / 1000).toFixed(0)}K`;

const stats = [
  { label: "Total Revenue", value: fmtK(totalRev), change: "+22% vs last month", icon: <TrendingUpOutlinedIcon />, color: "#10B981" },
  { label: "Total Costs", value: fmtK(totalCost), change: "operational expenses", icon: <AccountBalanceOutlinedIcon />, color: "#F59E0B" },
  { label: "Profit", value: fmtK(totalProfit), change: "net earnings", icon: <SavingsOutlinedIcon />, color: "#6C63FF" },
  { label: "Avg Margin", value: `${avgMargin}%`, change: "across projects", icon: <AttachMoneyOutlinedIcon />, color: "#8B85FF" },
];

export default function Finance() {
  return (
    <Box>
      <PageBanner
        icon={<AttachMoneyOutlinedIcon />}
        title="Finance"
        description="Track revenue, costs, and profitability across all active projects."
        tag="ADMIN // FINANCE"
        accentWord="Finance"
        iconColor="#10B981"
        iconLabel="LEDGER ACTIVE"
      />

      <ActionBar label="New Invoice" subtitle="CREATE INVOICE" color="#10B981" onClick={() => {}} />

      <SectionLabel>Financial Overview</SectionLabel>
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

      {/* Charts */}
      <SectionLabel>Revenue Trends</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "7fr 5fr" } }}>
        <ChartCard title="Revenue vs Costs (12 Months)" color="#6C63FF" index="04" colInRow={0} totalCols={2} animDelay={0.4}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTimeSeries}>
              <defs>
                <linearGradient id="fRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C63FF" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6C63FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fCostGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID_STYLE} />
              <XAxis dataKey="month" tick={AXIS_STYLE} />
              <YAxis tick={AXIS_STYLE} tickFormatter={fmtK} />
              <Tooltip {...TOOLTIP_STYLE} formatter={fmtTooltipK} />
              <Area type="monotone" dataKey="revenue" stroke="#6C63FF" fill="url(#fRevGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="costs" stroke="#EF4444" fill="url(#fCostGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue by Client" color="#00D4AA" index="05" colInRow={1} totalCols={2} animDelay={0.5}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByClient} layout="vertical">
              <CartesianGrid {...GRID_STYLE} />
              <XAxis type="number" tick={AXIS_STYLE} tickFormatter={fmtK} />
              <YAxis type="category" dataKey="client" tick={AXIS_STYLE} width={90} />
              <Tooltip {...TOOLTIP_STYLE} formatter={fmtTooltipK} />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                {revenueByClient.map((entry) => <RCell key={entry.client} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </Box>

      {/* Project Financials Cards */}
      <SectionLabel>Project Financials</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" } }}>
        {financials.map((f, i) => (
          <Cell key={f.project} color={f.color} index={String(i + 6).padStart(2, "0")} colInRow={i % 3} totalCols={3} animDelay={0.6 + i * 0.05}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>{f.project}</Typography>
            <Stack spacing={1}>
              {[
                { label: "Revenue", value: fmtK(f.revenue), color: "#10B981" },
                { label: "Cost", value: fmtK(f.cost), color: "#EF4444" },
                { label: "Profit", value: fmtK(f.profit), color: "#6C63FF" },
              ].map((row) => (
                <Stack key={row.label} direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>{row.label}</Typography>
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.8rem", color: row.color, fontWeight: 600 }}>{row.value}</Typography>
                </Stack>
              ))}
            </Stack>
            <Chip
              label={`${f.margin}% margin`}
              size="small"
              sx={{ mt: 1.5, fontFamily: "monospace", fontSize: "0.6rem", bgcolor: `${f.color}18`, color: f.color, border: `1px solid ${f.color}30` }}
            />
          </Cell>
        ))}
      </Box>
    </Box>
  );
}
