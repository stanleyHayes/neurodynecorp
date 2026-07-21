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
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import { useAuth } from "@/context/AuthContext";

const overlineSx = {
  fontFamily: "monospace",
  fontSize: "0.7rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.25em",
  color: "text.secondary",
  opacity: 0.6,
};

interface FormState {
  id?: string;
  term: string;
  category: string;
  definition: string;
  aliases: string;
  status: "published" | "draft";
  order: number | string;
}

const emptyForm: FormState = {
  term: "",
  category: "",
  definition: "",
  aliases: "",
  status: "published",
  order: 0,
};

export default function Glossary() {
  const { api } = useAuth();
  const [terms, setTerms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: "success" | "error" }>({
    open: false,
    msg: "",
    severity: "success",
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.listAllGlossary();
      setTerms(res.items ?? []);
    } catch {
      setTerms([]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (t: any) => {
    setForm({
      id: t.id,
      term: t.term ?? "",
      category: t.category ?? "",
      definition: t.definition ?? "",
      aliases: Array.isArray(t.aliases) ? t.aliases.join(", ") : t.aliases ?? "",
      status: t.status === "draft" ? "draft" : "published",
      order: t.order ?? 0,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        term: form.term.trim(),
        category: form.category.trim() || undefined,
        definition: form.definition.trim(),
        aliases: form.aliases
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        status: form.status,
        order: Number(form.order) || 0,
      };
      if (form.id) {
        await api.updateGlossaryTerm(form.id, payload);
      } else {
        await api.createGlossaryTerm(payload);
      }
      setDialogOpen(false);
      setSnack({ open: true, msg: form.id ? "Term updated" : "Term created", severity: "success" });
      load();
    } catch (e) {
      setSnack({ open: true, msg: e instanceof Error ? e.message : "Failed to save term", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (t: any) => {
    if (!t.id || !window.confirm(`Delete "${t.term}"?`)) return;
    try {
      await api.deleteGlossaryTerm(t.id);
      setSnack({ open: true, msg: "Term deleted", severity: "success" });
      load();
    } catch {
      setSnack({ open: true, msg: "Failed to delete term", severity: "error" });
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack sx={{ justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }} direction="row" spacing={2}>
        <Box>
          <Typography sx={overlineSx}>CONTENT // GLOSSARY OF PRACTICE</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
            Glossary
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Define the firm's language. Published terms appear on the public glossary page.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={openCreate} sx={{ flexShrink: 0 }}>
          New Term
        </Button>
      </Stack>

      <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.08)" }} />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : terms.length === 0 ? (
        <Card sx={{ bgcolor: "background.paper", textAlign: "center", py: 8 }}>
          <CardContent>
            <MenuBookOutlinedIcon sx={{ fontSize: 48, color: "text.secondary", opacity: 0.4, mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              No terms yet
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5, mb: 2 }}>
              Add the first term to start the glossary.
            </Typography>
            <Button variant="outlined" startIcon={<AddOutlinedIcon />} onClick={openCreate}>
              New Term
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {terms.map((t, i) => {
            const isDraft = t.status === "draft";
            const aliases: string[] = Array.isArray(t.aliases) ? t.aliases : [];
            return (
              <Card key={t.id ?? i} sx={{ bgcolor: "background.paper" }}>
                <CardContent>
                  <Stack sx={{ justifyContent: "space-between", alignItems: "flex-start" }} direction="row" spacing={2}>
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {t.term || "Untitled"}
                        </Typography>
                        <Chip
                          label={isDraft ? "Draft" : "Published"}
                          size="small"
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "0.6rem",
                            bgcolor: isDraft ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)",
                            color: isDraft ? "#F59E0B" : "#10B981",
                            border: `1px solid ${isDraft ? "#F59E0B" : "#10B981"}30`,
                          }}
                        />
                        {t.category && (
                          <Chip label={t.category} size="small" variant="outlined" sx={{ fontSize: "0.6rem" }} />
                        )}
                      </Stack>
                      <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                        {t.definition}
                      </Typography>
                      {aliases.length > 0 && (
                        <Typography sx={{ ...overlineSx, fontSize: "0.6rem", mt: 1, letterSpacing: "0.08em" }}>
                          Also: {aliases.join(", ")}
                        </Typography>
                      )}
                    </Box>
                    <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                      <IconButton size="small" onClick={() => openEdit(t)} aria-label="edit">
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(t)} aria-label="delete" sx={{ color: "#EF4444" }}>
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 700 }}>{form.id ? "Edit Term" : "New Term"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Term"
              value={form.term}
              onChange={(e) => setForm((f) => ({ ...f, term: e.target.value }))}
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                fullWidth
                helperText="Optional grouping, e.g. Methodology"
              />
              <Select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as FormState["status"] }))}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="published">Published</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
              </Select>
              <TextField
                label="Order"
                type="number"
                value={form.order}
                onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
                sx={{ width: { xs: "100%", sm: 120 } }}
              />
            </Stack>
            <TextField
              label="Definition"
              value={form.definition}
              onChange={(e) => setForm((f) => ({ ...f, definition: e.target.value }))}
              fullWidth
              multiline
              minRows={5}
            />
            <TextField
              label="Aliases (comma separated)"
              value={form.aliases}
              onChange={(e) => setForm((f) => ({ ...f, aliases: e.target.value }))}
              fullWidth
              helperText="Alternative names or acronyms that should match in search"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saving || !form.term.trim() || !form.definition.trim()}>
            {saving ? "Saving..." : form.id ? "Save Changes" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} variant="filled">
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
