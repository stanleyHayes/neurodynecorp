import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Stack,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import PageBanner from "@/components/shared/PageBanner";
import Cell from "@/components/shared/AnimatedCard";
import SectionLabel from "@/components/shared/AnimatedGrid";
import { useAuth } from "@/context/AuthContext";

const BORDER = "rgba(108, 99, 255, 0.12)";

const PROJECT_TYPES = [
  { label: "Web Application", value: "web_app" },
  { label: "Mobile App", value: "mobile_app" },
  { label: "AI/ML System", value: "ai_ml" },
  { label: "Blockchain", value: "blockchain" },
  { label: "Cloud Infrastructure", value: "cloud" },
  { label: "Full Stack", value: "fullstack" },
];

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD"];

const URGENCIES = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

const inputSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "rgba(108, 99, 255, 0.04)",
    "& fieldset": { borderColor: "rgba(108,99,255,0.15)" },
    "&:hover fieldset": { borderColor: "rgba(108,99,255,0.3)" },
    "&.Mui-focused fieldset": { borderColor: "#F59E0B" },
  },
};

const btnSx = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "0.65rem",
  letterSpacing: "0.1em",
};

interface ClientOption {
  id: string;
  label: string;
}

export default function ProjectCreate() {
  const navigate = useNavigate();
  const { api } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("web_app");
  const [clientId, setClientId] = useState("");
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [durationWeeks, setDurationWeeks] = useState("");
  const [urgency, setUrgency] = useState("medium");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.listUsers({ role: "client" });
        if (cancelled) return;
        const items = (res as any).items ?? (res as any).users ?? [];
        setClients(
          items.map((u: any) => ({
            id: u.id,
            label:
              [u.first_name, u.last_name].filter(Boolean).join(" ").trim() ||
              u.email ||
              u.id,
          })),
        );
      } catch {
        if (!cancelled) setClients([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api]);

  const canSubmit = Boolean(title.trim() && description.trim() && clientId);

  const handleSave = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError("");
    try {
      await api.createProject({
        title,
        description,
        type,
        client_id: clientId,
        features: [],
        ...(budgetMin || budgetMax
          ? {
              budget_range: {
                min: Number(budgetMin) || 0,
                max: Number(budgetMax) || 0,
                currency,
              },
            }
          : {}),
        ...(durationWeeks
          ? {
              timeline: {
                duration_weeks: Number(durationWeeks),
                preferred_urgency: urgency,
              },
            }
          : {}),
      });
      navigate("/projects");
    } catch (err: any) {
      setError(err.message ?? "Failed to create project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box
        onClick={() => navigate("/projects")}
        sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 3, py: 1.5, cursor: "pointer", color: "text.secondary", "&:hover": { color: "#F59E0B" }, transition: "color 0.2s" }}
      >
        <ArrowBackIcon sx={{ fontSize: 18 }} />
        <Typography sx={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem", letterSpacing: "0.1em" }}>BACK TO PROJECTS</Typography>
      </Box>

      <PageBanner
        icon={<FolderOutlinedIcon />}
        title="New Project"
        description="Create a new project with scope, budget, and timeline details."
        tag="PROJECTS // NEW PROJECT"
        accentWord="New"
        iconColor="#F59E0B"
        iconLabel="PROJECTS"
      />

      {/* Action bar */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", px: 3, py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" onClick={() => navigate("/projects")} sx={{ ...btnSx, borderColor: "rgba(108,99,255,0.2)", color: "text.secondary", "&:hover": { borderColor: "rgba(108,99,255,0.4)" } }}>
            Cancel
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={saving ? <CircularProgress size={14} /> : <SaveOutlinedIcon />}
            disabled={!canSubmit || saving}
            onClick={handleSave}
            sx={{ ...btnSx, borderColor: "#10B98140", color: "#10B981", "&:hover": { borderColor: "#10B981", bgcolor: "#10B98108" }, "&.Mui-disabled": { borderColor: "rgba(108,99,255,0.1)", color: "text.secondary", opacity: 0.3 } }}
          >
            Save Project
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mx: 3, mt: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <SectionLabel>Project Details</SectionLabel>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
        <Cell color="#F59E0B" index="00" colInRow={0} totalCols={2} animDelay={0}>
          <Stack spacing={2}>
            <TextField fullWidth size="small" label="Project Title" value={title} onChange={(e) => setTitle(e.target.value)} sx={inputSx} />
            <TextField fullWidth multiline minRows={3} maxRows={6} size="small" label="Description" placeholder="Describe the project scope and objectives..." value={description} onChange={(e) => setDescription(e.target.value)} sx={inputSx} />
          </Stack>
        </Cell>
        <Cell color="#6C63FF" index="01" colInRow={1} totalCols={2} animDelay={0.1}>
          <Stack spacing={2}>
            <TextField
              select
              fullWidth
              size="small"
              label="Client"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              sx={inputSx}
              helperText={clients.length === 0 ? "No clients found — create a client first" : undefined}
            >
              {clients.length === 0 ? (
                <MenuItem value="" disabled>No clients available</MenuItem>
              ) : (
                clients.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.label}</MenuItem>
                ))
              )}
            </TextField>
            <TextField select fullWidth size="small" label="Project Type" value={type} onChange={(e) => setType(e.target.value)} sx={inputSx}>
              {PROJECT_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
              ))}
            </TextField>
            <Stack direction="row" spacing={2}>
              <TextField fullWidth size="small" label="Budget Min" type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} sx={inputSx} />
              <TextField fullWidth size="small" label="Budget Max" type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} sx={inputSx} />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField select fullWidth size="small" label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} sx={inputSx}>
                {CURRENCIES.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </TextField>
              <TextField fullWidth size="small" label="Duration (weeks)" type="number" value={durationWeeks} onChange={(e) => setDurationWeeks(e.target.value)} sx={inputSx} />
              <TextField select fullWidth size="small" label="Urgency" value={urgency} onChange={(e) => setUrgency(e.target.value)} sx={inputSx}>
                {URGENCIES.map((u) => (
                  <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
                ))}
              </TextField>
            </Stack>
          </Stack>
        </Cell>
      </Box>
    </Box>
  );
}
