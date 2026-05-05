import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  MenuItem,
  Stack,
  Chip,
  IconButton,
  keyframes,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContactMailOutlinedIcon from "@mui/icons-material/ContactMailOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import SubjectOutlinedIcon from "@mui/icons-material/SubjectOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import SEO from "@/components/seo/SEO";
import CommunityBlock from "@/components/shared/CommunityBlock";
import BookACall from "@/components/shared/BookACall";
import { useContactForm } from "@/hooks/useContactForm";

const MotionBox = motion.create(Box);

const BORDER = "rgba(108, 99, 255, 0.12)";

const scanlinePulse = keyframes`
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
`;

const PROJECT_TYPES = [
  { value: "web_app", label: "Web Application" },
  { value: "mobile_app", label: "Mobile App" },
  { value: "ai_system", label: "AI / ML System" },
  { value: "blockchain", label: "Blockchain" },
];

const CONTACT_DATA = [
  { icon: <EmailIcon />, label: "Email", value: "hello@neurodynecorp.com", href: "mailto:hello@neurodynecorp.com", copyable: true, color: "#6C63FF", index: "08" },
  { icon: <PhoneIcon />, label: "Phone", value: "+1 (555) 123-4567", href: "tel:+15551234567", copyable: true, color: "#00D4AA", index: "09" },
  { icon: <LocationOnIcon />, label: "Location", value: "San Francisco, CA", href: undefined, copyable: false, color: "#8B85FF", index: "10" },
];

const STEPS = [
  { step: "01", text: "We review your message within 24 hours", color: "#6C63FF", index: "11" },
  { step: "02", text: "A team member reaches out to discuss details", color: "#00D4AA", index: "12" },
  { step: "03", text: "We deliver a proposal tailored to your needs", color: "#8B85FF", index: "13" },
];

// ── Reusable Cell ───────────────────────────────────────────────────────────

