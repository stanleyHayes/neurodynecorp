import { useState } from "react";
import HudCorners from "@/components/shared/HudCorners";
import { Box, Typography, TextField, Button, Stack, Alert } from "@mui/material";
import { motion } from "framer-motion";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import { playSound } from "@/hooks/useSound";
import { api } from "@/api/client";

const MotionBox = motion.create(Box);

export default function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setLoading(true);
    setFailed(false);
    try {
      await api.post("/api/v1/newsletter/subscribe", { email, source: "web" });
      playSound("success");
      setSubmitted(true);
      setEmail("");
    } catch {
      // Surface the failure — silently "succeeding" would lose the subscriber.
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      sx={{
        position: "relative",
        p: { xs: 3, md: 5 },
        borderRadius: 0,
        border: "1px solid rgba(108, 99, 255, 0.18)",
        background: "linear-gradient(135deg, rgba(108,99,255,0.05), rgba(0,212,170,0.04))",
        overflow: "hidden",
      }}
    >
      <HudCorners />
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
        <EmailOutlinedIcon sx={{ color: "#6C63FF", fontSize: 22 }} />
        <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#6C63FF", opacity: 0.8 }}>
          // ENGINEERING DECISIONS, WEEKLY
        </Typography>
      </Stack>

      <Typography
        sx={{
          fontWeight: 800,
          fontSize: { xs: "1.4rem", md: "1.8rem" },
          letterSpacing: "-0.02em",
          mb: 1,
        }}
      >
        Get one short note per week.
      </Typography>
      <Typography sx={{ color: "text.secondary", opacity: 0.75, mb: 3, maxWidth: 460, lineHeight: 1.7 }}>
        Architecture choices we made, what we'd change, and which tools earned their keep. No spam. Unsubscribe in one click.
      </Typography>

      {failed && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            bgcolor: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "text.primary",
            borderRadius: 0,
          }}
        >
          We couldn't sign you up just then. Please try again.
        </Alert>
      )}

      {submitted ? (
        <Alert
          icon={<CheckCircleOutlineIcon sx={{ color: "#10B981" }} />}
          severity="success"
          sx={{
            bgcolor: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.3)",
            color: "text.primary",
            "& .MuiAlert-icon": { color: "#10B981" },
          }}
        >
          You're in. Look for the first note this Friday.
        </Alert>
      ) : (
        <Stack
          component="form"
          onSubmit={handleSubmit}
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ maxWidth: 520 }}
        >
          <TextField
            fullWidth
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "rgba(108,99,255,0.04)",
                fontFamily: "monospace",
                fontSize: "0.85rem",
                height: 48,
                "& fieldset": { borderColor: "rgba(108,99,255,0.2)" },
                "&:hover fieldset": { borderColor: "rgba(108,99,255,0.4)" },
                "&.Mui-focused fieldset": { borderColor: "#6C63FF" },
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={!valid || loading}
            sx={{
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: "0.1em",
              height: 48,
              px: 3,
              flexShrink: 0,
              background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
              "&:hover": { boxShadow: "0 4px 20px rgba(108,99,255,0.4)" },
              "&.Mui-disabled": { background: "rgba(108,99,255,0.15)", color: "text.secondary" },
            }}
          >
            {loading ? "Sending..." : "Subscribe"}
          </Button>
        </Stack>
      )}
    </MotionBox>
  );
}
