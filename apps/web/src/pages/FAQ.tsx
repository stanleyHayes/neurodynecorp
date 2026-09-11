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
      { q: "What does the audit produce?", a: "A current-state map, a five-dimension readiness assessment, a target architecture, and a costed roadmap with sequencing. The planning horizon is set with you during scoping rather than fixed in advance." },
    ],
  },
  {
    name: "Pricing",
    color: "#00D4AA",
    items: [
      { q: "How do you price?", a: "Audits are fixed-scope; builds are milestone-paid; advisory is retainer-based. We publish indicative bands on each service page." },
      { q: "What currencies do you work in?", a: "USD, GHS, and EUR where relevant. The billing currency and any rate assumptions are fixed in the engagement agreement before work starts." },
      { q: "Is the scope estimator a quote?", a: "No. It's an indicative signal that we understand the brief. Final scope is set after a qualified conversation." },
    ],
  },
  {
    name: "Intellectual property",
    color: "#8B85FF",
    items: [
      { q: "Who owns what we build?", a: "Client engagements: you own the deliverables. Labs platforms: the IP stays with the firm and would be licensed to you rather than transferred. We make the distinction explicit up front." },
      { q: "Can we extract our data?", a: "Yes. Deliverables, decisions, milestones, and audit logs are yours, and a full export can be requested at any point during or after the engagement. Export is a contractual commitment, not a feature you have to negotiate for." },
    ],
  },
  {
    name: "Public-sector work",
    color: "#F59E0B",
    items: [
      { q: "Do you take public-sector work?", a: "Yes. Public-sector and national-scale systems are a deliberate focus of the practice, and RFP or tender documents can be sent through the contact page. To be clear: this is stated as intent and capability, not as a list of government engagements already delivered." },
      { q: "Can data stay on-shore?", a: "It can be built that way. Where regulation requires data residency, hosting region and a self-hosted deployment path are treated as architecture constraints and agreed in writing before the build starts — not offered as a pre-existing arrangement." },
    ],
  },
  {
    name: "Timelines",
    color: "#33DDBB",
    items: [
      { q: "How long does an audit take?", a: "Audits are scoped per engagement rather than sold against a fixed calendar. The duration and the review points are agreed in writing before work begins." },
      { q: "How fast can a build go live?", a: "Builds are phased so that each phase is independently shippable rather than held for one large launch. The phase plan and its dates are set with you at the start of the engagement, not quoted as a general timeline." },
    ],
  },
  {
    name: "Who does the work",
    color: "#6C63FF",
    items: [
      { q: "Who works on my engagement?", a: "NeuroDyne is founder-led by one engineer. The person who scopes the work is the person who designs, builds, and ships it — there is no handover to an unnamed delivery team." },
      { q: "Where are you based?", a: "Ghana. Engagements are delivered remotely, and the practice is oriented toward institutions building in Ghana and West Africa." },
    ],
  },
  {
    name: "Security & data protection",
    color: "#00D4AA",
    items: [
      { q: "How do you handle security?", a: "Role-based access control with per-permission checks, an append-only audit log on sensitive actions, and encryption in transit. Multi-factor authentication is not enabled yet, and there is no third-party certification or external audit to point to — every control is written out on the Trust Center so you can assess it directly." },
      { q: "What regulations do you align to?", a: "Work is designed to align with GDPR and Ghana's Data Protection Act 2012 (Act 843). That is a design posture rather than a certified compliance position; a data-processing agreement and sub-processor disclosure are available on request." },
    ],
  },
  {
    name: "Post-launch",
    color: "#8B85FF",
    items: [
      { q: "What happens after launch?", a: "Handover runbooks, training, a post-engagement report, and an agreed support plan. The engagement workspace stays as your record." },
      { q: "Do you offer ongoing support?", a: "Yes — through support tickets in the client portal and, where it fits, a retained advisory relationship. Response expectations are agreed in the support plan itself rather than advertised as a blanket SLA." },
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
        description="Frequently asked questions about NeuroDyne Corp — engagement model, pricing, IP, public-sector work, timelines, who does the work, security and data protection, and post-launch support."
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
