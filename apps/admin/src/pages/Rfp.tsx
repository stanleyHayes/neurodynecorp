import { useState, useEffect, useCallback } from "react";
import {
  Box, Container, Stack, Typography, Card, CardContent, Chip, Select, MenuItem,
  Divider, CircularProgress, Table, TableHead, TableBody, TableRow, TableCell, Alert,
} from "@mui/material";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import { useAuth } from "@/context/AuthContext";

const overlineSx = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "0.7rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.25em",
  color: "text.secondary",
  opacity: 0.6,
};

const STATUSES = ["received", "acknowledged", "in_review", "declined", "closed"];

const STATUS_COLOR: Record<string, string> = {
  received: "#F59E0B",
  acknowledged: "#00D4AA",
  in_review: "#6C63FF",
  declined: "#EF4444",
  closed: "#94A3B8",
};

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** SLA state for a submission, computed client-side. */
function slaState(r: any): { label: string; color: string } {
  // "Actioned" = we've moved it off received (acknowledgedAt stamped). It is an
  // internal-action proxy, not necessarily a client-facing acknowledgement.
  if (r.acknowledgedAt || (r.status && r.status !== "received")) return { label: "Actioned", color: "#10B981" };
  const due = r.slaDueAt ? new Date(r.slaDueAt).getTime() : 0;
  if (due && Date.now() > due) return { label: "Overdue", color: "#EF4444" };
  return { label: "On track", color: "#F59E0B" };
}

function StatCard({ label, value, color = "#6C63FF" }: { label: string; value: string; color?: string }) {
  return (
    <Card variant="outlined" sx={{ bgcolor: "#111827", borderColor: `${color}30`, borderRadius: 2, flex: 1, minWidth: 140 }}>
      <CardContent>
        <Typography sx={{ ...overlineSx, mb: 1 }}>{label}</Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color }}>{value}</Typography>
      </CardContent>
    </Card>
  );
}

export default function Rfp() {
  const { api } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.listRfps(Object.keys(params).length ? params : undefined);
      setItems(Array.isArray(res) ? res : (res?.items ?? []));
    } catch (err: any) {
      setError(err?.message ?? "Failed to load RFP submissions");
    } finally {
      setLoading(false);
    }
  }, [api, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id: string, status: string) => {
    try {
      await api.updateRfpStatus(id, status);
      load();
    } catch (err: any) {
      setError(err?.message ?? "Failed to update status");
    }
  };

  const overdue = items.filter((r) => slaState(r).label === "Overdue").length;
  const unacked = items.filter((r) => r.status === "received").length;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Container maxWidth="lg" disableGutters>
        <Box sx={{ mb: 3 }}>
          <Typography sx={overlineSx}>INTAKE // PROCUREMENT</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>RFP & Tender Submissions</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Formal procurement intake with a 48-hour acknowledgement SLA. Advance each submission as you action it.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        ) : (
          <>
            <Stack direction="row" spacing={2} sx={{ alignItems: "stretch", mb: 3, flexWrap: "wrap", gap: 2 }}>
              <StatCard label="Total" value={String(items.length)} color="#6C63FF" />
              <StatCard label="Awaiting ack" value={String(unacked)} color="#F59E0B" />
              <StatCard label="SLA overdue" value={String(overdue)} color="#EF4444" />
            </Stack>

            <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 2 }}>
              <Typography sx={overlineSx}>Filter by status</Typography>
              <Select size="small" value={statusFilter} displayEmpty onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 200, fontFamily: "'Outfit', sans-serif", fontSize: "0.8rem" }}>
                <MenuItem value="">All statuses</MenuItem>
                {STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>{s.replace(/_/g, " ")}</MenuItem>
                ))}
              </Select>
            </Stack>

            <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.06)" }} />

            <Card variant="outlined" sx={{ bgcolor: "#111827", borderColor: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
              {items.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <GavelOutlinedIcon sx={{ fontSize: 48, color: "text.secondary", opacity: 0.3, mb: 1 }} />
                  <Typography sx={{ color: "text.secondary" }}>
                    No RFP submissions yet{statusFilter ? ` with status "${statusFilter}".` : "."}
                  </Typography>
                </Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={overlineSx}>Received</TableCell>
                      <TableCell sx={overlineSx}>Organisation</TableCell>
                      <TableCell sx={overlineSx}>Title</TableCell>
                      <TableCell sx={overlineSx}>Contact</TableCell>
                      <TableCell sx={overlineSx}>SLA</TableCell>
                      <TableCell sx={overlineSx}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((r, i) => {
                      const sla = slaState(r);
                      const sColor = STATUS_COLOR[r.status] ?? "#94A3B8";
                      return (
                        <TableRow key={r.id ?? r._id ?? i} hover>
                          <TableCell sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem", color: "text.secondary", whiteSpace: "nowrap" }}>
                            {formatDate(r.createdAt ?? r.created_at)}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                            {r.org ?? "—"}
                            {r.sector ? <Typography component="span" sx={{ display: "block", fontSize: "0.65rem", color: "text.secondary", opacity: 0.7 }}>{r.sector}</Typography> : null}
                          </TableCell>
                          <TableCell sx={{ maxWidth: 240, fontSize: "0.8rem" }}>
                            {r.title ?? "—"}
                            {r.documentUrl ? (
                              <Typography component="a" href={r.documentUrl} target="_blank" rel="noopener noreferrer" sx={{ display: "block", fontSize: "0.65rem", color: "#6C63FF", textDecoration: "none" }}>
                                view document ↗
                              </Typography>
                            ) : null}
                          </TableCell>
                          <TableCell sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem", color: "text.secondary" }}>
                            {r.contactEmail ?? "—"}
                          </TableCell>
                          <TableCell>
                            <Chip label={sla.label} size="small" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", bgcolor: `${sla.color}18`, color: sla.color, border: `1px solid ${sla.color}30` }} />
                          </TableCell>
                          <TableCell>
                            <Select
                              size="small"
                              value={r.status ?? "received"}
                              onChange={(e) => changeStatus(r.id, e.target.value)}
                              sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem", color: sColor, minWidth: 130, "& .MuiOutlinedInput-notchedOutline": { borderColor: `${sColor}40` } }}
                            >
                              {STATUSES.map((s) => (
                                <MenuItem key={s} value={s} sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.75rem" }}>{s.replace(/_/g, " ")}</MenuItem>
                              ))}
                            </Select>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Card>
          </>
        )}
      </Container>
    </Box>
  );
}
