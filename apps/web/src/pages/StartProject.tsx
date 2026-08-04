import { useState, useRef, useCallback, useEffect, Component, type ReactNode } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormGroup,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  InputLabel,
  Alert,
  CircularProgress,
  IconButton,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  keyframes,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import TitleOutlinedIcon from "@mui/icons-material/TitleOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import FeaturedPlayListOutlinedIcon from "@mui/icons-material/FeaturedPlayListOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";
import SEO from "@/components/seo/SEO";
import { api } from "@/api/client";

const MotionBox = motion.create(Box);
const MotionTypography = motion.create(Typography);

// ── Theme-aware helpers ──────────────────────────────────────────────────────

function useThemeColors() {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  return {
    dark,
    border: dark ? "rgba(108, 99, 255, 0.12)" : "rgba(91, 84, 238, 0.12)",
    fieldBg: dark ? "rgba(108, 99, 255, 0.03)" : "rgba(91, 84, 238, 0.03)",
    fieldBorder: dark ? "rgba(108, 99, 255, 0.12)" : "rgba(91, 84, 238, 0.15)",
    fieldHover: dark ? "rgba(108, 99, 255, 0.3)" : "rgba(91, 84, 238, 0.35)",
    bracketIdle: dark ? "30" : "25",
    bracketHover: dark ? "80" : "60",
    fullscreenBg: dark
      ? "linear-gradient(160deg, #0A0E1A 0%, #0F1629 50%, #111827 100%)"
      : "linear-gradient(160deg, #F8FAFC 0%, #EEF2FF 50%, #E0E7FF 100%)",
    gridLine: dark ? "rgba(108,99,255,0.03)" : "rgba(91,84,238,0.06)",
    chipBorder: dark ? "rgba(108,99,255,0.12)" : "rgba(91,84,238,0.18)",
    chipSelectedBorder: dark ? "50" : "40",
    scrollThumb: dark ? "rgba(108,99,255,0.2)" : "rgba(91,84,238,0.2)",
    particle1: dark ? "#6C63FF" : "#5B54EE",
    particle2: dark ? "#00D4AA" : "#00BF99",
    primary: dark ? "#6C63FF" : "#5B54EE",
  };
}

// ── Constants ─────────────────────────────────────────────────────────────────

const BORDER = "rgba(108, 99, 255, 0.12)";

const scanlinePulse = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
`;

const projectTypes = [
  { value: "digital_platform", label: "Digital Platform / Portal" },
  { value: "mobile_app", label: "Mobile Product" },
  { value: "ai_system", label: "AI or Automation System" },
  { value: "data_platform", label: "Data & Intelligence Platform" },
  { value: "systems_integration", label: "Systems Integration" },
  { value: "modernisation", label: "Modernisation / Rebuild" },
];

const organisationTypes = ["Startup", "Established business", "Government / public institution", "NGO / development organisation", "University / research institution", "Individual founder"];
const projectStages = ["Exploring the opportunity", "Requirements are taking shape", "Specification or designs exist", "Replacing an existing system", "Already building and need help"];
const securityOptions = ["Role-based access", "Audit trail", "Sensitive personal data", "Payments or financial data", "Data residency requirements", "Regulatory compliance", "Not sure yet"];

const budgetRanges = [
  "$10,000 - $25,000",
  "$25,000 - $50,000",
  "$50,000 - $100,000",
  "$100,000 - $250,000",
  "$250,000+",
];

const timelines = [
  "1-2 months",
  "2-4 months",
  "4-6 months",
  "6-12 months",
  "12+ months",
];

// ── Types ─────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "ndl_start_project";

interface SavedState {
  formData: Omit<FormData, "specFile">;
  isFullscreen: boolean;
  stepIndex: number;
}

function saveState(formData: FormData, isFullscreen: boolean, stepIndex: number) {
  try {
    const { specFile: _specFile, ...rest } = formData;
    const state: SavedState = { formData: rest, isFullscreen, stepIndex };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* quota exceeded — ignore */ }
}

function loadState(): SavedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedState;
  } catch {
    return null;
  }
}

function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

interface UploadedSpec {
  name: string;
  size: number;
  url: string;
}

interface FormData {
  projectTypes: string[];
  title: string;
  description: string;
  features: string[];
  platforms: string[];
  authRequired: boolean;
  pushNotifications: boolean;
  offlineCapability: boolean;
  aiType: string;
  datasetAvailable: boolean;
  budget: string;
  timeline: string;
  name: string;
  email: string;
  company: string;
  organisationType: string;
  projectStage: string;
  primaryUsers: string;
  successCriteria: string;
  integrations: string;
  securityRequirements: string[];
  specFile: File | null;
  specUploaded: UploadedSpec | null;
}

const initialFormData: FormData = {
  projectTypes: [],
  title: "",
  description: "",
  features: [],
  platforms: [],
  authRequired: false,
  pushNotifications: false,
  offlineCapability: false,
  aiType: "",
  datasetAvailable: false,
  budget: "",
  timeline: "",
  name: "",
  email: "",
  company: "",
  organisationType: "",
  projectStage: "",
  primaryUsers: "",
  successCriteria: "",
  integrations: "",
  securityRequirements: [],
  specFile: null,
  specUploaded: null,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateProject(formData: FormData, requireDetailedBrief = true): string | null {
  if (!formData.projectTypes.length) return "Select at least one kind of engagement.";
  if (formData.title.trim().length < 3) return "Enter a working title with at least 3 characters.";
  if (formData.description.trim().length < 80) return "Describe the problem, current situation, and intended outcome in at least 80 characters.";
  if (requireDetailedBrief && !formData.projectStage) return "Select the current stage of the initiative.";
  if (requireDetailedBrief && formData.primaryUsers.trim().length < 20) return "Tell us who will use the system and in what context.";
  if (requireDetailedBrief && formData.successCriteria.trim().length < 30) return "Describe at least one measurable outcome that would make this project successful.";
  if (formData.name.trim().length < 2) return "Enter your full name.";
  if (!EMAIL_PATTERN.test(formData.email.trim())) return "Enter a valid email address, for example name@company.com.";
  if (requireDetailedBrief && !formData.organisationType) return "Select the type of organisation you represent.";
  if (formData.projectTypes.includes("mobile_app") && !formData.platforms.length) return "Select a target mobile platform.";
  if (formData.projectTypes.includes("ai_system") && !formData.aiType) return "Select the primary AI capability.";
  if (!formData.budget) return "Select the investment range you are planning around.";
  if (!formData.timeline) return "Select the delivery window you are working toward.";
  return null;
}

// ── Shared helpers ────────────────────────────────────────────────────────────

const parseBudgetRange = (budget: string) => {
  const cleaned = budget.replace(/[$,]/g, "");
  if (cleaned.includes("+")) {
    const min = parseInt(cleaned.replace("+", ""), 10);
    return { min, max: min * 2, currency: "USD" };
  }
  const parts = cleaned.split(" - ");
  return {
    min: parseInt(parts[0] ?? "0", 10) || 0,
    max: parseInt(parts[1] ?? "0", 10) || 0,
    currency: "USD",
  };
};

const parseTimeline = (timeline: string) => {
  const match = timeline.match(/(\d+)\+?\s*-?\s*(\d+)?/);
  if (!match) return { duration_weeks: 8, preferred_urgency: "normal" };
  const months = match[2] ? parseInt(match[2], 10) : parseInt(match[1] ?? "0", 10);
  const durationWeeks = months * 4;
  const urgency = months <= 2 ? "urgent" : months <= 6 ? "normal" : "relaxed";
  return { duration_weeks: durationWeeks, preferred_urgency: urgency };
};

// ── Reusable Cell (from Contact design) ───────────────────────────────────────

function Cell({
  children,
  color,
  index,
  colInRow,
  totalCols,
  minH = { xs: 120, md: 160 },
  animDelay = 0,
}: {
  children: React.ReactNode;
  color: string;
  index: string;
  colInRow: number;
  totalCols: number;
  minH?: Record<string, number>;
  animDelay?: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: animDelay }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        minHeight: minH,
        p: { xs: 2.5, md: 3 },
        position: "relative",
        overflow: "hidden",
        borderRight: { xs: "none", md: colInRow < totalCols - 1 ? `1px solid ${BORDER}` : "none" },
        borderBottom: `1px solid ${BORDER}`,
        background: hovered ? `${color}06` : "transparent",
        transition: "background 0.3s",
      }}
    >
      {[
        { top: 10, left: 10, bT: true, bL: true },
        { top: 10, right: 10, bT: true, bR: true },
        { bottom: 10, left: 10, bB: true, bL: true },
        { bottom: 10, right: 10, bB: true, bR: true },
      ].map((pos, ci) => (
        <Box
          key={ci}
          sx={{
            position: "absolute",
            ...(pos.top !== undefined && { top: pos.top }),
            ...(pos.bottom !== undefined && { bottom: pos.bottom }),
            ...(pos.left !== undefined && { left: pos.left }),
            ...(pos.right !== undefined && { right: pos.right }),
            width: 14,
            height: 14,
            borderTop: pos.bT ? `2px solid ${color}${hovered ? "80" : "30"}` : "none",
            borderBottom: pos.bB ? `2px solid ${color}${hovered ? "80" : "30"}` : "none",
            borderLeft: pos.bL ? `2px solid ${color}${hovered ? "80" : "30"}` : "none",
            borderRight: pos.bR ? `2px solid ${color}${hovered ? "80" : "30"}` : "none",
            filter: hovered ? `drop-shadow(0 0 6px ${color}50)` : "none",
            transition: "all 0.3s",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      ))}

      {hovered && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60%",
            height: "60%",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`,
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />
      )}

      <Typography
        sx={{
          position: "absolute",
          top: 14,
          left: 32,
          fontSize: "0.6rem",
          fontFamily: "monospace",
          color: hovered ? color : "text.secondary",
          opacity: 0.5,
          letterSpacing: "0.15em",
          transition: "color 0.3s",
          zIndex: 2,
        }}
      >
        {index}
      </Typography>

      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: "10%",
          right: "10%",
          height: 2,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: hovered ? 0.6 : 0,
          transition: "opacity 0.3s",
          pointerEvents: "none",
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1 }}>{children}</Box>
    </MotionBox>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <Box sx={{ borderBottom: `1px solid ${BORDER}`, py: 2, px: 4 }}>
      <Typography
        sx={{
          fontSize: "0.65rem",
          fontFamily: "monospace",
          fontWeight: 600,
          color: "text.secondary",
          letterSpacing: "0.3em",
          opacity: 0.4,
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}

function useFieldSx() {
  const tc = useThemeColors();
  return {
    "& .MuiOutlinedInput-root": {
      background: tc.fieldBg,
      borderRadius: 1,
      fontSize: "0.9rem",
      "& fieldset": { borderColor: tc.fieldBorder },
      "&:hover fieldset": { borderColor: tc.fieldHover },
      "&.Mui-focused fieldset": { borderColor: tc.primary, borderWidth: 1 },
    },
    "& .MuiInputLabel-root": {
      fontSize: "0.8rem",
      fontFamily: "monospace",
      letterSpacing: "0.05em",
    },
  };
}

// ── File upload component ─────────────────────────────────────────────────────

function FileUpload({
  file,
  uploaded,
  onFile,
  onRemove,
  uploading,
  disabled,
  variant = "normal",
}: {
  file: File | null;
  uploaded?: UploadedSpec | null;
  onFile: (f: File) => void;
  onRemove: () => void;
  uploading?: boolean;
  disabled?: boolean;
  variant?: "normal" | "fullscreen";
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const dropped = e.dataTransfer.files[0];
      if (dropped) onFile(dropped);
    },
    [onFile],
  );

  const isFs = variant === "fullscreen";
  const color = isFs ? "#00D4AA" : "#8B85FF";

  const displayName = file?.name ?? uploaded?.name;
  const displaySize = file?.size ?? uploaded?.size;

  if (displayName && displaySize) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2,
          borderRadius: 2,
          border: `1px solid ${color}30`,
          background: `${color}08`,
        }}
      >
        {uploading ? (
          <CircularProgress size={24} sx={{ color }} />
        ) : (
          <InsertDriveFileOutlinedIcon sx={{ color, fontSize: 28 }} />
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {displayName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {(displaySize / 1024 / 1024).toFixed(2)} MB
            {uploading ? " — uploading…" : uploaded ? " — saved" : ""}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onRemove} disabled={disabled || uploading} sx={{ color: "text.secondary" }}>
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept=".pdf,.doc,.docx,.txt,.md,.rtf,.pages"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
      <Box
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          p: isFs ? 5 : 3,
          borderRadius: 2,
          border: `2px dashed ${color}30`,
          cursor: disabled ? "default" : "pointer",
          opacity: disabled ? 0.5 : 1,
          transition: "all 0.3s",
          "&:hover": disabled
            ? {}
            : {
                borderColor: `${color}60`,
                background: `${color}06`,
              },
        }}
      >
        <CloudUploadOutlinedIcon sx={{ fontSize: isFs ? 48 : 32, color, opacity: 0.7 }} />
        <Typography
          variant={isFs ? "body1" : "body2"}
          color="text.secondary"
          sx={{ fontFamily: "monospace", fontSize: isFs ? "0.9rem" : "0.75rem" }}
        >
          {isFs ? "Drop your file here or click to browse" : "Drop file or click to upload"}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.5 }}>
          PDF, DOC, DOCX, TXT, MD (max 25MB)
        </Typography>
      </Box>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── FULLSCREEN MODE ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

