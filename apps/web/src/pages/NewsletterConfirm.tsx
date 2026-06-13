import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  Box,
  Container,
  Stack,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  Switch,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { motion } from "framer-motion";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SEO from "@/components/seo/SEO";
import { api } from "@/api/client";

const MotionCard = motion.create(Card);

const SEGMENTS = [
  { key: "sector", label: "Sector updates" },
  { key: "labs", label: "Labs releases" },
  { key: "hiring", label: "Hiring news" },
  { key: "thought", label: "Thought pieces" },
];

const overline = {
  fontFamily: "monospace",
  fontSize: "0.7rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.25em",
  color: "text.secondary",
  opacity: 0.6,
};

type Status = "loading" | "success" | "error";

export default function NewsletterConfirm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const [selected, setSelected] = useState<Record<string, boolean>>({
    sector: true,
    labs: true,
    hiring: false,
    thought: true,
  });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; ok: boolean; msg: string }>({
    open: false,
    ok: true,
    msg: "",
  });

  useEffect(() => {
    let active = true;
    if (!token) {
      setStatus("error");
      setErrorMessage("This confirmation link is missing its token.");
      return;
    }
    (async () => {
      try {
        await api.get("/api/v1/newsletter/confirm", { token });
        if (active) setStatus("success");
      } catch (err: any) {
        if (!active) return;
        setStatus("error");
        setErrorMessage(
          err?.message ??
            "We couldn't confirm this link. It may have expired or already been used."
        );
      }
    })();
    return () => {
      active = false;
    };
  }, [token]);

  const toggle = (key: string) =>
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));

  const savePreferences = async () => {
    setSavingPrefs(true);
    const segments = Object.entries(selected)
      .filter(([, on]) => on)
      .map(([key]) => key);
    try {
      await api.post("/api/v1/newsletter/preferences", { token, segments });
      setSnack({ open: true, ok: true, msg: "Preferences saved." });
    } catch {
      setSnack({
        open: true,
        ok: false,
        msg: "Couldn't save preferences. Please try again.",
      });
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <SEO
        title="Confirm your subscription"
        description="Confirm your NeuroDyne Corp newsletter subscription and choose the updates you want to receive."
      />
      <Container maxWidth="lg">
        <Stack spacing={4} alignItems="center">
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            sx={{
              width: "100%",
              maxWidth: 560,
              bgcolor: "#111827",
              backgroundImage:
                "linear-gradient(135deg, rgba(108,99,255,0.06), rgba(0,212,170,0.04))",
              border: "1px solid rgba(108,99,255,0.2)",
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: "center" }}>
              <Typography sx={{ ...overline, mb: 2 }}>Newsletter</Typography>

              {status === "loading" && (
                <Stack spacing={2} alignItems="center" sx={{ py: 3 }}>
                  <CircularProgress sx={{ color: "#6C63FF" }} />
                  <Typography sx={{ color: "text.secondary", opacity: 0.8 }}>
                    Confirming your subscription...
                  </Typography>
                </Stack>
              )}

              {status === "success" && (
                <Stack spacing={1.5} alignItems="center">
                  <MarkEmailReadOutlinedIcon sx={{ color: "#10B981", fontSize: 52 }} />
                  <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.4rem", md: "1.7rem" }, letterSpacing: "-0.02em" }}>
                    You're confirmed.
                  </Typography>
                  <Typography sx={{ color: "text.secondary", opacity: 0.8, lineHeight: 1.7, maxWidth: 420 }}>
                    Thanks for verifying your email. You're all set to receive our
                    updates. Fine-tune what lands in your inbox below.
                  </Typography>
                </Stack>
              )}

              {status === "error" && (
                <Stack spacing={1.5} alignItems="center">
                  <ErrorOutlineOutlinedIcon sx={{ color: "#EF4444", fontSize: 52 }} />
                  <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.4rem", md: "1.7rem" }, letterSpacing: "-0.02em" }}>
                    Something went wrong.
                  </Typography>
                  <Typography sx={{ color: "text.secondary", opacity: 0.8, lineHeight: 1.7, maxWidth: 420 }}>
                    {errorMessage}
                  </Typography>
                  <Button
                    component={Link}
                    to="/"
                    variant="outlined"
                    sx={{
                      mt: 1,
                      fontFamily: "monospace",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      borderColor: "rgba(108,99,255,0.4)",
                      color: "text.primary",
                      "&:hover": { borderColor: "#6C63FF", bgcolor: "rgba(108,99,255,0.06)" },
                    }}
                  >
                    Back to home
                  </Button>
                </Stack>
              )}
            </CardContent>
          </MotionCard>

          {status === "success" && (
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              sx={{
                width: "100%",
                maxWidth: 560,
                bgcolor: "#111827",
                border: "1px solid rgba(108,99,255,0.16)",
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Typography sx={{ ...overline, mb: 0.5 }}>Preferences</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", mb: 0.5 }}>
                  Choose what you hear about.
                </Typography>
                <Typography sx={{ color: "text.secondary", opacity: 0.75, fontSize: "0.875rem", mb: 2 }}>
                  Update these any time. Unsubscribe is always one click away.
                </Typography>

                <Divider sx={{ borderColor: "rgba(108,99,255,0.12)", mb: 1 }} />

                <Stack divider={<Divider sx={{ borderColor: "rgba(108,99,255,0.08)" }} />}>
                  {SEGMENTS.map((seg) => (
                    <Stack
                      key={seg.key}
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ py: 1.25 }}
                    >
                      <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                        {seg.label}
                      </Typography>
                      <Switch
                        checked={!!selected[seg.key]}
                        onChange={() => toggle(seg.key)}
                        inputProps={{ "aria-label": seg.label }}
                      />
                    </Stack>
                  ))}
                </Stack>

                <Button
                  fullWidth
                  onClick={savePreferences}
                  disabled={savingPrefs}
                  variant="contained"
                  startIcon={
                    savingPrefs ? (
                      <CircularProgress size={16} sx={{ color: "#fff" }} />
                    ) : (
                      <CheckCircleOutlineIcon />
                    )
                  }
                  sx={{
                    mt: 2.5,
                    fontFamily: "monospace",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
                    "&:hover": { boxShadow: "0 4px 20px rgba(108,99,255,0.4)" },
                    "&.Mui-disabled": {
                      background: "rgba(108,99,255,0.15)",
                      color: "text.secondary",
                    },
                  }}
                >
                  {savingPrefs ? "Saving..." : "Save preferences"}
                </Button>
              </CardContent>
            </MotionCard>
          )}
        </Stack>
      </Container>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.ok ? "success" : "error"}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
