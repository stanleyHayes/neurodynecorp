import { useState } from "react";
import { Box, Typography, TextField, MenuItem, Stack, Button, Chip, IconButton, Alert } from "@mui/material";
import { useNavigate } from "react-router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CloseIcon from "@mui/icons-material/Close";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import { useAuth } from "@/context/AuthContext";

const BORDER = "rgba(108, 99, 255, 0.12)";

const CATEGORIES = ["Fintech", "Healthcare", "Supply Chain", "Analytics", "Education", "IoT", "Real Estate", "CleanTech"];
const SECTORS = ["Government", "Health", "Financial Services", "Insurance", "Retail / Commerce", "Energy", "Education", "NGO / Development", "Proptech / Housing"];
const SERVICE_LINES = ["Audit & Architecture", "Enterprise & Government", "AI & Automation", "Web & Digital Platforms", "Healthcare Technology", "Fintech & Payments", "Strategy & Advisory"];
const SCALES = ["Pilot", "Growth", "Enterprise", "National"];
const STAGES = ["Discovery", "In Development", "QA", "Approved", "Delivered"];
const COLORS = [
  { label: "Purple", value: "#6C63FF" },
  { label: "Teal", value: "#00D4AA" },
  { label: "Lavender", value: "#8B85FF" },
  { label: "Amber", value: "#F59E0B" },
  { label: "Violet", value: "#8B5CF6" },
];

/** Split a multiline textarea into a trimmed, non-empty string array. */
const toLines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
/** Derive a kebab-case slug from a title. */
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const inputSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "rgba(108, 99, 255, 0.04)",
    "& fieldset": { borderColor: "rgba(108,99,255,0.15)" },
    "&:hover fieldset": { borderColor: "rgba(108,99,255,0.3)" },
    "&.Mui-focused fieldset": { borderColor: "#6C63FF" },
  },
};

const btnSx = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "0.65rem",
  letterSpacing: "0.1em",
};

