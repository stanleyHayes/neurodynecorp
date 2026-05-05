import { useState, lazy, Suspense } from "react";
import { Box, Typography, TextField, MenuItem, Stack, Button, Chip, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import MarkdownRenderer from "@/components/shared/MarkdownRenderer";

const MarkdownEditor = lazy(() => import("@/components/shared/MarkdownEditor"));

const BORDER = "rgba(108, 99, 255, 0.12)";

const CATEGORIES = ["Engineering", "AI/ML", "Tutorial", "Thought Leadership"];
const COLORS = [
  { label: "Purple", value: "#6C63FF" },
  { label: "Teal", value: "#00D4AA" },
  { label: "Lavender", value: "#8B85FF" },
  { label: "Mint", value: "#33DDBB" },
  { label: "Amber", value: "#F59E0B" },
  { label: "Violet", value: "#8B5CF6" },
];

const inputSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "rgba(108, 99, 255, 0.04)",
    "& fieldset": { borderColor: "rgba(108,99,255,0.15)" },
    "&:hover fieldset": { borderColor: "rgba(108,99,255,0.3)" },
    "&.Mui-focused fieldset": { borderColor: "#6C63FF" },
  },
};

export default function BlogCreate() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Engineering");
  const [color, setColor] = useState("#6C63FF");
  const [readTime, setReadTime] = useState("");
  const [content, setContent] = useState("");

  const canSubmit = title.trim() && excerpt.trim() && content.trim();

  return (
    <Box>
      <Box
        onClick={() => navigate("/blog")}
        sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 3, py: 1.5, cursor: "pointer", color: "text.secondary", "&:hover": { color: "#6C63FF" }, transition: "color 0.2s" }}
      >
        <ArrowBackIcon sx={{ fontSize: 18 }} />
        <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.1em" }}>BACK TO BLOG</Typography>
      </Box>

      <PageBanner
        icon={<EditNoteOutlinedIcon />}
        title="New Blog Post"
        description="Write and preview your blog post with full markdown support."
        tag="CONTENT // NEW POST"
        accentWord="New"
        iconColor="#6C63FF"
        iconLabel="EDITOR"
      />

      {/* Meta fields */}
      <SectionLabel>Post Details</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        <Cell color="#6C63FF" index="00" colInRow={0} totalCols={2} animDelay={0}>
          <Stack spacing={2}>
            <TextField fullWidth size="small" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} sx={inputSx} />
            <TextField fullWidth size="small" label="Excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} multiline rows={2} sx={inputSx} />
          </Stack>
        </Cell>
        <Cell color="#00D4AA" index="01" colInRow={1} totalCols={2} animDelay={0.1}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <TextField select fullWidth size="small" label="Category" value={category} onChange={(e) => setCategory(e.target.value)} sx={inputSx}>
                {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
              <TextField fullWidth size="small" label="Read Time" placeholder="8 min" value={readTime} onChange={(e) => setReadTime(e.target.value)} sx={inputSx} />
            </Stack>
            <TextField select fullWidth size="small" label="Accent Color" value={color} onChange={(e) => setColor(e.target.value)} sx={inputSx}>
              {COLORS.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: c.value }} />
                    <span>{c.label}</span>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Cell>
      </Box>

      {/* Editor / Preview tabs */}
      <Box sx={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${BORDER}`, px: 3 }}>
        <Stack direction="row" spacing={0}>
          {(["edit", "preview"] as const).map((t) => (
            <Button
              key={t}
              onClick={() => setTab(t)}
              startIcon={t === "edit" ? <EditNoteOutlinedIcon /> : <VisibilityOutlinedIcon />}
              sx={{
                fontFamily: "monospace",
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                borderRadius: 0,
                px: 3,
                py: 1.5,
                color: tab === t ? "#6C63FF" : "text.secondary",
                borderBottom: tab === t ? "2px solid #6C63FF" : "2px solid transparent",
                opacity: tab === t ? 1 : 0.5,
                "&:hover": { bgcolor: "rgba(108,99,255,0.04)" },
              }}
            >
              {t}
            </Button>
          ))}
        </Stack>

        <Box sx={{ flex: 1 }} />

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate("/blog")}
            sx={{
              fontFamily: "monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              borderColor: "rgba(108,99,255,0.2)",
              color: "text.secondary",
              "&:hover": { borderColor: "rgba(108,99,255,0.4)" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SaveOutlinedIcon />}
            disabled={!canSubmit}
            sx={{
              fontFamily: "monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              borderColor: "#F59E0B40",
              color: "#F59E0B",
              "&:hover": { borderColor: "#F59E0B", bgcolor: "#F59E0B08" },
              "&.Mui-disabled": { borderColor: "rgba(108,99,255,0.1)", color: "text.secondary", opacity: 0.3 },
            }}
          >
            Save Draft
          </Button>
          <Button
            variant="outlined"
            size="small"
            disabled={!canSubmit}
            sx={{
              fontFamily: "monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.1em",
              borderColor: "#10B98140",
              color: "#10B981",
              "&:hover": { borderColor: "#10B981", bgcolor: "#10B98108" },
              "&.Mui-disabled": { borderColor: "rgba(108,99,255,0.1)", color: "text.secondary", opacity: 0.3 },
            }}
          >
            Publish
          </Button>
        </Stack>
      </Box>

      {/* Edit pane */}
      {tab === "edit" && (
        <Suspense fallback={
          <Cell color="#6C63FF" index="02" animDelay={0}>
            <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
              <CircularProgress size={28} sx={{ color: "#6C63FF" }} />
              <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "text.secondary", opacity: 0.5 }}>Loading editor...</Typography>
            </Stack>
          </Cell>
        }>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="Start writing your blog post... Use the toolbar above for formatting, or type markdown shortcuts like ## for headings."
          />
        </Suspense>
      )}

      {/* Preview pane */}
      {tab === "preview" && (
        <Box>
          <Cell color={color} index="P0" animDelay={0}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
              <Chip label={category} size="small" variant="outlined" sx={{ fontFamily: "monospace", fontSize: "0.6rem" }} />
              {readTime && (
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5 }}>{readTime}</Typography>
              )}
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: "-0.02em" }}>
              {title || "Untitled Post"}
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary", opacity: 0.7 }}>
              {excerpt || "No excerpt provided."}
            </Typography>
          </Cell>

          <Cell color={color} index="P1" animDelay={0.05}>
            <MarkdownRenderer content={content} color={color} />
          </Cell>
        </Box>
      )}
    </Box>
  );
}
