import { useState } from "react";
import HudCorners from "@/components/shared/HudCorners";
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
  color: string;
  excerpt: string;
  content: string;
}

const FINTECH_SPEC = `# Financial Analytics Platform — Illustrative Spec Template

**Type:** Illustrative template · **Status:** Example only — not a client document

> This is a worked example of how a Neurodyne specification is structured. It is not
> a real engagement, there is no client behind it, and every target below is a
> placeholder that would be filled in with the client during intake.

## 1. Executive Summary

A hypothetical organisation wants to replace batch reporting with a near-real-time
analytics dashboard. The platform ingests transaction data from multiple sources,
normalises it, and surfaces insights through anomaly detection.

## 2. Objectives

*In a real spec, each objective carries a number agreed with the client and a way
to measure it. The placeholders below show the shape, not a promise.*

- Reduce report generation time from the current baseline to a target agreed at intake
- Detect transaction anomalies within an agreed time window of occurrence
- Support the concurrency ceiling the client's usage data justifies
- Meet whatever regulatory obligations the client identifies for the pipeline

## 3. Architecture

### Frontend
- **React 19** with Server Components for the analytics shell
- **Recharts** + custom WebGL charts for high-density visualizations
- **WebSocket** subscription for live anomaly stream

### Backend
- **Go** services with hexagonal architecture
- **gRPC** internal communication, **REST** edge gateway
- **Kafka** ingestion pipeline (source topics → normalized topic)

### Data
- **PostgreSQL** for transactional state
- **ClickHouse** for analytical queries
- **Redis** for session and rate-limit state

## 4. Feature Breakdown

*Effort columns in a real spec come from scoping the client's actual requirements.
The values here are illustrative only.*

| Feature | Effort | Priority |
|---------|--------|----------|
| Multi-source ingestion | TBD at scoping | Critical |
| Anomaly detection model | TBD at scoping | Critical |
| Real-time dashboard | TBD at scoping | High |
| Export & scheduled reports | TBD at scoping | Medium |
| Audit trail | TBD at scoping | High |

## 5. Timeline

> Sprint count and duration are set during scoping, once the feature breakdown above
> has real effort estimates against it.

## 6. Assumptions

1. Source systems expose webhooks or polling APIs with stable schemas
2. Client provides sufficient historical data for model training
3. Any compliance or audit milestones are owned by the client and scheduled explicitly

## 7. Role Permissions

- **Admin** — full read/write, user management, audit log access
- **Analyst** — read-only across dashboards, export
- **Auditor** — read-only with full audit log
`;

const HEALTHCARE_SPEC = `# Patient Monitoring Platform — Illustrative Spec Template

**Type:** Illustrative template · **Status:** Example only — not a client document

> This is a worked example of how a Neurodyne specification is structured for a
> regulated domain. It is not a real engagement and describes no delivered system.
> Neurodyne holds no healthcare certifications; any regulatory obligations in a real
> project belong to the client and are scoped explicitly.

## 1. Executive Summary

A hypothetical patient monitoring system. Wearables stream vitals to the cloud, a
processing pipeline flags concerning patterns, and care teams receive push alerts.

## 2. Objectives

*Placeholders. In a real spec each of these is a number the client sets and a
clinician signs off on.*

- Detection sensitivity target defined with the client's clinical team
- Regulatory scope (framework, jurisdiction, evidence required) agreed before build
- Patient and facility scale sized from the client's own figures
- Alert delivery latency budget set against clinical requirements

## 3. Architecture

- **React Native** patient-facing app (iOS + Android)
- **Node.js** + **TypeScript** API tier
- **MongoDB** (encrypted at rest, document-level encryption for sensitive fields)
- Model pipeline running in an isolated VPC
- **PubSub** for alert fanout

## 4. Engineering Controls

*Controls a spec of this kind would specify. They are design choices, not a
certification, and not a claim about any deployed system.*

- Sensitive data encrypted at rest with envelope encryption (AES-256-GCM + KMS)
- TLS 1.3 enforced; mTLS between internal services
- Security review and testing cadence agreed with the client and written into scope
- Data-processing agreements with any sub-processors the client approves

## 5. Key Risks

- Wearable battery drain — mitigated with batched uploads
- Network unavailability — local-first architecture, sync on reconnect
- Model drift — retraining cadence with a care-team feedback loop
`;

