import { useState, useMemo } from "react";
import { Box, Typography, Stack, Chip, Button, TextField, Alert, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import { Link } from "react-router";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import { SERVICE_LINES, getEstimator } from "@/data/serviceLines";
import { api } from "@/api/client";

const MotionBox = motion.create(Box);

const fmtK = (n: number) => `$${Math.round(n / 1000)}K`;
const labelSx = { fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.2em", color: "text.secondary", opacity: 0.6, textTransform: "uppercase" as const, mb: 1.5 };

const chipSx = (active: boolean, accent: string) => ({
  fontFamily: "monospace",
  fontSize: "0.7rem",
  fontWeight: 600,
  px: 0.5,
  cursor: "pointer",
  bgcolor: active ? `${accent}26` : "transparent",
  color: active ? accent : "text.secondary",
  border: active ? `1px solid ${accent}` : "1px solid rgba(108,99,255,0.2)",
  transition: "all 0.2s",
  "&:hover": { borderColor: accent, bgcolor: `${accent}14` },
});

export default function ScopeEstimator() {
  const [slug, setSlug] = useState(SERVICE_LINES[0]!.slug);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [lead, setLead] = useState({ name: "", email: "", org: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const line = SERVICE_LINES.find((l) => l.slug === slug)!;
  const estimator = getEstimator(slug);
  const params = selected[slug] ?? [];
  const accent = line.color;

  const toggleParam = (id: string) =>
    setSelected((prev) => {
      const cur = prev[slug] ?? [];
      return { ...prev, [slug]: cur.includes(id) ? cur.filter((p) => p !== id) : [...cur, id] };
    });

  const result = useMemo(() => {
    if (!estimator) return null;
    const chosen = estimator.params.filter((p) => params.includes(p.id));
    const weeks = estimator.baseWeeks + chosen.reduce((s, p) => s + p.weeksDelta, 0);
    const priceMin = estimator.basePrice + chosen.reduce((s, p) => s + p.costDelta, 0);
    const components = Array.from(new Set([...estimator.baseComponents, ...chosen.flatMap((p) => p.components ?? [])]));
    return {
      weeksMin: weeks,
      weeksMax: Math.round(weeks * 1.3),
      priceMin,
      priceMax: Math.round(priceMin * 1.4),
      components,
      architecture: estimator.architecture,
    };
  }, [estimator, params]);

  const canSubmit = Boolean(lead.name.trim() && lead.email.trim()) && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    const chosenLabels = estimator ? estimator.params.filter((p) => params.includes(p.id)).map((p) => p.label) : [];
    const message = [
      `Scope estimate request`,
      `Service line: ${line.name}`,
      chosenLabels.length ? `Selected: ${chosenLabels.join(", ")}` : `Selected: (none)`,
      result ? `Indicative components: ${result.components.join(", ")}` : "",
      result ? `Indicative timeline: ~${result.weeksMin}–${result.weeksMax} weeks` : `Timeline: ${line.timeline}`,
      result ? `Indicative price band: ${fmtK(result.priceMin)}–${fmtK(result.priceMax)}` : `Price band: ${line.priceBand}`,
    ].filter(Boolean).join("\n");
    try {
      await api.submitContact({
        name: lead.name.trim(),
        email: lead.email.trim(),
        company: lead.org.trim() || undefined,
        subject: `Scope estimate — ${line.name}`,
        projectType: line.slug,
        message,
      });
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't send. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ position: "relative", p: { xs: 3, md: 5 }, borderRadius: 3, border: "1px solid rgba(108, 99, 255, 0.18)", background: "linear-gradient(135deg, rgba(108,99,255,0.04), rgba(0,212,170,0.03))" }}>
      <Typography sx={{ fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#6C63FF", opacity: 0.7, mb: 1 }}>
        // SCOPE ESTIMATOR
      </Typography>
      <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.6rem", md: "2.2rem" }, letterSpacing: "-0.02em", mb: 1, background: "linear-gradient(135deg, #6C63FF, #00D4AA)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Configure an indicative scope
      </Typography>
      <Typography sx={{ color: "text.secondary", opacity: 0.7, mb: 4, maxWidth: 520 }}>
        Pick a service line, toggle what's in scope, and see an indicative component set, timeline, and price band. This isn't a quote — it's a signal that we understand the brief.
      </Typography>

      {/* Service line */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={labelSx}>Service line</Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
          {SERVICE_LINES.map((l) => (
            <Chip key={l.slug} label={l.name} onClick={() => setSlug(l.slug)} sx={chipSx(slug === l.slug, l.color)} />
          ))}
        </Stack>
      </Box>

      {estimator ? (
        <>
          {/* Params */}
          <Box sx={{ mb: 4 }}>
            <Typography sx={labelSx}>In scope ({params.length} selected)</Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
              {estimator.params.map((p) => (
                <Chip key={p.id} label={`${p.label} +${fmtK(p.costDelta)}`} onClick={() => toggleParam(p.id)} sx={chipSx(params.includes(p.id), "#00D4AA")} />
              ))}
            </Stack>
          </Box>

          {/* Result */}
          {result && (
            <MotionBox
              key={`${slug}-${params.join(",")}`}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 2, background: "rgba(10, 14, 26, 0.4)", border: "1px solid rgba(108, 99, 255, 0.2)", mb: 3 }}
            >
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: { xs: 2, md: 3 }, mb: 3 }}>
                <Stack sx={{ alignItems: "center" }} direction="row" spacing={1.5}>
                  <AttachMoneyIcon sx={{ fontSize: 30, color: "#6C63FF", filter: "drop-shadow(0 0 12px rgba(108,99,255,0.5))" }} />
                  <Box>
                    <Typography sx={{ ...labelSx, mb: 0.25, fontSize: "0.55rem" }}>Indicative price band</Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: "1.4rem" }}>{fmtK(result.priceMin)} – {fmtK(result.priceMax)}</Typography>
                  </Box>
                </Stack>
                <Stack sx={{ alignItems: "center" }} direction="row" spacing={1.5}>
                  <ScheduleOutlinedIcon sx={{ fontSize: 30, color: "#00D4AA", filter: "drop-shadow(0 0 12px rgba(0,212,170,0.5))" }} />
                  <Box>
                    <Typography sx={{ ...labelSx, mb: 0.25, fontSize: "0.55rem" }}>Indicative timeline</Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: "1.4rem" }}>~{result.weeksMin}–{result.weeksMax} weeks</Typography>
                  </Box>
                </Stack>
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
                  <WidgetsOutlinedIcon sx={{ fontSize: 16, color: "#8B85FF" }} />
                  <Typography sx={{ ...labelSx, mb: 0 }}>Indicative components</Typography>
                </Stack>
                <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
                  {result.components.map((c) => (
                    <Chip key={c} label={c} size="small" sx={{ fontFamily: "monospace", fontSize: "0.6rem", bgcolor: "rgba(139,133,255,0.12)", color: "#8B85FF", border: "1px solid rgba(139,133,255,0.25)" }} />
                  ))}
                </Stack>
              </Box>

              <Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.75 }}>
                  <LayersOutlinedIcon sx={{ fontSize: 16, color: "#33DDBB" }} />
                  <Typography sx={{ ...labelSx, mb: 0 }}>Sample architecture</Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.85, lineHeight: 1.7 }}>{result.architecture}</Typography>
              </Box>
            </MotionBox>
          )}

          {/* Lead capture */}
          {submitted ? (
            <Alert icon={<CheckCircleOutlineIcon />} severity="success" sx={{ borderRadius: 2 }}>
              Got it — your configuration is on its way to our team. We'll be in touch to turn this into a real scope.
            </Alert>
          ) : (
            <Box>
              <Typography sx={labelSx}>Send me this scope</Typography>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: error ? 1.5 : 0 }}>
                <TextField size="small" label="Name" value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} sx={{ flex: 1 }} />
                <TextField size="small" label="Email" type="email" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} sx={{ flex: 1 }} />
                <TextField size="small" label="Organisation" value={lead.org} onChange={(e) => setLead({ ...lead, org: e.target.value })} sx={{ flex: 1 }} />
                <Button
                  variant="contained"
                  onClick={submit}
                  disabled={!canSubmit}
                  startIcon={submitting ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <SendOutlinedIcon />}
                  sx={{ fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.06em", background: "linear-gradient(135deg, #6C63FF, #00D4AA)", whiteSpace: "nowrap", "&:hover": { boxShadow: "0 8px 30px rgba(108,99,255,0.4)" } }}
                >
                  {submitting ? "Sending…" : "Send scope"}
                </Button>
              </Stack>
              {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
            </Box>
          )}
        </>
      ) : (
        // Lines without a configurator (e.g. retained advisory) — point to a conversation.
        <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 2, background: "rgba(10, 14, 26, 0.4)", border: "1px solid rgba(108, 99, 255, 0.2)" }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>{line.name} is scoped as a relationship, not a configurator.</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>{line.priceBand}. {line.positioning}</Typography>
          <Button component={Link} to="/diagnostic" variant="outlined" sx={{ borderColor: `${accent}66`, color: accent }}>
            Start with the readiness diagnostic
          </Button>
        </Box>
      )}

      <Typography sx={{ mt: 2.5, fontFamily: "monospace", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5, textAlign: "center" }}>
        Indicative only — not a quote. Final scope is set after a qualified conversation.
      </Typography>
    </Box>
  );
}
