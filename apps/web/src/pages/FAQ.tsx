import { useState } from "react";
import { Box, Container, Stack, Typography, Accordion, AccordionSummary, AccordionDetails, Chip } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import { CTABand, Overline } from "@/components/shared/Marketing";

interface QA {
  q: string;
  a: string;
}
interface Category {
  name: string;
  color: string;
  items: QA[];
}

const CATEGORIES: Category[] = [
  {
    name: "Engagement model",
    color: "#6C63FF",
    items: [
      { q: "How do engagements start?", a: "By qualification, not enquiry. You complete the Engagement Readiness Diagnostic; we route you to the right path and a qualified conversation." },
      { q: "Do you take any project?", a: "No. We're selective on mission-critical builds and take web/platform work where it earns strategic position." },
      { q: "What does the audit produce?", a: "A current-state map, a five-dimension readiness assessment, a target architecture for 18–36 months, and a costed roadmap." },
    ],
  },
  {
    name: "Pricing",
    color: "#00D4AA",
    items: [
      { q: "How do you price?", a: "Audits are fixed-scope; builds are milestone-paid; advisory is retainer-based. We publish indicative bands on each service page." },
      { q: "What currencies do you work in?", a: "USD, GHS, and EUR where relevant. Multi-currency exposure is tracked in the client portal's budget view." },
      { q: "Is the scope estimator a quote?", a: "No. It's an indicative signal that we understand the brief. Final scope is set after a qualified conversation." },
    ],
  },
  {
    name: "Intellectual property",
    color: "#8B85FF",
    items: [
      { q: "Who owns what we build?", a: "Client engagements: you own the deliverables. Labs platforms: the IP stays with the firm and is licensed. We make the distinction explicit up front." },
      { q: "Can we extract our data?", a: "Yes. Sophisticated clients get scoped API keys to pull deliverables, decisions, milestones, and audit logs at any time." },
    ],
  },
  {
    name: "Government work",
    color: "#F59E0B",
    items: [
      { q: "Do you work with governments?", a: "Yes — national-scale digital systems are core. We support RFP/tender intake with SLA-tracked acknowledgement." },
      { q: "Can data stay on-shore?", a: "Yes. Where regulation requires data residency, we deploy to a self-hosted equivalent rather than a default cloud region." },
    ],
  },
  {
    name: "Timelines",
    color: "#33DDBB",
    items: [
      { q: "How long does an audit take?", a: "Typically 4–8 weeks depending on scope." },
      { q: "How fast can a build go live?", a: "Mission-critical builds are phased over 12–24+ weeks. Each phase is independently shippable." },
    ],
  },
  {
    name: "Team & composition",
    color: "#6C63FF",
    items: [
      { q: "Who works on my engagement?", a: "A named team surfaced in your portal's Team Directory, with roles, contact, and availability." },
      { q: "Where is the team based?", a: "Ghana and West Africa, working with international clients and multilateral institutions." },
    ],
  },
  {
    name: "Security & compliance",
    color: "#00D4AA",
    items: [
      { q: "How do you handle security?", a: "MFA enforced, full audit logging, RBAC, encryption in transit. Auth and audit are reviewed by an external practitioner before any client goes live." },
      { q: "What regulations do you align to?", a: "GDPR and Ghana's Data Protection Act 2012 (Act 843), with DPA and sub-processor disclosure on request." },
    ],
  },
  {
    name: "Post-launch",
    color: "#8B85FF",
    items: [
      { q: "What happens after launch?", a: "Handover runbooks, training, a post-engagement report, and an agreed support plan. The engagement workspace stays as your record." },
      { q: "Do you offer ongoing support?", a: "Yes — via SLA-tracked support tickets in the portal and, where fitting, a retained advisory relationship." },
    ],
  },
];

export default function FAQ() {
  const [expanded, setExpanded] = useState<string | false>("0-0");

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: CATEGORIES.flatMap((c) =>
      c.items.map((it) => ({
        "@type": "Question",
        name: it.q,
        acceptedAnswer: { "@type": "Answer", text: it.a },
      })),
    ),
  };

  return (
    <Box>
      <SEO
        title="FAQ"
        description="Frequently asked questions about NeuroDyne Corp — engagement model, pricing, IP, government work, timelines, team, security & compliance, and post-launch support."
        canonical="https://neurodyne.dev/faq"
        ogUrl="https://neurodyne.dev/faq"
        structuredData={faqStructuredData}
      />

      <PageHero
        icon={<QuizOutlinedIcon />}
        title="Questions, answered"
        description="A working reference, not a marketing FAQ. Grouped by what people actually ask before they engage."
        tag="REFERENCE // FAQ"
        accentWord="answered"
        iconColor="#00D4AA"
        iconLabel="KNOWLEDGE BASE"
      />

      <Container maxWidth="md" sx={{ py: { xs: 6, md: 9 } }}>
        <Stack spacing={{ xs: 5, md: 6 }}>
          {CATEGORIES.map((cat, ci) => (
            <Box key={cat.name}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2 }}>
                <Chip
                  label={`§ ${String(ci + 1).padStart(2, "0")}`}
                  size="small"
                  sx={{ bgcolor: `${cat.color}1A`, color: cat.color, fontFamily: "monospace", fontSize: "0.6rem" }}
                />
                <Overline color={cat.color}>{cat.name}</Overline>
              </Stack>
              {cat.items.map((it, ii) => {
                const id = `${ci}-${ii}`;
                return (
                  <Accordion
                    key={id}
                    expanded={expanded === id}
                    onChange={(_, isExp) => setExpanded(isExp ? id : false)}
                    disableGutters
                    elevation={0}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "12px !important",
                      mb: 1.5,
                      bgcolor: "transparent",
                      "&:before": { display: "none" },
                      overflow: "hidden",
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: cat.color }} />}>
                      <Typography sx={{ fontWeight: 600 }}>{it.q}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                        {it.a}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>
          ))}

          <CTABand
            to="/contact"
            tag="STILL STUCK?"
            title="Didn't find your answer?"
            description="Reach out directly and we'll get back to you. Serious enquiries get a serious response."
            color="#6C63FF"
          />
        </Stack>
      </Container>
    </Box>
  );
}
