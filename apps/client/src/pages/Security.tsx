import { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  TextField,
  Divider,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import PrivacyTipOutlinedIcon from "@mui/icons-material/PrivacyTipOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import DevicesOutlinedIcon from "@mui/icons-material/DevicesOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import { useAuth } from "@/context/AuthContext";

const CAN_MANAGE_API_KEYS = "apikeys:read";

const overlineSx = {
  fontFamily: "monospace",
  fontSize: "0.7rem",
  textTransform: "uppercase",
  letterSpacing: "0.25em",
  color: "text.secondary",
  opacity: 0.6,
} as const;

const sectionLabelSx = {
  fontFamily: "monospace",
  fontSize: "0.7rem",
  textTransform: "uppercase",
  letterSpacing: "0.25em",
  color: "text.secondary",
  opacity: 0.6,
} as const;

function formatDate(value?: string): string {
  if (!value) return "Never";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "Never";
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function privacyStatusColor(status: string): "success" | "warning" | "error" | "info" | "default" {
  const s = (status || "").toLowerCase();
  if (s === "completed" || s === "done" || s === "fulfilled") return "success";
  if (s === "pending" || s === "queued") return "warning";
  if (s === "processing" || s === "in_progress") return "info";
  if (s === "rejected" || s === "failed" || s === "cancelled") return "error";
  return "default";
}

export default function Security() {
  const { api, user, hasPermission } = useAuth();
  const canManageApiKeys = hasPermission(CAN_MANAGE_API_KEYS) || hasPermission("apikeys:create");

  // ── Shared feedback ──────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ msg: string; severity: "success" | "error" | "info" } | null>(null);

  // ── API Keys ─────────────────────────────────────────────────────────────
  const [keysLoading, setKeysLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [genOpen, setGenOpen] = useState(false);
  const [genName, setGenName] = useState("");
  const [genScopes, setGenScopes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  const loadKeys = async () => {
    if (!canManageApiKeys) {
      setApiKeys([]);
      setKeysLoading(false);
      return;
    }
    setKeysLoading(true);
    try {
      const res: any = await api.get("/api/v1/api-keys");
      const items = Array.isArray(res) ? res : res?.items ?? res?.keys ?? [];
      setApiKeys(items);
    } catch {
      setApiKeys([]);
    } finally {
      setKeysLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, canManageApiKeys]);

  const handleGenerate = async () => {
    if (!genName.trim()) {
      setToast({ msg: "Please enter a name for the key.", severity: "error" });
      return;
    }
    setGenerating(true);
    try {
      const scopes = genScopes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const body: any = { name: genName.trim() };
      if (scopes.length > 0) body.scopes = scopes;
      const res: any = await api.post("/api/v1/api-keys", body);
      const key = res?.key ?? res?.api_key ?? res?.token ?? null;
      if (key) setNewKey(key);
      setToast({ msg: "API key generated.", severity: "success" });
      setGenName("");
      setGenScopes("");
      await loadKeys();
    } catch {
      setToast({ msg: "Could not generate key.", severity: "error" });
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await api.del("/api/v1/api-keys/" + id);
      setToast({ msg: "API key revoked.", severity: "success" });
      await loadKeys();
    } catch {
      setToast({ msg: "Could not revoke key.", severity: "error" });
    }
  };

  const closeGenDialog = () => {
    setGenOpen(false);
    setNewKey(null);
    setGenName("");
    setGenScopes("");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast({ msg: "Copied to clipboard.", severity: "success" });
    } catch {
      setToast({ msg: "Copy failed — select and copy manually.", severity: "error" });
    }
  };

  // ── Data & Privacy ───────────────────────────────────────────────────────
  const [privacyLoading, setPrivacyLoading] = useState(true);
  const [privacyRequests, setPrivacyRequests] = useState<any[]>([]);
  const [submittingPrivacy, setSubmittingPrivacy] = useState(false);

  const loadPrivacy = async () => {
    setPrivacyLoading(true);
    try {
      const res: any = await api.get("/api/v1/privacy/requests/mine");
      const items = Array.isArray(res) ? res : res?.items ?? res?.requests ?? [];
      setPrivacyRequests(items);
    } catch {
      setPrivacyRequests([]);
    } finally {
      setPrivacyLoading(false);
    }
  };

  useEffect(() => {
    loadPrivacy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  const submitPrivacy = async (type: "export" | "erasure") => {
    setSubmittingPrivacy(true);
    try {
      await api.post("/api/v1/privacy/requests", { type });
      setToast({
        msg: type === "export" ? "Data export requested." : "Account erasure requested.",
        severity: "success",
      });
      await loadPrivacy();
    } catch {
      setToast({ msg: "Could not submit request.", severity: "error" });
    } finally {
      setSubmittingPrivacy(false);
    }
  };

  // ── Activity Log (the caller's own audit trail) ────────────────────────────
  const [activity, setActivity] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const loadActivity = async () => {
    setActivityLoading(true);
    try {
      const res = await api.getMyActivity({ limit: 500 });
      setActivity(res.items ?? []);
    } catch {
      setActivity([]);
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  const downloadBlob = (content: string, mime: string, filename: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportActivityJson = () => {
    downloadBlob(JSON.stringify(activity, null, 2), "application/json", "my-activity-log.json");
  };

  const exportActivityCsv = () => {
    const header = "timestamp,action,method,path,statusCode,ip";
    const esc = (v: unknown) => {
      let s = String(v ?? "");
      // Neutralize spreadsheet formula injection: a cell starting with = + - @ (or tab/CR) is
      // prefixed with an apostrophe so Excel/Sheets treats it as text, not a formula.
      if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = activity.map((e: any) =>
      [e.createdAt, e.action, e.method, e.path, e.statusCode ?? "", e.ip ?? ""].map(esc).join(","),
    );
    downloadBlob([header, ...rows].join("\n"), "text/csv", "my-activity-log.csv");
  };

  // ── Sessions ─────────────────────────────────────────────────────────────
  const signOutEverywhere = () => {
    localStorage.removeItem("neurodyne_access_token");
    localStorage.removeItem("neurodyne_refresh_token");
    localStorage.removeItem("neurodyne_user");
    window.location.href = "/login";
  };

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email || "Current user";

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Typography sx={overlineSx}>SECURITY</Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Security &amp; Privacy
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage data privacy requests, sessions{canManageApiKeys ? ", and API keys" : ""}.
        </Typography>
      </Stack>

      <Stack spacing={3} sx={{ maxWidth: 960 }}>
        {/* ── Card 1: API Keys (staff with apikeys:* only) ─────────────── */}
        {canManageApiKeys && (
        <Card>
          <CardContent>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, mb: 2 }}
            >
              <Stack spacing={0.5}>
                <Typography sx={sectionLabelSx}>API KEYS</Typography>
                <Stack sx={{ alignItems: "center" }} direction="row" spacing={1}>
                  <VpnKeyOutlinedIcon fontSize="small" color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Programmatic access
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Keys authenticate machine-to-machine requests. Treat them like passwords.
                </Typography>
              </Stack>
              <Button
                variant="contained"
                startIcon={<AddOutlinedIcon />}
                onClick={() => {
                  setNewKey(null);
                  setGenOpen(true);
                }}
              >
                Generate key
              </Button>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {keysLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : apiKeys.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <VpnKeyOutlinedIcon sx={{ fontSize: 40, color: "text.secondary", opacity: 0.4, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No API keys yet. Generate one to start integrating.
                </Typography>
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Key</TableCell>
                    <TableCell>Last used</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {apiKeys.map((k: any) => (
                    <TableRow key={k.id}>
                      <TableCell>{k.name ?? "Unnamed key"}</TableCell>
                      <TableCell>
                        <Typography
                          component="span"
                          sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                        >
                          {k.masked ?? k.prefix ?? k.masked_key ?? "••••••••"}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(k.lastUsedAt ?? k.last_used_at)}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteOutlineOutlinedIcon />}
                          onClick={() => handleRevoke(k.id)}
                        >
                          Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        )}

        {/* ── Card 2: Data & Privacy ────────────────────────────────────── */}
        <Card>
          <CardContent>
            <Stack spacing={0.5} sx={{ mb: 2 }}>
              <Typography sx={sectionLabelSx}>DATA &amp; PRIVACY</Typography>
              <Stack sx={{ alignItems: "center" }} direction="row" spacing={1}>
                <PrivacyTipOutlinedIcon fontSize="small" color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Your data rights
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Request a copy of your data or ask us to erase your account.
              </Typography>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<DownloadOutlinedIcon />}
                disabled={submittingPrivacy}
                onClick={() => submitPrivacy("export")}
              >
                Request data export
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteForeverOutlinedIcon />}
                disabled={submittingPrivacy}
                onClick={() => submitPrivacy("erasure")}
              >
                Request account erasure
              </Button>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {privacyLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : privacyRequests.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <PrivacyTipOutlinedIcon sx={{ fontSize: 40, color: "text.secondary", opacity: 0.4, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No privacy requests yet.
                </Typography>
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Requested</TableCell>
                    <TableCell align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {privacyRequests.map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell sx={{ textTransform: "capitalize" }}>{r.type ?? "—"}</TableCell>
                      <TableCell>{formatDate(r.created_at ?? r.createdAt)}</TableCell>
                      <TableCell align="right">
                        <Chip
                          size="small"
                          label={r.status ?? "pending"}
                          color={privacyStatusColor(r.status ?? "pending")}
                          sx={{ textTransform: "capitalize" }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* ── Card 3: Activity Log ──────────────────────────────────────── */}
        <Card>
          <CardContent>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, mb: 2 }}
            >
              <Stack spacing={0.5}>
                <Typography sx={sectionLabelSx}>ACTIVITY LOG</Typography>
                <Stack sx={{ alignItems: "center" }} direction="row" spacing={1}>
                  <HistoryOutlinedIcon fontSize="small" color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Your recent activity
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  A record of changes made from your account. Export it as CSV or JSON for your own records.
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" size="small" startIcon={<DownloadOutlinedIcon />} disabled={activity.length === 0} onClick={exportActivityCsv}>
                  CSV
                </Button>
                <Button variant="outlined" size="small" startIcon={<DownloadOutlinedIcon />} disabled={activity.length === 0} onClick={exportActivityJson}>
                  JSON
                </Button>
              </Stack>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {activityLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : activity.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <HistoryOutlinedIcon sx={{ fontSize: 40, color: "text.secondary", opacity: 0.4, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No recorded activity yet.
                </Typography>
              </Box>
            ) : (
              <>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>When</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell align="right">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activity.slice(0, 50).map((e: any) => (
                      <TableRow key={e.id}>
                        <TableCell>{formatDate(e.createdAt)}</TableCell>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>{e.action}</TableCell>
                        <TableCell>
                          <Chip size="small" variant="outlined" label={e.method} sx={{ fontSize: "0.6rem" }} />
                        </TableCell>
                        <TableCell align="right">{e.statusCode ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {activity.length > 50 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    Showing the 50 most recent of {activity.length}. Export to download the full set.
                  </Typography>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* ── Card 4: Sessions ──────────────────────────────────────────── */}
        <Card>
          <CardContent>
            <Stack spacing={0.5} sx={{ mb: 2 }}>
              <Typography sx={sectionLabelSx}>SESSIONS</Typography>
              <Stack sx={{ alignItems: "center" }} direction="row" spacing={1}>
                <DevicesOutlinedIcon fontSize="small" color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Active session
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Authentication uses short-lived JWTs, and multi-factor authentication is mandatory.
              </Typography>
            </Stack>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
                borderRadius: 2,
                border: 1,
                borderColor: "divider",
                mb: 2,
              }}
            >
              <ShieldOutlinedIcon color="success" />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {displayName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email ?? "—"} · this device
                </Typography>
              </Box>
              <Chip size="small" color="success" label="Current" />
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Stack sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" } }}
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
            >
              <Typography variant="caption" color="text.secondary">
                Best-effort / client-side: this clears tokens stored in this browser and redirects to
                sign-in. Server-side session revocation is not guaranteed.
              </Typography>
              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutOutlinedIcon />}
                onClick={signOutEverywhere}
                sx={{ flexShrink: 0 }}
              >
                Sign out everywhere
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* ── Generate key dialog ─────────────────────────────────────────── */}
      <Dialog open={genOpen} onClose={closeGenDialog} fullWidth maxWidth="sm">
        <DialogTitle>Generate API key</DialogTitle>
        <DialogContent>
          {newKey ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Alert severity="warning" icon={<WarningAmberOutlinedIcon />}>
                Copy this key now. For security, it will not be shown again.
              </Alert>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: "action.hover",
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.85rem",
                    wordBreak: "break-all",
                    flexGrow: 1,
                  }}
                >
                  {newKey}
                </Typography>
                <IconButton size="small" onClick={() => copyToClipboard(newKey)} aria-label="Copy key">
                  <ContentCopyOutlinedIcon fontSize="small" />
                </IconButton>
              </Box>
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Name"
                placeholder="e.g. CI pipeline"
                fullWidth
                value={genName}
                onChange={(e) => setGenName(e.target.value)}
                autoFocus
              />
              <TextField
                label="Scopes (optional)"
                placeholder="read, write"
                helperText="Comma-separated. Leave blank for default scopes."
                fullWidth
                value={genScopes}
                onChange={(e) => setGenScopes(e.target.value)}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          {newKey ? (
            <Button onClick={closeGenDialog} variant="contained">
              Done
            </Button>
          ) : (
            <>
              <Button onClick={closeGenDialog}>Cancel</Button>
              <Button onClick={handleGenerate} variant="contained" disabled={generating}>
                {generating ? "Generating…" : "Generate"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* ── Toast ───────────────────────────────────────────────────────── */}
      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)} sx={{ width: "100%" }}>
            {toast.msg}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
