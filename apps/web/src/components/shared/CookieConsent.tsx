import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Stack,
  Typography,
  Button,
  Switch,
  Divider,
  IconButton,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import CookieOutlinedIcon from "@mui/icons-material/CookieOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { api } from "@/api/client";

const CONSENT_KEY = "neurodyne_cookie_consent";
const ANON_KEY = "neurodyne_anon_id";
const POLICY_VERSION = "1.0";

const MotionBox = motion.create(Box);

interface Categories {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

const overline = {
  fontFamily: "monospace",
  fontSize: "0.7rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.25em",
  color: "text.secondary",
  opacity: 0.6,
};

function getAnonymousId(): string {
  try {
    let id = localStorage.getItem(ANON_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    return `anon-${Date.now()}`;
  }
}

function prefersReducedMotion(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  } catch {
    return false;
  }
}

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  const reduceMotion = prefersReducedMotion();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (!stored) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const persist = async (categories: Categories) => {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(categories));
    } catch {
      // ignore storage errors
    }
    const anonymousId = getAnonymousId();
    try {
      await api.post("/api/v1/consent", {
        anonymousId,
        categories,
        policyVersion: POLICY_VERSION,
      });
    } catch {
      // best-effort: consent is already stored locally
    }
    setOpen(false);
  };

  const handleAcceptAll = () =>
    persist({ essential: true, analytics: true, marketing: true });

  const handleRejectNonEssential = () =>
    persist({ essential: true, analytics: false, marketing: false });

  const handleSavePreferences = () =>
    persist({ essential: true, analytics, marketing });

  const cardInner = (
    <Box
      sx={{
        borderRadius: 3,
        border: "1px solid rgba(108, 99, 255, 0.22)",
        background:
          "linear-gradient(135deg, rgba(17,24,39,0.96), rgba(17,24,39,0.92))",
        backdropFilter: "blur(12px)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.45)",
        p: { xs: 2.5, md: 3 },
        position: "relative",
      }}
    >
      <IconButton
        aria-label="Dismiss and reject non-essential cookies"
        onClick={handleRejectNonEssential}
        size="small"
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          color: "text.secondary",
          opacity: 0.5,
          "&:hover": { opacity: 1 },
        }}
      >
        <CloseOutlinedIcon fontSize="small" />
      </IconButton>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={{ xs: 2, md: 3 }}
        alignItems={{ xs: "stretch", md: "center" }}
      >
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1 }}>
            <ShieldOutlinedIcon sx={{ color: "#00D4AA", fontSize: 22 }} />
            <CookieOutlinedIcon sx={{ color: "#6C63FF", fontSize: 22 }} />
            <Typography sx={overline}>Your privacy</Typography>
          </Stack>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.05rem", md: "1.15rem" },
              letterSpacing: "-0.01em",
              mb: 0.75,
            }}
          >
            We use cookies to keep things running smoothly.
          </Typography>
          <Typography
            sx={{
              color: "text.secondary",
              opacity: 0.8,
              fontSize: "0.875rem",
              lineHeight: 1.65,
              maxWidth: 640,
            }}
          >
            Essential cookies are always on. With your okay we also use analytics
            and marketing cookies to understand what works and improve your
            experience.
          </Typography>

          <AnimatePresence initial={false}>
            {customizing && (
              <MotionBox
                key="customize"
                initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                animate={
                  reduceMotion
                    ? { opacity: 1, height: "auto" }
                    : { opacity: 1, height: "auto" }
                }
                exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.25 }}
                sx={{ overflow: "hidden" }}
              >
                <Divider sx={{ my: 2, borderColor: "rgba(108,99,255,0.15)" }} />
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                        Essential
                      </Typography>
                      <Typography
                        sx={{ color: "text.secondary", opacity: 0.65, fontSize: "0.78rem" }}
                      >
                        Required for the site to work. Always on.
                      </Typography>
                    </Box>
                    <Switch checked disabled />
                  </Stack>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                        Analytics
                      </Typography>
                      <Typography
                        sx={{ color: "text.secondary", opacity: 0.65, fontSize: "0.78rem" }}
                      >
                        Helps us see what's useful and what to fix.
                      </Typography>
                    </Box>
                    <Switch
                      checked={analytics}
                      onChange={(e) => setAnalytics(e.target.checked)}
                      inputProps={{ "aria-label": "Analytics cookies" }}
                    />
                  </Stack>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                        Marketing
                      </Typography>
                      <Typography
                        sx={{ color: "text.secondary", opacity: 0.65, fontSize: "0.78rem" }}
                      >
                        Lets us tailor what we show you elsewhere.
                      </Typography>
                    </Box>
                    <Switch
                      checked={marketing}
                      onChange={(e) => setMarketing(e.target.checked)}
                      inputProps={{ "aria-label": "Marketing cookies" }}
                    />
                  </Stack>
                </Stack>
              </MotionBox>
            )}
          </AnimatePresence>
        </Box>

        <Stack
          spacing={1.25}
          sx={{ flexShrink: 0, minWidth: { md: 200 } }}
          direction={{ xs: "column", sm: "row", md: "column" }}
        >
          <Button
            variant="contained"
            fullWidth
            onClick={handleAcceptAll}
            sx={{
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: "0.08em",
              background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
              "&:hover": { boxShadow: "0 4px 20px rgba(108,99,255,0.4)" },
            }}
          >
            Accept all
          </Button>
          {customizing ? (
            <Button
              variant="outlined"
              fullWidth
              onClick={handleSavePreferences}
              sx={{
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: "0.08em",
                borderColor: "rgba(108,99,255,0.4)",
                color: "text.primary",
                "&:hover": { borderColor: "#6C63FF", bgcolor: "rgba(108,99,255,0.06)" },
              }}
            >
              Save preferences
            </Button>
          ) : (
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setCustomizing(true)}
              sx={{
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: "0.08em",
                borderColor: "rgba(108,99,255,0.4)",
                color: "text.primary",
                "&:hover": { borderColor: "#6C63FF", bgcolor: "rgba(108,99,255,0.06)" },
              }}
            >
              Customize
            </Button>
          )}
          <Button
            variant="text"
            fullWidth
            onClick={handleRejectNonEssential}
            sx={{
              fontFamily: "monospace",
              fontWeight: 600,
              letterSpacing: "0.06em",
              color: "text.secondary",
              "&:hover": { color: "text.primary", bgcolor: "rgba(255,255,255,0.03)" },
            }}
          >
            Reject non-essential
          </Button>
        </Stack>
      </Stack>
    </Box>
  );

  return (
    <AnimatePresence>
      {open && (
        <MotionBox
          key="cookie-consent"
          role="dialog"
          aria-label="Cookie consent"
          aria-live="polite"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeOut" }}
          sx={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: (theme) => theme.zIndex.snackbar + 1,
            p: { xs: 1.5, md: 3 },
            pointerEvents: "none",
          }}
        >
          <Container maxWidth="lg" sx={{ pointerEvents: "auto" }}>
            {cardInner}
          </Container>
        </MotionBox>
      )}
    </AnimatePresence>
  );
}
