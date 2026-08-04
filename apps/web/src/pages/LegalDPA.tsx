import { Box, Container, Divider, Link as MuiLink, Typography } from "@mui/material";
import SEO from "@/components/seo/SEO";

const overline = {
  fontFamily: "monospace",
  fontSize: "0.7rem",
  textTransform: "uppercase",
  letterSpacing: "0.25em",
  color: "text.secondary",
  opacity: 0.6,
} as const;

const sections = [
  {
    title: "1. Overview",
    content: `This page summarises NeuroDyne Corp's Data Processing Addendum ("DPA"). The DPA governs how we process personal data on behalf of our clients ("Controllers") when we act as a processor in the course of providing our services. It supplements and forms part of the master services agreement or other contract between us and the Controller.

This summary is provided for convenience only. The signed DPA is the legally binding document and prevails in the event of any inconsistency.`,
  },
  {
    title: "2. Roles of the Parties",
    content: `For personal data processed in connection with our services, the client typically acts as the Controller (determining the purposes and means of processing) and NeuroDyne Corp acts as the Processor (processing personal data only on the Controller's documented instructions). Where we engage sub-processors, they act as our sub-processors under equivalent obligations.`,
  },
  {
    title: "3. Scope & Purpose of Processing",
    content: `We process personal data only to the extent necessary to provide, support, and secure the contracted services, and as otherwise instructed in writing by the Controller. The categories of data subjects and personal data, the nature and purpose of processing, and the duration are described in the DPA and its annexes, which are tailored to each engagement.`,
  },
  {
    title: "4. Our Obligations",
    content: `Under the DPA, NeuroDyne Corp commits to:

• Process personal data only on documented instructions from the Controller
• Ensure persons authorised to process data are bound by confidentiality
• Implement appropriate technical and organisational security measures
• Assist the Controller with data subject requests and compliance obligations
• Notify the Controller without undue delay upon becoming aware of a personal data breach
• Delete or return personal data at the end of the engagement, subject to legal retention requirements
• Make available information necessary to demonstrate compliance and support audits`,
  },
  {
    title: "5. Sub-processors",
    content: `We engage sub-processors to help deliver our services and impose data protection obligations on them that are no less protective than those in our DPA. A current list is maintained on our Sub-processors page, and we provide advance notice of changes where required so that reasonable objections can be raised.`,
  },
  {
    title: "6. International Transfers & Data Residency",
    content: `Where personal data is transferred across borders, we rely on appropriate safeguards and lawful transfer mechanisms recognised under applicable law, including the Data Protection Act, 2012 (Act 843) of Ghana and, where relevant, the EU General Data Protection Regulation. For clients with specific requirements, data residency can be configured to keep data within a designated region.`,
  },
  {
    title: "7. Requesting a Signed DPA",
    content: `Controllers who require a countersigned DPA can request one from us. Our standard DPA is suitable for most engagements and can be executed alongside your master services agreement. Where your organisation requires its own template, our legal team will review it.

To request a signed DPA, contact dpo@neurodynecorp.com with your organisation's legal name, the services in scope, and any specific regulatory requirements. We aim to respond promptly and will coordinate execution through your preferred signing method.`,
  },
];

export default function LegalDPA() {
  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <SEO
        title="Data Processing Addendum"
        description="A summary of NeuroDyne Corp's Data Processing Addendum and how to request a signed DPA for your organisation."
        canonical="https://neurodyne.dev/legal/dpa"
        ogUrl="https://neurodyne.dev/legal/dpa"
      />

      <Container maxWidth="md">
        <Typography sx={overline}>Legal</Typography>
        <Typography variant="h3" sx={{ mt: 2, mb: 1, fontWeight: 700 }}>
          Data Processing Addendum
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Last updated: June 2026
        </Typography>

        <Divider sx={{ my: 5 }} />

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 5, lineHeight: 1.8 }}
        >
          This page summarises the key terms of the NeuroDyne Corp Data
          Processing Addendum, which sets out our commitments when processing
          personal data on behalf of our clients, and explains how to request a
          signed copy.
        </Typography>

        {sections.map((section) => (
          <Box key={section.title} sx={{ mb: 5 }}>
            <Typography variant="h5" sx={{ mb: 2, color: "primary.light" }}>
              {section.title}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}
            >
              {section.content}
            </Typography>
          </Box>
        ))}

        <Divider sx={{ my: 5 }} />

        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
          To request a signed DPA, email{" "}
          <MuiLink
            href="mailto:dpo@neurodynecorp.com"
            sx={{ color: "secondary.main" }}
          >
            dpo@neurodynecorp.com
          </MuiLink>
          .
        </Typography>
      </Container>
    </Box>
  );
}
