import { useState } from "react";
import { Box, Container, Stack, Typography, TextField, Button, Alert, CircularProgress, Chip } from "@mui/material";
import { Link, useSearchParams } from "react-router";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import { InfoCard, CTABand, Overline } from "@/components/shared/Marketing";
import { api } from "@/api/client";

// Mirror of the server's bookingDurationForRoute (server re-derives authoritatively).
function durationForRoute(route?: string): number {
  if (route === "gov_digital_excellence") return 45;
  if (route === "services" || route === "labs") return 30;
  return 20;
}

const ROUTE_LABEL: Record<string, string> = {
  services: "Services engagement",
  labs: "Labs collaboration",
  gov_digital_excellence: "Government Digital Excellence",
};

export default function Booking() {
  const [params] = useSearchParams();
  const ref = params.get("ref") || undefined;
  const route = params.get("route") || undefined;
  const duration = durationForRoute(route);

  const [form, setForm] = useState({ name: "", email: "", org: "", preferredTimes: "", timezone: "", topic: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ durationMins: number } | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim());
  const canSubmit = Boolean(form.name.trim() && emailOk && form.preferredTimes.trim()) && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await api.submitBooking({
        name: form.name.trim(),
        email: form.email.trim(),
        org: form.org.trim() || undefined,
        topic: form.topic.trim() || undefined,
        route,
        diagnosticId: ref,
        preferredTimes: form.preferredTimes.trim(),
        timezone: form.timezone.trim() || undefined,
      });
      setDone({ durationMins: res.durationMins });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't request a time. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <SEO
        title="Book a Reading"
        description="Request an initial conversation with NeuroDyne Corp. Conversations are gated by the readiness diagnostic so we come prepared with the right people and the right amount of time."
        canonical="https://neurodyne.dev/book"
        ogUrl="https://neurodyne.dev/book"
      />

      <PageHero
        icon={<EventAvailableOutlinedIcon />}
        title="Book a Reading"
        description="Request an initial conversation. We confirm a time and come prepared — with the right people, and the right amount of time for where you are."
        tag="INTAKE // CONVERSATION"
        accentWord="Reading"
        iconColor="#00D4AA"
        iconLabel="SCHEDULE"
      />

      <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
        {done ? (
          <Stack spacing={3}>
            <InfoCard accent="#00D4AA" icon={<CheckCircleOutlineIcon />} title="Request received">
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                Thanks — we've logged your request for a <strong>{done.durationMins}-minute</strong> conversation and will
                confirm a time by email shortly.
              </Typography>
            </InfoCard>
            <Button component={Link} to="/" variant="outlined" sx={{ alignSelf: "flex-start" }}>Back to home</Button>
          </Stack>
        ) : (
          <Stack spacing={4}>
            {/* Context / soft gate */}
            {ref ? (
              <InfoCard accent="#6C63FF" icon={<ScheduleOutlinedIcon />} title="Tailored to your diagnostic">
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", mt: 0.5 }}>
                  {route && ROUTE_LABEL[route] && (
                    <Chip label={ROUTE_LABEL[route]} sx={{ bgcolor: "rgba(108,99,255,0.12)", color: "#6C63FF", fontFamily: "monospace", fontSize: "0.65rem" }} />
                  )}
                  <Chip label={`${duration} minutes`} sx={{ bgcolor: "rgba(0,212,170,0.12)", color: "#00D4AA", fontFamily: "monospace", fontSize: "0.65rem" }} />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                  We've reserved a <strong>{duration}-minute</strong> slot based on your readiness diagnostic.
                </Typography>
              </InfoCard>
            ) : (
              <Alert severity="info">
                Conversations go further when we've seen your brief first. Consider running the{" "}
                <Link to="/diagnostic">2-minute readiness diagnostic</Link> — or request a time below and we'll take it from there.
              </Alert>
            )}

            <Stack spacing={2}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField slotProps={{ htmlInput: { maxLength: 200 } }} label="Your name *" value={form.name} onChange={set("name")} fullWidth />
                <TextField slotProps={{ htmlInput: { maxLength: 200 } }} label="Organisation" value={form.org} onChange={set("org")} fullWidth />
              </Stack>
              <TextField slotProps={{ htmlInput: { maxLength: 320 } }}
                label="Email *"
                type="email"
                value={form.email}
                onChange={set("email")}
                fullWidth
                error={Boolean(form.email) && !emailOk}
                helperText={Boolean(form.email) && !emailOk ? "Enter a valid email address" : undefined}
              />
              <TextField slotProps={{ htmlInput: { maxLength: 2000 } }} label="Preferred times *" value={form.preferredTimes} onChange={set("preferredTimes")} fullWidth multiline minRows={2} placeholder="e.g. Tue–Thu afternoons, or a few specific windows" />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField slotProps={{ htmlInput: { maxLength: 80 } }} label="Timezone" value={form.timezone} onChange={set("timezone")} fullWidth placeholder="e.g. GMT, WAT" />
                <TextField slotProps={{ htmlInput: { maxLength: 2000 } }} label="Topic (optional)" value={form.topic} onChange={set("topic")} fullWidth />
              </Stack>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            <Box>
              <Overline>* required</Overline>
              <Button
                variant="contained"
                onClick={submit}
                disabled={!canSubmit}
                startIcon={submitting ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <SendOutlinedIcon />}
                sx={{ mt: 1.5, bgcolor: "#00D4AA", color: "#04221c", fontWeight: 700, "&:hover": { bgcolor: "#00b896" } }}
              >
                {submitting ? "Requesting…" : `Request a ${duration}-minute reading`}
              </Button>
            </Box>

            <CTABand
              to="/diagnostic"
              tag="NOT YET QUALIFIED?"
              title="Run the readiness diagnostic first"
              description="Two minutes. It routes your brief and sets the right length for this conversation."
              color="#6C63FF"
            />
          </Stack>
        )}
      </Container>
    </Box>
  );
}
