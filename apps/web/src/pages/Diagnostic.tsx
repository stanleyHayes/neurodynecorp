import { useState, useEffect, useMemo } from "react";
import { Box, Container, Stack, Typography, TextField, Button, LinearProgress, CircularProgress, Chip, Alert } from "@mui/material";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import { SectionHeading, InfoCard, CTABand, Overline } from "@/components/shared/Marketing";
import { api } from "@/api/client";

const MotionBox = motion.create(Box);

interface DOption { value: string; label: string }
interface DQuestion {
  id: string;
  text: string;
  helpText?: string;
  type: "single" | "multi";
  options: DOption[];
  dependsOn?: { questionId: string; expectedValue: string };
  order: number;
}
interface DResult {
  route: string;
  routeLabel: string;
  confidence: number;
  lowConfidence: boolean;
  summary: string;
  reasons: string[];
  nextStep: string;
}

type Phase = "intro" | "questions" | "contact" | "result";
type AnswerMap = Record<string, string | string[]>;

const ROUTE_COLOR: Record<string, string> = {
  services: "#6C63FF",
  labs: "#8B85FF",
  gov_digital_excellence: "#00D4AA",
  decline_referral: "#F59E0B",
};

function matches(q: DQuestion, answers: AnswerMap): boolean {
  if (!q.dependsOn) return true;
  const parent = answers[q.dependsOn.questionId];
  if (parent === undefined) return false;
  return Array.isArray(parent) ? parent.includes(q.dependsOn.expectedValue) : parent === q.dependsOn.expectedValue;
}

