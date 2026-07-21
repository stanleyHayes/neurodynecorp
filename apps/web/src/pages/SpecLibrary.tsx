import { useState } from "react";
import { Box, Typography, Container, Stack, Chip, Button, Drawer, IconButton } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import LibraryBooksOutlinedIcon from "@mui/icons-material/LibraryBooksOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CloseIcon from "@mui/icons-material/Close";
import SchemaOutlinedIcon from "@mui/icons-material/SchemaOutlined";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import NewsletterCTA from "@/components/shared/NewsletterCTA";
import { playSound } from "@/hooks/useSound";

const MotionBox = motion.create(Box);

interface Spec {
  id: string;
  title: string;
  category: string;
  pages: number;
  domain: string;
  color: string;
  excerpt: string;
  content: string;
}

const FINTECH_SPEC = `# FinanceFlow — AI-Powered Analytics Platform

**Version:** 1.2 · **Status:** Approved · **Pages:** 18

## 1. Executive Summary

FinanceFlow needed a real-time analytics dashboard to replace their batch-reporting system. The platform ingests transaction data from 12 sources, normalizes it, and surfaces actionable insights through ML-driven anomaly detection.

## 2. Objectives

- Cut report generation time from 4 hours to under 30 seconds
- Detect transaction anomalies within 2 minutes of occurrence
- Support 50,000 concurrent dashboard sessions
- Maintain SOC-2 compliance throughout the pipeline

## 3. Architecture

### Frontend
- **React 19** with Server Components for the analytics shell
- **Recharts** + custom WebGL charts for high-density visualizations
- **WebSocket** subscription for live anomaly stream

### Backend
- **Go** services with hexagonal architecture
- **gRPC** internal communication, **REST** edge gateway
- **Kafka** ingestion pipeline (12 source topics → 1 normalized topic)

### Data
- **PostgreSQL** for transactional state
- **ClickHouse** for analytical queries (sub-second on 2B rows)
- **Redis** for session and rate-limit state

## 4. Feature Breakdown

| Feature | Effort | Priority |
|---------|--------|----------|
| Multi-source ingestion | 3 weeks | Critical |
| Anomaly detection model | 4 weeks | Critical |
| Real-time dashboard | 5 weeks | High |
| Export & scheduled reports | 2 weeks | Medium |
| Audit trail | 2 weeks | High |

## 5. Timeline

> 16 weeks total · 4 sprints of 4 weeks each

## 6. Assumptions

1. Source systems expose webhooks or polling APIs with stable schemas
2. Client provides historical data for ML model training (≥6 months)
3. SOC-2 Type 1 audit completed within 6 months of go-live

## 7. Role Permissions

- **Admin** — full read/write, user management, audit log access
- **Analyst** — read-only across dashboards, export
- **Auditor** — read-only with full audit log
`;

const HEALTHCARE_SPEC = `# HealthTrack — Patient Monitoring Platform

**Version:** 2.0 · **Status:** Approved · **Pages:** 22

## 1. Executive Summary

HIPAA-compliant patient monitoring system. Wearables stream vitals to the cloud; ML pipeline flags concerning patterns; care teams get instant push alerts.

## 2. Objectives

- 95% early detection rate on clinically-significant events
- HIPAA Type 2 compliance from day one
- Support 30K active patients across 50 facilities
- Sub-200ms alert delivery from anomaly to care-team device

## 3. Architecture

- **React Native** patient-facing app (iOS + Android)
- **Node.js** + **TypeScript** API tier
- **MongoDB** (encrypted at rest, document-level encryption for PHI)
- **TensorFlow** ML pipeline running in isolated VPC
- **PubSub** for alert fanout

## 4. Compliance Notes

- All PHI encrypted at rest with envelope encryption (AES-256-GCM + KMS)
- TLS 1.3 enforced; mTLS between internal services
- Annual penetration testing scheduled
- BAAs with all sub-processors

## 5. Key Risks

- Wearable battery drain — mitigated with batched uploads
- Network unavailability — local-first architecture, sync on reconnect
- Model drift — quarterly retraining with care-team feedback loop
`;