interface FullscreenStep {
  key: string;
  label: string;
  sublabel?: string;
  color: string;
  accent: string;
  icon: React.ReactNode;
  render: (props: {
    formData: FormData;
    update: (fields: Partial<FormData>) => void;
    extra?: { uploading: boolean; onSpecFile: (f: File) => void; onSpecRemove: () => void };
  }) => React.ReactNode;
  shouldShow?: (formData: FormData) => boolean;
  validate?: (formData: FormData) => string | null;
}

function ReviewCell({
  color,
  index,
  label,
  value,
  children,
  full,
  borderRight,
}: {
  color: string;
  index: string;
  label: string;
  value?: string;
  children?: React.ReactNode;
  full?: boolean;
  borderRight?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: "relative",
        p: { xs: 2, sm: 2.5 },
        minHeight: { xs: 60, sm: 80 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        borderBottom: `1px solid rgba(108,99,255,0.1)`,
        borderRight: { xs: "none", sm: borderRight && !full ? `1px solid rgba(108,99,255,0.1)` : "none" },
        background: hovered ? `${color}06` : "transparent",
        transition: "background 0.3s",
        textAlign: "left",
      }}
    >
      {/* Corner brackets */}
      {[
        { top: 6, left: 6, bT: true, bL: true },
        { top: 6, right: 6, bT: true, bR: true },
        { bottom: 6, left: 6, bB: true, bL: true },
        { bottom: 6, right: 6, bB: true, bR: true },
      ].map((pos, ci) => (
        <Box
          key={ci}
          sx={{
            position: "absolute",
            ...(pos.top !== undefined && { top: pos.top }),
            ...(pos.bottom !== undefined && { bottom: pos.bottom }),
            ...(pos.left !== undefined && { left: pos.left }),
            ...(pos.right !== undefined && { right: pos.right }),
            width: 10,
            height: 10,
            borderTop: pos.bT ? `1.5px solid ${color}${hovered ? "60" : "20"}` : "none",
            borderBottom: pos.bB ? `1.5px solid ${color}${hovered ? "60" : "20"}` : "none",
            borderLeft: pos.bL ? `1.5px solid ${color}${hovered ? "60" : "20"}` : "none",
            borderRight: pos.bR ? `1.5px solid ${color}${hovered ? "60" : "20"}` : "none",
            transition: "all 0.3s",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Index */}
      <Typography
        sx={{
          position: "absolute",
          top: 10,
          left: 22,
          fontSize: "0.5rem",
          fontFamily: "monospace",
          color: hovered ? color : "text.secondary",
          opacity: 0.4,
          letterSpacing: "0.15em",
          transition: "color 0.3s",
        }}
      >
        {index}
      </Typography>

      <Typography
        sx={{
          fontFamily: "monospace",
          fontSize: "0.6rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color,
          opacity: 0.6,
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      {children ?? (
        <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: "break-word" }}>
          {value || "—"}
        </Typography>
      )}
    </Box>
  );
}

const fsChoiceGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
  gap: { xs: 1, md: 1.5 },
  width: "100%",
  maxWidth: 900,
} as const;

function fsChoiceCardSx(selected: boolean, color: string) {
  return {
    position: "relative",
    minHeight: { xs: 64, md: 78 },
    m: 0,
    px: { xs: 1.5, md: 2 },
    py: { xs: 1, md: 1.25 },
    border: "1px solid",
    borderColor: selected ? `${color}70` : "divider",
    borderRadius: 2,
    bgcolor: selected ? `${color}10` : "rgba(108,99,255,0.025)",
    boxShadow: selected ? `inset 3px 0 0 ${color}, 0 12px 30px ${color}0D` : "none",
    transition: "transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease",
    cursor: "pointer",
    "&:hover": { borderColor: `${color}55`, bgcolor: `${color}08`, transform: "translateY(-2px)" },
    "& .MuiFormControlLabel-label": { fontWeight: selected ? 700 : 500, textAlign: "left" },
  } as const;
}

const fullscreenSteps: FullscreenStep[] = [
  {
    key: "welcome",
    label: "Build the Brief",
    sublabel: "A focused intake for serious digital systems—not a generic contact form.",
    color: "#6C63FF",
    accent: "#8B85FF",
    icon: <RocketLaunchIcon sx={{ fontSize: 48 }} />,
    render: () => (
      <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8, maxWidth: 460, textAlign: "center" }}>
        We’ll capture the problem, users, operating context, constraints, and measures of success. Your answers give our team enough signal to prepare a useful first response.
      </Typography>
    ),
  },
  {
    key: "projectType",
    label: "What Kind of Engagement Is This?",
    sublabel: "Select every workstream that is genuinely in scope.",
    color: "#00D4AA",
    accent: "#33DDBB",
    icon: <CategoryOutlinedIcon sx={{ fontSize: 48 }} />,
    render: ({ formData, update }) => (
      <FormGroup sx={fsChoiceGridSx}>
        {projectTypes.map((type) => (
          <FormControlLabel
            key={type.value}
            control={
              <Checkbox
                checked={formData.projectTypes.includes(type.value)}
                onChange={(e) => {
                  const types = e.target.checked
                    ? [...formData.projectTypes, type.value]
                    : formData.projectTypes.filter((t) => t !== type.value);
                  update({ projectTypes: types });
                }}
                sx={{
                  color: "#00D4AA60",
                  "&.Mui-checked": { color: "#00D4AA" },
                }}
              />
            }
            label={type.label}
            sx={fsChoiceCardSx(formData.projectTypes.includes(type.value), "#00D4AA")}
          />
        ))}
      </FormGroup>
    ),
    validate: (fd) => fd.projectTypes.length ? null : "Select at least one kind of engagement.",
  },
  {
    key: "title",
    label: "Give the Initiative a Working Title",
    sublabel: "Use a specific internal or public name; it does not need to be final.",
    color: "#6C63FF",
    accent: "#8B85FF",
    icon: <TitleOutlinedIcon sx={{ fontSize: 48 }} />,
    render: ({ formData, update }) => (
      <TextField
        fullWidth
        autoFocus
        value={formData.title}
        onChange={(e) => update({ title: e.target.value })}
        placeholder="e.g. National Provider Registry"
        variant="outlined"
        sx={{ maxWidth: 760, ...fsFieldSx }}
      />
    ),
    validate: (fd) => fd.title.trim().length >= 3 ? null : "Enter a working title with at least 3 characters.",
  },
  {
    key: "description",
    label: "What Problem Must Change?",
    sublabel: "Describe the current situation, why it is failing, and the outcome you need.",
    color: "#00D4AA",
    accent: "#33DDBB",
    icon: <DescriptionOutlinedIcon sx={{ fontSize: 48 }} />,
    render: ({ formData, update }) => (
      <TextField
        fullWidth
        autoFocus
        multiline
        rows={5}
        value={formData.description}
        onChange={(e) => update({ description: e.target.value })}
        placeholder="Today, our teams rely on… This causes… We need a system that…"
        sx={{ maxWidth: 820, ...fsFieldSx }}
      />
    ),
    validate: (fd) => fd.description.trim().length >= 80 ? null : "Add more context—at least 80 characters covering the problem and intended outcome.",
  },
  {
    key: "projectStage",
    label: "Where Is the Initiative Today?",
    sublabel: "This tells us whether the first engagement should focus on discovery, specification, rescue, or delivery.",
    color: "#6C63FF",
    accent: "#8B85FF",
    icon: <ScheduleOutlinedIcon sx={{ fontSize: 48 }} />,
    render: ({ formData, update }) => (
      <FormGroup sx={fsChoiceGridSx}>
        {projectStages.map((stage) => (
          <Box key={stage} onClick={() => update({ projectStage: stage })} sx={{ ...fsChoiceCardSx(formData.projectStage === stage, "#6C63FF"), display: "flex", alignItems: "center", textAlign: "left" }}>
            <Typography sx={{ fontWeight: formData.projectStage === stage ? 700 : 400 }}>{stage}</Typography>
          </Box>
        ))}
      </FormGroup>
    ),
    validate: (fd) => fd.projectStage ? null : "Select the current stage of the initiative.",
  },
  {
    key: "primaryUsers",
    label: "Who Will Depend on This System?",
    sublabel: "Name the primary users, their environment, and any access or device constraints.",
    color: "#00D4AA",
    accent: "#33DDBB",
    icon: <PersonOutlineIcon sx={{ fontSize: 48 }} />,
    render: ({ formData, update }) => (
      <TextField fullWidth autoFocus multiline rows={5} value={formData.primaryUsers} onChange={(e) => update({ primaryUsers: e.target.value })} placeholder="e.g. District health officers using shared Android devices, often with unstable connectivity…" sx={{ maxWidth: 820, ...fsFieldSx }} />
    ),
    validate: (fd) => fd.primaryUsers.trim().length >= 20 ? null : "Tell us who will use the system and in what context.",
  },
  {
    key: "successCriteria",
    label: "What Would Success Look Like?",
    sublabel: "Give us one or more observable outcomes—not just ‘launch the product’.",
    color: "#6C63FF",
    accent: "#8B85FF",
    icon: <AutoAwesomeIcon sx={{ fontSize: 48 }} />,
    render: ({ formData, update }) => (
      <TextField fullWidth autoFocus multiline rows={5} value={formData.successCriteria} onChange={(e) => update({ successCriteria: e.target.value })} placeholder="e.g. Reduce case processing from 10 days to 2, with a complete audit trail and 80% staff adoption in the first quarter." sx={{ maxWidth: 820, ...fsFieldSx }} />
    ),
    validate: (fd) => fd.successCriteria.trim().length >= 30 ? null : "Describe at least one measurable outcome in 30 characters or more.",
  },
  {
    key: "name",
    label: "Who Should We Speak With?",
    sublabel: "Use your real name so we can address the response properly.",
    color: "#6C63FF",
    accent: "#8B85FF",
    icon: <PersonOutlineIcon sx={{ fontSize: 48 }} />,
    render: ({ formData, update }) => (
      <TextField
        fullWidth
        autoFocus
        value={formData.name}
        onChange={(e) => update({ name: e.target.value })}
        placeholder="Your full name"
        sx={{ maxWidth: 620, ...fsFieldSx }}
      />
    ),
    validate: (fd) => fd.name.trim().length >= 2 ? null : "Enter your full name.",
  },
  {
    key: "email",
    label: "Where Should We Send the Response?",
    sublabel: "Use an address you actively monitor. We’ll never sell or publish it.",
    color: "#00D4AA",
    accent: "#33DDBB",
    icon: <AlternateEmailIcon sx={{ fontSize: 48 }} />,
    render: ({ formData, update }) => (
      <TextField
        fullWidth
        autoFocus
        type="email"
        value={formData.email}
        onChange={(e) => update({ email: e.target.value })}
        placeholder="you@company.com"
        sx={{ maxWidth: 620, ...fsFieldSx }}
      />
    ),
    validate: (fd) => EMAIL_PATTERN.test(fd.email.trim()) ? null : "Enter a valid email address, for example name@company.com.",
  },
  {
    key: "organisationType",
    label: "What Kind of Organisation Is This For?",
    sublabel: "The delivery, procurement, and governance approach changes with your operating context.",
    color: "#6C63FF",
    accent: "#8B85FF",
    icon: <BusinessOutlinedIcon sx={{ fontSize: 48 }} />,
    render: ({ formData, update }) => (
      <FormGroup sx={fsChoiceGridSx}>
        {organisationTypes.map((type) => (
          <Box key={type} onClick={() => update({ organisationType: type })} sx={{ ...fsChoiceCardSx(formData.organisationType === type, "#6C63FF"), display: "flex", alignItems: "center", textAlign: "left" }}>
            <Typography sx={{ fontWeight: formData.organisationType === type ? 700 : 400 }}>{type}</Typography>
          </Box>
        ))}
      </FormGroup>
    ),
    validate: (fd) => fd.organisationType ? null : "Select the type of organisation you represent.",
  },
  {
    key: "company",
    label: "Organisation Name",
    sublabel: "Optional for individual founders; useful for institutional briefs.",
    color: "#6C63FF",
    accent: "#8B85FF",
    icon: <BusinessOutlinedIcon sx={{ fontSize: 48 }} />,
    render: ({ formData, update }) => (
      <TextField
        fullWidth
        autoFocus
        value={formData.company}
        onChange={(e) => update({ company: e.target.value })}
        placeholder="Organisation or programme name"
        sx={{ maxWidth: 620, ...fsFieldSx }}
      />
    ),
  },
  {
    key: "mobilePlatforms",
    label: "Mobile Operating Context",
    sublabel: "Choose the platform and the capabilities the field experience genuinely requires.",
    color: "#00D4AA",
    accent: "#33DDBB",
    icon: <PhoneIphoneOutlinedIcon sx={{ fontSize: 48 }} />,
    shouldShow: (fd) => fd.projectTypes.includes("mobile_app"),
    render: ({ formData, update }) => (
      <Stack spacing={2} sx={{ width: "100%", maxWidth: 900 }}>
        <RadioGroup
          row
          value={formData.platforms[0] ?? ""}
          onChange={(e) => update({ platforms: [e.target.value] })}
          sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1.25 }}
        >
          {["iOS", "Android", "Both"].map((platform) => (
            <FormControlLabel
              key={platform}
              value={platform}
              control={
                <Radio
                  sx={{ color: "#00D4AA60", "&.Mui-checked": { color: "#00D4AA" } }}
                />
              }
              label={platform}
              sx={fsChoiceCardSx(formData.platforms[0] === platform, "#00D4AA")}
            />
          ))}
        </RadioGroup>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 1.25 }}>
          <FormControlLabel control={<Checkbox checked={formData.authRequired} onChange={(e) => update({ authRequired: e.target.checked })} sx={{ color: "#00D4AA60", "&.Mui-checked": { color: "#00D4AA" } }} />} label="Secure sign-in" sx={fsChoiceCardSx(formData.authRequired, "#00D4AA")} />
          <FormControlLabel control={<Checkbox checked={formData.pushNotifications} onChange={(e) => update({ pushNotifications: e.target.checked })} sx={{ color: "#00D4AA60", "&.Mui-checked": { color: "#00D4AA" } }} />} label="Push notifications" sx={fsChoiceCardSx(formData.pushNotifications, "#00D4AA")} />
          <FormControlLabel control={<Checkbox checked={formData.offlineCapability} onChange={(e) => update({ offlineCapability: e.target.checked })} sx={{ color: "#00D4AA60", "&.Mui-checked": { color: "#00D4AA" } }} />} label="Offline operation" sx={fsChoiceCardSx(formData.offlineCapability, "#00D4AA")} />
        </Box>
      </Stack>
    ),
    validate: (fd) => fd.platforms.length ? null : "Select a target mobile platform.",
  },
  {
    key: "aiDetails",
    label: "What Should the Intelligence Layer Do?",
    sublabel: "Choose the dominant capability. We’ll refine the model and data strategy during discovery.",
    color: "#6C63FF",
    accent: "#8B85FF",
    icon: <SmartToyOutlinedIcon sx={{ fontSize: 48 }} />,
    shouldShow: (fd) => fd.projectTypes.includes("ai_system"),
    render: ({ formData, update }) => (
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.4fr 0.6fr" }, gap: 1.5, width: "100%", maxWidth: 900 }}>
        <FormControl fullWidth>
          <InputLabel sx={{ fontFamily: "monospace", letterSpacing: "0.05em" }}>AI Type</InputLabel>
          <Select
            value={formData.aiType}
            label="AI Type"
            onChange={(e) => update({ aiType: e.target.value })}
            sx={{
              background: "rgba(108, 99, 255, 0.03)",
              "& fieldset": { borderColor: "rgba(108,99,255,0.2)" },
            }}
          >
            <MenuItem value="prediction">Prediction</MenuItem>
            <MenuItem value="nlp">Language, search, or document understanding</MenuItem>
            <MenuItem value="computer_vision">Computer Vision</MenuItem>
            <MenuItem value="agentic_automation">Agentic workflow automation</MenuItem>
            <MenuItem value="recommendation">Recommendation or decision support</MenuItem>
          </Select>
        </FormControl>
        <FormControlLabel
          control={<Checkbox checked={formData.datasetAvailable} onChange={(e) => update({ datasetAvailable: e.target.checked })} sx={{ color: "#6C63FF60", "&.Mui-checked": { color: "#6C63FF" } }} />}
          label="Existing data is available"
          sx={fsChoiceCardSx(formData.datasetAvailable, "#6C63FF")}
        />
      </Box>
    ),
    validate: (fd) => fd.aiType ? null : "Select the primary AI capability.",
  },
  {
    key: "features",
    label: "What Must the First Release Do?",
    sublabel: "Add only essential capabilities. Type one clear capability and press Enter.",
    color: "#00D4AA",
    accent: "#33DDBB",
    icon: <FeaturedPlayListOutlinedIcon sx={{ fontSize: 48 }} />,
    render: ({ formData, update }) => (
      <Box sx={{ width: "100%", maxWidth: 860 }}>
        <TextField
          fullWidth
          autoFocus
          placeholder="e.g. Approve applications with a recorded decision trail"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const input = e.target as HTMLInputElement;
              if (input.value.trim()) {
                update({ features: [...formData.features, input.value.trim()] });
                input.value = "";
              }
            }
          }}
          sx={{ mb: 2, ...fsFieldSx }}
        />
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", justifyContent: "center" }}>
          {formData.features.map((feature, i) => (
            <Chip
              key={i}
              label={feature}
              onDelete={() => update({ features: formData.features.filter((_, idx) => idx !== i) })}
              sx={{
                borderColor: "#00D4AA40",
                color: "#00D4AA",
                "& .MuiChip-deleteIcon": { color: "#00D4AA60", "&:hover": { color: "#00D4AA" } },
              }}
              variant="outlined"
            />
          ))}
        </Stack>
      </Box>
    ),
  },
  {
    key: "integrations",
    label: "What Must It Connect To?",
    sublabel: "List existing systems, databases, payment rails, identity providers, devices, or APIs. Leave blank if none are known.",
    color: "#6C63FF",
    accent: "#8B85FF",
    icon: <CategoryOutlinedIcon sx={{ fontSize: 48 }} />,
    render: ({ formData, update }) => (
      <TextField fullWidth autoFocus multiline rows={5} value={formData.integrations} onChange={(e) => update({ integrations: e.target.value })} placeholder="e.g. Microsoft Entra ID, Mobile Money, an existing PostgreSQL registry, SMS gateway…" sx={{ maxWidth: 820, ...fsFieldSx }} />
    ),
  },
  {
    key: "securityRequirements",
    label: "Which Trust Requirements Already Matter?",
    sublabel: "Select known constraints. ‘Not sure yet’ is a valid answer at this stage.",
    color: "#00D4AA",
    accent: "#33DDBB",
    icon: <FeaturedPlayListOutlinedIcon sx={{ fontSize: 48 }} />,
    render: ({ formData, update }) => (
      <FormGroup sx={fsChoiceGridSx}>
        {securityOptions.map((option) => (
          <FormControlLabel key={option} control={<Checkbox checked={formData.securityRequirements.includes(option)} onChange={(e) => {
            if (!e.target.checked) {
              update({ securityRequirements: formData.securityRequirements.filter((v) => v !== option) });
              return;
            }
            update({ securityRequirements: option === "Not sure yet" ? [option] : [...formData.securityRequirements.filter((v) => v !== "Not sure yet"), option] });
          }} sx={{ color: "#00D4AA60", "&.Mui-checked": { color: "#00D4AA" } }} />} label={option} sx={fsChoiceCardSx(formData.securityRequirements.includes(option), "#00D4AA")} />
        ))}
      </FormGroup>
    ),
  },
  {
    key: "budget",
    label: "What Investment Range Is Approved or Plausible?",
    sublabel: "An honest range lets us recommend the right engagement shape instead of over-scoping.",
    color: "#6C63FF",
    accent: "#8B85FF",
    icon: <AttachMoneyIcon sx={{ fontSize: 48 }} />,
    render: ({ formData, update }) => (
      <FormGroup sx={fsChoiceGridSx}>
        {budgetRanges.map((range) => (
          <Box
            key={range}
            onClick={() => update({ budget: range })}
            sx={{ ...fsChoiceCardSx(formData.budget === range, "#6C63FF"), display: "flex", alignItems: "center" }}
          >
            <Typography sx={{ fontWeight: formData.budget === range ? 700 : 400, fontFamily: "monospace" }}>
              {range}
            </Typography>
          </Box>
        ))}
      </FormGroup>
    ),
    validate: (fd) => fd.budget ? null : "Select the investment range you are planning around.",
  },
  {
    key: "timeline",
    label: "What Delivery Window Are You Working Toward?",
    sublabel: "Choose the practical window, not the most optimistic one.",
    color: "#00D4AA",
    accent: "#33DDBB",
    icon: <ScheduleOutlinedIcon sx={{ fontSize: 48 }} />,
    render: ({ formData, update }) => (
      <FormGroup sx={fsChoiceGridSx}>
        {timelines.map((t) => (
          <Box
            key={t}
            onClick={() => update({ timeline: t })}
            sx={{ ...fsChoiceCardSx(formData.timeline === t, "#00D4AA"), display: "flex", alignItems: "center" }}
          >
            <Typography sx={{ fontWeight: formData.timeline === t ? 700 : 400, fontFamily: "monospace" }}>
              {t}
            </Typography>
          </Box>
        ))}
      </FormGroup>
    ),
    validate: (fd) => fd.timeline ? null : "Select the delivery window you are working toward.",
  },
  {
    key: "specFile",
    label: "Specification Document",
    sublabel: "Have a full spec or requirements doc? Upload it here — totally optional.",
    color: "#6C63FF",
    accent: "#8B85FF",
    icon: <CloudUploadOutlinedIcon sx={{ fontSize: 48 }} />,
    render: ({ formData, extra }) => (
      <Box sx={{ width: "100%", maxWidth: 760 }}>
        <FileUpload
          file={formData.specFile}
          uploaded={formData.specUploaded}
          uploading={extra?.uploading}
          onFile={extra?.onSpecFile ?? (() => {})}
          onRemove={extra?.onSpecRemove ?? (() => {})}
          variant="fullscreen"
        />
      </Box>
    ),
  },
  {
    key: "review",
    label: "Review & Submit",
    sublabel: "Everything look good?",
    color: "#00D4AA",
    accent: "#33DDBB",
    icon: <AutoAwesomeIcon sx={{ fontSize: 48 }} />,
    render: ({ formData }) => {
      const items = [
        { label: "Project Type", value: formData.projectTypes.map((t) => projectTypes.find((pt) => pt.value === t)?.label).join(", "), color: "#6C63FF", index: "R1" },
        { label: "Title", value: formData.title, color: "#00D4AA", index: "R2" },
        { label: "Stage", value: formData.projectStage, color: "#8B85FF", index: "R3" },
        { label: "Organisation Type", value: formData.organisationType, color: "#00D4AA", index: "R4" },
        { label: "Contact", value: formData.name, color: "#6C63FF", index: "R5" },
        { label: "Email", value: formData.email, color: "#00D4AA", index: "R6" },
        ...(formData.company ? [{ label: "Organisation", value: formData.company, color: "#8B85FF", index: "R7" }] : []),
        { label: "Budget", value: formData.budget, color: "#6C63FF", index: "R8" },
        { label: "Timeline", value: formData.timeline, color: "#00D4AA", index: "R9" },
        ...((formData.specFile || formData.specUploaded) ? [{ label: "Spec File", value: formData.specFile?.name ?? formData.specUploaded?.name ?? "", color: "#8B85FF", index: "R10" }] : []),
      ];

      return (
        <Box sx={{ width: "100%" }}>
          {/* Description — full width */}
          <ReviewCell color="#8B85FF" index="R0" label="Description" value={formData.description} full />
          <ReviewCell color="#00D4AA" index="RU" label="Primary users" value={formData.primaryUsers} full />
          <ReviewCell color="#6C63FF" index="RS" label="Success criteria" value={formData.successCriteria} full />
          {formData.integrations && <ReviewCell color="#8B85FF" index="RI" label="Integrations" value={formData.integrations} full />}
          {formData.securityRequirements.length > 0 && <ReviewCell color="#00D4AA" index="RT" label="Trust requirements" value={formData.securityRequirements.join(", ")} full />}

          {/* Grid pairs */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            }}
          >
            {items.map((item, i) => (
              <ReviewCell
                key={item.label}
                color={item.color}
                index={item.index}
                label={item.label}
                value={item.value || "—"}
                borderRight={i % 2 === 0}
              />
            ))}
          </Box>

          {/* Features — full width */}
          {formData.features.length > 0 && (
            <ReviewCell color="#00D4AA" index="RF" label="Features" full>
              <Stack sx={{ flexWrap: "wrap" }} direction="row" spacing={0.75} useFlexGap>
                {formData.features.map((f, i) => (
                  <Chip
                    key={i}
                    label={f}
                    size="small"
                    sx={{
                      borderColor: "#00D4AA30",
                      color: "#00D4AA",
                      fontFamily: "monospace",
                      fontSize: "0.7rem",
                    }}
                    variant="outlined"
                  />
                ))}
              </Stack>
            </ReviewCell>
          )}
        </Box>
      );
    },
  },
];

const fsFieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "rgba(108,99,255,0.045)",
    borderRadius: 2,
    fontSize: "1.1rem",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.025)",
    transition: "background-color 0.2s ease, box-shadow 0.2s ease",
    "& fieldset": { borderColor: "rgba(108,99,255,0.2)" },
    "&:hover": { bgcolor: "rgba(108,99,255,0.065)" },
    "&:hover fieldset": { borderColor: "rgba(108,99,255,0.45)" },
    "&.Mui-focused": { bgcolor: "rgba(108,99,255,0.075)", boxShadow: "0 14px 36px rgba(34,31,90,0.18), inset 3px 0 0 #6C63FF" },
    "&.Mui-focused fieldset": { borderColor: "#6C63FF", borderWidth: 1 },
  },
  "& .MuiInputBase-input": { py: 1.7 },
  "& textarea.MuiInputBase-input": { lineHeight: 1.75 },
};

// Floating particles for fullscreen background
const fsParticles = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  x: `${Math.random() * 100}%`,
  y: `${Math.random() * 100}%`,
  size: 2 + Math.random() * 3,
  delay: Math.random() * 3,
  duration: 5 + Math.random() * 6,
}));

function FullscreenMode({
  onExit,
  onCancel,
  formData,
  update,
  onSubmit,
  onReset,
  loading,
  uploading,
  onSpecFile,
  onSpecRemove,
  error,
  stepIndex,
  setStepIndex,
}: {
  onExit: () => void;
  onCancel: () => void;
  formData: FormData;
  update: (fields: Partial<FormData>) => void;
  onSubmit: () => Promise<void>;
  onReset: () => void;
  loading: boolean;
  uploading: boolean;
  onSpecFile: (f: File) => void;
  onSpecRemove: () => void;
  error: string | null;
  stepIndex: number;
  setStepIndex: (i: number | ((prev: number) => number)) => void;
}) {
  const tc = useThemeColors();
  const [direction, setDirection] = useState(1);
  const [stepError, setStepError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  const visibleSteps = fullscreenSteps.filter((s) => !s.shouldShow || s.shouldShow(formData));
  const safeIndex = Math.min(stepIndex, visibleSteps.length - 1);
  useEffect(() => {
    if (safeIndex !== stepIndex) setStepIndex(safeIndex);
  }, [safeIndex, stepIndex, setStepIndex]);
  const step = visibleSteps[safeIndex]!;
  const isFirst = safeIndex === 0;
  const isLast = safeIndex === visibleSteps.length - 1;
  const progress = ((safeIndex + 1) / visibleSteps.length) * 100;

  const goNext = () => {
    const validationMessage = step.validate?.(formData) ?? (isLast ? validateProject(formData) : null);
    if (validationMessage) {
      setStepError(validationMessage);
      return;
    }
    setStepError(null);
    if (isLast) {
      onSubmit();
      return;
    }
    setDirection(1);
    setStepIndex((prev) => Math.min(prev + 1, visibleSteps.length - 1));
  };

  const goBack = () => {
    setStepError(null);
    setDirection(-1);
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && step.key !== "features" && step.key !== "description") {
        e.preventDefault();
        goNext();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [safeIndex, isLast, formData, step.key],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: tc.fullscreenBg,
        overflow: "hidden",
      }}
    >
      {/* Particles */}
      {fsParticles.map((p) => (
        <MotionBox
          key={p.id}
          animate={{
            opacity: [0, 0.5, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          sx={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.id % 2 === 0 ? tc.particle1 : tc.particle2,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Grid background */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${tc.gridLine} 1px, transparent 1px),
            linear-gradient(90deg, ${tc.gridLine} 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          pointerEvents: "none",
        }}
      />

      {/* Gradient orbs */}
      <MotionBox
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        sx={{
          position: "absolute",
          top: "-15%",
          left: "-10%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${step.color}20 0%, transparent 70%)`,
          filter: "blur(100px)",
          pointerEvents: "none",
          transition: "background 0.5s",
        }}
      />
      <MotionBox
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        sx={{
          position: "absolute",
          bottom: "-15%",
          right: "-10%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${step.accent}15 0%, transparent 70%)`,
          filter: "blur(100px)",
          pointerEvents: "none",
          transition: "background 0.5s",
        }}
      />

      {/* Progress bar */}
      <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 3,
            background: tc.dark ? "rgba(108,99,255,0.08)" : "rgba(91,84,238,0.1)",
            "& .MuiLinearProgress-bar": {
              background: `linear-gradient(90deg, ${step.color}, ${step.accent})`,
            },
          }}
        />
      </Box>

      {/* Top-right controls */}
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        sx={{ position: "absolute", top: 24, right: { xs: 16, md: 32 }, zIndex: 10, display: "flex", gap: 1, alignItems: "center" }}
      >
        <Button
          onClick={() => setCancelOpen(true)}
          startIcon={<CloseIcon />}
          sx={{
            color: "error.main",
            fontWeight: 700,
            fontFamily: "monospace",
            fontSize: "0.7rem",
            letterSpacing: "0.08em",
            border: "1px solid",
            borderColor: "rgba(239,68,68,0.24)",
            px: { xs: 1.25, md: 1.75 },
            whiteSpace: "nowrap",
            "&:hover": { borderColor: "error.main", bgcolor: "rgba(239,68,68,0.08)" },
          }}
        >
          Exit
        </Button>
        <Button
          onClick={onReset}
          sx={{
            color: "text.secondary",
            fontWeight: 600,
            fontFamily: "monospace",
            fontSize: "0.7rem",
            letterSpacing: "0.1em",
            opacity: 0.6,
            "&:hover": { color: "text.primary", opacity: 1 },
          }}
        >
          Start Over
        </Button>
        <Button
          onClick={onExit}
          startIcon={<FullscreenExitIcon />}
          sx={{
            color: "text.secondary",
            fontWeight: 600,
            fontFamily: "monospace",
            fontSize: "0.75rem",
            letterSpacing: "0.1em",
            "&:hover": { color: "text.primary" },
          }}
        >
          Normal Form
        </Button>
      </MotionBox>

      <Dialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { border: "1px solid rgba(239,68,68,0.24)", bgcolor: "background.paper" } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Exit project intake?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
            This will discard the current draft and return you to the homepage. You won’t be able to recover these answers.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setCancelOpen(false)} color="inherit">Keep editing</Button>
          <Button onClick={onCancel} color="error" variant="contained">Discard and exit</Button>
        </DialogActions>
      </Dialog>

      {/* Step counter */}
      <Box sx={{ position: "absolute", top: 28, left: 32, zIndex: 10 }}>
        <Typography
          sx={{
            fontFamily: "monospace",
            fontSize: "0.7rem",
            color: "text.secondary",
            opacity: 0.5,
            letterSpacing: "0.15em",
          }}
        >
          {String(safeIndex + 1).padStart(2, "0")} / {String(visibleSteps.length).padStart(2, "0")}
        </Typography>
      </Box>

      {/* Content */}
      <Box
        sx={{
          position: "absolute",
          top: 60,
          bottom: 100,
          left: 0,
          right: 0,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflowY: "auto",
          px: step.key === "review" ? { xs: 2, md: 6 } : { xs: 2, sm: 4, md: 6 },
          py: 2,
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": { background: tc.scrollThumb, borderRadius: 2 },
        }}
      >
        <Box sx={{ maxWidth: step.key === "review" ? "100%" : 1040, width: "100%", textAlign: "center" }}>
        <AnimatePresence mode="wait" custom={direction}>
          <MotionBox
            key={step.key}
            custom={direction}
            initial={{ x: direction > 0 ? 200 : -200, opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ x: direction > 0 ? -200 : 200, opacity: 0, scale: 0.95, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
            }}
          >
            {/* Icon */}
            <Box sx={{ position: "relative", mb: 3 }}>
              <MotionBox
                animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.08, 0.25] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                sx={{
                  position: "absolute",
                  inset: -16,
                  borderRadius: "50%",
                  border: `2px solid ${step.color}`,
                }}
              />
              <Box
                sx={{
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `linear-gradient(135deg, ${step.color}20, ${step.accent}10)`,
                  border: `1px solid ${step.color}30`,
                  color: step.color,
                }}
              >
                {step.icon}
              </Box>
            </Box>

            {/* Title */}
            <MotionTypography
              variant="h3"
              sx={{ fontWeight: 800,
                mb: 1,
                background: `linear-gradient(135deg, ${step.color}, ${step.accent})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
                fontSize: { xs: "1.6rem", md: "2.2rem" },
              }}
            >
              {step.label}
            </MotionTypography>

            {step.sublabel && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 2.5, md: 3.5 }, opacity: 0.68, maxWidth: 620, lineHeight: 1.7 }}>
                {step.sublabel}
              </Typography>
            )}

            {/* Render step content */}
            {step.render({
              formData,
              update: (fields) => {
                update(fields);
                setStepError(null);
              },
              extra: { uploading, onSpecFile, onSpecRemove },
            })}

            {(stepError || error) && (
              <Alert severity="error" sx={{ mt: 3, width: "100%", maxWidth: 760 }} onClose={() => {}}>
                {stepError || error}
              </Alert>
            )}
          </MotionBox>
        </AnimatePresence>
        </Box>
      </Box>

      {/* Navigation */}
      <Box
        sx={{
          position: "absolute",
          bottom: { xs: 20, md: 40 },
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: { xs: 1.5, md: 3 },
          px: 2,
          zIndex: 10,
        }}
      >
        <IconButton
          onClick={goBack}
          disabled={isFirst || loading}
          sx={{
            color: "text.secondary",
            border: `1px solid ${tc.fieldBorder}`,
            "&:disabled": { opacity: 0.3 },
            "&:hover": { borderColor: tc.fieldHover },
          }}
        >
          <ArrowBackIcon />
        </IconButton>

        {/* Dots */}
        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", flexShrink: 1, minWidth: 0, overflow: "hidden" }}>
          {visibleSteps.map((_, i) => (
            <Box
              key={i}
              sx={{
                width: i === safeIndex ? { xs: 16, md: 24 } : { xs: 5, md: 6 },
                height: { xs: 5, md: 6 },
                borderRadius: 3,
                background: i === safeIndex ? step.color : "rgba(148, 163, 184, 0.25)",
                transition: "all 0.3s",
                cursor: i < safeIndex ? "pointer" : "default",
              }}
              onClick={() => {
                if (i < safeIndex) {
                  setDirection(-1);
                  setStepIndex(i);
                }
              }}
            />
          ))}
        </Box>

        {isLast ? (
          <Button
            onClick={goNext}
            disabled={loading}
            variant="contained"
            endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardIcon />}
            sx={{
              px: { xs: 2.5, md: 4 },
              py: { xs: 1, md: 1.2 },
              fontSize: { xs: "0.75rem", md: "0.875rem" },
              fontWeight: 700,
              fontFamily: "monospace",
              letterSpacing: "0.1em",
              borderRadius: 2,
              background: `linear-gradient(135deg, ${step.color}, ${step.accent})`,
              boxShadow: `0 4px 16px ${step.color}40`,
              "&:hover": { boxShadow: `0 6px 24px ${step.color}50` },
            }}
          >
            {loading ? "Submitting..." : "Submit Project"}
          </Button>
        ) : (
          <IconButton
            onClick={goNext}
            sx={{
              color: "text.primary",
              border: `1px solid ${step.color}40`,
              bgcolor: `${step.color}10`,
              "&:hover": { bgcolor: `${step.color}20` },
            }}
          >
            <ArrowForwardIcon />
          </IconButton>
        )}
      </Box>

      {/* Enter hint */}
      {!isFirst && !isLast && step.key !== "features" && step.key !== "description" && (
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          sx={{ position: "absolute", bottom: 12, zIndex: 10 }}
        >
          <Typography
            sx={{
              fontFamily: "monospace",
              fontSize: "0.6rem",
              color: "text.secondary",
              opacity: 0.3,
              letterSpacing: "0.15em",
            }}
          >
            PRESS ENTER TO CONTINUE
          </Typography>
        </MotionBox>
      )}
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── DRAMATIC SUCCESS SCREEN ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function SuccessScreen({ onExit, isFullscreen }: { onExit: () => void; isFullscreen: boolean }) {
  const tc = useThemeColors();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 2000);
    const t3 = setTimeout(() => setPhase(3), 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (!isFullscreen) {
    // Normal mode success — matches Contact page style
    return (
      <MotionBox
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
      >
        <Cell color="#00D4AA" index="OK" colInRow={0} totalCols={1} minH={{ xs: 300, md: 400 }}>
          <Box sx={{ textAlign: "center", py: 4 }}>
            <MotionBox initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} sx={{ mb: 3 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 80, color: "#00D4AA", filter: "drop-shadow(0 0 20px rgba(0,212,170,0.4))" }} />
            </MotionBox>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, letterSpacing: "-0.02em", textTransform: "uppercase", color: "text.secondary" }}>
              Project Submitted
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 440, mx: "auto", mb: 2, opacity: 0.6 }}>
              Thank you for entrusting us with your vision. Our team will review your submission and generate a professional specification document. Expect to hear from us within 24 hours.
            </Typography>
            <Stack spacing={1} sx={{ maxWidth: 380, mx: "auto", mb: 4, textAlign: "left" }}>
              {[
                "Our team reviews your submission",
                "A specification document is generated",
                "You'll receive an invitation to review",
                "Project kicks off upon approval",
              ].map((text, i) => (
                <Typography key={i} variant="body2" sx={{ color: "text.secondary", opacity: 0.5, fontFamily: "monospace", fontSize: "0.75rem" }}>
                  {String(i + 1).padStart(2, "0")}. {text}
                </Typography>
              ))}
            </Stack>
            <Button
              variant="outlined"
              href="/"
              sx={{
                borderColor: "#00D4AA30",
                color: "#00D4AA",
                fontFamily: "monospace",
                letterSpacing: "0.1em",
                "&:hover": { borderColor: "#00D4AA60", background: "#00D4AA08" },
              }}
            >
              BACK TO HOME
            </Button>
          </Box>
        </Cell>
      </MotionBox>
    );
  }

  // Fullscreen dramatic success
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: tc.fullscreenBg,
        overflow: "hidden",
      }}
    >
      {/* Particles burst */}
      {Array.from({ length: 30 }, (_, i) => (
        <MotionBox
          key={i}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0.5],
            x: (Math.random() - 0.5) * 800,
            y: (Math.random() - 0.5) * 800,
          }}
          transition={{ duration: 2 + Math.random() * 2, delay: 0.5 + Math.random() * 0.5, ease: "easeOut" }}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 3 + Math.random() * 5,
            height: 3 + Math.random() * 5,
            borderRadius: "50%",
            background: i % 3 === 0 ? "#6C63FF" : i % 3 === 1 ? "#00D4AA" : "#8B85FF",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Pulsing rings */}
      {[0, 0.4, 0.8].map((delay, i) => (
        <MotionBox
          key={i}
          initial={{ scale: 0.5, opacity: 0.6 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 2, delay: 0.8 + delay, ease: "easeOut" }}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 100,
            height: 100,
            borderRadius: "50%",
            border: "2px solid #00D4AA",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Gradient orbs */}
      <MotionBox
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        sx={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, #00D4AA15 0%, transparent 60%)",
          filter: "blur(100px)",
          pointerEvents: "none",
        }}
      />

      <Box sx={{ position: "relative", zIndex: 2, textAlign: "center", px: 4, maxWidth: 600 }}>
        {/* Checkmark */}
        <MotionBox
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 150, damping: 12 }}
          sx={{ mb: 4 }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #00D4AA20, #6C63FF10)",
              border: "2px solid #00D4AA40",
              mx: "auto",
            }}
          >
            <CheckCircleOutlineIcon
              sx={{
                fontSize: 64,
                color: "#00D4AA",
                filter: "drop-shadow(0 0 20px rgba(0,212,170,0.5))",
              }}
            />
          </Box>
        </MotionBox>

        {/* Phase 1: Title */}
        <AnimatePresence>
          {phase >= 1 && (
            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <Typography
                variant="h2"
                sx={{ fontWeight: 800,
                  mb: 2,
                  background: "linear-gradient(135deg, #00D4AA, #6C63FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.03em",
                  fontSize: { xs: "2rem", md: "3rem" },
                }}
              >
                Mission Received
              </Typography>
            </MotionBox>
          )}
        </AnimatePresence>

        {/* Phase 2: Message */}
        <AnimatePresence>
          {phase >= 2 && (
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color: "text.secondary",
                  fontWeight: 400,
                  lineHeight: 1.7,
                  opacity: 0.8,
                }}
              >
                Thank you for trusting NeuroDyne Corp with your vision.
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  opacity: 0.5,
                  lineHeight: 1.8,
                  maxWidth: 480,
                  mx: "auto",
                }}
              >
                Our engineering team is already on it. We'll analyze your requirements,
                craft a professional specification, and reach out within 24 hours.
                This is going to be extraordinary.
              </Typography>
            </MotionBox>
          )}
        </AnimatePresence>

        {/* Phase 3: CTA */}
        <AnimatePresence>
          {phase >= 3 && (
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              sx={{ mt: 5 }}
            >
              <Button
                onClick={onExit}
                variant="contained"
                sx={{
                  px: 5,
                  py: 1.5,
                  fontWeight: 700,
                  fontFamily: "monospace",
                  letterSpacing: "0.1em",
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #00D4AA, #6C63FF)",
                  boxShadow: "0 4px 20px rgba(0,212,170,0.3)",
                  "&:hover": { boxShadow: "0 6px 28px rgba(0,212,170,0.4)" },
                }}
              >
                Return Home
              </Button>
            </MotionBox>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── ERROR BOUNDARY ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

class FullscreenErrorBoundary extends Component<
  { children: ReactNode; onFallback: () => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onFallback();
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export default function StartProject() {
  const tc = useThemeColors();
  const fieldSx = useFieldSx();
  const saved = useRef(loadState());
  const [isFullscreen, setIsFullscreen] = useState(saved.current?.isFullscreen ?? true);
  const [stepIndex, setStepIndex] = useState(saved.current?.stepIndex ?? 0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(() => {
    if (saved.current?.formData) {
      return { ...initialFormData, ...saved.current.formData, specFile: null };
    }
    return initialFormData;
  });

  const handleSpecFile = async (f: File) => {
    setFormData((prev) => ({ ...prev, specFile: f }));
    setUploading(true);
    try {
      const uploaded = await api.uploadFile(f, "specifications");
      setFormData((prev) => ({
        ...prev,
        specUploaded: { name: f.name, size: f.size, url: uploaded.url },
      }));
    } catch {
      // Keep the File in state so user sees it, but no persisted URL
    } finally {
      setUploading(false);
    }
  };

  const handleSpecRemove = () => {
    setFormData((prev) => ({ ...prev, specFile: null, specUploaded: null }));
  };

  // Persist state on changes
  useEffect(() => {
    if (!submitted) {
      saveState(formData, isFullscreen, stepIndex);
    }
  }, [formData, isFullscreen, stepIndex, submitted]);

  const update = (fields: Partial<FormData>) => {
    setError(null);
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleReset = () => {
    clearState();
    setFormData(initialFormData);
    setIsFullscreen(true);
    setStepIndex(0);
    setError(null);
  };

  const handleCancel = () => {
    clearState();
    window.location.href = "/";
  };

  const handleSubmit = async () => {
    setError(null);
    const validationMessage = validateProject(formData, isFullscreen);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }
    setLoading(true);
    try {
      // Use already-uploaded URL, or upload now as fallback
      let specFileUrl = formData.specUploaded?.url;
      if (!specFileUrl && formData.specFile) {
        try {
          const uploaded = await api.uploadFile(formData.specFile, "specifications");
          specFileUrl = uploaded.url;
        } catch {
          // Non-blocking — continue without the file
        }
      }

      const intakeContext = [
        formData.primaryUsers.trim() ? `Primary users: ${formData.primaryUsers.trim()}` : "",
        formData.successCriteria.trim() ? `Success criteria: ${formData.successCriteria.trim()}` : "",
        formData.projectStage ? `Initiative stage: ${formData.projectStage}` : "",
        formData.organisationType ? `Organisation: ${formData.company.trim() || "Not provided"} (${formData.organisationType})` : (formData.company.trim() ? `Organisation: ${formData.company.trim()}` : ""),
        `Contact: ${formData.name.trim()} <${formData.email.trim()}>`,
        formData.integrations.trim() ? `Integrations: ${formData.integrations.trim()}` : "",
        formData.securityRequirements.length ? `Trust requirements: ${formData.securityRequirements.join(", ")}` : "",
      ].filter(Boolean).join("\n");

      await api.createProject({
        title: formData.title,
        description: `${formData.description.trim()}\n\n--- Intake context ---\n${intakeContext}${specFileUrl ? `\n\n[Specification Document](${specFileUrl})` : ""}`,
        type: formData.projectTypes.join(", "),
        features: formData.features.map((name) => ({
          name,
          description: "",
          priority: "medium",
          complexity: "medium",
        })),
        budget_range: parseBudgetRange(formData.budget),
        timeline: parseTimeline(formData.timeline),
      });
      clearState();
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Submitted state ──
  if (submitted) {
    return (
      <>
        <SEO title="Project Submitted" />
        {isFullscreen ? (
          <SuccessScreen isFullscreen onExit={() => (window.location.href = "/")} />
        ) : (
          <SuccessScreen isFullscreen={false} onExit={() => (window.location.href = "/")} />
        )}
      </>
    );
  }

  // ── Fullscreen mode ──
  if (isFullscreen) {
    return (
      <>
        <SEO
          title="Start a Project"
          description="Start your software project with NeuroDyne Corp."
          canonical="https://neurodyne.dev/start-project"
          ogUrl="https://neurodyne.dev/start-project"
        />
        <FullscreenErrorBoundary onFallback={() => setIsFullscreen(false)}>
          <FullscreenMode
            onExit={() => setIsFullscreen(false)}
            onCancel={handleCancel}
            formData={formData}
            update={update}
            onSubmit={handleSubmit}
            onReset={handleReset}
            loading={loading}
            uploading={uploading}
            onSpecFile={handleSpecFile}
            onSpecRemove={handleSpecRemove}
            error={error}
            stepIndex={stepIndex}
            setStepIndex={setStepIndex}
          />
        </FullscreenErrorBoundary>
      </>
    );
  }

  // ── Normal mode (Contact-style grid) ──
  return (
    <>
      <SEO
        title="Start a Project"
        description="Start your software project with NeuroDyne Corp. Our intelligent questionnaire transforms your idea into a professional specification."
        canonical="https://neurodyne.dev/start-project"
        ogUrl="https://neurodyne.dev/start-project"
      />

      {/* ═══ HERO ═══ */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.6fr 0.4fr" },
          borderBottom: `1px solid ${BORDER}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: tc.dark
              ? "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(108,99,255,0.04) 2px, rgba(108,99,255,0.04) 4px)"
              : "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(91,84,238,0.03) 2px, rgba(91,84,238,0.03) 4px)",
            pointerEvents: "none",
            zIndex: 50,
          }}
        />

        <Cell color="#6C63FF" index="00" colInRow={0} totalCols={2} minH={{ xs: 300, md: 360 }}>
          <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Typography
              sx={{
                fontSize: "0.6rem",
                fontFamily: "monospace",
                fontWeight: 600,
                color: "#6C63FF",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                mb: 3,
                opacity: 0.7,
              }}
            >
              INITIATE // SEQUENCE
            </Typography>

            <Typography
              variant="h1"
              sx={{
                mb: 3,
                fontSize: { xs: "2.2rem", md: "3.4rem" },
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                color: "text.secondary",
              }}
            >
              Start Your{" "}
              <Box
                component="span"
                sx={{
                  background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Project
              </Box>
            </Typography>

            <Typography variant="body1" sx={{ maxWidth: 480, color: "text.secondary", opacity: 0.6, lineHeight: 1.8 }}>
              Answer a few questions and we'll create a professional specification for your project.
            </Typography>
          </MotionBox>
        </Cell>

        <Cell color="#00D4AA" index="—" colInRow={1} totalCols={2} minH={{ xs: 160, md: 360 }}>
          <Box sx={{ textAlign: "center" }}>
            <MotionBox
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 180, delay: 0.2 }}
            >
              <RocketLaunchOutlinedIcon
                sx={{
                  fontSize: { xs: 80, md: 120 },
                  color: "#00D4AA",
                  filter: "drop-shadow(0 0 20px rgba(0,212,170,0.3)) drop-shadow(0 0 60px rgba(0,212,170,0.15))",
                }}
              />
            </MotionBox>
            <Typography
              sx={{
                mt: 2,
                fontFamily: "monospace",
                fontSize: "0.65rem",
                color: "text.secondary",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                opacity: 0.4,
              }}
            >
              LAUNCH SEQUENCE
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row", md: "column", lg: "row" }}
              spacing={1}
              sx={{ mt: 2, alignItems: "center", justifyContent: "center" }}
            >
              <Button
                onClick={() => setIsFullscreen(true)}
                startIcon={<FullscreenIcon />}
                sx={{
                  color: "#00D4AA",
                  fontFamily: "monospace",
                  fontSize: "0.7rem",
                  letterSpacing: "0.1em",
                  whiteSpace: "nowrap",
                  border: "1px solid #00D4AA30",
                  "&:hover": { borderColor: "#00D4AA60", background: "#00D4AA08" },
                }}
              >
                Immersive Mode
              </Button>
              <Button
                onClick={handleReset}
                sx={{
                  color: "text.secondary",
                  fontFamily: "monospace",
                  fontSize: "0.7rem",
                  letterSpacing: "0.1em",
                  whiteSpace: "nowrap",
                  opacity: 0.6,
                  "&:hover": { opacity: 1 },
                }}
              >
                Start Over
              </Button>
            </Stack>
          </Box>
        </Cell>
      </Box>

      {/* ═══ FORM GRID ═══ */}
      <SectionLabel text="PROJECT DETAILS" />

      <AnimatePresence mode="wait">
        <Box key="form">
          <AnimatePresence>
            {error && (
              <MotionBox
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                sx={{ px: 3, py: 2, borderBottom: `1px solid ${BORDER}` }}
              >
                <Alert severity="error" variant="outlined" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                  {error}
                </Alert>
              </MotionBox>
            )}
          </AnimatePresence>

          {/* Row 1: Name | Email */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
            <Cell color="#6C63FF" index="01" colInRow={0} totalCols={2} minH={{ xs: 100, md: 130 }} animDelay={0}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
                <PersonOutlineIcon sx={{ fontSize: 18, color: "#6C63FF", filter: "drop-shadow(0 0 4px #6C63FF40)" }} />
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#6C63FF", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>Full Name</Typography>
              </Stack>
              <TextField fullWidth required value={formData.name} onChange={(e) => update({ name: e.target.value })} placeholder="John Doe" size="small" sx={fieldSx} />
            </Cell>
            <Cell color="#00D4AA" index="02" colInRow={1} totalCols={2} minH={{ xs: 100, md: 130 }} animDelay={0.05}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
                <AlternateEmailIcon sx={{ fontSize: 18, color: "#00D4AA", filter: "drop-shadow(0 0 4px #00D4AA40)" }} />
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#00D4AA", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>Email</Typography>
              </Stack>
              <TextField fullWidth required type="email" value={formData.email} onChange={(e) => update({ email: e.target.value })} placeholder="you@company.com" size="small" sx={fieldSx} />
            </Cell>
          </Box>

          {/* Row 2: Company | Project Type */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
            <Cell color="#8B85FF" index="03" colInRow={0} totalCols={2} minH={{ xs: 100, md: 130 }} animDelay={0.1}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
                <BusinessOutlinedIcon sx={{ fontSize: 18, color: "#8B85FF", filter: "drop-shadow(0 0 4px #8B85FF40)" }} />
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#8B85FF", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>Company</Typography>
                <Chip label="OPT" size="small" sx={{ height: 16, fontSize: "0.5rem", fontFamily: "monospace", background: "#8B85FF15", color: "#8B85FF", border: "none" }} />
              </Stack>
              <TextField fullWidth value={formData.company} onChange={(e) => update({ company: e.target.value })} placeholder="Acme Corp" size="small" sx={fieldSx} />
            </Cell>
            <Cell color="#00D4AA" index="04" colInRow={1} totalCols={2} minH={{ xs: 100, md: 130 }} animDelay={0.15}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
                <CategoryOutlinedIcon sx={{ fontSize: 18, color: "#00D4AA", filter: "drop-shadow(0 0 4px #00D4AA40)" }} />
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#00D4AA", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>Project Type</Typography>
              </Stack>
              <FormGroup row sx={{ gap: 1 }}>
                {projectTypes.map((type) => (
                  <FormControlLabel
                    key={type.value}
                    control={
                      <Checkbox
                        size="small"
                        checked={formData.projectTypes.includes(type.value)}
                        onChange={(e) => {
                          const types = e.target.checked
                            ? [...formData.projectTypes, type.value]
                            : formData.projectTypes.filter((t) => t !== type.value);
                          update({ projectTypes: types });
                        }}
                      />
                    }
                    label={<Typography variant="body2">{type.label}</Typography>}
                    sx={{ mr: 0 }}
                  />
                ))}
              </FormGroup>
            </Cell>
          </Box>

          {/* Row 3: Title — full width */}
          <Cell color="#6C63FF" index="05" colInRow={0} totalCols={1} minH={{ xs: 100, md: 130 }} animDelay={0.2}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
              <TitleOutlinedIcon sx={{ fontSize: 18, color: "#6C63FF", filter: "drop-shadow(0 0 4px #6C63FF40)" }} />
              <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#6C63FF", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>Project Title</Typography>
            </Stack>
            <TextField fullWidth required value={formData.title} onChange={(e) => update({ title: e.target.value })} placeholder="e.g. Customer Analytics Dashboard" size="small" sx={fieldSx} />
          </Cell>

          {/* Row 4: Description — full width */}
          <Cell color="#00D4AA" index="06" colInRow={0} totalCols={1} minH={{ xs: 180, md: 220 }} animDelay={0.25}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
              <DescriptionOutlinedIcon sx={{ fontSize: 18, color: "#00D4AA", filter: "drop-shadow(0 0 4px #00D4AA40)" }} />
              <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#00D4AA", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>Description</Typography>
            </Stack>
            <TextField
              fullWidth
              multiline
              rows={4}
              required
              value={formData.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Tell us about the product you envision..."
              sx={fieldSx}
            />
          </Cell>

          {/* Conditional: Mobile fields */}
          {formData.projectTypes.includes("mobile_app") && (
            <Cell color="#33DDBB" index="M1" colInRow={0} totalCols={1} minH={{ xs: 100, md: 130 }} animDelay={0}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
                <PhoneIphoneOutlinedIcon sx={{ fontSize: 18, color: "#33DDBB", filter: "drop-shadow(0 0 4px #33DDBB40)" }} />
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#33DDBB", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>Mobile Configuration</Typography>
              </Stack>
              <Stack sx={{ flexWrap: "wrap" }} direction="row" spacing={2} useFlexGap>
                <FormControl>
                  <FormLabel sx={{ fontFamily: "monospace", fontSize: "0.7rem", mb: 0.5 }}>Platforms</FormLabel>
                  <FormGroup row>
                    {["iOS", "Android", "Both"].map((p) => (
                      <FormControlLabel
                        key={p}
                        control={<Checkbox size="small" checked={formData.platforms.includes(p)} onChange={(e) => { const platforms = e.target.checked ? [...formData.platforms, p] : formData.platforms.filter((x) => x !== p); update({ platforms }); }} />}
                        label={<Typography variant="body2">{p}</Typography>}
                      />
                    ))}
                  </FormGroup>
                </FormControl>
                <FormControlLabel control={<Checkbox size="small" checked={formData.authRequired} onChange={(e) => update({ authRequired: e.target.checked })} />} label={<Typography variant="body2">Auth Required</Typography>} />
                <FormControlLabel control={<Checkbox size="small" checked={formData.pushNotifications} onChange={(e) => update({ pushNotifications: e.target.checked })} />} label={<Typography variant="body2">Push Notifications</Typography>} />
                <FormControlLabel control={<Checkbox size="small" checked={formData.offlineCapability} onChange={(e) => update({ offlineCapability: e.target.checked })} />} label={<Typography variant="body2">Offline Capability</Typography>} />
              </Stack>
            </Cell>
          )}

          {/* Conditional: AI fields */}
          {formData.projectTypes.includes("ai_system") && (
            <Cell color="#8B85FF" index="A1" colInRow={0} totalCols={1} minH={{ xs: 100, md: 130 }} animDelay={0}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
                <SmartToyOutlinedIcon sx={{ fontSize: 18, color: "#8B85FF", filter: "drop-shadow(0 0 4px #8B85FF40)" }} />
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#8B85FF", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>AI Configuration</Typography>
              </Stack>
              <Stack sx={{ alignItems: "center", flexWrap: "wrap" }} direction="row" spacing={2} useFlexGap>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel size="small">AI Type</InputLabel>
                  <Select size="small" value={formData.aiType} label="AI Type" onChange={(e) => update({ aiType: e.target.value })} sx={fieldSx}>
                    <MenuItem value="prediction">Prediction</MenuItem>
                    <MenuItem value="nlp">NLP</MenuItem>
                    <MenuItem value="computer_vision">Computer Vision</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel control={<Checkbox size="small" checked={formData.datasetAvailable} onChange={(e) => update({ datasetAvailable: e.target.checked })} />} label={<Typography variant="body2">Dataset Available</Typography>} />
              </Stack>
            </Cell>
          )}

          {/* Row 5: Features — full width */}
          <Cell color="#8B85FF" index="07" colInRow={0} totalCols={1} minH={{ xs: 140, md: 170 }} animDelay={0.3}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
              <FeaturedPlayListOutlinedIcon sx={{ fontSize: 18, color: "#8B85FF", filter: "drop-shadow(0 0 4px #8B85FF40)" }} />
              <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#8B85FF", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>Features</Typography>
              <Chip label="OPT" size="small" sx={{ height: 16, fontSize: "0.5rem", fontFamily: "monospace", background: "#8B85FF15", color: "#8B85FF", border: "none" }} />
            </Stack>
            <TextField
              fullWidth
              size="small"
              placeholder="Type a feature and press Enter"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const input = e.target as HTMLInputElement;
                  if (input.value.trim()) {
                    update({ features: [...formData.features, input.value.trim()] });
                    input.value = "";
                  }
                }
              }}
              sx={{ ...fieldSx, mb: 1.5 }}
            />
            <Stack sx={{ flexWrap: "wrap" }} direction="row" spacing={1} useFlexGap>
              {formData.features.map((f, i) => (
                <Chip key={i} label={f} onDelete={() => update({ features: formData.features.filter((_, idx) => idx !== i) })} color="primary" variant="outlined" size="small" />
              ))}
            </Stack>
          </Cell>

          {/* Row 6: Budget | Timeline */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
            <Cell color="#6C63FF" index="08" colInRow={0} totalCols={2} minH={{ xs: 100, md: 130 }} animDelay={0.35}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
                <AttachMoneyIcon sx={{ fontSize: 18, color: "#6C63FF", filter: "drop-shadow(0 0 4px #6C63FF40)" }} />
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#6C63FF", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>Budget Range</Typography>
              </Stack>
              <TextField
                fullWidth
                select
                size="small"
                value={formData.budget}
                onChange={(e) => update({ budget: e.target.value })}
                sx={fieldSx}
              >
                <MenuItem value=""><em>Select budget</em></MenuItem>
                {budgetRanges.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </TextField>
            </Cell>
            <Cell color="#00D4AA" index="09" colInRow={1} totalCols={2} minH={{ xs: 100, md: 130 }} animDelay={0.4}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
                <ScheduleOutlinedIcon sx={{ fontSize: 18, color: "#00D4AA", filter: "drop-shadow(0 0 4px #00D4AA40)" }} />
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#00D4AA", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>Timeline</Typography>
              </Stack>
              <TextField
                fullWidth
                select
                size="small"
                value={formData.timeline}
                onChange={(e) => update({ timeline: e.target.value })}
                sx={fieldSx}
              >
                <MenuItem value=""><em>Select timeline</em></MenuItem>
                {timelines.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </Cell>
          </Box>

          {/* Row 7: File Upload — full width */}
          <Cell color="#8B85FF" index="10" colInRow={0} totalCols={1} minH={{ xs: 140, md: 170 }} animDelay={0.45}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
              <CloudUploadOutlinedIcon sx={{ fontSize: 18, color: "#8B85FF", filter: "drop-shadow(0 0 4px #8B85FF40)" }} />
              <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#8B85FF", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>Specification Document</Typography>
              <Chip label="OPT" size="small" sx={{ height: 16, fontSize: "0.5rem", fontFamily: "monospace", background: "#8B85FF15", color: "#8B85FF", border: "none" }} />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.5, mb: 2, fontSize: "0.8rem" }}>
              Have a full specification or requirements document? Upload it here.
            </Typography>
            <FileUpload
              file={formData.specFile}
              uploaded={formData.specUploaded}
              uploading={uploading}
              onFile={handleSpecFile}
              onRemove={handleSpecRemove}
            />
          </Cell>

          {/* Submit CTA */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: { xs: 3, md: 4 },
              position: "relative",
              overflow: "hidden",
              borderBottom: `1px solid ${BORDER}`,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                overflow: "hidden",
                pointerEvents: "none",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: "linear-gradient(90deg, transparent, #6C63FF40, transparent)",
                  animation: `${scanlinePulse} 3s linear infinite`,
                },
              }}
            />

            {[
              { top: 10, left: 10, bT: true, bL: true },
              { top: 10, right: 10, bT: true, bR: true },
              { bottom: 10, left: 10, bB: true, bL: true },
              { bottom: 10, right: 10, bB: true, bR: true },
            ].map((pos, ci) => (
              <Box
                key={ci}
                sx={{
                  position: "absolute",
                  ...(pos.top !== undefined && { top: pos.top }),
                  ...(pos.bottom !== undefined && { bottom: pos.bottom }),
                  ...(pos.left !== undefined && { left: pos.left }),
                  ...(pos.right !== undefined && { right: pos.right }),
                  width: 14,
                  height: 14,
                  borderTop: pos.bT ? "2px solid #00D4AA30" : "none",
                  borderBottom: pos.bB ? "2px solid #00D4AA30" : "none",
                  borderLeft: pos.bL ? "2px solid #00D4AA30" : "none",
                  borderRight: pos.bR ? "2px solid #00D4AA30" : "none",
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              />
            ))}

            <Button
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                px: 8,
                py: 2,
                fontSize: "0.85rem",
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#060911",
                background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
                borderRadius: 1,
                position: "relative",
                zIndex: 1,
                "&:hover": {
                  boxShadow: "0 0 30px rgba(108,99,255,0.4), 0 0 60px rgba(0,212,170,0.2)",
                  background: "linear-gradient(135deg, #7B73FF, #00E4BA)",
                },
                "&:disabled": {
                  background: "rgba(108, 99, 255, 0.2)",
                  color: "text.secondary",
                },
              }}
              endIcon={
                loading ? (
                  <CircularProgress size={18} sx={{ color: "#060911" }} />
                ) : (
                  <RocketLaunchIcon sx={{ fontSize: 18 }} />
                )
              }
            >
              {loading ? "Submitting..." : "Launch Project"}
            </Button>
          </Box>
        </Box>
      </AnimatePresence>
    </>
  );
}
