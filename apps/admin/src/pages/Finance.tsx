import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Typography,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell as RCell,
} from "recharts";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import ChartCard from "@/components/shared/ChartCard";
import { AXIS_STYLE, GRID_STYLE, TOOLTIP_STYLE, fmtTooltipK } from "@/data/chartTheme";
import { useAuth } from "@/context/AuthContext";

const CLIENT_COLORS = ["#6C63FF", "#00D4AA", "#8B85FF", "#F59E0B", "#EF4444", "#10B981"];

function fmtMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function Finance() {
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.listInvoices({ pageSize: "100" });
        if (!cancelled) setInvoices((res as any).items ?? []);
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "Failed to load invoices");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api]);

  const paid = invoices.filter((i) => i.status === "paid");
  const outstanding = invoices.filter(
    (i) => i.status !== "paid" && i.status !== "cancelled" && i.status !== "refunded",
  );
  const totalPaid = paid.reduce((s, i) => s + Number(i.total ?? 0), 0);
  const totalOutstanding = outstanding.reduce((s, i) => s + Number(i.total ?? 0), 0);
  const currency = invoices[0]?.currency ?? "USD";

  const revenueByClient = useMemo(() => {
    const map = new Map<string, number>();
    for (const inv of paid) {
      const key = String(inv.client_id ?? inv.clientId ?? "unknown");
      map.set(key, (map.get(key) ?? 0) + Number(inv.total ?? 0));
    }
    return [...map.entries()]
      .map(([client, revenue], i) => ({
        client: client.slice(0, 10),
        revenue,
        color: CLIENT_COLORS[i % CLIENT_COLORS.length],
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [paid]);

  const stats = [
    {
      label: "Paid Revenue",
      value: loading ? "…" : fmtMoney(totalPaid, currency),
      change: `${paid.length} paid invoices`,
      icon: <TrendingUpOutlinedIcon />,
      color: "#10B981",
    },
    {
      label: "Outstanding",
      value: loading ? "…" : fmtMoney(totalOutstanding, currency),
      change: `${outstanding.length} open invoices`,
      icon: <PendingActionsOutlinedIcon />,
      color: "#F59E0B",
    },
    {
      label: "Invoice Count",
      value: loading ? "…" : String(invoices.length),
      change: "all statuses",
      icon: <ReceiptLongOutlinedIcon />,
      color: "#6C63FF",
    },
    {
      label: "Collection Rate",
      value: loading
        ? "…"
        : invoices.length
          ? `${Math.round((paid.length / invoices.length) * 100)}%`
          : "—",
      change: "paid / total",
      icon: <AccountBalanceOutlinedIcon />,
      color: "#8B85FF",
    },
  ];

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
          Totals below are derived from live invoices. Cost/profit margins still need a cost aggregation source.
        </Alert>
        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}
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

      <SectionLabel>Revenue by Client</SectionLabel>
      <ChartCard title="Paid invoice totals" color="#00D4AA" index="04" animDelay={0.4} height={280}>
        {revenueByClient.length === 0 ? (
          <Box sx={{ height: "100%", display: "grid", placeItems: "center", px: 2 }}>
            <Typography variant="body2" color="text.secondary" align="center">
              {loading ? "Loading invoices…" : "No paid invoices yet."}
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByClient} layout="vertical">
              <CartesianGrid {...GRID_STYLE} />
              <XAxis type="number" tick={AXIS_STYLE} tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}K`} />
              <YAxis type="category" dataKey="client" tick={AXIS_STYLE} width={90} />
              <Tooltip {...TOOLTIP_STYLE} formatter={fmtTooltipK} />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                {revenueByClient.map((entry) => (
                  <RCell key={entry.client} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <SectionLabel>Recent Invoices</SectionLabel>
      <Box sx={{ px: 3, pb: 4 }}>
        {invoices.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {loading ? "Loading…" : "No invoices found. Create invoices via the API or seed data."}
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Invoice</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Due</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.slice(0, 20).map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.invoice_number ?? inv.invoiceNumber ?? inv.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                        {(inv.client_id ?? inv.clientId ?? "—").toString().slice(0, 12)}
                      </Typography>
                    </TableCell>
                    <TableCell>{fmtMoney(Number(inv.total ?? 0), inv.currency ?? currency)}</TableCell>
                    <TableCell>
                      <Chip label={inv.status} size="small" />
                    </TableCell>
                    <TableCell>
                      {inv.due_date || inv.dueDate
                        ? new Date(inv.due_date ?? inv.dueDate).toLocaleDateString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
}
