import { useState, useEffect, useCallback } from "react";
import {
  Box, Container, Stack, Typography, Card, CardContent, Chip, Select, MenuItem,
  Divider, CircularProgress, Table, TableHead, TableBody, TableRow, TableCell, Alert,
} from "@mui/material";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import { useAuth } from "@/context/AuthContext";

const overlineSx = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "0.7rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.25em",
  color: "text.secondary",
  opacity: 0.6,
};

const STATUSES = ["requested", "confirmed", "declined", "completed"];

const STATUS_COLOR: Record<string, string> = {
  requested: "#F59E0B",
  confirmed: "#00D4AA",
  declined: "#EF4444",
  completed: "#6C63FF",
};

const ROUTE_LABEL: Record<string, string> = {
  services: "Services",
  labs: "Labs",
  gov_digital_excellence: "Gov Digital Excellence",
  decline_referral: "Referral",
};

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
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

export default function Bookings() {
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
      const res = await api.listBookings(Object.keys(params).length ? params : undefined);
      setItems(Array.isArray(res) ? res : (res?.items ?? []));
    } catch (err: any) {
      setError(err?.message ?? "Failed to load booking requests");
    } finally {
      setLoading(false);
    }
  }, [api, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id: string, status: string) => {
    try {
      await api.updateBookingStatus(id, status);
      load();
    } catch (err: any) {
      setError(err?.message ?? "Failed to update status");
    }
  };

  const pending = items.filter((b) => b.status === "requested").length;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Container maxWidth="lg" disableGutters>
        <Box sx={{ mb: 3 }}>
          <Typography sx={overlineSx}>INTAKE // CONVERSATIONS</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>Reading Requests</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Requested conversations, with the duration set by each visitor's diagnostic routing. Confirm a time and advance the status.
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
              <StatCard label="Awaiting confirmation" value={String(pending)} color="#F59E0B" />
            </Stack>

            <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 2 }}>
              <Typography sx={overlineSx}>Filter by status</Typography>
              <Select size="small" value={statusFilter} displayEmpty onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 200, fontFamily: "'Outfit', sans-serif", fontSize: "0.8rem" }}>
                <MenuItem value="">All statuses</MenuItem>
                {STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </Select>
            </Stack>

            <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.06)" }} />

            <Card variant="outlined" sx={{ bgcolor: "#111827", borderColor: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
              {items.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <EventAvailableOutlinedIcon sx={{ fontSize: 48, color: "text.secondary", opacity: 0.3, mb: 1 }} />
                  <Typography sx={{ color: "text.secondary" }}>
                    No reading requests yet{statusFilter ? ` with status "${statusFilter}".` : "."}
                  </Typography>
                </Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={overlineSx}>Requested</TableCell>
                      <TableCell sx={overlineSx}>Who</TableCell>
                      <TableCell sx={overlineSx}>Route</TableCell>
                      <TableCell sx={overlineSx}>Length</TableCell>
                      <TableCell sx={overlineSx}>Preferred times</TableCell>
                      <TableCell sx={overlineSx}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((b, i) => {
                      const sColor = STATUS_COLOR[b.status] ?? "#94A3B8";
                      return (
                        <TableRow key={b.id ?? b._id ?? i} hover>
                          <TableCell sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem", color: "text.secondary", whiteSpace: "nowrap" }}>
                            {formatDate(b.createdAt ?? b.created_at)}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.8rem" }}>
                            <Typography sx={{ fontWeight: 600, fontSize: "0.8rem" }}>{b.name ?? "—"}{b.org ? ` · ${b.org}` : ""}</Typography>
                            <Typography component="span" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", color: "text.secondary", opacity: 0.7 }}>{b.email ?? ""}</Typography>
                          </TableCell>
                          <TableCell>
                            {b.route ? <Chip label={ROUTE_LABEL[b.route] ?? b.route} size="small" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", bgcolor: "rgba(108,99,255,0.12)", color: "#8B85FF" }} /> : <Typography sx={{ color: "text.secondary", opacity: 0.5 }}>—</Typography>}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: "0.8rem" }}>
                            {b.durationMins ? `${b.durationMins}m` : "—"}
                          </TableCell>
                          <TableCell sx={{ maxWidth: 260, fontSize: "0.78rem", color: "text.secondary" }}>
                            {b.preferredTimes ?? "—"}
                            {b.timezone ? <Typography component="span" sx={{ display: "block", fontSize: "0.65rem", opacity: 0.6 }}>{b.timezone}</Typography> : null}
                          </TableCell>
                          <TableCell>
                            <Select
                              size="small"
                              value={b.status ?? "requested"}
                              onChange={(e) => changeStatus(b.id, e.target.value)}
                              sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem", color: sColor, minWidth: 130, "& .MuiOutlinedInput-notchedOutline": { borderColor: `${sColor}40` } }}
                            >
                              {STATUSES.map((s) => (
                                <MenuItem key={s} value={s} sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.75rem" }}>{s}</MenuItem>
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