const SAAS_SPEC = `# Multi-Tenant SaaS Starter Spec

**Version:** 1.0 · **Status:** Generated · **Pages:** 14

## 1. Overview

Reusable architecture for B2B multi-tenant SaaS products. Schema-per-tenant model, JWT auth with refresh rotation, feature-flagged tier system.

## 2. Core Features

- Tenant onboarding wizard
- Per-tenant RBAC with custom roles
- Stripe billing with metered usage
- Audit log streaming to S3
- Admin console for tenant management

## 3. Tech Stack

- **Frontend:** React + Vite + React Router v7
- **Backend:** Go services with hexagonal architecture
- **DB:** PostgreSQL (Citus extension for multi-tenant scaling)
- **Auth:** JWT + refresh tokens, OAuth 2.0 federated SSO

## 4. Sprint Plan

| Sprint | Focus |
|--------|-------|
| 1 | Auth, tenant onboarding, basic admin |
| 2 | Billing integration, usage metering |
| 3 | RBAC, audit log, API tokens |
| 4 | Polish, perf testing, hardening |
`;

const SPECS: Spec[] = [
  {
    id: "fintech",
    title: "Fintech Analytics Platform",
    category: "Fintech",
    pages: 18,
    domain: "Financial services",
    color: "#6C63FF",
    excerpt: "Real-time analytics dashboard, anomaly detection, SOC-2 compliant pipeline.",
    content: FINTECH_SPEC,
  },
  {
    id: "healthcare",
    title: "Patient Monitoring System",
    category: "Healthcare",
    pages: 22,
    domain: "HIPAA-regulated",
    color: "#00D4AA",
    excerpt: "Wearables → ML anomaly detection → care-team alerts. HIPAA Type 2 from day one.",
    content: HEALTHCARE_SPEC,
  },
  {
    id: "saas",
    title: "Multi-Tenant SaaS Starter",
    category: "B2B SaaS",
    pages: 14,
    domain: "Generic SaaS",
    color: "#8B85FF",
    excerpt: "Tenant onboarding, RBAC, Stripe billing, audit log. Reusable architecture blueprint.",
    content: SAAS_SPEC,
  },
];

