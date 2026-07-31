import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Stack,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Snackbar,
  Alert,
} from "@mui/material";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import { useAuth } from "@/context/AuthContext";

const overlineSx = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "0.7rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.25em",
  color: "text.secondary",
  opacity: 0.6,
};

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const methodColor: Record<string, string> = {
  GET: "#00D4AA",
  POST: "#10B981",
  PUT: "#F59E0B",
  PATCH: "#6C63FF",
  DELETE: "#EF4444",
};

function statusColor(status: number): string {
  if (status >= 500) return "#EF4444";
  if (status >= 400) return "#F59E0B";
  if (status >= 300) return "#6C63FF";
  return "#10B981";
}

function formatTime(value: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function userLabel(entry: any): string {
  if (!entry) return "—";
  const name = [entry.firstName ?? entry.first_name, entry.lastName ?? entry.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return (
    name ||
    entry.userEmail ||
    entry.user_email ||
    entry.email ||
    entry.userId ||
    entry.user_id ||
    "—"
  );
}

export default function AuditLog() {
  const { api } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({
    open: false,
    msg: "",
    severity: "success",
  });

  // Filters
  const [method, setMethod] = useState("");
  const [resource, setResource] = useState("");
  const [limit, setLimit] = useState("50");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params: Record<string, string> = {};
      if (method) params.method = method;
      if (resource.trim()) params.resource = resource.trim();
      if (limit) params.limit = limit;
      const res: any = await api.get("/api/v1/audit", params);
      const items = Array.isArray(res) ? res : res?.items ?? res?.data ?? [];
      setRows(items);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load audit log");
    } finally {
      setLoading(false);
    }
  }, [api, method, resource, limit]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExport = async () => {
    try {
      setExporting(true);
      const base = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
      const token =
        localStorage.getItem("neurodyne_access_token") ??
        localStorage.getItem("neurodyne_admin_access_token") ??
        "";
      const res = await fetch(`${base}/api/v1/audit/export?format=csv`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setSnack({ open: true, msg: "Export downloaded", severity: "success" });
    } catch (err: any) {
      setSnack({ open: true, msg: err?.message ?? "Export failed", severity: "error" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Container maxWidth="xl" disableGutters sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Typography sx={overlineSx}>SECURITY // AUDIT</Typography>
        <Stack sx={{ alignItems: "center" }} direction="row" spacing={1.5}>
          <ReceiptLongOutlinedIcon sx={{ color: "#6C63FF" }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Audit Log
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.8 }}>
          Track every authenticated request across the platform — who did what, when, and from where.
        </Typography>
      </Stack>

      {/* Filters */}
      <Card sx={{ mb: 3, bgcolor: "#111827", border: "1px solid rgba(255,255,255,0.06)" }}>
        <CardContent>
          <Typography sx={{ ...overlineSx, mb: 2 }}>Filters</Typography>
          <Stack sx={{ alignItems: { xs: "stretch", md: "flex-end" } }}
            direction={{ xs: "column", md: "row" }}
            spacing={2}
          >
            <Box sx={{ minWidth: 160 }}>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
                Method
              </Typography>
              <Select
                fullWidth
                size="small"
                displayEmpty
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <MenuItem value="">All methods</MenuItem>
                {METHODS.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <Box sx={{ flex: 1, minWidth: 180 }}>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
                Resource
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. projects, users"
                value={resource}
                onChange={(e) => setResource(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load()}
              />
            </Box>
            <Box sx={{ minWidth: 120 }}>
              <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
                Limit
              </Typography>
              <Select
                fullWidth
                size="small"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              >
                {["25", "50", "100", "200"].map((l) => (
                  <MenuItem key={l} value={l}>
                    {l}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="contained"
                startIcon={<RefreshOutlinedIcon />}
                onClick={load}
                disabled={loading}
              >
                Apply
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={
                  exporting ? <CircularProgress size={16} color="inherit" /> : <FileDownloadOutlinedIcon />
                }
                onClick={handleExport}
                disabled={exporting}
              >
                Export CSV
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Table */}
      <Card sx={{ bgcolor: "#111827", border: "1px solid rgba(255,255,255,0.06)" }}>
        <CardContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : rows.length === 0 ? (
            <Stack spacing={1.5} sx={{ alignItems: "center", py: 8, opacity: 0.7 }}>
              <HistoryOutlinedIcon sx={{ fontSize: 48, color: "text.secondary" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                No audit entries
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                No requests match your current filters.
              </Typography>
            </Stack>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {["Time", "User", "Method", "Path", "Status", "IP"].map((h) => (
                      <TableCell key={h} sx={{ ...overlineSx, opacity: 0.5, borderColor: "rgba(255,255,255,0.08)" }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r, i) => {
                    const m = (r.method ?? "").toUpperCase();
                    const status = Number(r.status ?? r.statusCode ?? r.status_code ?? 0);
                    return (
                      <TableRow key={r.id ?? r._id ?? i} hover>
                        <TableCell sx={{ whiteSpace: "nowrap", borderColor: "rgba(255,255,255,0.05)" }}>
                          <Typography variant="caption" sx={{ fontFamily: "'Outfit', sans-serif" }}>
                            {formatTime(r.createdAt ?? r.created_at ?? r.timestamp ?? r.time)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderColor: "rgba(255,255,255,0.05)" }}>
                          {userLabel(r)}
                        </TableCell>
                        <TableCell sx={{ borderColor: "rgba(255,255,255,0.05)" }}>
                          <Chip
                            label={m || "—"}
                            size="small"
                            sx={{
                              fontFamily: "'Outfit', sans-serif",
                              fontSize: "0.6rem",
                              fontWeight: 700,
                              bgcolor: `${methodColor[m] ?? "#94A3B8"}18`,
                              color: methodColor[m] ?? "#94A3B8",
                              border: `1px solid ${methodColor[m] ?? "#94A3B8"}30`,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ borderColor: "rgba(255,255,255,0.05)", maxWidth: 360 }}>
                          <Typography
                            variant="caption"
                            sx={{ fontFamily: "'Outfit', sans-serif", wordBreak: "break-all" }}
                          >
                            {r.path ?? r.url ?? r.route ?? "—"}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderColor: "rgba(255,255,255,0.05)" }}>
                          <Typography
                            variant="caption"
                            sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: statusColor(status) }}
                          >
                            {status || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderColor: "rgba(255,255,255,0.05)" }}>
                          <Typography variant="caption" sx={{ fontFamily: "'Outfit', sans-serif", opacity: 0.7 }}>
                            {r.ip ?? r.ipAddress ?? r.ip_address ?? "—"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}
