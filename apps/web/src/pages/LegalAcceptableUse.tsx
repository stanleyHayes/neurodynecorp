import { Box, Container, Divider, Typography } from "@mui/material";
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
    title: "1. Purpose & Scope",
    content: `This Acceptable Use Policy governs the use of all NeuroDyne Corp websites, products, platforms, and services (collectively, the "Services"). It applies to every user, including clients, their authorised users, and the public. By accessing the Services, you agree to comply with this policy. Where a separate master services agreement or order form exists, that agreement takes precedence in the event of any conflict.

We may update this policy from time to time to address emerging risks, regulatory requirements, or operational needs.`,
  },
  {
    title: "2. Prohibited Activities",
    content: `You must not use the Services to:

• Violate any applicable law or regulation, including the laws of the Republic of Ghana and the jurisdictions in which you operate
• Infringe the intellectual property, privacy, or other rights of any person or entity
• Transmit unlawful, defamatory, harassing, fraudulent, or otherwise objectionable content
• Distribute malware, ransomware, or any code intended to disrupt, damage, or gain unauthorised access to systems
• Attempt to probe, scan, or test the vulnerability of any system or network without explicit written authorisation
• Circumvent authentication, rate limits, or access controls
• Engage in spamming, phishing, or other deceptive practices`,
  },
  {
    title: "3. System & Network Integrity",
    content: `You may not interfere with the proper functioning of the Services or any associated infrastructure. This includes generating excessive load, conducting denial-of-service activity, mining cryptocurrency without authorisation, or using automated tools to scrape data in a manner that degrades service quality or breaches rate limits.

Penetration testing, security research, and load testing against our environments require prior written consent and a defined scope agreed with our security team.`,
  },
  {
    title: "4. Data & Privacy Responsibilities",
    content: `Where you process personal data through the Services, you are responsible for doing so lawfully, including obtaining any necessary consents and providing required notices. You must not upload sensitive data unless the relevant Service is contracted and configured to handle it. Our processing of personal data on your behalf is governed by our Data Processing Addendum.`,
  },
  {
    title: "5. Government & Enterprise Use",
    content: `For public-sector and enterprise deployments, additional obligations may apply, including data residency, classification handling, and procurement-specific terms. Authorised users must adhere to their organisation's internal policies in addition to this policy. Misuse that places public services or constituent data at risk will be treated with the highest priority.`,
  },
  {
    title: "6. Reporting Violations",
    content: `If you become aware of any violation of this policy, or of a security or abuse concern, please report it promptly to abuse@neurodynecorp.com. We investigate all credible reports and treat them confidentially where appropriate.`,
  },
  {
    title: "7. Enforcement",
    content: `We may investigate suspected violations and take any action we deem appropriate, including warning users, suspending or terminating access, removing offending content, and cooperating with law enforcement. We may act without prior notice where necessary to protect the Services, our users, or third parties. Nothing in this policy limits any other rights or remedies available to us.`,
  },
  {
    title: "8. Contact",
    content: `Questions about this Acceptable Use Policy can be directed to:

NeuroDyne Corp
Email: legal@neurodynecorp.com
Abuse reports: abuse@neurodynecorp.com`,
  },
];

export default function LegalAcceptableUse() {
  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <SEO
        title="Acceptable Use Policy"
        description="The rules governing use of NeuroDyne Corp products and services, including prohibited activities and enforcement."
        canonical="https://neurodynecorp.com/legal/acceptable-use"
        ogUrl="https://neurodynecorp.com/legal/acceptable-use"
      />

      <Container maxWidth="md">
        <Typography sx={overline}>Legal</Typography>
        <Typography variant="h3" sx={{ mt: 2, mb: 1, fontWeight: 700 }}>
          Acceptable Use Policy
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
          This Acceptable Use Policy sets out the responsibilities and
          prohibited conduct that apply to everyone who uses NeuroDyne Corp
          products and services. It exists to keep our platforms secure, lawful,
          and reliable for all users.
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
      </Container>
    </Box>
  );
}
