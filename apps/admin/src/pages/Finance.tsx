import { Alert, Box, Typography, Chip, Stack } from "@mui/material";
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

// Honest empty series until a finance aggregation API exists — do not invent revenue.
const revenueTimeSeries: { month: string; revenue: number; costs: number; profit: number }[] = [];
const revenueByClient: { client: string; revenue: number; color: string }[] = [];
const financials: { project: string; revenue: number; cost: number; profit: number; margin: number; color: string }[] = [];

const fmtK = (v: number) => `$${(v / 1000).toFixed(0)}K`;

const stats = [
  { label: "Total Revenue", value: "—", change: "aggregation API pending", icon: <TrendingUpOutlinedIcon />, color: "#10B981" },
  { label: "Total Costs", value: "—", change: "aggregation API pending", icon: <AccountBalanceOutlinedIcon />, color: "#F59E0B" },
  { label: "Profit", value: "—", change: "aggregation API pending", icon: <SavingsOutlinedIcon />, color: "#6C63FF" },
  { label: "Avg Margin", value: "—", change: "aggregation API pending", icon: <AttachMoneyOutlinedIcon />, color: "#8B85FF" },
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

      <Box sx={{ px: 3, pt: 2 }}>
        <Alert severity="info">
          Charts below are illustrative placeholders until the finance aggregation API ships. Invoice creation is not available from this page yet.
        </Alert>
      </Box>

      <SectionLabel>Financial Overview</SectionLabel>
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

      {/* Charts */}
      <SectionLabel>Revenue Trends</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "7fr 5fr" } }}>
        <ChartCard title="Revenue vs Costs (12 Months)" color="#6C63FF" index="04" colInRow={0} totalCols={2} animDelay={0.4}>
          {revenueTimeSeries.length === 0 ? (
            <Box sx={{ height: "100%", display: "grid", placeItems: "center", px: 2 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                No finance time-series yet. Connect the aggregation API to populate this chart.
              </Typography>
            </Box>
          ) : (
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
          )}
        </ChartCard>

        <ChartCard title="Revenue by Client" color="#00D4AA" index="05" colInRow={1} totalCols={2} animDelay={0.5}>
          {revenueByClient.length === 0 ? (
            <Box sx={{ height: "100%", display: "grid", placeItems: "center", px: 2 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                Client revenue breakdown unavailable until invoice aggregation ships.
              </Typography>
            </Box>
          ) : (
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
          )}
        </ChartCard>
      </Box>

      {/* Project Financials Cards */}
      <SectionLabel>Project Financials</SectionLabel>
      {financials.length === 0 ? (
        <Box sx={{ px: 3, pb: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Per-project financials will appear here once live invoice and cost data are aggregated.
          </Typography>
        </Box>
      ) : (
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
                <Stack sx={{ justifyContent: "space-between", alignItems: "center" }} key={row.label} direction="row">
                  <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em", textTransform: "uppercase" }}>{row.label}</Typography>
                  <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.8rem", color: row.color, fontWeight: 600 }}>{row.value}</Typography>
                </Stack>
              ))}
            </Stack>
            <Chip
              label={`${f.margin}% margin`}
              size="small"
              sx={{ mt: 1.5, fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", bgcolor: `${f.color}18`, color: f.color, border: `1px solid ${f.color}30` }}
            />
          </Cell>
        ))}
      </Box>
      )}
    </Box>
  );
}
