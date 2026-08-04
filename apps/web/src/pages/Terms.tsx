import { Box, Container, Typography } from "@mui/material";
import { motion } from "framer-motion";
import GavelIcon from "@mui/icons-material/Gavel";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";

const MotionBox = motion.create(Box);

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using the NeuroDyne Corp website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using our services. These terms apply to all visitors, users, and clients of NeuroDyne Corp.`,
  },
  {
    title: "2. Services",
    content: `NeuroDyne Corp provides productized software engineering services including custom software development, mobile development, AI/ML systems, blockchain solutions, and related consulting. The specific scope, timeline, and deliverables for each project will be defined in a separate Statement of Work (SOW) or project agreement.`,
  },
  {
    title: "3. Intellectual Property",
    content: `Unless otherwise specified in a project agreement:

• All pre-existing intellectual property remains with its respective owner
• Custom work product created for a client is assigned to the client upon full payment
• NeuroDyne Corp retains the right to use general knowledge, skills, and experience gained during projects
• Our proprietary tools, frameworks, and methodologies remain our property
• You may not reproduce, distribute, or create derivative works from our website content without permission`,
  },
  {
    title: "4. Client Responsibilities",
    content: `As a client, you agree to:

• Provide accurate and complete information necessary for project execution
• Respond to requests for feedback and approvals in a timely manner
• Ensure you have the right to provide any content or materials shared with us
• Not use our services for any unlawful purpose
• Maintain confidentiality of any credentials or access provided to you`,
  },
  {
    title: "5. Payment Terms",
    content: `Payment terms are specified in individual project agreements. Generally:

• Invoices are due within 30 days of issuance unless otherwise agreed
• Late payments may incur interest at 1.5% per month
• We reserve the right to suspend services for overdue accounts
• All fees are non-refundable unless otherwise stated in the project agreement
• Prices are exclusive of applicable taxes`,
  },
  {
    title: "6. Warranties & Disclaimers",
    content: `We warrant that our services will be performed in a professional and workmanlike manner consistent with industry standards. Except as expressly stated, our services are provided "as is" without warranties of any kind, whether express or implied, including implied warranties of merchantability, fitness for a particular purpose, or non-infringement.`,
  },
  {
    title: "7. Limitation of Liability",
    content: `To the maximum extent permitted by law, NeuroDyne Corp shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities, regardless of the cause of action. Our total liability shall not exceed the fees paid by you in the twelve months preceding the claim.`,
  },
  {
    title: "8. Confidentiality",
    content: `Both parties agree to keep confidential any proprietary or sensitive information disclosed during the course of our engagement. This includes business strategies, technical specifications, source code, and any information marked as confidential. This obligation survives termination of services for a period of two years.`,
  },
  {
    title: "9. Termination",
    content: `Either party may terminate services as specified in the project agreement. Upon termination:

• All outstanding payments become immediately due
• Each party shall return or destroy confidential materials
• Provisions that by their nature should survive termination will remain in effect
• We will deliver any completed work product for which payment has been received`,
  },
  {
    title: "10. Governing Law",
    content: `These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which NeuroDyne Corp operates, without regard to conflict of law principles. Any disputes shall be resolved through binding arbitration in accordance with applicable arbitration rules.`,
  },
  {
    title: "11. Changes to Terms",
    content: `We reserve the right to modify these Terms at any time. Changes take effect immediately upon posting to the website. Continued use of our services after changes constitutes acceptance of the modified terms. We will make reasonable efforts to notify clients of significant changes.`,
  },
  {
    title: "12. Contact",
    content: `For questions about these Terms of Service, please contact us at:

NeuroDyne Corp
Email: legal@neurodynecorp.com`,
  },
];

export default function Terms() {
  return (
    <>
      <SEO
        title="Terms of Service"
        description="NeuroDyne Corp Terms of Service — the terms and conditions governing your use of our platform and services."
        canonical="https://neurodyne.dev/terms"
        ogUrl="https://neurodyne.dev/terms"
      />

      <PageHero
        icon={<GavelIcon />}
        title="Terms of Service"
        description="Please read these terms carefully before using our services. They outline the rules and regulations for using NeuroDyne Corp."
        tag="LEGAL // FRAMEWORK"
        accentWord="Terms"
        iconColor="#8B85FF"
        iconLabel="DIRECTIVE LOADED"
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