function Cell({
  children,
  color,
  index,
  colInRow,
  totalCols,
  minH = { xs: 120, md: 160 },
  animDelay = 0,
  onClick,
  component,
  href,
}: {
  children: React.ReactNode;
  color: string;
  index: string;
  colInRow: number;
  totalCols: number;
  minH?: Record<string, number>;
  animDelay?: number;
  onClick?: () => void;
  component?: React.ElementType;
  href?: string;
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
      onClick={onClick}
      {...(component && href ? { component, href } : {})}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        minHeight: minH,
        p: { xs: 2.5, md: 3 },
        position: "relative",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        cursor: onClick || href ? "pointer" : "default",
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
        <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "60%", height: "60%", borderRadius: "50%", background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`, filter: "blur(40px)", pointerEvents: "none" }} />
      )}

      <Typography sx={{ position: "absolute", top: 14, left: 32, fontSize: "0.6rem", fontFamily: "monospace", color: hovered ? color : "text.secondary", opacity: 0.5, letterSpacing: "0.15em", transition: "color 0.3s", zIndex: 2 }}>
        {index}
      </Typography>

      <Box sx={{ position: "absolute", bottom: 0, left: "10%", right: "10%", height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: hovered ? 0.6 : 0, transition: "opacity 0.3s", pointerEvents: "none" }} />

      <Box sx={{ position: "relative", zIndex: 1 }}>{children}</Box>
    </MotionBox>
  );
}

function SectionLabel({ text, color = "#6C63FF" }: { text: string; color?: string }) {
  return (
    <Box sx={{ borderBottom: `1px solid ${BORDER}`, py: 2, px: 4 }}>
      <Typography sx={{ fontSize: "0.7rem", fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.3em", color, filter: `drop-shadow(0 0 6px ${color}60)` }}>
        {text}
      </Typography>
    </Box>
  );
}

// ── Styled text field for dark grid aesthetic ─────────────────────────────

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    background: "rgba(108, 99, 255, 0.03)",
    borderRadius: 1,
    fontSize: "0.9rem",
    "& fieldset": { borderColor: "rgba(108, 99, 255, 0.12)" },
    "&:hover fieldset": { borderColor: "rgba(108, 99, 255, 0.3)" },
    "&.Mui-focused fieldset": { borderColor: "#6C63FF", borderWidth: 1 },
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.8rem",
    fontFamily: "monospace",
    letterSpacing: "0.05em",
  },
};

// ── Page ────────────────────────────────────────────────────────────────────

export default function Contact() {
  const { submit, isSubmitting, isSubmitted, error } = useContactForm();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
    projectType: "",
  });
  const [copied, setCopied] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit({
      name: form.name,
      email: form.email,
      message: form.message,
      phone: form.phone || undefined,
      company: form.company || undefined,
      subject: form.subject || undefined,
      projectType: form.projectType || undefined,
    });
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      <SEO
        title="Contact"
        description="Get in touch with NeuroDyne Corp. Contact us for custom software development, consultations, and project inquiries."
        canonical="https://neurodynecorp.com/contact"
        ogUrl="https://neurodynecorp.com/contact"
      />

      {/* ═══ HERO — full-width cell ═══ */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.6fr 0.4fr" },
          borderBottom: `1px solid ${BORDER}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Scanline overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(108,99,255,0.04) 2px, rgba(108,99,255,0.04) 4px)",
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
              CONTACT // TRANSMISSION
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
              Send Us a{" "}
              <Box
                component="span"
                sx={{
                  background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Signal
              </Box>
            </Typography>

            <Typography
              variant="body1"
              sx={{ maxWidth: 480, color: "text.secondary", opacity: 0.6, lineHeight: 1.8 }}
            >
              Ready to bring your vision to life? Fill out the grid below and we'll craft a tailored solution.
            </Typography>
          </MotionBox>
        </Cell>

        {/* Right — icon cell */}
        <Cell color="#00D4AA" index="—" colInRow={1} totalCols={2} minH={{ xs: 160, md: 360 }}>
          <Box sx={{ textAlign: "center" }}>
            <MotionBox
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 180, delay: 0.2 }}
            >
              <ContactMailOutlinedIcon
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
              UPLINK READY
            </Typography>
          </Box>
        </Cell>
      </Box>

      {/* ═══ FORM GRID ═══ */}
      <SectionLabel text="TRANSMIT YOUR MESSAGE" color="#6C63FF" />

      <AnimatePresence mode="wait">
        {isSubmitted ? (
          /* ── Success state ── */
          <MotionBox
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
          >
            <Cell color="#00D4AA" index="OK" colInRow={0} totalCols={1} minH={{ xs: 300, md: 400 }}>
              <Box sx={{ textAlign: "center", py: 4 }}>
                <MotionBox
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  sx={{ mb: 3 }}
                >
                  <CheckCircleOutlineIcon
                    sx={{
                      fontSize: 80,
                      color: "#00D4AA",
                      filter: "drop-shadow(0 0 20px rgba(0,212,170,0.4))",
                    }}
                  />
                </MotionBox>
                <Typography variant="h3" fontWeight={800} sx={{ mb: 2, letterSpacing: "-0.02em", textTransform: "uppercase", color: "text.secondary" }}>
                  Signal Received
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: "auto", mb: 4, opacity: 0.6 }}>
                  Thank you for reaching out. We'll review your message and get back to you within 24 hours.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => window.location.reload()}
                  sx={{
                    borderColor: "#00D4AA30",
                    color: "#00D4AA",
                    fontFamily: "monospace",
                    letterSpacing: "0.1em",
                    "&:hover": { borderColor: "#00D4AA60", background: "#00D4AA08" },
                  }}
                >
                  SEND ANOTHER
                </Button>
              </Box>
            </Cell>
          </MotionBox>
        ) : (
          /* ── Form cells ── */
          <Box key="form" component="form" onSubmit={handleSubmit}>
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
                <TextField fullWidth required disabled={isSubmitting} value={form.name} onChange={handleChange("name")} placeholder="John Doe" size="small" sx={fieldSx} />
              </Cell>
              <Cell color="#00D4AA" index="02" colInRow={1} totalCols={2} minH={{ xs: 100, md: 130 }} animDelay={0.05}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                  <AlternateEmailIcon sx={{ fontSize: 18, color: "#00D4AA", filter: "drop-shadow(0 0 4px #00D4AA40)" }} />
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#00D4AA", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>Email</Typography>
                </Stack>
                <TextField fullWidth required type="email" disabled={isSubmitting} value={form.email} onChange={handleChange("email")} placeholder="you@company.com" size="small" sx={fieldSx} />
              </Cell>
            </Box>

            {/* Row 2: Phone | Company */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
              <Cell color="#8B85FF" index="03" colInRow={0} totalCols={2} minH={{ xs: 100, md: 130 }} animDelay={0.1}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                  <PhoneOutlinedIcon sx={{ fontSize: 18, color: "#8B85FF", filter: "drop-shadow(0 0 4px #8B85FF40)" }} />
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#8B85FF", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>Phone</Typography>
                  <Chip label="OPT" size="small" sx={{ height: 16, fontSize: "0.5rem", fontFamily: "monospace", background: "#8B85FF15", color: "#8B85FF", border: "none" }} />
                </Stack>
                <TextField fullWidth disabled={isSubmitting} value={form.phone} onChange={handleChange("phone")} placeholder="+1 (555) 000-0000" size="small" sx={fieldSx} />
              </Cell>
              <Cell color="#33DDBB" index="04" colInRow={1} totalCols={2} minH={{ xs: 100, md: 130 }} animDelay={0.15}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                  <BusinessOutlinedIcon sx={{ fontSize: 18, color: "#33DDBB", filter: "drop-shadow(0 0 4px #33DDBB40)" }} />
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#33DDBB", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>Company</Typography>
                  <Chip label="OPT" size="small" sx={{ height: 16, fontSize: "0.5rem", fontFamily: "monospace", background: "#33DDBB15", color: "#33DDBB", border: "none" }} />
                </Stack>
                <TextField fullWidth disabled={isSubmitting} value={form.company} onChange={handleChange("company")} placeholder="Acme Corp" size="small" sx={fieldSx} />
              </Cell>
            </Box>

            {/* Row 3: Subject | Project Type */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
              <Cell color="#6C63FF" index="05" colInRow={0} totalCols={2} minH={{ xs: 100, md: 130 }} animDelay={0.2}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                  <SubjectOutlinedIcon sx={{ fontSize: 18, color: "#6C63FF", filter: "drop-shadow(0 0 4px #6C63FF40)" }} />
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#6C63FF", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>Subject</Typography>
                </Stack>
                <TextField fullWidth required disabled={isSubmitting} value={form.subject} onChange={handleChange("subject")} placeholder="Project inquiry" size="small" sx={fieldSx} />
              </Cell>
              <Cell color="#00D4AA" index="06" colInRow={1} totalCols={2} minH={{ xs: 100, md: 130 }} animDelay={0.25}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                  <CategoryOutlinedIcon sx={{ fontSize: 18, color: "#00D4AA", filter: "drop-shadow(0 0 4px #00D4AA40)" }} />
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#00D4AA", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>Project Type</Typography>
                  <Chip label="OPT" size="small" sx={{ height: 16, fontSize: "0.5rem", fontFamily: "monospace", background: "#00D4AA15", color: "#00D4AA", border: "none" }} />
                </Stack>
                <TextField
                  fullWidth
                  select
                  disabled={isSubmitting}
                  value={form.projectType}
                  onChange={handleChange("projectType")}
                  size="small"
                  sx={fieldSx}
                >
                  <MenuItem value=""><em>Select a type</em></MenuItem>
                  {PROJECT_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                  ))}
                </TextField>
              </Cell>
            </Box>

            {/* Row 4: Message — full width */}
            <Cell color="#8B85FF" index="07" colInRow={0} totalCols={1} minH={{ xs: 180, md: 220 }} animDelay={0.3}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <ChatBubbleOutlineIcon sx={{ fontSize: 18, color: "#8B85FF", filter: "drop-shadow(0 0 4px #8B85FF40)" }} />
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#8B85FF", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>Message</Typography>
              </Stack>
              <TextField
                fullWidth
                multiline
                rows={4}
                required
                disabled={isSubmitting}
                value={form.message}
                onChange={handleChange("message")}
                placeholder="Tell us about your project, timeline, and any specific requirements..."
                sx={fieldSx}
              />
            </Cell>

            {/* Row 5: Send — CTA cell */}
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
              {/* Animated scanline */}
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
                type="submit"
                disabled={isSubmitting}
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
                  isSubmitting ? (
                    <CircularProgress size={18} sx={{ color: "#060911" }} />
                  ) : (
                    <SendIcon sx={{ fontSize: 18 }} />
                  )
                }
              >
                {isSubmitting ? "Transmitting..." : "Transmit"}
              </Button>
            </Box>
          </Box>
        )}
      </AnimatePresence>

      {/* ═══ CONTACT INFO ═══ */}
      <SectionLabel text="DIRECT CHANNELS" color="#00D4AA" />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" } }}>
        {CONTACT_DATA.map((item, i) => (
          <Cell
            key={item.label}
            color={item.color}
            index={item.index}
            colInRow={i}
            totalCols={3}
            minH={{ xs: 120, md: 160 }}
            animDelay={i * 0.08}
            component={item.href ? "a" : undefined}
            href={item.href}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  "& .MuiSvgIcon-root": { fontSize: 28 },
                  color: item.color,
                  filter: `drop-shadow(0 0 8px ${item.color}40)`,
                }}
              >
                {item.icon}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.65rem", color: "text.secondary", letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.5 }}>
                  {item.label}
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ mt: 0.25 }}>
                  {item.value}
                </Typography>
              </Box>
              {item.copyable && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCopy(item.value, item.label);
                  }}
                  sx={{
                    color: copied === item.label ? "#00D4AA" : "text.secondary",
                    transition: "color 0.2s",
                  }}
                >
                  {copied === item.label ? (
                    <CheckCircleOutlineIcon fontSize="small" />
                  ) : (
                    <ContentCopyIcon fontSize="small" />
                  )}
                </IconButton>
              )}
            </Stack>
          </Cell>
        ))}
      </Box>

      {/* ═══ WHAT TO EXPECT ═══ */}
      <SectionLabel text="WHAT TO EXPECT" color="#6C63FF" />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" } }}>
        {STEPS.map((item, i) => (
          <Cell key={item.step} color={item.color} index={item.index} colInRow={i} totalCols={3} minH={{ xs: 140, md: 180 }} animDelay={i * 0.08}>
            <Chip
              label={item.step}
              size="small"
              sx={{
                mb: 2,
                fontWeight: 700,
                fontSize: "0.75rem",
                fontFamily: "monospace",
                letterSpacing: "0.1em",
                background: `${item.color}15`,
                color: item.color,
                border: `1px solid ${item.color}25`,
                filter: `drop-shadow(0 0 6px ${item.color}30)`,
              }}
            />
            <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7, opacity: 0.8 }}>
              {item.text}
            </Typography>
          </Cell>
        ))}
      </Box>

      {/* ═══ CTA CELL ═══ */}
      <Box
        component="a"
        href="/start-project"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          py: { xs: 5, md: 7 },
          px: 4,
          position: "relative",
          overflow: "hidden",
          textDecoration: "none",
          color: "inherit",
          cursor: "pointer",
          borderBottom: `1px solid ${BORDER}`,
          transition: "background 0.3s",
          "&:hover": {
            background: "rgba(0,212,170,0.04)",
            "& .cta-arrow": { opacity: 1, transform: "translateX(0)" },
          },
        }}
      >
        {[
          { top: 12, left: 12, bT: true, bL: true },
          { top: 12, right: 12, bT: true, bR: true },
          { bottom: 12, left: 12, bB: true, bL: true },
          { bottom: 12, right: 12, bB: true, bR: true },
        ].map((pos, ci) => (
          <Box
            key={ci}
            sx={{
              position: "absolute",
              ...(pos.top !== undefined && { top: pos.top }),
              ...(pos.bottom !== undefined && { bottom: pos.bottom }),
              ...(pos.left !== undefined && { left: pos.left }),
              ...(pos.right !== undefined && { right: pos.right }),
              width: 16,
              height: 16,
              borderTop: pos.bT ? "2px solid #00D4AA30" : "none",
              borderBottom: pos.bB ? "2px solid #00D4AA30" : "none",
              borderLeft: pos.bL ? "2px solid #00D4AA30" : "none",
              borderRight: pos.bR ? "2px solid #00D4AA30" : "none",
              transition: "all 0.3s",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
        ))}

        <Box sx={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <RocketLaunchOutlinedIcon sx={{ fontSize: 40, color: "#00D4AA", filter: "drop-shadow(0 0 8px rgba(0,212,170,0.4))", mb: 2 }} />
          <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: "-0.02em", textTransform: "uppercase", color: "text.secondary", mb: 1 }}>
            Skip the Form?
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.6 }}>
            Start with our intelligent project questionnaire and get a professional specification in minutes.
          </Typography>
        </Box>
      </Box>

      {/* Book a call */}
      <Box sx={{ px: { xs: 3, md: 6 }, pt: { xs: 5, md: 8 } }}>
        <BookACall />
      </Box>

      {/* Community block */}
      <Box sx={{ px: { xs: 3, md: 6 }, py: { xs: 5, md: 8 } }}>
        <CommunityBlock />
      </Box>
    </>
  );
}