export default function PortfolioCreate() {
  const navigate = useNavigate();
  const { api } = useAuth();

  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [category, setCategory] = useState("Fintech");
  const [description, setDescription] = useState("");
  const [impact, setImpact] = useState("");
  const [color, setColor] = useState("#6C63FF");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Case Dossier fields (spec §5.6)
  const [sector, setSector] = useState("");
  const [serviceLine, setServiceLine] = useState("");
  const [scale, setScale] = useState("");
  const [stage, setStage] = useState("");
  const [brief, setBrief] = useState("");
  const [architecture, setArchitecture] = useState("");
  const [shipped, setShipped] = useState("");
  const [retained, setRetained] = useState("");
  const [learnt, setLearnt] = useState("");
  const [constraintInput, setConstraintInput] = useState("");
  const [constraints, setConstraints] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const addConstraint = () => {
    const c = constraintInput.trim();
    if (c && !constraints.includes(c)) {
      setConstraints([...constraints, c]);
      setConstraintInput("");
    }
  };

  const removeConstraint = (c: string) => setConstraints(constraints.filter((x) => x !== c));

  const canSubmit = Boolean(title.trim() && client.trim() && description.trim()) && !saving;

  const handleSave = async (status: "draft" | "published") => {
    if (!canSubmit) return;
    setSaving(true);
    setError("");
    const shippedLines = toLines(shipped);
    const retainedLines = toLines(retained);
    const learntLines = toLines(learnt);
    try {
      await api.createCaseStudy({
        title: title.trim(),
        slug: slugify(title),
        client: client.trim(),
        category,
        description: description.trim(),
        impact: impact.trim(),
        color,
        tags,
        results: [],
        sector: sector || undefined,
        serviceLine: serviceLine || undefined,
        scale: scale || undefined,
        stage: stage || undefined,
        brief: brief.trim() || undefined,
        constraints: constraints.length ? constraints : undefined,
        architecture: architecture.trim() || undefined,
        shipped: shippedLines.length ? shippedLines : undefined,
        retained: retainedLines.length ? retainedLines : undefined,
        learnt: learntLines.length ? learntLines : undefined,
        status,
      });
      navigate("/portfolio");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save case study");
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box
        onClick={() => navigate("/portfolio")}
        sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 3, py: 1.5, cursor: "pointer", color: "text.secondary", "&:hover": { color: "#6C63FF" }, transition: "color 0.2s" }}
      >
        <ArrowBackIcon sx={{ fontSize: 18 }} />
        <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem", letterSpacing: "0.1em" }}>BACK TO PORTFOLIO</Typography>
      </Box>

      <PageBanner
        icon={<WorkOutlineOutlinedIcon />}
        title="New Case Study"
        description="Add a new project showcase to the public portfolio."
        tag="CONTENT // NEW CASE STUDY"
        accentWord="New"
        iconColor="#6C63FF"
        iconLabel="PORTFOLIO"
      />

      {/* Action bar */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", px: 3, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" onClick={() => navigate("/portfolio")} sx={{ ...btnSx, borderColor: "rgba(108,99,255,0.2)", color: "text.secondary", "&:hover": { borderColor: "rgba(108,99,255,0.4)" } }}>
            Cancel
          </Button>
          <Button variant="outlined" size="small" startIcon={<SaveOutlinedIcon />} disabled={!canSubmit} onClick={() => handleSave("draft")} sx={{ ...btnSx, borderColor: "#F59E0B40", color: "#F59E0B", "&:hover": { borderColor: "#F59E0B", bgcolor: "#F59E0B08" }, "&.Mui-disabled": { borderColor: "rgba(108,99,255,0.1)", color: "text.secondary", opacity: 0.3 } }}>
            {saving ? "Saving…" : "Save Draft"}
          </Button>
          <Button variant="outlined" size="small" disabled={!canSubmit} onClick={() => handleSave("published")} sx={{ ...btnSx, borderColor: "#10B98140", color: "#10B981", "&:hover": { borderColor: "#10B981", bgcolor: "#10B98108" }, "&.Mui-disabled": { borderColor: "rgba(108,99,255,0.1)", color: "text.secondary", opacity: 0.3 } }}>
            Publish
          </Button>
        </Stack>
      </Box>

      {error && (
        <Box sx={{ px: 3, pt: 2 }}>
          <Alert severity="error" onClose={() => setError("")}>{error}</Alert>
        </Box>
      )}

      {/* Form fields */}
      <SectionLabel>Case Study Details</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        <Cell color="#6C63FF" index="00" colInRow={0} totalCols={2} animDelay={0}>
          <Stack spacing={2}>
            <TextField fullWidth size="small" label="Project Title" value={title} onChange={(e) => setTitle(e.target.value)} sx={inputSx} />
            <TextField fullWidth size="small" label="Client Name" value={client} onChange={(e) => setClient(e.target.value)} sx={inputSx} />
            <TextField select fullWidth size="small" label="Industry" value={category} onChange={(e) => setCategory(e.target.value)} sx={inputSx}>
              {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
          </Stack>
        </Cell>
        <Cell color="#00D4AA" index="01" colInRow={1} totalCols={2} animDelay={0.1}>
          <Stack spacing={2}>
            <TextField fullWidth size="small" label="Impact Metric" placeholder="e.g. 50K+ users, 3x faster" value={impact} onChange={(e) => setImpact(e.target.value)} sx={inputSx} />
            <TextField select fullWidth size="small" label="Accent Color" value={color} onChange={(e) => setColor(e.target.value)} sx={inputSx}>
              {COLORS.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  <Stack sx={{ alignItems: "center" }} direction="row" spacing={1}>
                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: c.value }} />
                    <span>{c.label}</span>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
            <Box>
              <Stack sx={{ alignItems: "center" }} direction="row" spacing={1}>
                <TextField
                  size="small"
                  label="Tech Tags"
                  placeholder="React, Go..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  sx={{ ...inputSx, flex: 1 }}
                />
                <IconButton size="small" onClick={addTag} sx={{ color: "#6C63FF" }}><AddOutlinedIcon /></IconButton>
              </Stack>
              {tags.length > 0 && (
                <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: "wrap", gap: 0.5 }}>
                  {tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      onDelete={() => removeTag(tag)}
                      deleteIcon={<CloseIcon sx={{ fontSize: 14 }} />}
                      sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem" }}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        </Cell>
      </Box>

      <SectionLabel>Description</SectionLabel>
      <Cell color="#6C63FF" index="02" animDelay={0.2}>
        <TextField
          fullWidth
          multiline
          minRows={4}
          maxRows={12}
          placeholder="Describe the project, the challenge, and the outcome..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={inputSx}
        />
      </Cell>

      {/* Case Dossier fields */}
      <SectionLabel>Case Dossier (declassified brief)</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        <Cell color="#8B85FF" index="03" colInRow={0} totalCols={2} animDelay={0.3}>
          <Stack spacing={2}>
            <TextField select fullWidth size="small" label="Sector" value={sector} onChange={(e) => setSector(e.target.value)} sx={inputSx}>
              <MenuItem value=""><em>None</em></MenuItem>
              {SECTORS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <TextField select fullWidth size="small" label="Service Line" value={serviceLine} onChange={(e) => setServiceLine(e.target.value)} sx={inputSx}>
              <MenuItem value=""><em>None</em></MenuItem>
              {SERVICE_LINES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <Stack direction="row" spacing={2}>
              <TextField select fullWidth size="small" label="Scale" value={scale} onChange={(e) => setScale(e.target.value)} sx={inputSx}>
                <MenuItem value=""><em>None</em></MenuItem>
                {SCALES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
              <TextField select fullWidth size="small" label="Stage" value={stage} onChange={(e) => setStage(e.target.value)} sx={inputSx}>
                <MenuItem value=""><em>None</em></MenuItem>
                {STAGES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Stack>
          </Stack>
        </Cell>
        <Cell color="#F59E0B" index="04" colInRow={1} totalCols={2} animDelay={0.35}>
          <Stack spacing={2}>
            <TextField fullWidth multiline minRows={3} size="small" label="Brief (the problem)" value={brief} onChange={(e) => setBrief(e.target.value)} sx={inputSx} />
            <Box>
              <Stack sx={{ alignItems: "center" }} direction="row" spacing={1}>
                <TextField
                  size="small"
                  label="Constraints"
                  placeholder="Add a constraint…"
                  value={constraintInput}
                  onChange={(e) => setConstraintInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addConstraint(); } }}
                  sx={{ ...inputSx, flex: 1 }}
                />
                <IconButton size="small" onClick={addConstraint} sx={{ color: "#6C63FF" }}><AddOutlinedIcon /></IconButton>
              </Stack>
              {constraints.length > 0 && (
                <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: "wrap", gap: 0.5 }}>
                  {constraints.map((c) => (
                    <Chip key={c} label={c} size="small" onDelete={() => removeConstraint(c)} deleteIcon={<CloseIcon sx={{ fontSize: 14 }} />} sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem" }} />
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        </Cell>
      </Box>

      <Cell color="#8B85FF" index="05" animDelay={0.4}>
        <Stack spacing={2}>
          <TextField fullWidth multiline minRows={2} size="small" label="Architecture chosen" value={architecture} onChange={(e) => setArchitecture(e.target.value)} sx={inputSx} />
          <TextField fullWidth multiline minRows={3} size="small" label="What shipped (one per line)" value={shipped} onChange={(e) => setShipped(e.target.value)} sx={inputSx} />
          <TextField fullWidth multiline minRows={2} size="small" label="Retained as IP (one per line)" value={retained} onChange={(e) => setRetained(e.target.value)} sx={inputSx} />
          <TextField fullWidth multiline minRows={2} size="small" label="What we learnt (one per line)" value={learnt} onChange={(e) => setLearnt(e.target.value)} sx={inputSx} />
        </Stack>
      </Cell>

      {/* Preview */}
      {canSubmit && (
        <>
          <SectionLabel>Preview</SectionLabel>
          <Cell color={color} index="P0" animDelay={0.3} minH={140}>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", color: "text.secondary", opacity: 0.6 }}>{client} — {category}</Typography>
              </Box>
              <Chip label="Draft" size="small" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", bgcolor: "#F59E0B18", color: "#F59E0B", border: "1px solid #F59E0B30" }} />
            </Stack>
            <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.7, lineHeight: 1.6, mb: 1.5 }}>{description}</Typography>
            {tags.length > 0 && (
              <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
                {tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", height: 22 }} />
                ))}
              </Stack>
            )}
            {impact && <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", color, fontWeight: 600 }}>{impact}</Typography>}
          </Cell>
        </>
      )}
    </Box>
  );
}
