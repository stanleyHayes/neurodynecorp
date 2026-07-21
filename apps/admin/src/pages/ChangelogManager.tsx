import { useState, useEffect, useCallback } from "react";
import {
  Box,
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
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import { useAuth } from "@/context/AuthContext";

const overline = {
  fontFamily: "monospace",
  fontSize: "0.7rem",
  textTransform: "uppercase",
  letterSpacing: "0.25em",
  color: "text.secondary",
  opacity: 0.6,
} as const;

const CATEGORIES = [
  { value: "feature", label: "Feature", color: "#6C63FF" },
  { value: "fix", label: "Fix", color: "#EF4444" },
  { value: "improvement", label: "Improvement", color: "#00D4AA" },
  { value: "security", label: "Security", color: "#F59E0B" },
];

function categoryMeta(value: string) {
  return CATEGORIES.find((c) => c.value === value) ?? { value, label: value, color: "#94A3B8" };
}

function asArray(res: any): any[] {
  if (Array.isArray(res)) return res;
  return res?.items ?? res?.data ?? res?.entries ?? res?.changelog ?? [];
}

function fmtDate(s?: string) {
  if (!s) return "";
  try {
    return new Date(s).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return s;
  }
}

type FormState = {
  version: string;
  title: string;
  body: string;
  category: string;
  published: boolean;
};

const EMPTY_FORM: FormState = {
  version: "",
  title: "",
  body: "",
  category: "feature",
  published: false,
};

export default function ChangelogManager() {
  const { api } = useAuth();

  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ msg: string; sev: "success" | "error" } | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/api/v1/changelog/all");
      setEntries(asArray(res));
    } catch (err: any) {
      setError(err?.message ?? "Failed to load changelog");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const notify = (msg: string, sev: "success" | "error") => setToast({ msg, sev });

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (entry: any) => {
    setEditingId(entry.id ?? entry._id);
    setForm({
      version: entry.version ?? "",
      title: entry.title ?? "",
      body: entry.body ?? "",
      category: entry.category ?? "feature",
      published: Boolean(entry.published),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.version.trim() || !form.title.trim()) return;
    const payload = {
      version: form.version.trim(),
      title: form.title.trim(),
      body: form.body,
      category: form.category,
      published: form.published,
    };
    try {
      setSaving(true);
      if (editingId) {
        await api.patch(`/api/v1/changelog/${editingId}`, payload);
        notify("Entry updated", "success");
      } else {
        await api.post("/api/v1/changelog", payload);
        notify("Entry created", "success");
      }
      setDialogOpen(false);
      await load();
    } catch (err: any) {
      notify(err?.message ?? "Failed to save entry", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublished = async (entry: any) => {
    const id = entry.id ?? entry._id;
    const next = !entry.published;
    setEntries((prev) => prev.map((e) => ((e.id ?? e._id) === id ? { ...e, published: next } : e)));
    try {
      await api.patch(`/api/v1/changelog/${id}`, { published: next });
      notify(next ? "Published" : "Unpublished", "success");
    } catch (err: any) {
      notify(err?.message ?? "Failed to update", "error");
      await load();
    }
  };

  const handleDelete = async (entry: any) => {
    const id = entry.id ?? entry._id;
    try {
      await api.del(`/api/v1/changelog/${id}`);
      setEntries((prev) => prev.filter((e) => (e.id ?? e._id) !== id));
      notify("Entry deleted", "success");
    } catch (err: any) {
      notify(err?.message ?? "Failed to delete", "error");
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ px: { xs: 2, md: 3 }, pt: { xs: 2, md: 3 }, pb: 1 }}>
        <Typography sx={overline}>PRODUCT // CHANGELOG</Typography>
        <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
          Changelog Manager
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.7, mt: 0.5 }}>
          Author and publish release notes shown on the public changelog.
        </Typography>
      </Box>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography sx={overline}>ALL ENTRIES</Typography>
          <Stack sx={{ alignItems: "center" }} direction="row" spacing={1}>
            <IconButton size="small" onClick={load} sx={{ color: "text.secondary" }}>
              <RefreshOutlinedIcon fontSize="small" />
            </IconButton>
            <Button variant="contained" size="small" startIcon={<AddOutlinedIcon />} onClick={openCreate}>
              New Entry
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={load}>Retry</Button>}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : entries.length === 0 ? (
          <Card variant="outlined" sx={{ bgcolor: "#111827" }}>
            <CardContent sx={{ textAlign: "center", py: 6 }}>
              <HistoryOutlinedIcon sx={{ fontSize: 44, color: "text.secondary", opacity: 0.4, mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                No changelog entries yet
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.7, mt: 0.5, mb: 2 }}>
                Document your first release to keep users informed of what's new.
              </Typography>
              <Button variant="outlined" startIcon={<AddOutlinedIcon />} onClick={openCreate}>
                New Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={1.5}>
            {entries.map((entry) => {
              const meta = categoryMeta(entry.category);
              const published = Boolean(entry.published);
              return (
                <Card key={entry.id ?? entry._id} variant="outlined" sx={{ bgcolor: "#111827" }}>
                  <CardContent>
                    <Stack sx={{ justifyContent: "space-between", alignItems: { sm: "flex-start" } }} direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                      <Box sx={{ minWidth: 0 }}>
                        <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap", mb: 0.5 }}>
                          <Chip
                            label={entry.version}
                            size="small"
                            sx={{ fontFamily: "monospace", fontSize: "0.6rem", bgcolor: "rgba(108,99,255,0.12)", color: "#6C63FF", border: "1px solid rgba(108,99,255,0.3)" }}
                          />
                          <Chip
                            label={meta.label}
                            size="small"
                            sx={{ fontFamily: "monospace", fontSize: "0.6rem", bgcolor: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}30` }}
                          />
                          {!published && (
                            <Chip
                              label="DRAFT"
                              size="small"
                              sx={{ fontFamily: "monospace", fontSize: "0.55rem", bgcolor: "rgba(148,163,184,0.12)", color: "#94A3B8", border: "1px solid rgba(148,163,184,0.3)" }}
                            />
                          )}
                          <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5 }}>
                            {fmtDate(entry.createdAt ?? entry.created_at ?? entry.date)}
                          </Typography>
                        </Stack>
                        <Typography sx={{ fontWeight: 700 }}>{entry.title}</Typography>
                        {entry.body && (
                          <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.75, mt: 0.5, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                            {entry.body}
                          </Typography>
                        )}
                      </Box>

                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", flexShrink: 0 }}>
                        <Stack sx={{ alignItems: "center", mr: 0.5 }}>
                          <Switch size="small" checked={published} onChange={() => handleTogglePublished(entry)} />
                          <Typography sx={{ fontFamily: "monospace", fontSize: "0.5rem", letterSpacing: "0.1em", color: "text.secondary", opacity: 0.6 }}>
                            {published ? "LIVE" : "DRAFT"}
                          </Typography>
                        </Stack>
                        <IconButton size="small" onClick={() => openEdit(entry)} sx={{ color: "#6C63FF" }}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(entry)} sx={{ color: "#EF4444" }}>
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

      {/* Create / edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? "Edit Entry" : "New Entry"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Version"
                placeholder="v1.2.0"
                value={form.version}
                onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))}
                sx={{ minWidth: { sm: 160 } }}
              />
              <Select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                fullWidth
                size="medium"
              >
                {CATEGORIES.map((c) => (
                  <MenuItem key={c.value} value={c.value}>
                    {c.label}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
            <TextField
              label="Title"
              fullWidth
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <TextField
              label="Body"
              fullWidth
              multiline
              minRows={5}
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            />
            <Divider sx={{ borderColor: "rgba(108,99,255,0.12)" }} />
            <Stack sx={{ alignItems: "center", justifyContent: "space-between" }} direction="row">
              <Box>
                <Typography sx={{ fontWeight: 600 }}>Published</Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.7 }}>
                  Visible on the public changelog
                </Typography>
              </Box>
              <Switch
                checked={form.published}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !form.version.trim() || !form.title.trim()}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {editingId ? "Save Changes" : "Create"}
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
