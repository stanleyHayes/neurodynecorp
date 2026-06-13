import {
  Box,
  Container,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import SEO from "@/components/seo/SEO";

const overline = {
  fontFamily: "monospace",
  fontSize: "0.7rem",
  textTransform: "uppercase",
  letterSpacing: "0.25em",
  color: "text.secondary",
  opacity: 0.6,
} as const;

const subprocessors = [
  {
    name: "Cloudinary",
    purpose: "File and media storage, processing, and delivery",
    location: "United States / Global CDN",
  },
  {
    name: "Resend",
    purpose: "Transactional and notification email delivery",
    location: "United States",
  },
  {
    name: "MongoDB Atlas",
    purpose: "Managed application database",
    location: "Configurable region (cloud-hosted)",
  },
  {
    name: "Stripe",
    purpose: "International payment processing",
    location: "United States / Global",
  },
  {
    name: "Paystack",
    purpose: "Payment processing for Ghana and Africa",
    location: "Ghana / Nigeria",
  },
  {
    name: "Render",
    purpose: "Application and infrastructure hosting",
    location: "United States / Selected regions",
  },
];

export default function LegalSubprocessors() {
  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <SEO
        title="Sub-processors"
        description="The third-party sub-processors NeuroDyne Corp engages to deliver its services, including their purpose and location."
        canonical="https://neurodynecorp.com/legal/subprocessors"
        ogUrl="https://neurodynecorp.com/legal/subprocessors"
      />

      <Container maxWidth="md">
        <Typography sx={overline}>Legal</Typography>
        <Typography variant="h3" sx={{ mt: 2, mb: 1, fontWeight: 700 }}>
          Sub-processors
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
          NeuroDyne Corp engages a small number of trusted third-party
          providers ("sub-processors") to help deliver, secure, and operate our
          services. Each sub-processor is bound by contractual obligations
          requiring appropriate technical and organisational safeguards and is
          permitted to process personal data only as instructed by us. The table
          below lists our current sub-processors.
        </Typography>

        <Box sx={{ overflowX: "auto" }}>
          <Table
            sx={{
              "& th, & td": { borderColor: "rgba(255,255,255,0.08)" },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "primary.light" }}>
                  Name
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "primary.light" }}>
                  Purpose
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "primary.light" }}>
                  Location
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subprocessors.map((row) => (
                <TableRow key={row.name}>
                  <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>
                    {row.purpose}
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>
                    {row.location}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        <Divider sx={{ my: 5 }} />

        <Typography variant="h5" sx={{ mb: 2, color: "primary.light" }}>
          Updates & Notifications
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, lineHeight: 1.8 }}
        >
          We may update this list from time to time as our services evolve. Where
          required by contract, we will provide clients with advance notice of any
          new sub-processor so that any reasonable objection can be raised before
          the change takes effect. Data residency can be configured for clients
          with specific regional requirements.
        </Typography>

        <Typography variant="h5" sx={{ mb: 2, color: "primary.light" }}>
          Contact
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}
        >
          {`To request notification of changes to this list, or for questions about our sub-processors, contact:

NeuroDyne Corp
Email: privacy@neurodynecorp.com`}
        </Typography>
      </Container>
    </Box>
  );
}