export default function SpecLibrary() {
  const [selected, setSelected] = useState<Spec | null>(null);

  return (
    <>
      <SEO
        title="Spec Library"
        description="Sanitized example software specifications generated by NeuroDyne Corp's AI-assisted spec engine."
      />

      <PageHero
        icon={<LibraryBooksOutlinedIcon />}
        title="Spec Library"
        description="Sanitized example specs from real engagements. See exactly what our AI-assisted intake produces."
        tag="EXAMPLES // PUBLIC"
        accentWord="Library"
        iconColor="#8B85FF"
        iconLabel="3 EXAMPLES"
      />

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 3,
            mb: 8,
          }}
        >
          {SPECS.map((s, i) => (
            <MotionBox
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              sx={{
                position: "relative",
                p: 3,
                borderRadius: 2,
                border: "1px solid rgba(108, 99, 255, 0.15)",
                bgcolor: "rgba(108, 99, 255, 0.02)",
                transition: "all 0.25s",
                "&:hover": {
                  borderColor: `${s.color}50`,
                  bgcolor: `${s.color}06`,
                  transform: "translateY(-2px)",
                  boxShadow: `0 8px 28px ${s.color}15`,
                },
              }}
            >
              <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 28, color: s.color, filter: `drop-shadow(0 0 8px ${s.color}50)` }, mb: 2 }}>
                <SchemaOutlinedIcon />
              </Box>
              <Stack direction="row" spacing={0.75} sx={{ mb: 1.5 }}>
                <Chip label={s.category} size="small" sx={{ fontFamily: "monospace", fontSize: "0.6rem", bgcolor: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }} />
                <Chip label={`${s.pages} pages`} size="small" variant="outlined" sx={{ fontFamily: "monospace", fontSize: "0.6rem" }} />
              </Stack>
              <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", mb: 1 }}>
                {s.title}
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: "0.85rem", lineHeight: 1.6, mb: 2.5, opacity: 0.8 }}>
                {s.excerpt}
              </Typography>
              <Button
                onClick={() => {
                  playSound("open");
                  setSelected(s);
                }}
                startIcon={<VisibilityOutlinedIcon />}
                fullWidth
                variant="outlined"
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  borderColor: `${s.color}40`,
                  color: s.color,
                  "&:hover": { borderColor: s.color, bgcolor: `${s.color}10` },
                }}
              >
                Preview Spec
              </Button>
            </MotionBox>
          ))}
        </Stack>

        <Box>
          <NewsletterCTA />
        </Box>
      </Container>

      {/* Drawer with full spec */}
      <Drawer slotProps={{ paper: {
          sx: {
            width: { xs: "100%", md: 720 },
            bgcolor: "background.default",
            borderLeft: "1px solid rgba(108,99,255,0.2)",
          },
        } }}
        anchor="right"
        open={!!selected}
        onClose={() => {
          playSound("close");
          setSelected(null);
        }}
      >
        <AnimatePresence>
          {selected && (
            <Box sx={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {/* Header */}
              <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", px: 3, py: 2, borderBottom: "1px solid rgba(108,99,255,0.12)" }}>
                <Stack sx={{ alignItems: "center" }} direction="row" spacing={1.5}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: selected.color, boxShadow: `0 0 8px ${selected.color}` }} />
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "text.secondary", opacity: 0.6 }}>
                    SPEC PREVIEW
                  </Typography>
                  <Chip label={selected.category} size="small" sx={{ fontFamily: "monospace", fontSize: "0.55rem", bgcolor: `${selected.color}15`, color: selected.color, border: `1px solid ${selected.color}30` }} />
                </Stack>
                <IconButton onClick={() => setSelected(null)} sx={{ color: "text.secondary" }}>
                  <CloseIcon />
                </IconButton>
              </Stack>

              {/* Body */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  px: { xs: 3, md: 5 },
                  py: { xs: 3, md: 5 },
                  "& h1": { fontWeight: 800, fontSize: "1.8rem", mb: 1, letterSpacing: "-0.02em" },
                  "& h2": { fontWeight: 700, fontSize: "1.3rem", mt: 4, mb: 1.5 },
                  "& h3": { fontWeight: 600, fontSize: "1.05rem", mt: 3, mb: 1 },
                  "& p": { color: "text.secondary", lineHeight: 1.85, mb: 2, fontSize: "0.95rem" },
                  "& ul, & ol": { color: "text.secondary", pl: 3, mb: 2, "& li": { mb: 0.75, lineHeight: 1.7 } },
                  "& blockquote": { borderLeft: `3px solid ${selected.color}`, pl: 2.5, my: 3, bgcolor: `${selected.color}08`, borderRadius: "0 6px 6px 0", py: 0.5 },
                  "& code": { fontFamily: "monospace", fontSize: "0.85em", bgcolor: "rgba(108, 99, 255, 0.1)", color: "#8B85FF", px: 0.6, borderRadius: 0.5 },
                  "& table": {
                    width: "100%",
                    borderCollapse: "collapse",
                    mb: 3,
                    "& th": { textAlign: "left", py: 1.25, px: 1.5, fontWeight: 600, fontSize: "0.8rem", borderBottom: "2px solid rgba(108,99,255,0.15)" },
                    "& td": { py: 1.25, px: 1.5, fontSize: "0.8rem", color: "text.secondary", borderBottom: "1px solid rgba(108,99,255,0.08)" },
                  },
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{selected.content}</ReactMarkdown>
              </Box>

              {/* Footer CTA */}
              <Box sx={{ px: 3, py: 2, borderTop: "1px solid rgba(108,99,255,0.12)", bgcolor: "rgba(108,99,255,0.04)" }}>
                <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", opacity: 0.85 }}>
                  Like the format? <Box component="a" href="/start-project" sx={{ color: selected.color, fontWeight: 600, textDecoration: "none", borderBottom: `1px solid ${selected.color}40`, "&:hover": { borderColor: selected.color } }}>Brief us</Box> and we'll generate one for your project.
                </Typography>
              </Box>
            </Box>
          )}
        </AnimatePresence>
      </Drawer>
    </>
  );
}
