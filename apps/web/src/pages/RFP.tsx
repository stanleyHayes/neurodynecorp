import { useState } from "react";
import { Box, Container, Stack, Typography, TextField, Button, Alert, CircularProgress, Divider } from "@mui/material";
import { Link } from "react-router";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import { SectionHeading, InfoCard, Overline } from "@/components/shared/Marketing";
import { api } from "@/api/client";

interface Form {
  org: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  sector: string;
  title: string;
  scope: string;
  evaluationCriteria: string;
  submissionRequirements: string;
  documentUrl: string;
  estimatedValue: string;
  deadline: string;
}

const EMPTY: Form = {
  org: "", contactName: "", contactEmail: "", contactPhone: "", sector: "", title: "",
  scope: "", evaluationCriteria: "", submissionRequirements: "", documentUrl: "", estimatedValue: "", deadline: "",
};

export default function RFP() {
  const [form, setForm] = useState<Form>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ id: string; slaHours: number } | null>(null);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.contactEmail.trim());
  const canSubmit =
    Boolean(form.org.trim() && form.contactName.trim() && emailOk && form.title.trim() && form.scope.trim().length >= 10) &&
    !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await api.submitRfp({
        org: form.org.trim(),
        contactName: form.contactName.trim(),
        contactEmail: form.contactEmail.trim(),
        contactPhone: form.contactPhone.trim() || undefined,
        sector: form.sector.trim() || undefined,
        title: form.title.trim(),
        scope: form.scope.trim(),
        evaluationCriteria: form.evaluationCriteria.trim() || undefined,
        submissionRequirements: form.submissionRequirements.trim() || undefined,
        documentUrl: form.documentUrl.trim() || undefined,
        estimatedValue: form.estimatedValue.trim() || undefined,
        deadline: form.deadline.trim() || undefined,
      });
      setResult({ id: res.id, slaHours: res.slaHours });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't submit. Please check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <SEO
        title="Submit an RFP or Tender"
        description="Government bodies and enterprises can submit formal RFPs and tenders to NeuroDyne Corp through a structured intake, with an SLA-tracked acknowledgement."
        canonical="https://neurodynecorp.com/rfp"
        ogUrl="https://neurodynecorp.com/rfp"
      />

      <PageHero
        icon={<GavelOutlinedIcon />}
        title="RFP & Tender Submission"
        description="A structured channel for formal procurement. Submit the brief and your requirements; we acknowledge every serious submission within 48 hours and route it to the team that owns your vertical."
        tag="INTAKE // PROCUREMENT"
        accentWord="Tender"
        iconColor="#8B85FF"
        iconLabel="PROCUREMENT"
      />

      <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
        {result ? (
          <Stack spacing={3}>
            <InfoCard accent="#00D4AA" icon={<CheckCircleOutlineIcon />} title="Submission received">
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 2 }}>
                Thank you. Your RFP has been logged and routed internally. We commit to acknowledging it within{" "}
                <strong>{result.slaHours} hours</strong> — you'll get an email from us, and a confirmation is on its way now.
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <ScheduleOutlinedIcon sx={{ color: "#00D4AA", fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">
                  Reference: <Box component="span" sx={{ fontFamily: "monospace", color: "#00D4AA" }}>{result.id}</Box>
                </Typography>
              </Stack>
            </InfoCard>
            <Button component={Link} to="/" variant="outlined" sx={{ alignSelf: "flex-start" }}>
              Back to home
            </Button>
          </Stack>
        ) : (
          <Stack spacing={4}>
            <InfoCard accent="#8B85FF">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <ScheduleOutlinedIcon sx={{ color: "#8B85FF", fontSize: 22 }} />
                <Typography variant="body2" color="text.secondary">
                  Every serious submission is acknowledged within <strong>48 hours</strong> and SLA-tracked internally.
                </Typography>
              </Stack>
            </InfoCard>

            {/* Organisation & contact */}
            <Box>
              <SectionHeading tag="§ 01 — WHO" title="Organisation & contact" color="#6C63FF" />
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField label="Organisation *" value={form.org} onChange={set("org")} fullWidth inputProps={{ maxLength: 200 }} />
                  <TextField label="Sector / vertical" value={form.sector} onChange={set("sector")} fullWidth placeholder="e.g. Government, Health, Finance" inputProps={{ maxLength: 80 }} />
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField label="Contact name *" value={form.contactName} onChange={set("contactName")} fullWidth inputProps={{ maxLength: 200 }} />
                  <TextField label="Contact email *" type="email" value={form.contactEmail} onChange={set("contactEmail")} fullWidth error={Boolean(form.contactEmail) && !emailOk} helperText={Boolean(form.contactEmail) && !emailOk ? "Enter a valid email address" : undefined} inputProps={{ maxLength: 320 }} />
                  <TextField label="Phone" value={form.contactPhone} onChange={set("contactPhone")} fullWidth inputProps={{ maxLength: 40 }} />
                </Stack>
              </Stack>
            </Box>

            <Divider />

            {/* The brief */}
            <Box>
              <SectionHeading tag="§ 02 — THE BRIEF" title="Scope & requirements" color="#00D4AA" />
              <Stack spacing={2}>
                <TextField label="RFP / tender title *" value={form.title} onChange={set("title")} fullWidth inputProps={{ maxLength: 300 }} />
                <TextField label="Scope * (what you need built or delivered)" value={form.scope} onChange={set("scope")} fullWidth multiline minRows={4} helperText="At least a couple of sentences." inputProps={{ maxLength: 8000 }} />
                <TextField label="Evaluation criteria" value={form.evaluationCriteria} onChange={set("evaluationCriteria")} fullWidth multiline minRows={2} placeholder="How will submissions be scored?" inputProps={{ maxLength: 4000 }} />
                <TextField label="Submission requirements" value={form.submissionRequirements} onChange={set("submissionRequirements")} fullWidth multiline minRows={2} placeholder="Format, mandatory documents, compliance, etc." inputProps={{ maxLength: 4000 }} />
              </Stack>
            </Box>

            <Divider />

            {/* Logistics */}
            <Box>
              <SectionHeading tag="§ 03 — LOGISTICS" title="Deadline, value & document" color="#8B85FF" />
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField label="Your submission deadline" type="date" value={form.deadline} onChange={set("deadline")} fullWidth InputLabelProps={{ shrink: true }} />
                  <TextField label="Estimated value / budget band" value={form.estimatedValue} onChange={set("estimatedValue")} fullWidth placeholder="e.g. USD 100k–250k" inputProps={{ maxLength: 120 }} />
                </Stack>
                <TextField label="Link to RFP document" value={form.documentUrl} onChange={set("documentUrl")} fullWidth placeholder="https://… (procurement portal, Drive, etc.)" helperText="Paste a link to the full RFP/tender document. Direct file upload is coming soon." inputProps={{ maxLength: 2000 }} />
              </Stack>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <Box>
              <Overline>* required</Overline>
              <Button
                variant="contained"
                onClick={submit}
                disabled={!canSubmit}
                startIcon={submitting ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : <SendOutlinedIcon />}
                sx={{ mt: 1.5, bgcolor: "#6C63FF", "&:hover": { bgcolor: "#5a52e0" } }}
              >
                {submitting ? "Submitting…" : "Submit RFP"}
              </Button>
            </Box>
          </Stack>
        )}
      </Container>
    </Box>
  );
}
