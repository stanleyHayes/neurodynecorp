import ContentSkeleton from "@/components/shared/ContentSkeleton";
import { useState } from "react";
import { NEWSLETTER } from "@/content/interface";
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
  const [submitStatus, setSubmitStatus] = useState<"pending" | "already_subscribed" | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setLoading(true);
    setFailed(false);
    try {
      const res = await api.post<{ status?: string }>("/api/v1/newsletter/subscribe", {
        email,
        source: "web",
      });
      playSound("success");
      setSubmitStatus(res?.status === "already_subscribed" ? "already_subscribed" : "pending");
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
        p: { xs: 3, md: 4 },
        mx: "auto",
        width: "100%",
        maxWidth: 1200,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        columnGap: 5,
        alignItems: "center",
        gap: { xs: 3, md: 5 },
        borderRadius: 0,
        border: "1px solid rgba(108, 99, 255, 0.18)",
        background: "linear-gradient(135deg, rgba(108,99,255,0.05), rgba(0,212,170,0.04))",
        overflow: "hidden",
      }}
    >
      <Box>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
          <EmailOutlinedIcon sx={{ color: "#6C63FF", fontSize: 22 }} />
          <Typography
            sx={{
              fontFamily: "monospace",
              fontSize: "0.6rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#6C63FF",
              opacity: 0.8,
            }}
          >
            {NEWSLETTER.eyebrow}
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
          {NEWSLETTER.title}
        </Typography>
        <Typography
          sx={{ color: "text.secondary", opacity: 0.75, mb: 3, maxWidth: 460, lineHeight: 1.7 }}
        >
          {NEWSLETTER.description}
        </Typography>
      </Box>
      <Box
        sx={{
          borderLeft: { md: "1px solid" },
          borderColor: { md: "divider" },
          pl: { md: 4 },
          minWidth: 0,
        }}
      >
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
            {submitStatus === "already_subscribed"
              ? "You're already on the list. Check your inbox if you still need to confirm."
              : "Check your email to confirm — you're not subscribed until you click the link."}
          </Alert>
        ) : (
          <Stack
            component="form"
            onSubmit={handleSubmit}
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ width: "100%" }}
          >
            <TextField
              fullWidth
              type="email"
              placeholder="you@company.com"
              slotProps={{ htmlInput: { "aria-label": "Email address" } }}
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
              aria-label="Subscribe"
              aria-busy={loading}
              variant="contained"
              disabled={!valid || loading}
              sx={{
                fontFamily: "Outfit, sans-serif",
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
              {loading ? <ContentSkeleton compact /> : "Subscribe"}
            </Button>
          </Stack>
        )}
        <Typography color="text.secondary" sx={{ fontSize: ".75rem", mt: 1.5 }}>
          {NEWSLETTER.privacy}
        </Typography>
      </Box>
    </MotionBox>
  );
}
