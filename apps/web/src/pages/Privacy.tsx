import { Box, Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import ShieldIcon from "@mui/icons-material/Shield";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";

const MotionBox = motion.create(Box);

const sections = [
  {
    title: "1. Information We Collect",
    content: `We collect information you provide directly when you use our services, including:

• Contact information (name, email address, phone number)
• Project details and requirements you share with us
• Account credentials if you create an account
• Payment and billing information
• Communications you send to us

We also automatically collect certain technical information when you visit our website, including IP address, browser type, device information, and usage data through cookies and similar technologies.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use the information we collect to:

• Provide, maintain, and improve our services
• Process transactions and send related information
• Respond to your requests, comments, and questions
• Send technical notices, updates, and administrative messages
• Monitor and analyze trends, usage, and activities
• Detect, investigate, and prevent fraudulent or unauthorized activity
• Personalize and improve your experience`,
  },
  {
    title: "3. Information Sharing",
    content: `We do not sell your personal information. We may share information with:

• Service providers who assist in our operations
• Professional advisors (lawyers, accountants, auditors)
• Regulatory authorities when required by law
• Business partners with your consent

All third-party service providers are contractually obligated to protect your data and use it only for the purposes we specify.`,
  },
  {
    title: "4. Data Security",
    content: `We implement industry-standard security measures to protect your information, including encryption in transit and at rest, access controls, regular security assessments, and incident response procedures. While no method of transmission over the Internet is 100% secure, we strive to use commercially acceptable means to protect your personal data.`,
  },
  {
    title: "5. Data Retention",
    content: `We retain your personal information for as long as necessary to fulfill the purposes for which it was collected, including to satisfy legal, accounting, or reporting requirements. When data is no longer needed, we securely delete or anonymize it.`,
  },
  {
    title: "6. Your Rights",
    content: `Depending on your jurisdiction, you may have the right to:

• Access the personal data we hold about you
• Correct inaccurate or incomplete data
• Request deletion of your data
• Object to or restrict processing of your data
• Data portability
• Withdraw consent at any time

To exercise these rights, please contact us at privacy@neurodynecorp.com.`,
  },
  {
    title: "7. Cookies & Tracking",
    content: `We use cookies and similar tracking technologies to collect information about your browsing activity. You can control cookie preferences through your browser settings. Essential cookies are required for the site to function and cannot be disabled. Analytics cookies help us understand how visitors interact with our website.`,
  },
  {
    title: "8. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically.`,
  },
  {
    title: "9. Contact Us",
    content: `If you have questions or concerns about this Privacy Policy, please contact us at:

NeuroDyne Corp
Email: privacy@neurodynecorp.com`,
  },
];

export default function Privacy() {
  return (
    <>
      <SEO
        title="Privacy Policy"
        description="NeuroDyne Corp Privacy Policy — how we collect, use, and protect your personal information."
        canonical="https://neurodynecorp.com/privacy"
        ogUrl="https://neurodynecorp.com/privacy"
      />

      <PageHero
        icon={<ShieldIcon />}
        title="Privacy Policy"
        description="Your privacy matters. This policy describes how NeuroDyne Corp collects, uses, and protects your personal information."
        tag="SECURITY // PROTOCOL"
        accentWord="Privacy"
        iconColor="#6C63FF"
        iconLabel="ENCRYPTED CHANNEL"
      />

      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 6 }}>
          Last Updated: March 29, 2026
        </Typography>

        {sections.map((section, i) => (
          <MotionBox
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            sx={{ mb: 5 }}
          >
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
          </MotionBox>
        ))}
      </Container>
    </>
  );
}
