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
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbDownOutlinedIcon from "@mui/icons-material/ThumbDownOutlined";
import { useAuth } from "@/context/AuthContext";

const overlineSx = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "0.7rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.25em",
  color: "text.secondary",
  opacity: 0.6,
};

interface FormState {
  id?: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  tags: string;
  status: "published" | "draft";
  order: number | string;
}

const emptyForm: FormState = {
  title: "",
  category: "",
  summary: "",
  body: "",
  tags: "",
  status: "published",
  order: 0,
};

function asList(res: any): any[] {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.items)) return res.items;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

export default function KnowledgeBase() {
  const { api } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
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
      // pass status param to also fetch drafts (not just published)
      const res: any = await api.get("/api/v1/help", { status: "all" });
      setArticles(asList(res));
    } catch {
      setArticles([]);
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

  const openEdit = (a: any) => {
    setForm({
      id: a.id ?? a._id,
      title: a.title ?? "",
      category: a.category ?? "",
      summary: a.summary ?? "",
      body: a.body ?? "",
      tags: Array.isArray(a.tags) ? a.tags.join(", ") : a.tags ?? "",
      status: a.status === "draft" ? "draft" : "published",
      order: a.order ?? 0,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        title: form.title,
        category: form.category,
        summary: form.summary,
        body: form.body,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        status: form.status,
        order: Number(form.order) || 0,
      };
      if (form.id) {
        await api.patch(`/api/v1/help/${form.id}`, payload);
      } else {
        await api.post("/api/v1/help", payload);
      }
      setDialogOpen(false);
      setSnack({ open: true, msg: form.id ? "Article updated" : "Article created", severity: "success" });
      load();
    } catch {
      setSnack({ open: true, msg: "Failed to save article", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (a: any) => {
    const id = a.id ?? a._id;
    if (!id || !window.confirm(`Delete "${a.title}"?`)) return;
    try {
      await api.del(`/api/v1/help/${id}`);
      setSnack({ open: true, msg: "Article deleted", severity: "success" });
      load();
    } catch {
      setSnack({ open: true, msg: "Failed to delete article", severity: "error" });
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack sx={{ justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }} direction="row" spacing={2}>
        <Box>
          <Typography sx={overlineSx}>CONTENT // KNOWLEDGE BASE</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
            Knowledge Base
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Author and manage help articles shown to clients across the platform.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={openCreate} sx={{ flexShrink: 0 }}>
          New Article
        </Button>
      </Stack>

      <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.08)" }} />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : articles.length === 0 ? (
        <Card sx={{ bgcolor: "background.paper", textAlign: "center", py: 8 }}>
          <CardContent>
            <MenuBookOutlinedIcon sx={{ fontSize: 48, color: "text.secondary", opacity: 0.4, mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              No articles yet
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5, mb: 2 }}>
              Create your first help article to get started.
            </Typography>
            <Button variant="outlined" startIcon={<AddOutlinedIcon />} onClick={openCreate}>
              New Article
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {articles.map((a, i) => {
            const id = a.id ?? a._id ?? i;
            const isDraft = a.status === "draft";
            const tags: string[] = Array.isArray(a.tags) ? a.tags : a.tags ? String(a.tags).split(",").map((t: string) => t.trim()) : [];
            return (
              <Card key={id} sx={{ bgcolor: "background.paper" }}>
                <CardContent>
                  <Stack sx={{ justifyContent: "space-between", alignItems: "flex-start" }} direction="row" spacing={2}>
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {a.title || "Untitled"}
                        </Typography>
                        <Chip
                          label={isDraft ? "Draft" : "Published"}
                          size="small"
                          sx={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: "0.6rem",
                            bgcolor: isDraft ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)",
                            color: isDraft ? "#F59E0B" : "#10B981",
                            border: `1px solid ${isDraft ? "#F59E0B" : "#10B981"}30`,
                          }}
                        />
                      </Stack>
                      {a.category && (
                        <Typography sx={{ ...overlineSx, fontSize: "0.6rem", mb: 0.5 }}>{a.category}</Typography>
                      )}
                      {a.summary && (
                        <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
                          {a.summary}
                        </Typography>
                      )}
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", mt: 1.5 }}>
                        {tags.map((t) => (
                          <Chip
                            key={t}
                            label={t}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.65rem", borderColor: "rgba(108,99,255,0.3)", color: "text.secondary" }}
                          />
                        ))}
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", color: "#10B981" }}>
                          <ThumbUpOutlinedIcon sx={{ fontSize: 14 }} />
                          <Typography variant="caption">{a.helpfulYes ?? a.helpful_yes ?? 0}</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", color: "#EF4444" }}>
                          <ThumbDownOutlinedIcon sx={{ fontSize: 14 }} />
                          <Typography variant="caption">{a.helpfulNo ?? a.helpful_no ?? 0}</Typography>
                        </Stack>
                        <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.6 }}>
                          order {a.order ?? 0}
                        </Typography>
                      </Stack>
                    </Box>
                    <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                      <IconButton size="small" onClick={() => openEdit(a)} aria-label="edit">
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(a)} aria-label="delete" sx={{ color: "#EF4444" }}>
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
        <DialogTitle sx={{ fontWeight: 700 }}>{form.id ? "Edit Article" : "New Article"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                fullWidth
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
              label="Summary"
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Body"
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              fullWidth
              multiline
              minRows={6}
            />
            <TextField
              label="Tags (comma separated)"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              fullWidth
              helperText="e.g. billing, account, getting-started"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saving || !form.title.trim()}>
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
