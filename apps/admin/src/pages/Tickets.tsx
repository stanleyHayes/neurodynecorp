import { useState, useEffect, useCallback } from "react";
import {
  Box, Container, Stack, Typography, Card, CardContent, Chip, Select, MenuItem, Divider, CircularProgress,
  Table, TableHead, TableBody, TableRow, TableCell, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Snackbar,
} from "@mui/material";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import { useAuth } from "@/context/AuthContext";

const overlineSx = {
  fontFamily: "monospace",
  fontSize: "0.7rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.25em",
  color: "text.secondary",
  opacity: 0.6,
};

const STATUSES = ["open", "in_progress", "waiting", "resolved", "closed"];

const STATUS_COLOR: Record<string, string> = {
  open: "#F59E0B",
  in_progress: "#6C63FF",
  waiting: "#8B85FF",
  resolved: "#00D4AA",
  closed: "#94A3B8",
};

const PRIORITY_COLOR: Record<string, string> = {
  urgent: "#EF4444",
  high: "#F59E0B",
  normal: "#6C63FF",
  low: "#94A3B8",
};

function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function slaBreached(t: any): boolean {
  if (t.firstRespondedAt) return false;
  const due = t.slaDueAt ? new Date(t.slaDueAt).getTime() : 0;
  return Boolean(due) && Date.now() > due;
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

export default function Tickets() {
  const { api } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.listAllTickets(Object.keys(params).length ? params : undefined);
      setItems(Array.isArray(res) ? res : (res?.items ?? []));
    } catch (err: any) {
      setError(err?.message ?? "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [api, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const reply = async () => {
    if (!active || !replyText.trim()) return;
    setBusy(true);
    try {
      const updated = await api.replyTicket(active.id, replyText.trim());
      setActive(updated);
      setReplyText("");
      setToast("Reply sent");
      await load();
    } catch (e: any) {
      setToast(e?.message ?? "Failed to reply");
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (status: string) => {
    if (!active) return;
    try {
      const updated = await api.updateTicketStatus(active.id, status);
      setActive(updated);
      setToast("Status updated");
      await load();
    } catch (e: any) {
      setToast(e?.message ?? "Failed to update status");
    }
  };

  const awaiting = items.filter((t) => !t.firstRespondedAt).length;
  const breached = items.filter(slaBreached).length;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Container maxWidth="lg" disableGutters>
        <Box sx={{ mb: 3 }}>
          <Typography sx={overlineSx}>PORTAL // SUPPORT</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>Support Tickets</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Client-raised tickets across all engagements, with first-response SLA tracking. Open one to reply or advance status.
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
              <StatCard label="Awaiting first response" value={String(awaiting)} color="#F59E0B" />
              <StatCard label="SLA breached" value={String(breached)} color="#EF4444" />
            </Stack>

            <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 2 }}>
              <Typography sx={overlineSx}>Filter by status</Typography>
              <Select size="small" value={statusFilter} displayEmpty onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 200, fontFamily: "monospace", fontSize: "0.8rem" }}>
                <MenuItem value="">All statuses</MenuItem>
                {STATUSES.map((s) => <MenuItem key={s} value={s}>{s.replace(/_/g, " ")}</MenuItem>)}
              </Select>
            </Stack>

            <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.06)" }} />

            <Card variant="outlined" sx={{ bgcolor: "#111827", borderColor: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
              {items.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <SupportAgentOutlinedIcon sx={{ fontSize: 48, color: "text.secondary", opacity: 0.3, mb: 1 }} />
                  <Typography sx={{ color: "text.secondary" }}>No tickets{statusFilter ? ` with status "${statusFilter}".` : "."}</Typography>
                </Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={overlineSx}>Raised</TableCell>
                      <TableCell sx={overlineSx}>Subject</TableCell>
                      <TableCell sx={overlineSx}>Priority</TableCell>
                      <TableCell sx={overlineSx}>SLA</TableCell>
                      <TableCell sx={overlineSx}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((t, i) => {
                      const pColor = PRIORITY_COLOR[t.priority] ?? "#94A3B8";
                      const sColor = STATUS_COLOR[t.status] ?? "#94A3B8";
                      const breach = slaBreached(t);
                      return (
                        <TableRow key={t.id ?? i} hover sx={{ cursor: "pointer" }} onClick={() => { setActive(t); setReplyText(""); }}>
                          <TableCell sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "text.secondary", whiteSpace: "nowrap" }}>{formatDate(t.createdAt ?? t.created_at)}</TableCell>
                          <TableCell sx={{ fontSize: "0.82rem", fontWeight: 600, maxWidth: 320 }}>
                            {t.subject}
                            <Typography component="span" sx={{ display: "block", fontSize: "0.65rem", color: "text.secondary", opacity: 0.6 }}>
                              {(t.replies?.length ?? 0)} repl{(t.replies?.length ?? 0) === 1 ? "y" : "ies"} · {t.category?.replace(/_/g, " ")}
                            </Typography>
                          </TableCell>
                          <TableCell><Chip label={t.priority} size="small" sx={{ fontFamily: "monospace", fontSize: "0.6rem", textTransform: "capitalize", bgcolor: `${pColor}18`, color: pColor, border: `1px solid ${pColor}30` }} /></TableCell>
                          <TableCell>
                            <Chip label={breach ? "Breached" : t.firstRespondedAt ? "Responded" : "On track"} size="small" sx={{ fontFamily: "monospace", fontSize: "0.6rem", bgcolor: breach ? "#EF444418" : t.firstRespondedAt ? "#10B98118" : "#F59E0B18", color: breach ? "#EF4444" : t.firstRespondedAt ? "#10B981" : "#F59E0B" }} />
                          </TableCell>
                          <TableCell><Chip label={(t.status ?? "open").replace(/_/g, " ")} size="small" sx={{ fontFamily: "monospace", fontSize: "0.6rem", textTransform: "capitalize", bgcolor: `${sColor}18`, color: sColor, border: `1px solid ${sColor}30` }} /></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Card>
          </>
        )}

        {/* Ticket thread dialog */}
        <Dialog open={!!active} onClose={() => setActive(null)} fullWidth maxWidth="sm">
          {active && (
            <>
              <DialogTitle sx={{ pb: 0.5 }}>
                {active.subject}
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 1 }}>
                  <Chip label={active.priority} size="small" variant="outlined" sx={{ textTransform: "capitalize", fontSize: "0.6rem" }} />
                  <Select size="small" value={active.status ?? "open"} onChange={(e) => changeStatus(e.target.value)} sx={{ fontFamily: "monospace", fontSize: "0.7rem", minWidth: 140 }}>
                    {STATUSES.map((s) => <MenuItem key={s} value={s} sx={{ fontSize: "0.75rem", textTransform: "capitalize" }}>{s.replace(/_/g, " ")}</MenuItem>)}
                  </Select>
                </Stack>
              </DialogTitle>
              <DialogContent dividers>
                <Typography variant="body2" sx={{ mb: 2, whiteSpace: "pre-wrap" }}>{active.body}</Typography>
                <Divider sx={{ mb: 2 }} />
                {(active.replies ?? []).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No replies yet.</Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {(active.replies ?? []).map((rep: any) => (
                      <Box key={rep.id} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: rep.staff ? "rgba(0,212,170,0.08)" : "rgba(108,99,255,0.06)", border: "1px solid", borderColor: rep.staff ? "rgba(0,212,170,0.25)" : "rgba(108,99,255,0.15)" }}>
                        <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.08em", color: rep.staff ? "#00D4AA" : "#8B85FF", textTransform: "uppercase", mb: 0.5 }}>
                          {rep.staff ? "Staff" : "Client"}{rep.createdAt ? ` · ${formatDate(rep.createdAt)}` : ""}
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{rep.body}</Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </DialogContent>
              <DialogActions sx={{ flexDirection: "column", alignItems: "stretch", gap: 1, p: 2 }}>
                <TextField slotProps={{ htmlInput: { maxLength: 8000 } }} placeholder="Reply to the client…" value={replyText} onChange={(e) => setReplyText(e.target.value)} fullWidth multiline minRows={2} size="small" />
                <Stack sx={{ justifyContent: "flex-end" }} direction="row" spacing={1}>
                  <Button onClick={() => setActive(null)}>Close</Button>
                  <Button variant="contained" onClick={reply} disabled={busy || !replyText.trim()}>{busy ? "Sending…" : "Reply"}</Button>
                </Stack>
              </DialogActions>
            </>
          )}
        </Dialog>

        <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast("")} message={toast} />
      </Container>
    </Box>
  );
}
