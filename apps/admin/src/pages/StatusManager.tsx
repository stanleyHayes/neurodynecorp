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
  Divider,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import { useAuth } from "@/context/AuthContext";

const overline = {
  fontFamily: "monospace",
  fontSize: "0.7rem",
  textTransform: "uppercase",
  letterSpacing: "0.25em",
  color: "text.secondary",
  opacity: 0.6,
} as const;

const COMPONENT_STATUSES = [
  { value: "operational", label: "Operational", color: "#10B981" },
  { value: "degraded", label: "Degraded Performance", color: "#F59E0B" },
  { value: "partial_outage", label: "Partial Outage", color: "#F59E0B" },
  { value: "major_outage", label: "Major Outage", color: "#EF4444" },
  { value: "maintenance", label: "Under Maintenance", color: "#6C63FF" },
];

const INCIDENT_STATUSES = [
  { value: "investigating", label: "Investigating", color: "#EF4444" },
  { value: "identified", label: "Identified", color: "#F59E0B" },
  { value: "monitoring", label: "Monitoring", color: "#6C63FF" },
  { value: "resolved", label: "Resolved", color: "#10B981" },
];

function statusMeta(list: { value: string; label: string; color: string }[], value: string) {
  return list.find((s) => s.value === value) ?? { value, label: value, color: "#94A3B8" };
}

function asArray(res: any): any[] {
  if (Array.isArray(res)) return res;
  return res?.items ?? res?.data ?? res?.components ?? res?.incidents ?? [];
}

function fmtDate(s?: string) {
  if (!s) return "";
  try {
    return new Date(s).toLocaleString();
  } catch {
    return s;
  }
}

