import { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import { api } from "@/api/client";

const MotionBox = motion.create(Box);

type FeedbackType = "idea" | "bug" | "general";

const TYPES: { value: FeedbackType; label: string; icon: React.ReactNode }[] = [
  { value: "idea", label: "Idea", icon: <LightbulbOutlinedIcon sx={{ fontSize: 18 }} /> },
  { value: "bug", label: "Bug", icon: <BugReportOutlinedIcon sx={{ fontSize: 18 }} /> },
  { value: "general", label: "General", icon: <ForumOutlinedIcon sx={{ fontSize: 18 }} /> },
];

const overline = {
  fontFamily: "monospace",
  fontSize: "0.7rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.25em",
  color: "text.secondary",
  opacity: 0.6,
};

const emailValid = (e: string) => e === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("idea");
  const [nps, setNps] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const reset = () => {
    setType("idea");
    setNps(null);
    setMessage("");
    setEmail("");
    setLoading(false);
    setDone(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Reset form shortly after the dialog closes so it reopens fresh.
  useEffect(() => {
    if (!open) {
      const t = setTimeout(reset, 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Auto-close after a successful submit.
  useEffect(() => {
    if (done) {
      const t = setTimeout(() => setOpen(false), 1800);
      return () => clearTimeout(t);
    }
  }, [done]);

  const canSubmit = message.trim().length > 0 && emailValid(email) && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await api.post("/api/v1/feedback", {
        type,
        nps,
        message: message.trim(),
        email: email.trim() || undefined,
      });
      setDone(true);
    } catch {
      // best-effort: still acknowledge so the visitor isn't blocked
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          right: { xs: 16, md: 24 },
          bottom: { xs: 16, md: 24 },
          zIndex: (theme) => theme.zIndex.speedDial,
        }}
      >
        <Button
          onClick={() => setOpen(true)}
          startIcon={<ChatBubbleOutlineOutlinedIcon />}
          aria-label="Send feedback"
          sx={{
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "none",
            px: 2.25,
            py: 1.25,
            borderRadius: 999,
            color: "#fff",
            background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
            boxShadow: "0 8px 28px rgba(108,99,255,0.45)",
            "&:hover": { boxShadow: "0 10px 34px rgba(108,99,255,0.6)" },
          }}
        >
          Feedback
        </Button>
      </Box>

      <Dialog slotProps={{ paper: {
          sx: {
            bgcolor: "#111827",
            backgroundImage:
              "linear-gradient(135deg, rgba(108,99,255,0.06), rgba(0,212,170,0.04))",
            border: "1px solid rgba(108,99,255,0.22)",
            borderRadius: 3,
          },
        } }}
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack sx={{ alignItems: "center", justifyContent: "space-between" }} direction="row">
            <Typography sx={overline}>Tell us anything</Typography>
            <IconButton
              aria-label="Close feedback"
              size="small"
              onClick={handleClose}
              sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}
            >
              <CloseOutlinedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <AnimatePresence mode="wait">
            {done ? (
              <MotionBox
                key="thanks"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                sx={{ textAlign: "center", py: 4 }}
              >
                <CheckCircleOutlineIcon sx={{ color: "#10B981", fontSize: 48, mb: 1.5 }} />
                <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", mb: 0.5 }}>
                  Thank you.
                </Typography>
                <Typography sx={{ color: "text.secondary", opacity: 0.8, fontSize: "0.875rem" }}>
                  We read every note. This window will close itself.
                </Typography>
              </MotionBox>
            ) : (
              <MotionBox
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", opacity: 0.7, mb: 1 }}>
                  What kind of feedback is this?
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
                  {TYPES.map((t) => {
                    const active = type === t.value;
                    return (
                      <Chip
                        key={t.value}
                        icon={
                          <Box sx={{ display: "flex", color: active ? "#fff" : "text.secondary" }}>
                            {t.icon}
                          </Box>
                        }
                        label={t.label}
                        onClick={() => setType(t.value)}
                        sx={{
                          flex: 1,
                          fontFamily: "monospace",
                          fontWeight: 600,
                          letterSpacing: "0.04em",
                          borderRadius: 1.5,
                          color: active ? "#fff" : "text.secondary",
                          border: "1px solid",
                          borderColor: active ? "transparent" : "rgba(108,99,255,0.25)",
                          background: active
                            ? "linear-gradient(135deg, #6C63FF, #00D4AA)"
                            : "rgba(108,99,255,0.04)",
                          "&:hover": {
                            background: active
                              ? "linear-gradient(135deg, #6C63FF, #00D4AA)"
                              : "rgba(108,99,255,0.1)",
                          },
                        }}
                      />
                    );
                  })}
                </Stack>

                <Divider sx={{ borderColor: "rgba(108,99,255,0.12)", mb: 2 }} />

                <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", opacity: 0.7, mb: 1 }}>
                  How likely are you to recommend us? (optional)
                </Typography>
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ mb: 2.5, flexWrap: "wrap", gap: 0.5 }}
                >
                  {Array.from({ length: 11 }, (_, i) => i).map((n) => {
                    const active = nps === n;
                    return (
                      <Button
                        key={n}
                        onClick={() => setNps(active ? null : n)}
                        aria-label={`NPS score ${n}`}
                        sx={{
                          minWidth: 0,
                          width: 30,
                          height: 30,
                          p: 0,
                          borderRadius: 1,
                          fontFamily: "monospace",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: active ? "#fff" : "text.secondary",
                          border: "1px solid",
                          borderColor: active ? "transparent" : "rgba(108,99,255,0.2)",
                          background: active
                            ? "linear-gradient(135deg, #6C63FF, #00D4AA)"
                            : "transparent",
                          "&:hover": {
                            background: active
                              ? "linear-gradient(135deg, #6C63FF, #00D4AA)"
                              : "rgba(108,99,255,0.1)",
                          },
                        }}
                      >
                        {n}
                      </Button>
                    );
                  })}
                </Stack>

                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  placeholder="What's on your mind?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  sx={{
                    mb: 2,
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "rgba(108,99,255,0.04)",
                      fontSize: "0.9rem",
                      "& fieldset": { borderColor: "rgba(108,99,255,0.2)" },
                      "&:hover fieldset": { borderColor: "rgba(108,99,255,0.4)" },
                      "&.Mui-focused fieldset": { borderColor: "#6C63FF" },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  type="email"
                  placeholder="you@company.com (optional, if you'd like a reply)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={!emailValid(email)}
                  helperText={!emailValid(email) ? "Enter a valid email or leave blank" : " "}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "rgba(108,99,255,0.04)",
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                      "& fieldset": { borderColor: "rgba(108,99,255,0.2)" },
                      "&:hover fieldset": { borderColor: "rgba(108,99,255,0.4)" },
                      "&.Mui-focused fieldset": { borderColor: "#6C63FF" },
                    },
                  }}
                />
              </MotionBox>
            )}
          </AnimatePresence>
        </DialogContent>

        {!done && (
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              onClick={handleClose}
              sx={{
                fontFamily: "monospace",
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: "text.secondary",
                "&:hover": { color: "text.primary" },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              variant="contained"
              startIcon={
                loading ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : undefined
              }
              sx={{
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: "0.08em",
                px: 2.5,
                background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
                "&:hover": { boxShadow: "0 4px 20px rgba(108,99,255,0.4)" },
                "&.Mui-disabled": {
                  background: "rgba(108,99,255,0.15)",
                  color: "text.secondary",
                },
              }}
            >
              {loading ? "Sending..." : "Send feedback"}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
}
