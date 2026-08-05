import { useState } from "react";
import { Box, Typography, TextField, MenuItem, Stack, Button, Alert, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MiscellaneousServicesOutlinedIcon from "@mui/icons-material/MiscellaneousServicesOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import TokenOutlinedIcon from "@mui/icons-material/TokenOutlined";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import { useAuth } from "@/context/AuthContext";

const BORDER = "rgba(108, 99, 255, 0.12)";

const ICONS = [
  { label: "Code", value: "code", icon: <CodeOutlinedIcon /> },
  { label: "Mobile", value: "phone", icon: <PhoneIphoneOutlinedIcon /> },
  { label: "AI / ML", value: "psychology", icon: <PsychologyOutlinedIcon /> },
  { label: "Blockchain", value: "token", icon: <TokenOutlinedIcon /> },
  { label: "Cloud", value: "cloud", icon: <CloudOutlinedIcon /> },
  { label: "Data", value: "storage", icon: <StorageOutlinedIcon /> },
];

const iconMap: Record<string, React.ReactNode> = Object.fromEntries(ICONS.map((i) => [i.value, i.icon]));

const STATUSES = [
  { label: "Active", value: "active" },
  { label: "Coming Soon", value: "coming_soon" },
  { label: "Inactive", value: "inactive" },
];

const COLORS = [
  { label: "Purple", value: "#6C63FF" },
  { label: "Teal", value: "#00D4AA" },
  { label: "Lavender", value: "#8B85FF" },
  { label: "Mint", value: "#33DDBB" },
  { label: "Amber", value: "#F59E0B" },
];

const inputSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "rgba(108, 99, 255, 0.04)",
    "& fieldset": { borderColor: "rgba(108,99,255,0.15)" },
    "&:hover fieldset": { borderColor: "rgba(108,99,255,0.3)" },
    "&.Mui-focused fieldset": { borderColor: "#00D4AA" },
  },
};

const btnSx = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "0.65rem",
  letterSpacing: "0.1em",
};

const statusColor: Record<string, string> = {
  active: "#10B981",
  coming_soon: "#F59E0B",
  inactive: "#94A3B8",
};

const statusLabel: Record<string, string> = {
  active: "Active",
  coming_soon: "Coming Soon",
  inactive: "Inactive",
};

export default function ServiceCreate() {
  const navigate = useNavigate();
  const { api } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("code");
  const [status, setStatus] = useState("active");
  const [color, setColor] = useState("#00D4AA");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = Boolean(title.trim() && description.trim());

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.createService({
        title: title.trim(),
        description: description.trim(),
        icon,
        status,
        color,
        features: [],
        projectCount: 0,
        order: 0,
      });
      navigate("/services");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save service.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box
        onClick={() => navigate("/services")}
        sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 3, py: 1.5, cursor: "pointer", color: "text.secondary", "&:hover": { color: "#00D4AA" }, transition: "color 0.2s" }}
      >
        <ArrowBackIcon sx={{ fontSize: 18 }} />
        <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem", letterSpacing: "0.1em" }}>BACK TO SERVICES</Typography>
      </Box>

      <PageBanner
        icon={<MiscellaneousServicesOutlinedIcon />}
        title="New Service"
        description="Add a new service offering to be displayed on the website."
        tag="CONTENT // NEW SERVICE"
        accentWord="New"
        iconColor="#00D4AA"
        iconLabel="OFFERINGS"
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", px: 3, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" onClick={() => navigate("/services")} sx={{ ...btnSx, borderColor: "rgba(108,99,255,0.2)", color: "text.secondary", "&:hover": { borderColor: "rgba(108,99,255,0.4)" } }}>
            Cancel
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={submitting ? <CircularProgress size={14} sx={{ color: "#10B981" }} /> : <SaveOutlinedIcon />}
            disabled={!canSubmit || submitting}
            onClick={handleSubmit}
            sx={{ ...btnSx, borderColor: "#10B98140", color: "#10B981", "&:hover": { borderColor: "#10B981", bgcolor: "#10B98108" }, "&.Mui-disabled": { borderColor: "rgba(108,99,255,0.1)", color: "text.secondary", opacity: 0.3 } }}
          >
            {submitting ? "Saving…" : "Save Service"}
          </Button>
        </Stack>
      </Box>

      {error && (
        <Box sx={{ px: 3, pt: 2 }}>
          <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
        </Box>
      )}

      <SectionLabel>Service Details</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        <Cell color="#00D4AA" index="00" colInRow={0} totalCols={2} animDelay={0}>
          <Stack spacing={2}>
            <TextField fullWidth size="small" label="Service Title" value={title} onChange={(e) => setTitle(e.target.value)} sx={inputSx} />
            <TextField fullWidth multiline minRows={3} maxRows={6} size="small" label="Description" placeholder="What does this service offer?" value={description} onChange={(e) => setDescription(e.target.value)} sx={inputSx} />
          </Stack>
        </Cell>
        <Cell color="#6C63FF" index="01" colInRow={1} totalCols={2} animDelay={0.1}>
          <Stack spacing={2}>
            <TextField select fullWidth size="small" label="Icon" value={icon} onChange={(e) => setIcon(e.target.value)} sx={inputSx}>
              {ICONS.map((i) => (
                <MenuItem key={i.value} value={i.value}>
                  <Stack sx={{ alignItems: "center" }} direction="row" spacing={1}>
                    <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 18 }, color, display: "flex" }}>{i.icon}</Box>
                    <span>{i.label}</span>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>
            <TextField select fullWidth size="small" label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={inputSx}>
              {STATUSES.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
            </TextField>
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
          </Stack>
        </Cell>
      </Box>

      {canSubmit && (
        <>
          <SectionLabel>Preview</SectionLabel>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" } }}>
            <Cell color={color} index="P0" colInRow={0} totalCols={3} animDelay={0.2} minH={180}>
              <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 36 }, color, filter: `drop-shadow(0 0 12px ${color}40)`, mb: 1.5 }}>
                {iconMap[icon] ?? <CodeOutlinedIcon />}
              </Box>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{title}</Typography>
                <Box sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", bgcolor: `${statusColor[status]}18`, color: statusColor[status], border: `1px solid ${statusColor[status]}30`, px: 1, py: 0.25, borderRadius: 1 }}>
                  {statusLabel[status]}
                </Box>
              </Stack>
              <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.7, lineHeight: 1.6 }}>{description}</Typography>
            </Cell>
          </Box>
        </>
      )}
    </Box>
  );
}
