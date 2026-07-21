import { useEffect, useState } from "react";
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
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import WebhookOutlinedIcon from "@mui/icons-material/WebhookOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import { useAuth } from "@/context/AuthContext";

const overlineSx = {
  fontFamily: "monospace",
  fontSize: "0.7rem",
  textTransform: "uppercase",
  letterSpacing: "0.25em",
  color: "text.secondary",
  opacity: 0.6,
} as const;

const EVENT_OPTIONS = [
  "project.updated",
  "deliverable.published",
  "invoice.paid",
  "decision.logged",
  "milestone.reached",
];

function formatDate(value: any): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Webhooks() {
  const { api } = useAuth();

  const [loading, setLoading] = useState(true);
  const [webhooks, setWebhooks] = useState<any[]>([]);

  // Add endpoint dialog
  const [addOpen, setAddOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newEvents, setNewEvents] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  // Signing secret (shown once)
  const [secretValue, setSecretValue] = useState<string | null>(null);
  const [secretContext, setSecretContext] = useState<string>("created");

  // Test result
  const [testOpen, setTestOpen] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  // Deliveries dialog
  const [deliveriesOpen, setDeliveriesOpen] = useState(false);
  const [deliveriesLoading, setDeliveriesLoading] = useState(false);
  const [deliveries, setDeliveries] = useState<any[]>([]);

  // Row-level busy state
  const [busyId, setBusyId] = useState<string | null>(null);

  const [toast, setToast] = useState<{ msg: string; severity: "success" | "error" } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res: any = await api.get("/api/v1/webhooks");
      const items = res?.items ?? res?.data ?? res ?? [];
      setWebhooks(Array.isArray(items) ? items : []);
    } catch {
      setWebhooks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  function openAdd() {
    setNewUrl("");
    setNewEvents([]);
    setAddOpen(true);
  }

  async function handleCreate() {
    if (!newUrl.trim() || newEvents.length === 0) return;
    setCreating(true);
    try {
      const res: any = await api.post("/api/v1/webhooks", {
        url: newUrl.trim(),
        events: newEvents,
      });
      const secret = res?.signing_secret ?? res?.signingSecret ?? res?.secret;
      setAddOpen(false);
      if (secret) {
        setSecretContext("created");
        setSecretValue(secret);
      }
      setToast({ msg: "Endpoint added", severity: "success" });
      await load();
    } catch {
      setToast({ msg: "Failed to add endpoint", severity: "error" });
    } finally {
      setCreating(false);
    }
  }

  async function handleTest(id: string) {
    setTestingId(id);
    setBusyId(id);
    try {
      const res: any = await api.post(`/api/v1/webhooks/${id}/test`, {});
      setTestResult(res ?? { ok: true });
      setTestOpen(true);
    } catch (e: any) {
      setTestResult({ error: e?.message ?? "Test failed" });
      setTestOpen(true);
    } finally {
      setTestingId(null);
      setBusyId(null);
    }
  }

  async function handleDeliveries(id: string) {
    setBusyId(id);
    setDeliveries([]);
    setDeliveriesLoading(true);
    setDeliveriesOpen(true);
    try {
      const res: any = await api.get(`/api/v1/webhooks/${id}/deliveries`);
      const items = res?.items ?? res?.data ?? res ?? [];
      setDeliveries(Array.isArray(items) ? items : []);
    } catch {
      setDeliveries([]);
    } finally {
      setDeliveriesLoading(false);
      setBusyId(null);
    }
  }

  async function handleRotate(id: string) {
    setBusyId(id);
    try {
      const res: any = await api.post(`/api/v1/webhooks/${id}/rotate-secret`, {});
      const secret = res?.signing_secret ?? res?.signingSecret ?? res?.secret;
      if (secret) {
        setSecretContext("rotated");
        setSecretValue(secret);
      }
      setToast({ msg: "Signing secret rotated", severity: "success" });
      await load();
    } catch {
      setToast({ msg: "Failed to rotate secret", severity: "error" });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    try {
      await api.del(`/api/v1/webhooks/${id}`);
      setToast({ msg: "Endpoint deleted", severity: "success" });
      setWebhooks((prev) => prev.filter((w) => (w.id ?? w._id) !== id));
    } catch {
      setToast({ msg: "Failed to delete endpoint", severity: "error" });
    } finally {
      setBusyId(null);
    }
  }

  async function copySecret() {
    if (!secretValue) return;
    try {
      await navigator.clipboard.writeText(secretValue);
      setToast({ msg: "Secret copied to clipboard", severity: "success" });
    } catch {
      /* clipboard unavailable */
    }
  }

  function deliveryStatusColor(status: any): "success" | "error" | "warning" | "default" {
    const s = String(status ?? "").toLowerCase();
    if (s.includes("success") || s.includes("deliver") || s === "200" || s.startsWith("2")) return "success";
    if (s.includes("fail") || s.includes("error") || s.startsWith("4") || s.startsWith("5")) return "error";
    if (s.includes("pend") || s.includes("retry")) return "warning";
    return "default";
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Container maxWidth="lg" disableGutters>
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "flex-end" }, mb: 3 }}
        >
          <Box>
            <Typography sx={overlineSx}>Integrations</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
              Webhooks
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Receive real-time event notifications at your own endpoints.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={openAdd}>
            Add endpoint
          </Button>
        </Stack>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : webhooks.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <WebhookOutlinedIcon sx={{ fontSize: 48, color: "text.secondary", opacity: 0.4, mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                No endpoints yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                Add an endpoint to start receiving event notifications.
              </Typography>
              <Button variant="outlined" startIcon={<AddOutlinedIcon />} onClick={openAdd}>
                Add endpoint
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Endpoint</TableCell>
                    <TableCell>Events</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {webhooks.map((wh) => {
                    const id = wh.id ?? wh._id;
                    const events: string[] = wh.events ?? [];
                    const rowBusy = busyId === id;
                    return (
                      <TableRow key={id} hover>
                        <TableCell sx={{ maxWidth: 280, wordBreak: "break-all" }}>
                          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                            {wh.url}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack sx={{ flexWrap: "wrap" }} direction="row" spacing={0.5} useFlexGap>
                            {events.length === 0 ? (
                              <Typography variant="caption" color="text.secondary">
                                —
                              </Typography>
                            ) : (
                              events.map((ev) => (
                                <Chip
                                  key={ev}
                                  label={ev}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontFamily: "monospace", fontSize: "0.65rem" }}
                                />
                              ))
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(wh.created_at ?? wh.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack sx={{ justifyContent: "flex-end" }} direction="row" spacing={0.5}>
                            <IconButton
                              size="small"
                              title="Send test event"
                              disabled={rowBusy}
                              onClick={() => handleTest(id)}
                            >
                              {testingId === id ? (
                                <CircularProgress size={16} />
                              ) : (
                                <PlayArrowOutlinedIcon fontSize="small" />
                              )}
                            </IconButton>
                            <IconButton
                              size="small"
                              title="View deliveries"
                              disabled={rowBusy}
                              onClick={() => handleDeliveries(id)}
                            >
                              <ListAltOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              title="Rotate signing secret"
                              disabled={rowBusy}
                              onClick={() => handleRotate(id)}
                            >
                              <AutorenewOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              title="Delete endpoint"
                              disabled={rowBusy}
                              onClick={() => handleDelete(id)}
                            >
                              <DeleteOutlineOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Add endpoint dialog */}
      <Dialog open={addOpen} onClose={() => !creating && setAddOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add endpoint</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Endpoint URL"
              placeholder="https://example.com/webhooks"
              fullWidth
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
                Events
              </Typography>
              <Select
                multiple
                fullWidth
                displayEmpty
                value={newEvents}
                onChange={(e) =>
                  setNewEvents(typeof e.target.value === "string" ? e.target.value.split(",") : (e.target.value as string[]))
                }
                renderValue={(selected) =>
                  (selected as string[]).length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Select events
                    </Typography>
                  ) : (
                    <Stack sx={{ flexWrap: "wrap" }} direction="row" spacing={0.5} useFlexGap>
                      {(selected as string[]).map((ev) => (
                        <Chip key={ev} label={ev} size="small" sx={{ fontFamily: "monospace", fontSize: "0.65rem" }} />
                      ))}
                    </Stack>
                  )
                }
              >
                {EVENT_OPTIONS.map((ev) => (
                  <MenuItem key={ev} value={ev} sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                    {ev}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)} disabled={creating}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={creating || !newUrl.trim() || newEvents.length === 0}
            startIcon={creating ? <CircularProgress size={16} color="inherit" /> : null}
          >
            Add endpoint
          </Button>
        </DialogActions>
      </Dialog>

      {/* Signing secret (shown once) */}
      <Dialog open={!!secretValue} onClose={() => setSecretValue(null)} fullWidth maxWidth="sm">
        <DialogTitle>Signing secret {secretContext === "rotated" ? "rotated" : "created"}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Copy this signing secret now. For security, it will not be shown again.
          </Alert>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 1.5,
              borderRadius: 1,
              bgcolor: "background.default",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontFamily: "monospace", wordBreak: "break-all", flex: 1 }}
            >
              {secretValue}
            </Typography>
            <IconButton size="small" onClick={copySecret} title="Copy">
              <ContentCopyOutlinedIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setSecretValue(null)}>
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test result dialog */}
      <Dialog open={testOpen} onClose={() => setTestOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Test result</DialogTitle>
        <DialogContent>
          <Box
            component="pre"
            sx={{
              m: 0,
              p: 1.5,
              borderRadius: 1,
              bgcolor: "background.default",
              border: "1px solid",
              borderColor: "divider",
              fontFamily: "monospace",
              fontSize: "0.75rem",
              overflow: "auto",
              maxHeight: 360,
            }}
          >
            {JSON.stringify(testResult, null, 2)}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Deliveries dialog */}
      <Dialog open={deliveriesOpen} onClose={() => setDeliveriesOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Recent deliveries</DialogTitle>
        <DialogContent>
          {deliveriesLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress />
            </Box>
          ) : deliveries.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
              No deliveries recorded yet.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Event</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Response</TableCell>
                  <TableCell>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deliveries.map((d, i) => (
                  <TableRow key={d.id ?? d._id ?? i}>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.7rem" }}>
                      {d.event ?? d.event_type ?? d.eventType ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={String(d.status ?? d.state ?? "—")}
                        size="small"
                        color={deliveryStatusColor(d.status ?? d.state)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{d.response_code ?? d.responseCode ?? d.status_code ?? d.statusCode ?? "—"}</TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(d.created_at ?? d.createdAt ?? d.delivered_at ?? d.deliveredAt)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeliveriesOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Divider sx={{ display: "none" }} />

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)} variant="filled">
            {toast.msg}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
