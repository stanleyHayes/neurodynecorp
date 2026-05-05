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
  keyframes,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
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
  { value: "web_app", label: "Web Application" },
  { value: "mobile_app", label: "Mobile Application" },
  { value: "ai_system", label: "AI/ML System" },
  { value: "blockchain", label: "Blockchain Platform" },
];

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
    const { specFile: _, ...rest } = formData;
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
  specFile: null,
  specUploaded: null,
};

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
            fontWeight={600}
            sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
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
        <Typography variant="body2" fontWeight={500} sx={{ wordBreak: "break-word" }}>
          {value || "—"}
        </Typography>
      )}
    </Box>
  );
}

const fullscreenSteps: FullscreenStep[] = [
  {
    key: "welcome",
    label: "Let's Build Something",
    sublabel: "Answer a few questions and we'll craft a specification for your project.",
    color: "#6C63FF",
    accent: "#8B85FF",
    icon: <RocketLaunchIcon sx={{ fontSize: 48 }} />,
    render: () => (
      <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8, maxWidth: 460, textAlign: "center" }}>
        This will only take a few minutes. We'll walk you through each step one at a time.
      </Typography>
    ),
  },
  {
    key: "projectType",
    label: "What Are You Building?",
    sublabel: "Select all that apply",
    color: "#00D4AA",
    accent: "#33DDBB",
    icon: <CategoryOutlinedIcon sx={{ fontSize: 48 }} />,
    render: ({ formData, update }) => (
      <FormGroup sx={{ gap: 1.5, width: "100%", maxWidth: 400 }}>
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
            sx={{
              border: "1px solid",
              borderColor: formData.projectTypes.includes(type.value) ? "#00D4AA50" : "rgba(108,99,255,0.12)",
              borderRadius: 2,
              p: 1.5,
              mx: 0,
              background: formData.projectTypes.includes(type.value) ? "#00D4AA08" : "transparent",
              transition: "all 0.2s",
            }}
          />
        ))}
      </FormGroup>
    ),
  },
  {
    key: "title",
    label: "Give Your Project a Name",
    sublabel: "Something descriptive — you can always change it later",
    color: "#6C63FF",
    accent: "#8B85FF",
    icon: <TitleOutlinedIcon sx={{ fontSize: 48 }} />,
    render: ({ formData, update }) => (
      <TextField
        fullWidth
        autoFocus
        value={formData.title}
        onChange={(e) => update({ title: e.target.value })}
        placeholder="e.g. Customer Analytics Dashboard"
        variant="outlined"
        sx={{ maxWidth: 480, ...fsFieldSx }}
      />
    ),
  },
  {
    key: "description",
    label: "Describe Your Vision",
    sublabel: "What problem does this solve? What's the big picture?",
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
        placeholder="Tell us about the product you envision..."
        sx={{ maxWidth: 520, ...fsFieldSx }}
      />
    ),
  },
  {
    key: "name",
    label: "What's Your Name?",
    color: "#6C63FF",
    accent: "#8B85FF",
    icon: <PersonOutlineIcon sx={{ fontSize: 48 }} />,
    render: ({ formData, update }) => (
      <TextField
        fullWidth
        autoFocus
        value={formData.name}
        onChange={(e) => update({ name: e.target.value })}
        placeholder="John Doe"
        sx={{ maxWidth: 400, ...fsFieldSx }}
      />
    ),
  },
  {
    key: "email",
    label: "Your Email Address",
    sublabel: "We'll send your specification here",
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
        sx={{ maxWidth: 400, ...fsFieldSx }}
      />
    ),
  },
  {
    key: "company",
    label: "Your Company",
    sublabel: "Optional — but helps us understand your context",
    color: "#6C63FF",
    accent: "#8B85FF",
    icon: <BusinessOutlinedIcon sx={{ fontSize: 48 }} />,
    render: ({ formData, update }) => (
      <TextField
        fullWidth
        autoFocus
        value={formData.company}
        onChange={(e) => update({ company: e.target.value })}
        placeholder="Acme Corp"
        sx={{ maxWidth: 400, ...fsFieldSx }}
      />
    ),
  },
  {
    key: "mobilePlatforms",
    label: "Target Platforms",
    sublabel: "Which platforms should your mobile app support?",
    color: "#00D4AA",
    accent: "#33DDBB",
    icon: <PhoneIphoneOutlinedIcon sx={{ fontSize: 48 }} />,
    shouldShow: (fd) => fd.projectTypes.includes("mobile_app"),
    render: ({ formData, update }) => (
      <Stack spacing={2} sx={{ width: "100%", maxWidth: 400 }}>
        <RadioGroup
          row
          value={formData.platforms[0] ?? ""}
          onChange={(e) => update({ platforms: [e.target.value] })}
          sx={{ gap: 1 }}
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
              sx={{
                border: "1px solid",
                borderColor: formData.platforms[0] === platform ? "#00D4AA50" : "rgba(108,99,255,0.12)",
                borderRadius: 2,
                px: 2,
                py: 0.5,
                background: formData.platforms[0] === platform ? "#00D4AA08" : "transparent",
              }}
            />
          ))}
        </RadioGroup>
        <FormControlLabel
          control={<Checkbox checked={formData.authRequired} onChange={(e) => update({ authRequired: e.target.checked })} sx={{ color: "#00D4AA60", "&.Mui-checked": { color: "#00D4AA" } }} />}
          label="Authentication required?"
        />
        <FormControlLabel
          control={<Checkbox checked={formData.pushNotifications} onChange={(e) => update({ pushNotifications: e.target.checked })} sx={{ color: "#00D4AA60", "&.Mui-checked": { color: "#00D4AA" } }} />}
          label="Push notifications?"
        />
        <FormControlLabel
          control={<Checkbox checked={formData.offlineCapability} onChange={(e) => update({ offlineCapability: e.target.checked })} sx={{ color: "#00D4AA60", "&.Mui-checked": { color: "#00D4AA" } }} />}
          label="Offline capability?"
        />
      </Stack>
    ),
  },
  {
    key: "aiDetails",
    label: "AI Configuration",
    sublabel: "Help us understand the intelligence layer",
    color: "#6C63FF",
    accent: "#8B85FF",
    icon: <SmartToyOutlinedIcon sx={{ fontSize: 48 }} />,
    shouldShow: (fd) => fd.projectTypes.includes("ai_system"),
    render: ({ formData, update }) => (
      <Stack spacing={3} sx={{ width: "100%", maxWidth: 400 }}>
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
            <MenuItem value="nlp">NLP</MenuItem>
            <MenuItem value="computer_vision">Computer Vision</MenuItem>
          </Select>
        </FormControl>
        <FormControlLabel
          control={<Checkbox checked={formData.datasetAvailable} onChange={(e) => update({ datasetAvailable: e.target.checked })} sx={{ color: "#6C63FF60", "&.Mui-checked": { color: "#6C63FF" } }} />}
          label="Do you have a dataset available?"
        />
      </Stack>
    ),
  },
  {
    key: "features",
    label: "Key Features",
    sublabel: "Type a feature and press Enter to add it",
    color: "#00D4AA",
    accent: "#33DDBB",
    icon: <FeaturedPlayListOutlinedIcon sx={{ fontSize: 48 }} />,
    render: ({ formData, update }) => (
      <Box sx={{ width: "100%", maxWidth: 480 }}>
        <TextField
          fullWidth
          autoFocus
          placeholder="e.g. User authentication, Dashboard analytics..."
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
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ justifyContent: "center" }}>
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
    key: "budget",
    label: "Budget Range",
    sublabel: "This helps us scope the project appropriately",
    color: "#6C63FF",
    accent: "#8B85FF",
    icon: <AttachMoneyIcon sx={{ fontSize: 48 }} />,
    render: ({ formData, update }) => (
      <FormGroup sx={{ gap: 1.5, width: "100%", maxWidth: 400 }}>
        {budgetRanges.map((range) => (
          <Box
            key={range}
            onClick={() => update({ budget: range })}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: formData.budget === range ? "#6C63FF50" : "rgba(108,99,255,0.12)",
              background: formData.budget === range ? "#6C63FF10" : "transparent",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": { borderColor: "#6C63FF40", background: "#6C63FF06" },
            }}
          >
            <Typography fontWeight={formData.budget === range ? 700 : 400} sx={{ fontFamily: "monospace" }}>
              {range}
            </Typography>
          </Box>
        ))}
      </FormGroup>
    ),
  },
  {
    key: "timeline",
    label: "Expected Timeline",
    sublabel: "When do you need this delivered?",
    color: "#00D4AA",
    accent: "#33DDBB",
    icon: <ScheduleOutlinedIcon sx={{ fontSize: 48 }} />,
    render: ({ formData, update }) => (
      <FormGroup sx={{ gap: 1.5, width: "100%", maxWidth: 400 }}>
        {timelines.map((t) => (
          <Box
            key={t}
            onClick={() => update({ timeline: t })}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: formData.timeline === t ? "#00D4AA50" : "rgba(108,99,255,0.12)",
              background: formData.timeline === t ? "#00D4AA10" : "transparent",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": { borderColor: "#00D4AA40", background: "#00D4AA06" },
            }}
          >
            <Typography fontWeight={formData.timeline === t ? 700 : 400} sx={{ fontFamily: "monospace" }}>
              {t}
            </Typography>
          </Box>
        ))}
      </FormGroup>
    ),
  },
  {
    key: "specFile",
    label: "Specification Document",
    sublabel: "Have a full spec or requirements doc? Upload it here — totally optional.",
    color: "#6C63FF",
    accent: "#8B85FF",
    icon: <CloudUploadOutlinedIcon sx={{ fontSize: 48 }} />,
    render: ({ formData, extra }) => (
      <Box sx={{ width: "100%", maxWidth: 480 }}>
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
        { label: "Name", value: formData.name, color: "#6C63FF", index: "R3" },
        { label: "Email", value: formData.email, color: "#00D4AA", index: "R4" },
        ...(formData.company ? [{ label: "Company", value: formData.company, color: "#8B85FF", index: "R5" }] : []),
        { label: "Budget", value: formData.budget, color: "#6C63FF", index: "R6" },
        { label: "Timeline", value: formData.timeline, color: "#00D4AA", index: "R7" },
        ...((formData.specFile || formData.specUploaded) ? [{ label: "Spec File", value: formData.specFile?.name ?? formData.specUploaded?.name ?? "", color: "#8B85FF", index: "R8" }] : []),
      ];

      return (
        <Box sx={{ width: "100%" }}>
          {/* Description — full width */}
          <ReviewCell color="#8B85FF" index="R0" label="Description" value={formData.description} full />

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
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
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
    bgcolor: "action.hover",
    borderRadius: 2,
    fontSize: "1.1rem",
    "& fieldset": { borderColor: "divider" },
    "&:hover fieldset": { borderColor: "primary.main" },
    "&.Mui-focused fieldset": { borderColor: "primary.main", borderWidth: 1 },
  },
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
    if (isLast) {
      onSubmit();
      return;
    }
    setDirection(1);
    setStepIndex((prev) => Math.min(prev + 1, visibleSteps.length - 1));
  };

  const goBack = () => {
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
    [safeIndex, isLast],
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
        sx={{ position: "absolute", top: 24, right: 32, zIndex: 10, display: "flex", gap: 1 }}
      >
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
          px: step.key === "review" ? { xs: 2, md: 6 } : 4,
          py: 2,
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": { background: tc.scrollThumb, borderRadius: 2 },
        }}
      >
        <Box sx={{ maxWidth: step.key === "review" ? "100%" : 640, width: "100%", textAlign: "center" }}>
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
              fontWeight={800}
              sx={{
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
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4, opacity: 0.6, maxWidth: 400 }}>
                {step.sublabel}
              </Typography>
            )}

            {/* Render step content */}
            {step.render({ formData, update, extra: { uploading, onSpecFile, onSpecRemove } })}

            {error && (
              <Alert severity="error" sx={{ mt: 3, width: "100%", maxWidth: 480 }} onClose={() => {}}>
                {error}
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
            <Typography variant="h3" fontWeight={800} sx={{ mb: 2, letterSpacing: "-0.02em", textTransform: "uppercase", color: "text.secondary" }}>
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
                fontWeight={800}
                sx={{
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
      return { ...saved.current.formData, specFile: null };
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

  const update = (fields: Partial<FormData>) => setFormData((prev) => ({ ...prev, ...fields }));

  const handleReset = () => {
    clearState();
    setFormData(initialFormData);
    setIsFullscreen(true);
    setStepIndex(0);
    setError(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
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

      await api.createProject({
        title: formData.title,
        description: formData.description + (specFileUrl ? `\n\n[Specification Document](${specFileUrl})` : ""),
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
          canonical="https://neurodynecorp.com/start-project"
          ogUrl="https://neurodynecorp.com/start-project"
        />
        <FullscreenErrorBoundary onFallback={() => setIsFullscreen(false)}>
          <FullscreenMode
            onExit={() => setIsFullscreen(false)}
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
        canonical="https://neurodynecorp.com/start-project"
        ogUrl="https://neurodynecorp.com/start-project"
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
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button
                onClick={() => setIsFullscreen(true)}
                startIcon={<FullscreenIcon />}
                sx={{
                  color: "#00D4AA",
                  fontFamily: "monospace",
                  fontSize: "0.7rem",
                  letterSpacing: "0.1em",
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
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <PersonOutlineIcon sx={{ fontSize: 18, color: "#6C63FF", filter: "drop-shadow(0 0 4px #6C63FF40)" }} />
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#6C63FF", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>Full Name</Typography>
              </Stack>
              <TextField fullWidth required value={formData.name} onChange={(e) => update({ name: e.target.value })} placeholder="John Doe" size="small" sx={fieldSx} />
            </Cell>
            <Cell color="#00D4AA" index="02" colInRow={1} totalCols={2} minH={{ xs: 100, md: 130 }} animDelay={0.05}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <AlternateEmailIcon sx={{ fontSize: 18, color: "#00D4AA", filter: "drop-shadow(0 0 4px #00D4AA40)" }} />
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#00D4AA", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>Email</Typography>
              </Stack>
              <TextField fullWidth required type="email" value={formData.email} onChange={(e) => update({ email: e.target.value })} placeholder="you@company.com" size="small" sx={fieldSx} />
            </Cell>
          </Box>

          {/* Row 2: Company | Project Type */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
            <Cell color="#8B85FF" index="03" colInRow={0} totalCols={2} minH={{ xs: 100, md: 130 }} animDelay={0.1}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <BusinessOutlinedIcon sx={{ fontSize: 18, color: "#8B85FF", filter: "drop-shadow(0 0 4px #8B85FF40)" }} />
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#8B85FF", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>Company</Typography>
                <Chip label="OPT" size="small" sx={{ height: 16, fontSize: "0.5rem", fontFamily: "monospace", background: "#8B85FF15", color: "#8B85FF", border: "none" }} />
              </Stack>
              <TextField fullWidth value={formData.company} onChange={(e) => update({ company: e.target.value })} placeholder="Acme Corp" size="small" sx={fieldSx} />
            </Cell>
            <Cell color="#00D4AA" index="04" colInRow={1} totalCols={2} minH={{ xs: 100, md: 130 }} animDelay={0.15}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
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
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
              <TitleOutlinedIcon sx={{ fontSize: 18, color: "#6C63FF", filter: "drop-shadow(0 0 4px #6C63FF40)" }} />
              <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#6C63FF", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>Project Title</Typography>
            </Stack>
            <TextField fullWidth required value={formData.title} onChange={(e) => update({ title: e.target.value })} placeholder="e.g. Customer Analytics Dashboard" size="small" sx={fieldSx} />
          </Cell>

          {/* Row 4: Description — full width */}
          <Cell color="#00D4AA" index="06" colInRow={0} totalCols={1} minH={{ xs: 180, md: 220 }} animDelay={0.25}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
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
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <PhoneIphoneOutlinedIcon sx={{ fontSize: 18, color: "#33DDBB", filter: "drop-shadow(0 0 4px #33DDBB40)" }} />
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#33DDBB", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>Mobile Configuration</Typography>
              </Stack>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
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
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <SmartToyOutlinedIcon sx={{ fontSize: 18, color: "#8B85FF", filter: "drop-shadow(0 0 4px #8B85FF40)" }} />
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#8B85FF", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>AI Configuration</Typography>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
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
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
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
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {formData.features.map((f, i) => (
                <Chip key={i} label={f} onDelete={() => update({ features: formData.features.filter((_, idx) => idx !== i) })} color="primary" variant="outlined" size="small" />
              ))}
            </Stack>
          </Cell>

          {/* Row 6: Budget | Timeline */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
            <Cell color="#6C63FF" index="08" colInRow={0} totalCols={2} minH={{ xs: 100, md: 130 }} animDelay={0.35}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
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
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
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
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
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