export default function Diagnostic() {
  const [questions, setQuestions] = useState<DQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [contact, setContact] = useState({ respondentName: "", email: "", org: "" });

  const [result, setResult] = useState<DResult | null>(null);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    api
      .getDiagnosticQuestions()
      .then((data) => setQuestions((data.questions ?? []).slice().sort((a, b) => a.order - b.order)))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  // Client-side branching mirrors the server's dependsOn rule.
  const visible = useMemo(() => questions.filter((q) => matches(q, answers)), [questions, answers]);
  const current = visible[Math.min(stepIndex, Math.max(0, visible.length - 1))];
  const progress = visible.length ? (Math.min(stepIndex, visible.length) / (visible.length + 1)) * 100 : 0;

  const answerSingle = (qid: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
    // Auto-advance after a short beat for single-select.
    setStepIndex((i) => i + 1);
  };

  // When stepIndex passes the (possibly re-branched) visible list, move to contact.
  useEffect(() => {
    if (phase === "questions" && visible.length > 0 && stepIndex >= visible.length) {
      setPhase("contact");
    }
  }, [phase, stepIndex, visible.length]);

  const goBack = () => {
    if (phase === "contact") {
      setPhase("questions");
      setStepIndex(Math.max(0, visible.length - 1));
    } else if (phase === "questions" && stepIndex > 0) {
      setStepIndex((i) => i - 1);
    } else if (phase === "questions") {
      setPhase("intro");
    }
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      // Only submit answers for questions still visible — drop orphaned branch
      // answers left behind if the user changed an earlier (parent) answer.
      const payload = {
        answers: visible
          .filter((q) => answers[q.id] !== undefined)
          .map((q) => ({ questionId: q.id, value: answers[q.id]! })),
        respondentName: contact.respondentName.trim() || undefined,
        email: contact.email.trim() || undefined,
        org: contact.org.trim() || undefined,
      };
      const res = await api.submitDiagnostic(payload);
      setResult(res.result);
      setRecordId(res.recordId);
      setPhase("result");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadSummary = () => {
    if (!result) return;
    const blob = new Blob([result.summary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "engagement-readiness-summary.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <SEO
        title="Engagement Readiness Diagnostic"
        description="A short, branching diagnostic that routes your brief to the right engagement path with NeuroDyne Corp — and gives you a one-page readiness summary."
        canonical="https://neurodynecorp.com/diagnostic"
        ogUrl="https://neurodynecorp.com/diagnostic"
      />

      <PageHero
        icon={<InsightsOutlinedIcon />}
        title="Engagement Readiness Diagnostic"
        description="Eight to ten questions. We'll route your brief to the right path and hand you a one-page readiness summary. Engagement is by qualification — this is how it starts."
        tag="INTAKE // DIAGNOSTIC"
        accentWord="Readiness"
        iconColor="#6C63FF"
        iconLabel="QUALIFY"
      />

      <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress size={32} sx={{ color: "#6C63FF" }} />
          </Box>
        ) : loadError ? (
          <Alert severity="error">
            The diagnostic is temporarily unavailable. Please <Link to="/contact">contact us</Link> directly.
          </Alert>
        ) : (
          <AnimatePresence mode="wait">
            {/* ── Intro ── */}
            {phase === "intro" && (
              <MotionBox key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <InfoCard accent="#6C63FF" title="Before we talk, a quick qualification">
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 2 }}>
                    This replaces the contact form. It takes about two minutes, branches based on your answers, and ends
                    with an indicative routing decision plus a one-page summary you can keep. Nothing here commits you to anything.
                  </Typography>
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => { setPhase("questions"); setStepIndex(0); }}
                    sx={{ bgcolor: "#6C63FF", "&:hover": { bgcolor: "#5a52e0" } }}
                  >
                    Begin diagnostic
                  </Button>
                </InfoCard>
              </MotionBox>
            )}

            {/* ── Questions ── */}
            {phase === "questions" && current && (
              <MotionBox key={`q-${current.id}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
                <LinearProgress variant="determinate" value={progress} sx={{ mb: 3, borderRadius: 2, height: 6, bgcolor: "rgba(108,99,255,0.12)", "& .MuiLinearProgress-bar": { bgcolor: "#6C63FF" } }} />
                <Overline>Question {stepIndex + 1} of {visible.length}</Overline>
                <Typography variant="h5" sx={{ fontWeight: 800, mt: 1, mb: current.helpText ? 0.75 : 2 }}>
                  {current.text}
                </Typography>
                {current.helpText && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, opacity: 0.8 }}>{current.helpText}</Typography>
                )}
                <Stack spacing={1.5}>
                  {current.options.map((opt) => {
                    const selected = answers[current.id] === opt.value;
                    return (
                      <Box
                        key={opt.value}
                        component="button"
                        onClick={() => answerSingle(current.id, opt.value)}
                        sx={{
                          textAlign: "left",
                          cursor: "pointer",
                          font: "inherit",
                          width: "100%",
                          p: 2,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: selected ? "#6C63FF" : "divider",
                          bgcolor: selected ? "rgba(108,99,255,0.10)" : "transparent",
                          color: "text.primary",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          transition: "border-color 0.2s, background 0.2s",
                          "&:hover": { borderColor: "#6C63FF", bgcolor: "rgba(108,99,255,0.06)" },
                        }}
                      >
                        <Typography sx={{ fontWeight: 500 }}>{opt.label}</Typography>
                        {selected && <CheckCircleOutlineIcon sx={{ color: "#6C63FF", fontSize: 20 }} />}
                      </Box>
                    );
                  })}
                </Stack>
                <Button onClick={goBack} startIcon={<ArrowBackIcon />} sx={{ mt: 3, color: "text.secondary" }}>
                  Back
                </Button>
              </MotionBox>
            )}

            {/* ── Contact ── */}
            {phase === "contact" && (
              <MotionBox key="contact" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
                <LinearProgress variant="determinate" value={92} sx={{ mb: 3, borderRadius: 2, height: 6, bgcolor: "rgba(108,99,255,0.12)", "& .MuiLinearProgress-bar": { bgcolor: "#6C63FF" } }} />
                <SectionHeading tag="ALMOST THERE" title="Where should the summary go?" lead="Optional — but if you'd like a copy and a route to a conversation, leave a way to reach you." />
                <Stack spacing={2}>
                  <TextField label="Your name" value={contact.respondentName} onChange={(e) => setContact({ ...contact, respondentName: e.target.value })} fullWidth />
                  <TextField label="Organisation" value={contact.org} onChange={(e) => setContact({ ...contact, org: e.target.value })} fullWidth />
                  <TextField label="Email" type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} fullWidth />
                </Stack>
                {submitError && <Alert severity="error" sx={{ mt: 2 }}>{submitError}</Alert>}
                <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
                  <Button onClick={goBack} startIcon={<ArrowBackIcon />} sx={{ color: "text.secondary" }}>Back</Button>
                  <Button
                    variant="contained"
                    endIcon={submitting ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <ArrowForwardIcon />}
                    disabled={submitting}
                    onClick={submit}
                    sx={{ bgcolor: "#6C63FF", "&:hover": { bgcolor: "#5a52e0" } }}
                  >
                    {submitting ? "Scoring…" : "See my routing"}
                  </Button>
                </Stack>
              </MotionBox>
            )}

            {/* ── Result ── */}
            {phase === "result" && result && (
              <MotionBox key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <Stack spacing={3}>
                  <InfoCard accent={ROUTE_COLOR[result.route] ?? "#6C63FF"} icon={<CheckCircleOutlineIcon />} title="Your indicative routing">
                    <Chip
                      label={result.routeLabel}
                      sx={{ mt: 0.5, mb: 2, bgcolor: `${ROUTE_COLOR[result.route] ?? "#6C63FF"}1A`, color: ROUTE_COLOR[result.route] ?? "#6C63FF", fontWeight: 700, fontFamily: "monospace", letterSpacing: "0.08em" }}
                    />
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      {result.nextStep}
                    </Typography>
                    {result.reasons.length > 0 && (
                      <Stack spacing={1} sx={{ mt: 2.5 }}>
                        <Overline>Why</Overline>
                        {result.reasons.map((r, i) => (
                          <Stack sx={{ alignItems: "flex-start" }} key={`${i}-${r}`} direction="row" spacing={1.5}>
                            <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: ROUTE_COLOR[result.route] ?? "#6C63FF", mt: "7px", flexShrink: 0 }} />
                            <Typography variant="body2" color="text.secondary">{r}</Typography>
                          </Stack>
                        ))}
                      </Stack>
                    )}
                  </InfoCard>

                  {/* One-page summary (print-friendly) */}
                  <Box className="diagnostic-summary" sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "rgba(108,99,255,0.04)" }}>
                    <Overline>One-page summary</Overline>
                    <Typography component="pre" sx={{ mt: 1.5, fontFamily: "monospace", fontSize: "0.8rem", whiteSpace: "pre-wrap", color: "text.secondary", lineHeight: 1.7 }}>
                      {result.summary}
                    </Typography>
                  </Box>

                  <Stack sx={{ flexWrap: "wrap" }} direction="row" spacing={1.5} useFlexGap>
                    <Button variant="outlined" startIcon={<DownloadOutlinedIcon />} onClick={downloadSummary}>Download summary</Button>
                    <Button variant="outlined" startIcon={<PrintOutlinedIcon />} onClick={() => window.print()}>Print / Save as PDF</Button>
                  </Stack>

                  {result.route === "decline_referral" ? (
                    <CTABand
                      to="/insights"
                      tag="RESOURCES"
                      title="Resources to move you forward"
                      description="Start with our field notes and theses. When your brief firms up — budget, sponsor, timeline — come back and we'll route you properly."
                      color="#F59E0B"
                    />
                  ) : (
                    <CTABand
                      to={`/book?route=${encodeURIComponent(result.route)}${recordId ? `&ref=${encodeURIComponent(recordId)}` : ""}`}
                      tag="NEXT STEP"
                      title="Book a qualified conversation"
                      description="We've reserved the right length of time based on your routing. Pick up exactly where the diagnostic left off."
                      color={ROUTE_COLOR[result.route] ?? "#6C63FF"}
                    />
                  )}
                </Stack>
              </MotionBox>
            )}
          </AnimatePresence>
        )}
      </Container>
    </Box>
  );
}
