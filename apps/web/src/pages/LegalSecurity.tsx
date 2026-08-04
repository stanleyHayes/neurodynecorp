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
    title: "1. Our Approach to Security",
    content: `Security is foundational to how NeuroDyne Corp designs, builds, and operates software for government, enterprise, and the public. We apply defence-in-depth principles, secure-by-default configurations, and the principle of least privilege across our systems. Our practices are informed by recognised frameworks, including the OWASP guidance and ISO 27001 control objectives, and are reviewed regularly.`,
  },
  {
    title: "2. Data Protection",
    content: `We encrypt data in transit using modern TLS and encrypt data at rest using industry-standard algorithms. Access to production data is restricted, logged, and granted on a need-to-know basis. We support configurable data residency for clients with regional requirements, and we maintain a current list of sub-processors on our Sub-processors page.`,
  },
  {
    title: "3. Application Security",
    content: `Security is integrated throughout our development lifecycle. We conduct code review, dependency scanning, and static analysis, and we follow secure coding standards. Authentication and authorisation are enforced server-side, secrets are managed through dedicated secret stores, and inputs are validated to defend against common web vulnerabilities.`,
  },
  {
    title: "4. Infrastructure & Operations",
    content: `Our infrastructure runs on reputable cloud providers with hardened configurations, network segmentation, and continuous monitoring. We maintain audit logging, automated backups, and tested recovery procedures. Changes to production follow controlled processes with appropriate review and approval.`,
  },
  {
    title: "5. Access Control",
    content: `Internal access to systems requires strong authentication, including multi-factor authentication, and is governed by role-based permissions. Access is provisioned through formal onboarding, reviewed periodically, and revoked promptly upon role change or departure.`,
  },
  {
    title: "6. Incident Response",
    content: `We maintain an incident response process to detect, contain, investigate, and remediate security events. In the event of a personal data breach, we notify affected clients and relevant authorities in line with applicable law, including the Data Protection Act, 2012 (Act 843) of Ghana and other regulations that apply to our operations.`,
  },
  {
    title: "7. Responsible Disclosure",
    content: `We welcome reports from security researchers and the public. If you believe you have found a vulnerability, please contact us so we can investigate and respond. We ask that you act in good faith, avoid privacy violations and service disruption, and give us reasonable time to remediate before any public disclosure. Our security contact details are published in our security.txt file.`,
  },
];

export default function LegalSecurity() {
  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <SEO
        title="Security Practices"
        description="An overview of NeuroDyne Corp's security practices, including data protection, application security, and responsible disclosure."
        canonical="https://neurodyne.dev/legal/security"
        ogUrl="https://neurodyne.dev/legal/security"
      />

      <Container maxWidth="md">
        <Typography sx={overline}>Legal</Typography>
        <Typography variant="h3" sx={{ mt: 2, mb: 1, fontWeight: 700 }}>
          Security Practices
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
          This page summarises the technical and organisational measures
          NeuroDyne Corp uses to protect the confidentiality, integrity, and
          availability of the systems and data entrusted to us.
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

        <Box>
          <Typography variant="h5" sx={{ mb: 2, color: "primary.light" }}>
            Report a Vulnerability
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ lineHeight: 1.8 }}
          >
            Our security contact information and disclosure policy are published
            in a machine-readable format at{" "}
            <MuiLink
              href="/.well-known/security.txt"
              sx={{ color: "secondary.main", fontFamily: "monospace" }}
            >
              /.well-known/security.txt
            </MuiLink>
            . You can also reach our security team directly at{" "}
            <MuiLink
              href="mailto:security@neurodynecorp.com"
              sx={{ color: "secondary.main" }}
            >
              security@neurodynecorp.com
            </MuiLink>
            .
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