export default function StatusManager() {
  const { api } = useAuth();

  const [components, setComponents] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ msg: string; sev: "success" | "error" } | null>(null);

  // Component create form
  const [newComponentName, setNewComponentName] = useState("");
  const [newComponentStatus, setNewComponentStatus] = useState("operational");
  const [savingComponent, setSavingComponent] = useState(false);

  // Incident create dialog
  const [incidentDialogOpen, setIncidentDialogOpen] = useState(false);
  const [incidentTitle, setIncidentTitle] = useState("");
  const [incidentBody, setIncidentBody] = useState("");
  const [incidentStatus, setIncidentStatus] = useState("investigating");
  const [savingIncident, setSavingIncident] = useState(false);

  // Incident update dialog
  const [updateTarget, setUpdateTarget] = useState<any | null>(null);
  const [updateStatus, setUpdateStatus] = useState("investigating");
  const [updateBody, setUpdateBody] = useState("");
  const [savingUpdate, setSavingUpdate] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [comps, incs] = await Promise.all([
        api.get("/api/v1/status/components"),
        api.get("/api/v1/status/incidents"),
      ]);
      setComponents(asArray(comps));
      setIncidents(asArray(incs));
    } catch (err: any) {
      setError(err?.message ?? "Failed to load status data");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const notify = (msg: string, sev: "success" | "error") => setToast({ msg, sev });

  const handleCreateComponent = async () => {
    if (!newComponentName.trim()) return;
    try {
      setSavingComponent(true);
      await api.post("/api/v1/status/components", {
        name: newComponentName.trim(),
        status: newComponentStatus,
      });
      setNewComponentName("");
      setNewComponentStatus("operational");
      notify("Component created", "success");
      await load();
    } catch (err: any) {
      notify(err?.message ?? "Failed to create component", "error");
    } finally {
      setSavingComponent(false);
    }
  };

  const handleComponentStatusChange = async (component: any, status: string) => {
    const id = component.id ?? component._id;
    setComponents((prev) => prev.map((c) => ((c.id ?? c._id) === id ? { ...c, status } : c)));
    try {
      await api.patch(`/api/v1/status/components/${id}`, { status });
      notify("Component status updated", "success");
    } catch (err: any) {
      notify(err?.message ?? "Failed to update component", "error");
      await load();
    }
  };

  const handleDeleteComponent = async (component: any) => {
    const id = component.id ?? component._id;
    try {
      await api.del(`/api/v1/status/components/${id}`);
      setComponents((prev) => prev.filter((c) => (c.id ?? c._id) !== id));
      notify("Component deleted", "success");
    } catch (err: any) {
      notify(err?.message ?? "Failed to delete component", "error");
    }
  };

  const handleCreateIncident = async () => {
    if (!incidentTitle.trim()) return;
    try {
      setSavingIncident(true);
      await api.post("/api/v1/status/incidents", {
        title: incidentTitle.trim(),
        status: incidentStatus,
        body: incidentBody.trim() || undefined,
      });
      setIncidentDialogOpen(false);
      setIncidentTitle("");
      setIncidentBody("");
      setIncidentStatus("investigating");
      notify("Incident created", "success");
      await load();
    } catch (err: any) {
      notify(err?.message ?? "Failed to create incident", "error");
    } finally {
      setSavingIncident(false);
    }
  };

  const openUpdate = (incident: any) => {
    setUpdateTarget(incident);
    setUpdateStatus(incident.status ?? "investigating");
    setUpdateBody("");
  };

  const handleSubmitUpdate = async () => {
    if (!updateTarget || !updateBody.trim()) return;
    const id = updateTarget.id ?? updateTarget._id;
    try {
      setSavingUpdate(true);
      await api.patch(`/api/v1/status/incidents/${id}`, {
        status: updateStatus,
        body: updateBody.trim(),
      });
      setUpdateTarget(null);
      setUpdateBody("");
      notify("Incident updated", "success");
      await load();
    } catch (err: any) {
      notify(err?.message ?? "Failed to update incident", "error");
    } finally {
      setSavingUpdate(false);
    }
  };

  const openIncidents = incidents.filter((i) => (i.status ?? "") !== "resolved");
  const resolvedIncidents = incidents.filter((i) => (i.status ?? "") === "resolved");

  return (
    <Box>
      {/* Header */}
      <Box sx={{ px: { xs: 2, md: 3 }, pt: { xs: 2, md: 3 }, pb: 1 }}>
        <Typography sx={overline}>OPERATIONS // STATUS</Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
          Status Manager
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.7, mt: 0.5 }}>
          Manage public status-page components and publish incident updates.
        </Typography>
      </Box>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={load}>Retry</Button>}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={4}>
            {/* ── Components ───────────────────────────────────────── */}
            <Box>
              <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                <Typography sx={overline}>COMPONENTS</Typography>
                <IconButton size="small" onClick={load} sx={{ color: "text.secondary" }}>
                  <RefreshOutlinedIcon fontSize="small" />
                </IconButton>
              </Stack>

              {/* Create component */}
              <Card variant="outlined" sx={{ mb: 2, bgcolor: "#111827" }}>
                <CardContent>
                  <Stack sx={{ alignItems: { sm: "center" } }} direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Component name"
                      value={newComponentName}
                      onChange={(e) => setNewComponentName(e.target.value)}
                    />
                    <Select
                      size="small"
                      value={newComponentStatus}
                      onChange={(e) => setNewComponentStatus(e.target.value)}
                      sx={{ minWidth: { xs: "100%", sm: 220 } }}
                    >
                      {COMPONENT_STATUSES.map((s) => (
                        <MenuItem key={s.value} value={s.value}>
                          {s.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <Button
                      variant="contained"
                      startIcon={savingComponent ? <CircularProgress size={16} color="inherit" /> : <AddOutlinedIcon />}
                      onClick={handleCreateComponent}
                      disabled={savingComponent || !newComponentName.trim()}
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      Add
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              {components.length === 0 ? (
                <Card variant="outlined" sx={{ bgcolor: "#111827" }}>
                  <CardContent sx={{ textAlign: "center", py: 5 }}>
                    <MonitorHeartOutlinedIcon sx={{ fontSize: 40, color: "text.secondary", opacity: 0.4, mb: 1 }} />
                    <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.7 }}>
                      No components yet. Add your first monitored service above.
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <Stack spacing={1.5}>
                  {components.map((c) => {
                    const id = c.id ?? c._id;
                    const meta = statusMeta(COMPONENT_STATUSES, c.status);
                    return (
                      <Card key={id} variant="outlined" sx={{ bgcolor: "#111827" }}>
                        <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                          <Stack sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }} direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
                              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: meta.color, flexShrink: 0, boxShadow: `0 0 10px ${meta.color}80` }} />
                              <Typography sx={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>
                                {c.name}
                              </Typography>
                            </Stack>
                            <Stack sx={{ alignItems: "center" }} direction="row" spacing={1}>
                              <Select
                                size="small"
                                value={c.status ?? "operational"}
                                onChange={(e) => handleComponentStatusChange(c, e.target.value)}
                                sx={{ minWidth: 220, "& .MuiSelect-select": { color: meta.color, fontWeight: 600 } }}
                              >
                                {COMPONENT_STATUSES.map((s) => (
                                  <MenuItem key={s.value} value={s.value}>
                                    {s.label}
                                  </MenuItem>
                                ))}
                              </Select>
                              <IconButton size="small" onClick={() => handleDeleteComponent(c)} sx={{ color: "#EF4444" }}>
                                <DeleteOutlineOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              )}
            </Box>

            <Divider sx={{ borderColor: "rgba(108,99,255,0.12)" }} />

            {/* ── Incidents ────────────────────────────────────────── */}
            <Box>
              <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                <Typography sx={overline}>INCIDENTS</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddOutlinedIcon />}
                  onClick={() => setIncidentDialogOpen(true)}
                >
                  New Incident
                </Button>
              </Stack>

              {/* Open incidents */}
              <Typography sx={{ ...overline, fontSize: "0.6rem", display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
                <ReportProblemOutlinedIcon sx={{ fontSize: 14, color: "#F59E0B" }} /> OPEN ({openIncidents.length})
              </Typography>
              {openIncidents.length === 0 ? (
                <Card variant="outlined" sx={{ bgcolor: "#111827", mb: 3 }}>
                  <CardContent sx={{ textAlign: "center", py: 4 }}>
                    <CheckCircleOutlinedIcon sx={{ fontSize: 36, color: "#10B981", opacity: 0.6, mb: 1 }} />
                    <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.7 }}>
                      All systems clear. No open incidents.
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <Stack spacing={1.5} sx={{ mb: 3 }}>
                  {openIncidents.map((inc) => (
                    <IncidentCard key={inc.id ?? inc._id} incident={inc} onUpdate={() => openUpdate(inc)} />
                  ))}
                </Stack>
              )}

              {/* Resolved incidents */}
              <Typography sx={{ ...overline, fontSize: "0.6rem", display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
                <CheckCircleOutlinedIcon sx={{ fontSize: 14, color: "#10B981" }} /> RESOLVED ({resolvedIncidents.length})
              </Typography>
              {resolvedIncidents.length === 0 ? (
                <Card variant="outlined" sx={{ bgcolor: "#111827" }}>
                  <CardContent sx={{ textAlign: "center", py: 3 }}>
                    <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.6 }}>
                      No resolved incidents yet.
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <Stack spacing={1.5}>
                  {resolvedIncidents.map((inc) => (
                    <IncidentCard key={inc.id ?? inc._id} incident={inc} onUpdate={() => openUpdate(inc)} muted />
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        )}
      </Box>

      {/* Create incident dialog */}
      <Dialog open={incidentDialogOpen} onClose={() => setIncidentDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Incident</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              fullWidth
              value={incidentTitle}
              onChange={(e) => setIncidentTitle(e.target.value)}
            />
            <Select value={incidentStatus} onChange={(e) => setIncidentStatus(e.target.value)} fullWidth size="small">
              {INCIDENT_STATUSES.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
            <TextField
              label="Initial update"
              fullWidth
              multiline
              minRows={3}
              value={incidentBody}
              onChange={(e) => setIncidentBody(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIncidentDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateIncident}
            disabled={savingIncident || !incidentTitle.trim()}
            startIcon={savingIncident ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add update dialog */}
      <Dialog open={Boolean(updateTarget)} onClose={() => setUpdateTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle>Post Update — {updateTarget?.title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Select value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)} fullWidth size="small">
              {INCIDENT_STATUSES.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </Select>
            <TextField
              label="Update message"
              fullWidth
              multiline
              minRows={3}
              value={updateBody}
              onChange={(e) => setUpdateBody(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateTarget(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitUpdate}
            disabled={savingUpdate || !updateBody.trim()}
            startIcon={savingUpdate ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Post Update
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {toast ? (
          <Alert severity={toast.sev} variant="filled" onClose={() => setToast(null)}>
            {toast.msg}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}

function IncidentCard({ incident, onUpdate, muted }: { incident: any; onUpdate: () => void; muted?: boolean }) {
  const meta = statusMeta(INCIDENT_STATUSES, incident.status);
  const updates: any[] = incident.updates ?? incident.history ?? [];
  return (
    <Card variant="outlined" sx={{ bgcolor: "#111827", opacity: muted ? 0.75 : 1 }}>
      <CardContent>
        <Stack sx={{ justifyContent: "space-between", alignItems: "flex-start" }} direction="row" spacing={1.5}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700 }}>{incident.title}</Typography>
            <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5, mt: 0.3 }}>
              {fmtDate(incident.createdAt ?? incident.created_at)}
            </Typography>
          </Box>
          <Chip
            label={meta.label}
            size="small"
            sx={{
              fontFamily: "monospace",
              fontSize: "0.6rem",
              bgcolor: `${meta.color}18`,
              color: meta.color,
              border: `1px solid ${meta.color}30`,
              flexShrink: 0,
            }}
          />
        </Stack>

        {updates.length > 0 && (
          <Stack spacing={1} sx={{ mt: 1.5, pl: 1.5, borderLeft: "2px solid rgba(108,99,255,0.2)" }}>
            {updates.map((u, i) => {
              const um = statusMeta(INCIDENT_STATUSES, u.status);
              return (
                <Box key={i}>
                  <Stack sx={{ alignItems: "center" }} direction="row" spacing={1}>
                    <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", color: um.color, fontWeight: 700 }}>
                      {um.label}
                    </Typography>
                    <Typography sx={{ fontFamily: "monospace", fontSize: "0.55rem", color: "text.secondary", opacity: 0.5 }}>
                      {fmtDate(u.createdAt ?? u.created_at ?? u.timestamp)}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.8, mt: 0.3 }}>
                    {u.body ?? u.message}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        )}

        <Box sx={{ mt: 1.5 }}>
          <Button size="small" variant="outlined" onClick={onUpdate}>
            Post Update
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
