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
    title: "1. Our Commitment",
    content: `NeuroDyne Corp is committed to ensuring that our websites, products, and digital services are accessible to the widest possible audience, regardless of ability or technology. Accessibility is a core part of how we design and build software for government, enterprise, and the public across Ghana and West Africa.

We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA, the internationally recognised standard for digital accessibility.`,
  },
  {
    title: "2. Conformance Standard",
    content: `We target WCAG 2.1 Level AA conformance across our public-facing properties and client deliverables. This standard is organised around four principles — content must be Perceivable, Operable, Understandable, and Robust — and we apply these principles throughout our design and engineering process.

Where a Service has not yet reached full conformance, we document known gaps and prioritise remediation.`,
  },
  {
    title: "3. Measures We Take",
    content: `To support accessibility, we:

• Use semantic, standards-compliant markup and ARIA where appropriate
• Provide text alternatives for non-text content
• Maintain sufficient colour contrast and do not rely on colour alone to convey meaning
• Ensure functionality is available via keyboard and assistive technologies
• Design clear, consistent navigation and predictable interactions
• Support resizing of text and responsive layouts across devices
• Include accessibility checks in our design reviews and quality assurance`,
  },
  {
    title: "4. Assistive Technologies",
    content: `Our services are designed to be compatible with current versions of widely used assistive technologies, including screen readers, screen magnifiers, speech-recognition software, and keyboard-only navigation, on modern browsers and operating systems. We test against representative combinations and continue to expand our coverage.`,
  },
  {
    title: "5. Known Limitations",
    content: `Despite our best efforts, some content or features may not yet be fully accessible. This can occur with third-party components, legacy content, or newly released functionality. Where we identify such limitations, we record them and work to resolve them as part of our ongoing accessibility programme. We welcome reports that help us find and fix issues faster.`,
  },
  {
    title: "6. Feedback & Assistance",
    content: `We value feedback on the accessibility of our services. If you encounter a barrier, need information in an alternative format, or require assistance, please contact us. We aim to acknowledge accessibility feedback promptly and to provide a meaningful response within a reasonable time.

NeuroDyne Corp
Email: accessibility@neurodynecorp.com`,
  },
  {
    title: "7. Ongoing Review",
    content: `Accessibility is an ongoing commitment rather than a one-time exercise. We review this statement and our conformance periodically, and as we release new features, to ensure our services remain inclusive. The "Last updated" date below reflects the most recent review.`,
  },
];

export default function LegalAccessibility() {
  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <SEO
        title="Accessibility Statement"
        description="NeuroDyne Corp's commitment to WCAG 2.1 AA accessibility across our products and services, and how to report barriers."
        canonical="https://neurodyne.dev/legal/accessibility"
        ogUrl="https://neurodyne.dev/legal/accessibility"
      />

      <Container maxWidth="md">
        <Typography sx={overline}>Legal</Typography>
        <Typography variant="h3" sx={{ mt: 2, mb: 1, fontWeight: 700 }}>
          Accessibility Statement
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
          This statement describes how NeuroDyne Corp works to make its digital
          services accessible to everyone, our conformance with WCAG 2.1 Level
          AA, and how you can reach us if you experience any barriers.
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
