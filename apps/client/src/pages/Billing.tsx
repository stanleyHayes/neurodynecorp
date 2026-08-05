import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  Skeleton,
} from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaidIcon from "@mui/icons-material/Paid";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PageBanner from "@/components/shared/PageBanner";
import AnimatedCard from "@/components/shared/AnimatedCard";
import { AnimatedGridItem } from "@/components/shared/AnimatedGrid";
import EmptyState from "@/components/shared/EmptyState";
import { useAuth } from "@/context/AuthContext";

interface InvoiceRow {
  id: string;
  invoice_number: string;
  project_id: string;
  total: number;
  currency: string;
  created_at: string;
  due_date: string;
  status: string;
  paid_at?: string;
}

function formatCurrency(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(cents / 100);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function Billing() {
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [projectNames, setProjectNames] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [invoiceRes, projectRes] = await Promise.all([
          api.listInvoices(),
          api.listProjects(),
        ]);

        if (cancelled) return;

        setInvoices((invoiceRes.items ?? []) as InvoiceRow[]);

        const names: Record<string, string> = {};
        for (const p of (projectRes.items ?? [])) {
          names[p.id] = p.title;
        }
        setProjectNames(names);
      } catch {
        // handled by API client
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [api]);

  const totalPaid = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.total, 0);

  const outstanding = invoices
    .filter((inv) => inv.status !== "paid" && inv.status !== "cancelled")
    .reduce((sum, inv) => sum + inv.total, 0);

  const currency = invoices[0]?.currency ?? "USD";

  const statCards = [
    { label: "Total Paid", value: loading ? "..." : formatCurrency(totalPaid, currency), color: "success.main", icon: <PaidIcon /> },
    { label: "Outstanding", value: loading ? "..." : formatCurrency(outstanding, currency), color: "warning.main", icon: <PendingActionsIcon /> },
    { label: "Total Invoices", value: loading ? "..." : String(invoices.length), color: "text.primary", icon: <ReceiptIcon /> },
  ];

  const statusLabel = (status: string) => {
    const map: Record<string, string> = { paid: "Paid", pending: "Pending", sent: "Pending", overdue: "Overdue", cancelled: "Cancelled" };
    return map[status] ?? status;
  };

  const statusColor = (status: string): "success" | "warning" | "error" | "default" => {
    if (status === "paid") return "success";
    if (status === "overdue") return "error";
    if (status === "pending" || status === "sent") return "warning";
    return "default";
  };

  return (
    <Box>
      <PageBanner
        icon={<ReceiptLongIcon />}
        title="Billing & Invoices"
        description="View payment history, outstanding invoices, and manage your billing."
      />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, i) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 4 }}>
            <AnimatedGridItem index={i}>
              <AnimatedCard delay={i}>
                <CardContent>
                  <Box sx={{ color: "text.secondary", mb: 1, display: "flex" }}>{stat.icon}</Box>
                  <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                  {loading ? (
                    <Skeleton variant="text" width={100} height={48} />
                  ) : (
                    <Typography variant="h3" color={stat.color}>{stat.value}</Typography>
                  )}
                </CardContent>
              </AnimatedCard>
            </AnimatedGridItem>
          </Grid>
        ))}
      </Grid>

      <AnimatedCard delay={3}>
        <CardContent>
          {loading ? (
            <Box>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="text" height={48} sx={{ mb: 1 }} />
              ))}
            </Box>
          ) : invoices.length === 0 ? (
            <EmptyState
              icon={<ReceiptLongOutlinedIcon />}
              title="No invoices yet"
              description="When invoices are generated for your projects, they will appear here with payment tracking."
              color="#F59E0B"
            />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Due</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>{inv.invoice_number}</TableCell>
                      <TableCell>{projectNames[inv.project_id] ?? inv.project_id}</TableCell>
                      <TableCell>{formatCurrency(inv.total, inv.currency)}</TableCell>
                      <TableCell>{formatDate(inv.created_at)}</TableCell>
                      <TableCell>{formatDate(inv.due_date)}</TableCell>
                      <TableCell>
                        <Chip
                          label={statusLabel(inv.status)}
                          size="small"
                          color={statusColor(inv.status)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {(inv.status === "pending" || inv.status === "sent") && (
                          <Typography variant="caption" color="text.secondary">
                            Contact your PM to arrange payment
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </AnimatedCard>
    </Box>
  );
}
