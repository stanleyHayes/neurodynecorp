import { useState } from "react";
import { Box, Typography, TextField, MenuItem, Stack, Button, Chip, IconButton } from "@mui/material";
import { useNavigate } from "react-router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CloseIcon from "@mui/icons-material/Close";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";

const BORDER = "rgba(108, 99, 255, 0.12)";

const CATEGORIES = ["Fintech", "Healthcare", "Supply Chain", "Analytics", "Education", "IoT", "Real Estate", "CleanTech"];
const COLORS = [
  { label: "Purple", value: "#6C63FF" },
  { label: "Teal", value: "#00D4AA" },
  { label: "Lavender", value: "#8B85FF" },
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

const btnSx = {
  fontFamily: "monospace",
  fontSize: "0.65rem",
  letterSpacing: "0.1em",
};

export default function PortfolioCreate() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [category, setCategory] = useState("Fintech");
  const [description, setDescription] = useState("");
  const [impact, setImpact] = useState("");
  const [color, setColor] = useState("#6C63FF");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const canSubmit = title.trim() && client.trim() && description.trim();

  return (
    <Box>
      <Box
        onClick={() => navigate("/portfolio")}
        sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 3, py: 1.5, cursor: "pointer", color: "text.secondary", "&:hover": { color: "#6C63FF" }, transition: "color 0.2s" }}
      >
        <ArrowBackIcon sx={{ fontSize: 18 }} />
        <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.1em" }}>BACK TO PORTFOLIO</Typography>
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
          <Button variant="outlined" size="small" startIcon={<SaveOutlinedIcon />} disabled={!canSubmit} sx={{ ...btnSx, borderColor: "#F59E0B40", color: "#F59E0B", "&:hover": { borderColor: "#F59E0B", bgcolor: "#F59E0B08" }, "&.Mui-disabled": { borderColor: "rgba(108,99,255,0.1)", color: "text.secondary", opacity: 0.3 } }}>
            Save Draft
          </Button>
          <Button variant="outlined" size="small" disabled={!canSubmit} sx={{ ...btnSx, borderColor: "#10B98140", color: "#10B981", "&:hover": { borderColor: "#10B981", bgcolor: "#10B98108" }, "&.Mui-disabled": { borderColor: "rgba(108,99,255,0.1)", color: "text.secondary", opacity: 0.3 } }}>
            Publish
          </Button>
        </Stack>
      </Box>

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
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: c.value }} />
                    <span>{c.label}</span>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
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
                      sx={{ fontFamily: "monospace", fontSize: "0.6rem" }}
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

      {/* Preview */}
      {canSubmit && (
        <>
          <SectionLabel>Preview</SectionLabel>
          <Cell color={color} index="P0" animDelay={0.3} minH={140}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.65rem", color: "text.secondary", opacity: 0.6 }}>{client} — {category}</Typography>
              </Box>
              <Chip label="Draft" size="small" sx={{ fontFamily: "monospace", fontSize: "0.6rem", bgcolor: "#F59E0B18", color: "#F59E0B", border: "1px solid #F59E0B30" }} />
            </Stack>
            <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.7, lineHeight: 1.6, mb: 1.5 }}>{description}</Typography>
            {tags.length > 0 && (
              <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
                {tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ fontFamily: "monospace", fontSize: "0.55rem", height: 22 }} />
                ))}
              </Stack>
            )}
            {impact && <Typography sx={{ fontFamily: "monospace", fontSize: "0.65rem", color, fontWeight: 600 }}>{impact}</Typography>}
          </Cell>
        </>
      )}
    </Box>
  );
}
