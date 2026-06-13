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
  Switch,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import { useAuth } from "@/context/AuthContext";

const overlineSx = {
  fontFamily: "monospace",
  fontSize: "0.7rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.25em",
  color: "text.secondary",
  opacity: 0.6,
};

const MAINTENANCE_KEY = "maintenance_mode";

type Flag = any;

function flagId(f: Flag): string {
  return f?.id ?? f?._id ?? f?.key ?? "";
}

function rolloutOf(f: Flag): number {
  return Number(f?.rolloutPercentage ?? f?.rollout_percentage ?? f?.rollout ?? 100);
}

interface FormState {
  key: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: string;
}

const emptyForm: FormState = { key: "", description: "", enabled: false, rolloutPercentage: "100" };

export default function FeatureFlags() {
  const { api } = useAuth();
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string>("");
  const [maintBusy, setMaintBusy] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Flag | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({
    open: false,
    msg: "",
    severity: "success",
  });

  const notify = (msg: string, severity: "success" | "error" = "success") =>
    setSnack({ open: true, msg, severity });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res: any = await api.get("/api/v1/flags/all");
      const items = Array.isArray(res) ? res : res?.items ?? res?.flags ?? res?.data ?? [];
      setFlags(items);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load feature flags");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const maintenance = flags.find(
    (f) => (f.key ?? f.name) === MAINTENANCE_KEY
  );
  const maintenanceOn = Boolean(maintenance?.enabled);

  const toggleFlag = async (f: Flag, enabled: boolean) => {
    const id = flagId(f);
    setBusyId(id);
    // optimistic
    setFlags((prev) => prev.map((x) => (flagId(x) === id ? { ...x, enabled } : x)));
    try {
      await api.patch(`/api/v1/flags/${id}`, { enabled });
      notify(`${f.key ?? f.name} ${enabled ? "enabled" : "disabled"}`);
    } catch (err: any) {
      // revert
      setFlags((prev) => prev.map((x) => (flagId(x) === id ? { ...x, enabled: !enabled } : x)));
      notify(err?.message ?? "Failed to update flag", "error");
    } finally {
      setBusyId("");
    }
  };

  const saveRollout = async (f: Flag, value: number) => {
    const id = flagId(f);
    const clamped = Math.max(0, Math.min(100, value));
    setFlags((prev) =>
      prev.map((x) => (flagId(x) === id ? { ...x, rolloutPercentage: clamped } : x))
    );
    try {
      await api.patch(`/api/v1/flags/${id}`, { rolloutPercentage: clamped });
      notify("Rollout updated");
    } catch (err: any) {
      notify(err?.message ?? "Failed to update rollout", "error");
      load();
    }
  };

  const toggleMaintenance = async (enabled: boolean) => {
    setMaintBusy(true);
    try {
      if (maintenance) {
        const id = flagId(maintenance);
        await api.patch(`/api/v1/flags/${id}`, { enabled });
      } else {
        // create the flag, default fully rolled out
        await api.post("/api/v1/flags", {
          key: MAINTENANCE_KEY,
          description: "Puts the platform into maintenance mode for all users.",
          enabled,
          rolloutPercentage: 100,
        });
      }
      notify(enabled ? "Maintenance mode ENABLED" : "Maintenance mode disabled", enabled ? "error" : "success");
      await load();
    } catch (err: any) {
      notify(err?.message ?? "Failed to toggle maintenance mode", "error");
    } finally {
      setMaintBusy(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (f: Flag) => {
    setEditing(f);
    setForm({
      key: f.key ?? f.name ?? "",
      description: f.description ?? "",
      enabled: Boolean(f.enabled),
      rolloutPercentage: String(rolloutOf(f)),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.key.trim()) {
      notify("Key is required", "error");
      return;
    }
    setSaving(true);
    const payload = {
      key: form.key.trim(),
      description: form.description.trim(),
      enabled: form.enabled,
      rolloutPercentage: Math.max(0, Math.min(100, Number(form.rolloutPercentage) || 0)),
    };
    try {
      if (editing) {
        await api.patch(`/api/v1/flags/${flagId(editing)}`, payload);
        notify("Flag updated");
      } else {
        await api.post("/api/v1/flags", payload);
        notify("Flag created");
      }
      setDialogOpen(false);
      await load();
    } catch (err: any) {
      notify(err?.message ?? "Failed to save flag", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (f: Flag) => {
    if (!window.confirm(`Delete flag "${f.key ?? f.name}"? This cannot be undone.`)) return;
    const id = flagId(f);
    setBusyId(id);
    try {
      await api.del(`/api/v1/flags/${id}`);
      notify("Flag deleted");
      setFlags((prev) => prev.filter((x) => flagId(x) !== id));
    } catch (err: any) {
      notify(err?.message ?? "Failed to delete flag", "error");
    } finally {
      setBusyId("");
    }
  };

  return (
    <Container maxWidth="xl" disableGutters sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "flex-end" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Stack spacing={0.5}>
          <Typography sx={overlineSx}>PLATFORM // FLAGS</Typography>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <FlagOutlinedIcon sx={{ color: "#6C63FF" }} />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Feature Flags
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.8 }}>
            Toggle features, stage gradual rollouts, and control platform-wide behavior.
          </Typography>
        </Stack>
        <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={openCreate}>
          New Flag
        </Button>
      </Stack>

      {/* Maintenance mode highlighted control */}
      <Card
        sx={{
          mb: 3,
          bgcolor: maintenanceOn ? "rgba(239,68,68,0.08)" : "#111827",
          border: `1px solid ${maintenanceOn ? "rgba(239,68,68,0.5)" : "rgba(245,158,11,0.3)"}`,
        }}
      >
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <BuildOutlinedIcon sx={{ color: maintenanceOn ? "#EF4444" : "#F59E0B" }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Maintenance Mode
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Flag key <code>{MAINTENANCE_KEY}</code> — gates the whole platform.
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              {maintBusy && <CircularProgress size={18} />}
              <Chip
                label={maintenanceOn ? "ON" : "OFF"}
                size="small"
                sx={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  bgcolor: maintenanceOn ? "rgba(239,68,68,0.18)" : "rgba(148,163,184,0.15)",
                  color: maintenanceOn ? "#EF4444" : "#94A3B8",
                }}
              />
              <Switch
                color="error"
                checked={maintenanceOn}
                disabled={maintBusy}
                onChange={(e) => toggleMaintenance(e.target.checked)}
              />
            </Stack>
          </Stack>
          {maintenanceOn && (
            <Alert
              icon={<WarningAmberOutlinedIcon />}
              severity="error"
              sx={{ mt: 2 }}
            >
              Maintenance mode is ON. The platform may be unavailable to users until this is disabled.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Flags table */}
      <Card sx={{ bgcolor: "#111827", border: "1px solid rgba(255,255,255,0.06)" }}>
        <CardContent>
          <Typography sx={{ ...overlineSx, mb: 2 }}>All Flags</Typography>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 1 }} />
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : flags.length === 0 ? (
            <Stack alignItems="center" spacing={1.5} sx={{ py: 8, opacity: 0.7 }}>
              <FlagOutlinedIcon sx={{ fontSize: 48, color: "text.secondary" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                No feature flags yet
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Create your first flag to start gating features.
              </Typography>
              <Button variant="outlined" startIcon={<AddOutlinedIcon />} onClick={openCreate}>
                New Flag
              </Button>
            </Stack>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {["Enabled", "Key", "Description", "Rollout %", "Actions"].map((h) => (
                      <TableCell
                        key={h}
                        sx={{ ...overlineSx, opacity: 0.5, borderColor: "rgba(255,255,255,0.08)" }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {flags.map((f) => {
                    const id = flagId(f);
                    const key = f.key ?? f.name ?? "—";
                    const isMaint = key === MAINTENANCE_KEY;
                    return (
                      <TableRow key={id || key} hover>
                        <TableCell sx={{ borderColor: "rgba(255,255,255,0.05)" }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Switch
                              size="small"
                              checked={Boolean(f.enabled)}
                              disabled={busyId === id}
                              onChange={(e) => toggleFlag(f, e.target.checked)}
                            />
                            {busyId === id && <CircularProgress size={14} />}
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ borderColor: "rgba(255,255,255,0.05)", whiteSpace: "nowrap" }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 700 }}>
                              {key}
                            </Typography>
                            {isMaint && (
                              <Chip
                                label="SYSTEM"
                                size="small"
                                sx={{
                                  fontFamily: "monospace",
                                  fontSize: "0.55rem",
                                  height: 18,
                                  bgcolor: "rgba(245,158,11,0.15)",
                                  color: "#F59E0B",
                                }}
                              />
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell
                          sx={{ borderColor: "rgba(255,255,255,0.05)", color: "text.secondary", maxWidth: 320 }}
                        >
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            {f.description || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderColor: "rgba(255,255,255,0.05)", width: 130 }}>
                          <TextField
                            size="small"
                            type="number"
                            defaultValue={rolloutOf(f)}
                            inputProps={{ min: 0, max: 100 }}
                            onBlur={(e) => {
                              const v = Number(e.target.value);
                              if (v !== rolloutOf(f)) saveRollout(f, v);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                            }}
                            sx={{ width: 90 }}
                          />
                        </TableCell>
                        <TableCell sx={{ borderColor: "rgba(255,255,255,0.05)", whiteSpace: "nowrap" }}>
                          <IconButton size="small" onClick={() => openEdit(f)} aria-label="edit">
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(f)}
                            disabled={busyId === id}
                            aria-label="delete"
                          >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
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

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>{editing ? "Edit Flag" : "New Feature Flag"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Key"
              fullWidth
              value={form.key}
              disabled={Boolean(editing)}
              onChange={(e) => setForm((s) => ({ ...s, key: e.target.value }))}
              placeholder="new_dashboard"
              helperText={editing ? "Key cannot be changed" : "Lowercase identifier, e.g. new_dashboard"}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={2}
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
            />
            <TextField
              label="Rollout Percentage"
              type="number"
              fullWidth
              inputProps={{ min: 0, max: 100 }}
              value={form.rolloutPercentage}
              onChange={(e) => setForm((s) => ({ ...s, rolloutPercentage: e.target.value }))}
            />
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2">Enabled</Typography>
              <Switch
                checked={form.enabled}
                onChange={(e) => setForm((s) => ({ ...s, enabled: e.target.checked }))}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button color="inherit" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {editing ? "Save" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

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
