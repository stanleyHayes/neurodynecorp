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
    title: "1. What Are Cookies",
    content: `Cookies are small text files placed on your device when you visit a website. They allow the site to recognise your device, remember your preferences, and understand how the service is used. Similar technologies — including local storage, pixels, and software development kits — serve comparable purposes, and references to "cookies" in this policy include those technologies.

NeuroDyne Corp uses cookies sparingly and with a clear preference for first-party, privacy-respecting methods. We do not sell the information collected through cookies.`,
  },
  {
    title: "2. Categories of Cookies We Use",
    content: `Strictly Necessary — Required for the website to function, including session management, security, load balancing, and remembering your cookie choices. These cannot be switched off through our preference controls.

Functional — Remember choices you make, such as language or region, to provide a more tailored experience.

Performance & Analytics — Help us understand which pages are visited and how the service performs, so we can improve it. Where these are not strictly necessary, they are set only with your consent.

We currently do not use advertising or cross-site tracking cookies. Should that ever change, we will update this policy and request your consent before any such cookies are set.`,
  },
  {
    title: "3. Consent",
    content: `Where required by the Data Protection Act, 2012 (Act 843) of Ghana, the EU General Data Protection Regulation, and comparable laws in the jurisdictions where we operate, we obtain your consent before placing non-essential cookies. Strictly necessary cookies are exempt from consent requirements.

You may withdraw or change your consent at any time using the controls described below. Withdrawing consent does not affect the lawfulness of processing carried out before withdrawal.`,
  },
  {
    title: "4. Managing Your Preferences",
    content: `You can manage non-essential cookies through the cookie banner presented on your first visit and through any preference controls we provide. You can also control cookies through your browser settings, including deleting existing cookies and blocking new ones.

Please note that disabling strictly necessary cookies may cause parts of the website to function incorrectly. Most browsers offer guidance on cookie management in their help or privacy sections.`,
  },
  {
    title: "5. Third-Party Cookies",
    content: `Some features may rely on third parties — such as our hosting and analytics providers — that set their own cookies. These providers are bound by contractual obligations and process data only as instructed. A list of our sub-processors is maintained on our Sub-processors page.`,
  },
  {
    title: "6. Changes to This Policy",
    content: `We may update this Cookie Policy to reflect changes in technology, law, or our practices. The "Last updated" date below indicates when the policy was last revised. Material changes will be communicated through the website.`,
  },
  {
    title: "7. Contact",
    content: `Questions about our use of cookies can be directed to:

NeuroDyne Corp
Email: privacy@neurodynecorp.com`,
  },
];

export default function LegalCookies() {
  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <SEO
        title="Cookie Policy"
        description="How NeuroDyne Corp uses cookies and similar technologies, the categories we set, and how to manage your preferences."
        canonical="https://neurodynecorp.com/legal/cookies"
        ogUrl="https://neurodynecorp.com/legal/cookies"
      />

      <Container maxWidth="md">
        <Typography sx={overline}>Legal</Typography>
        <Typography variant="h3" sx={{ mt: 2, mb: 1, fontWeight: 700 }}>
          Cookie Policy
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
          This Cookie Policy explains how NeuroDyne Corp uses cookies and similar
          technologies on our websites and applications. It should be read
          alongside our Privacy Policy.
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