const SAAS_SPEC = `# Multi-Tenant SaaS Starter — Illustrative Spec Template

**Type:** Illustrative template · **Status:** Example only — not a client document

> A reusable architecture blueprint, not a record of delivered work.

## 1. Overview

Reusable architecture for B2B multi-tenant SaaS products. Schema-per-tenant model,
JWT auth with refresh rotation, feature-flagged tier system.

## 2. Core Features

- Tenant onboarding wizard
- Per-tenant RBAC with custom roles
- Stripe billing with metered usage
- Audit log streaming to object storage
- Admin console for tenant management

## 3. Tech Stack

- **Frontend:** React + Vite + React Router v7
- **Backend:** Go services with hexagonal architecture
- **DB:** PostgreSQL (Citus extension for multi-tenant scaling)
- **Auth:** JWT + refresh tokens, OAuth 2.0 federated SSO

## 4. Sprint Plan

*Illustrative sequencing. Real sprint plans come out of scoping.*

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
    title: "Financial Analytics Platform",
    category: "Template",
    color: "#6C63FF",
    excerpt: "How a spec for a real-time analytics platform is structured: objectives, architecture, effort breakdown, assumptions.",
    content: FINTECH_SPEC,
  },
  {
    id: "healthcare",
    title: "Patient Monitoring Platform",
    category: "Template",
    color: "#00D4AA",
    excerpt: "How a spec for a regulated domain is structured, including where compliance scope and engineering controls are written down.",
    content: HEALTHCARE_SPEC,
  },
  {
    id: "saas",
    title: "Multi-Tenant SaaS Starter",
    category: "Template",
    color: "#8B85FF",
    excerpt: "Tenant onboarding, RBAC, billing, audit log. A reusable architecture blueprint.",
    content: SAAS_SPEC,
  },
];

export default function SpecLibrary() {
  const [selected, setSelected] = useState<Spec | null>(null);

  return (
    <>
      <SEO
        title="Spec Library"
        description="Illustrative specification templates showing how NeuroDyne Corp structures a software spec. Not client work — no client names and no engagement data."
      />

      <PageHero
        icon={<LibraryBooksOutlinedIcon />}
        title="Spec Library"
        description="Illustrative specification templates. These are not client documents — they show how a Neurodyne spec is structured, from objectives through architecture to assumptions."
        tag="TEMPLATES // PUBLIC"
        accentWord="Library"
        iconColor="#8B85FF"
        iconLabel="3 TEMPLATES"
      />

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box
          sx={{
            position: "relative",
            p: 2.5,
            mb: 5,
            border: "1px solid rgba(108, 99, 255, 0.2)",
            bgcolor: "rgba(108, 99, 255, 0.04)",
          }}
        >
          <Typography
            sx={{
              fontFamily: "monospace",
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "text.secondary",
              opacity: 0.7,
              mb: 1,
            }}
          >
            Illustrative only
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: "0.9rem", lineHeight: 1.7 }}>
            Every document below is a template written for this page. There is no client
            behind any of them, and the figures are placeholders rather than measured
            results. They are published because the structure is the useful part: what a
            specification covers, in what order, and where the numbers belong once a real
            project supplies them.
          </Typography>
        </Box>

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
                borderRadius: 0,
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
              <HudCorners />
              <Box sx={{ "& .MuiSvgIcon-root": { fontSize: 28, color: s.color, filter: `drop-shadow(0 0 8px ${s.color}50)` }, mb: 2 }}>
                <SchemaOutlinedIcon />
              </Box>
              <Stack direction="row" spacing={0.75} sx={{ mb: 1.5 }}>
                <Chip label={s.category} size="small" sx={{ fontFamily: "monospace", fontSize: "0.6rem", bgcolor: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }} />
                <Chip label="not client work" size="small" variant="outlined" sx={{ fontFamily: "monospace", fontSize: "0.6rem" }} />
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
                Preview Template
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
                    TEMPLATE PREVIEW
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
                  "& blockquote": { borderLeft: `3px solid ${selected.color}`, pl: 2.5, my: 3, bgcolor: `${selected.color}08`, borderRadius: 0, py: 0.5 },
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
                  Want a spec in this format for your own project? <Box component="a" href="/start-project" sx={{ color: selected.color, fontWeight: 600, textDecoration: "none", borderBottom: `1px solid ${selected.color}40`, "&:hover": { borderColor: selected.color } }}>Start a brief</Box>.
                </Typography>
              </Box>
            </Box>
          )}
        </AnimatePresence>
      </Drawer>
    </>
  );
}
