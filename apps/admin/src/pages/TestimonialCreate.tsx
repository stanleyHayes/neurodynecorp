import { useState } from "react";
import { Box, Typography, TextField, MenuItem, Stack, Button, Avatar, Rating } from "@mui/material";
import { useNavigate } from "react-router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FormatQuoteOutlinedIcon from "@mui/icons-material/FormatQuoteOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";

const BORDER = "rgba(108, 99, 255, 0.12)";

const COLORS = [
  { label: "Purple", value: "#6C63FF" },
  { label: "Teal", value: "#00D4AA" },
  { label: "Lavender", value: "#8B85FF" },
  { label: "Amber", value: "#F59E0B" },
  { label: "Green", value: "#10B981" },
  { label: "Violet", value: "#8B5CF6" },
];

const inputSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "rgba(108, 99, 255, 0.04)",
    "& fieldset": { borderColor: "rgba(108,99,255,0.15)" },
    "&:hover fieldset": { borderColor: "rgba(108,99,255,0.3)" },
    "&.Mui-focused fieldset": { borderColor: "#8B85FF" },
  },
};

const btnSx = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "0.65rem",
  letterSpacing: "0.1em",
};

export default function TestimonialCreate() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [avatarColor, setAvatarColor] = useState("#6C63FF");

  const canSubmit = name.trim() && role.trim() && company.trim() && content.trim();

  const initials = name
    .trim()
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Box>
      <Box
        onClick={() => navigate("/testimonials")}
        sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 3, py: 1.5, cursor: "pointer", color: "text.secondary", "&:hover": { color: "#8B85FF" }, transition: "color 0.2s" }}
      >
        <ArrowBackIcon sx={{ fontSize: 18 }} />
        <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem", letterSpacing: "0.1em" }}>BACK TO TESTIMONIALS</Typography>
      </Box>

      <PageBanner
        icon={<FormatQuoteOutlinedIcon />}
        title="New Testimonial"
        description="Add a new client testimonial to be displayed on the website."
        tag="CONTENT // NEW TESTIMONIAL"
        accentWord="New"
        iconColor="#8B85FF"
        iconLabel="SOCIAL PROOF"
      />

      {/* Action bar */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", px: 3, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" onClick={() => navigate("/testimonials")} sx={{ ...btnSx, borderColor: "rgba(108,99,255,0.2)", color: "text.secondary", "&:hover": { borderColor: "rgba(108,99,255,0.4)" } }}>
            Cancel
          </Button>
          <Button variant="outlined" size="small" startIcon={<SaveOutlinedIcon />} disabled={!canSubmit} sx={{ ...btnSx, borderColor: "#F59E0B40", color: "#F59E0B", "&:hover": { borderColor: "#F59E0B", bgcolor: "#F59E0B08" }, "&.Mui-disabled": { borderColor: "rgba(108,99,255,0.1)", color: "text.secondary", opacity: 0.3 } }}>
            Save Hidden
          </Button>
          <Button variant="outlined" size="small" disabled={!canSubmit} sx={{ ...btnSx, borderColor: "#10B98140", color: "#10B981", "&:hover": { borderColor: "#10B981", bgcolor: "#10B98108" }, "&.Mui-disabled": { borderColor: "rgba(108,99,255,0.1)", color: "text.secondary", opacity: 0.3 } }}>
            Publish
          </Button>
        </Stack>
      </Box>

      {/* Form */}
      <SectionLabel>Client Details</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        <Cell color="#8B85FF" index="00" colInRow={0} totalCols={2} animDelay={0}>
          <Stack spacing={2}>
            <TextField fullWidth size="small" label="Full Name" value={name} onChange={(e) => setName(e.target.value)} sx={inputSx} />
            <TextField fullWidth size="small" label="Role / Title" placeholder="CTO, Founder, VP Eng..." value={role} onChange={(e) => setRole(e.target.value)} sx={inputSx} />
            <TextField fullWidth size="small" label="Company" value={company} onChange={(e) => setCompany(e.target.value)} sx={inputSx} />
          </Stack>
        </Cell>
        <Cell color="#00D4AA" index="01" colInRow={1} totalCols={2} animDelay={0.1}>
          <Stack spacing={2}>
            <TextField select fullWidth size="small" label="Avatar Color" value={avatarColor} onChange={(e) => setAvatarColor(e.target.value)} sx={inputSx}>
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
              <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "text.secondary", opacity: 0.5, mb: 1 }}>
                Rating
              </Typography>
              <Rating
                value={rating}
                onChange={(_, v) => v && setRating(v)}
                icon={<StarOutlinedIcon sx={{ color: "#F59E0B" }} />}
                emptyIcon={<StarOutlinedIcon sx={{ color: "rgba(148,163,184,0.3)" }} />}
              />
            </Box>
          </Stack>
        </Cell>
      </Box>

      <SectionLabel>Testimonial Content</SectionLabel>
      <Cell color="#8B85FF" index="02" animDelay={0.2}>
        <TextField
          fullWidth
          multiline
          minRows={4}
          maxRows={10}
          placeholder="What did the client say about working with NeuroDyne?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={inputSx}
        />
      </Cell>

      {/* Preview */}
      {canSubmit && (
        <>
          <SectionLabel>Preview</SectionLabel>
          <Cell color={avatarColor} index="P0" animDelay={0.3}>
            <Stack sx={{ alignItems: "flex-start" }} direction="row" spacing={2}>
              <Avatar sx={{ bgcolor: `${avatarColor}20`, color: avatarColor, width: 42, height: 42, fontSize: 14, fontWeight: 700, border: `1.5px solid ${avatarColor}30`, flexShrink: 0 }}>
                {initials || "?"}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{name}</Typography>
                <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: "text.secondary", opacity: 0.6 }}>{role}, {company}</Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.8, mt: 1, fontStyle: "italic", lineHeight: 1.6 }}>
                  "{content}"
                </Typography>
                <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarOutlinedIcon key={i} sx={{ fontSize: 14, color: i < rating ? "#F59E0B" : "rgba(148,163,184,0.3)" }} />
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Cell>
        </>
      )}
    </Box>
  );
}
