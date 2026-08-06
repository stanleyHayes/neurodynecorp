import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import {
  Box,
  Typography,
  Chip,
  Stack,
  Alert,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
} from "@mui/material";
import { useParams, useNavigate } from "react-router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import PageSkeleton from "@/components/shared/PageSkeleton";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";
import { useAuth } from "@/context/AuthContext";

const MarkdownEditor = lazy(() => import("@/components/shared/MarkdownEditor"));

const statusColor: Record<string, string> = {
  published: "#10B981",
  draft: "#F59E0B",
  archived: "#94A3B8",
};

const CATEGORIES = ["Engineering", "AI/ML", "Tutorial", "Thought Leadership"];

const inputSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "rgba(108, 99, 255, 0.04)",
    "& fieldset": { borderColor: "rgba(108,99,255,0.15)" },
    "&:hover fieldset": { borderColor: "rgba(108,99,255,0.3)" },
    "&.Mui-focused fieldset": { borderColor: "#6C63FF" },
  },
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Engineering");
  const [readTime, setReadTime] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft");

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getBlogPost(id);
      setPost(data);
      setTitle(data.title ?? "");
      setExcerpt(data.excerpt ?? "");
      setCategory(data.category ?? "Engineering");
      setReadTime(data.readTime ?? data.read_time ?? "");
      setContent(data.content ?? "");
      setStatus(data.status ?? "draft");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load blog post");
    } finally {
      setLoading(false);
    }
  }, [api, id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (nextStatus?: string) => {
    if (!id || !title.trim() || !excerpt.trim() || !content.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      const updated = await api.updateBlogPost(id, {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        category,
        readTime: readTime.trim() || "5 min",
        status: nextStatus ?? status,
      });
      setPost(updated);
      setStatus(updated.status ?? nextStatus ?? status);
      setEditing(false);
    } catch (err: any) {
      setSaveError(err?.message ?? "Failed to update blog post");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageSkeleton stats={3} rows={4} />;

  if (error || !post) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Typography variant="h5" color="text.secondary">Post not found</Typography>
        )}
      </Box>
    );
  }

  const color = post.color ?? statusColor[status] ?? "#6C63FF";
  const canSave = Boolean(title.trim() && excerpt.trim() && content.trim()) && !saving;

  return (
    <Box>
      <Box
        onClick={() => navigate("/blog")}
        sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 3, py: 1.5, cursor: "pointer", color: "text.secondary", "&:hover": { color: "#6C63FF" }, transition: "color 0.2s" }}
      >
        <ArrowBackIcon sx={{ fontSize: 18 }} />
        <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem", letterSpacing: "0.1em" }}>BACK TO BLOG</Typography>
      </Box>

      <PageBanner
        icon={<ArticleOutlinedIcon />}
        title={editing ? "Edit Blog Post" : post.title}
        description={editing ? "Update content, then save or publish." : post.excerpt}
        tag={`CONTENT // ${(category ?? "").toUpperCase()}`}
        accentWord={category}
        iconColor={color}
        iconLabel={(status ?? "POST").toUpperCase()}
      />

      <Box sx={{ px: 3, pb: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
        {!editing && (
          <Button variant="outlined" size="small" onClick={() => setEditing(true)}>
            Edit
          </Button>
        )}
        {editing && (
          <>
            <Button variant="outlined" size="small" onClick={() => { setEditing(false); void load(); }} disabled={saving}>
              Cancel
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={saving ? <CircularProgress size={14} /> : <SaveOutlinedIcon />}
              disabled={!canSave}
              onClick={() => void handleSave("draft")}
            >
              Save draft
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <PublishOutlinedIcon />}
              disabled={!canSave}
              onClick={() => void handleSave("published")}
            >
              Publish
            </Button>
          </>
        )}
        {!editing && status !== "published" && (
          <Button
            variant="contained"
            size="small"
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <PublishOutlinedIcon />}
            disabled={saving}
            onClick={() => void handleSave("published")}
          >
            Publish
          </Button>
        )}
        {!editing && status === "published" && (
          <Button
            variant="outlined"
            size="small"
            disabled={saving}
            onClick={() => void handleSave("archived")}
          >
            Archive
          </Button>
        )}
      </Box>

      {saveError && (
        <Alert severity="error" sx={{ mx: 3, mb: 2 }} onClose={() => setSaveError("")}>
          {saveError}
        </Alert>
      )}

      {!editing ? (
        <>
          <SectionLabel>Post Info</SectionLabel>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" } }}>
            <Cell color={color} index="00" colInRow={0} totalCols={4} animDelay={0} minH={100}>
              <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6, mb: 0.5 }}>Author</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{post.author}</Typography>
            </Cell>
            <Cell color={color} index="01" colInRow={1} totalCols={4} animDelay={0.1} minH={100}>
              <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6, mb: 0.5 }}>Date</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {post.createdAt ? new Date(post.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"}
              </Typography>
            </Cell>
            <Cell color={color} index="02" colInRow={2} totalCols={4} animDelay={0.2} minH={100}>
              <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6, mb: 0.5 }}>Read Time</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{post.readTime ?? post.read_time ?? "—"}</Typography>
            </Cell>
            <Cell color={statusColor[status] ?? color} index="03" colInRow={3} totalCols={4} animDelay={0.3} minH={100}>
              <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6, mb: 0.5 }}>Status</Typography>
              <Chip label={capitalize(status)} size="small" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", bgcolor: `${statusColor[status] ?? color}18`, color: statusColor[status] ?? color, border: `1px solid ${statusColor[status] ?? color}30` }} />
            </Cell>
          </Box>

          {post.tags?.length > 0 && (
            <>
              <SectionLabel>Tags</SectionLabel>
              <Cell color={color} index="04" animDelay={0.35}>
                <Stack sx={{ flexWrap: "wrap" }} direction="row" spacing={1}>
                  {post.tags.map((tag: string) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem" }} />
                  ))}
                </Stack>
              </Cell>
            </>
          )}

          <SectionLabel>Content</SectionLabel>
          <Cell color={color} index="05" animDelay={0.4}>
            <MarkdownRenderer content={post.content ?? ""} color={color} />
          </Cell>
        </>
      ) : (
        <>
          <SectionLabel>Edit Post</SectionLabel>
          <Cell color={color} index="10" animDelay={0.1}>
            <Stack spacing={2}>
              <TextField fullWidth label="Title" value={title} onChange={(e) => setTitle(e.target.value)} sx={inputSx} />
              <TextField fullWidth label="Excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} multiline minRows={2} sx={inputSx} />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField select fullWidth label="Category" value={category} onChange={(e) => setCategory(e.target.value)} sx={inputSx}>
                  {CATEGORIES.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </TextField>
                <TextField fullWidth label="Read time" value={readTime} onChange={(e) => setReadTime(e.target.value)} placeholder="5 min" sx={inputSx} />
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant={tab === "edit" ? "contained" : "outlined"}
                  startIcon={<SaveOutlinedIcon />}
                  onClick={() => setTab("edit")}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  variant={tab === "preview" ? "contained" : "outlined"}
                  startIcon={<VisibilityOutlinedIcon />}
                  onClick={() => setTab("preview")}
                >
                  Preview
                </Button>
              </Stack>
              {tab === "edit" ? (
                <Suspense fallback={<CircularProgress size={24} />}>
                  <MarkdownEditor value={content} onChange={setContent} />
                </Suspense>
              ) : (
                <MarkdownRenderer content={content} color={color} />
              )}
            </Stack>
          </Cell>
        </>
      )}
    </Box>
  );
}
