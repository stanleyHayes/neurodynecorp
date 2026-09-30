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

/**
 * This page covers BOTH surfaces: the public website and the client platform.
 *
 * It used to be silent about its own scope, which left the reader unable to
 * tell whether an omission meant "we do not use this" or "that is out of
 * scope". Saying which is the point — and saying "both" is what obliged us to
 * list Vercel, which serves neurodyne.dev and therefore processes the request
 * logs and IP addresses of everyone who reads this page.
 *
 * `usedFor` keeps that honest per row, so "both" is something the table shows
 * rather than something the prose claims.
 *
 * Redis and Kafka are deliberately absent: they are self-hosted alongside the
 * application rather than managed by a third party, so they are covered by the
 * hosting entry.
 */
const subprocessors = [
  {
    name: "Vercel",
    purpose: "Hosting and delivery of the public website, including request logs",
    location: "United States / Global edge network",
    usedFor: "Website",
  },
  {
    name: "Render",
    purpose: "Application and infrastructure hosting for the client platform",
    location: "United States / Selected regions",
    usedFor: "Client platform",
  },
  {
    name: "MongoDB Atlas",
    purpose: "Managed application database",
    location: "Configurable region (cloud-hosted)",
    usedFor: "Client platform",
  },
  {
    name: "Cloudinary",
    purpose: "File and media storage, processing, and delivery",
    location: "United States / Global CDN",
    usedFor: "Client platform",
  },
  {
    name: "Resend",
    purpose: "Transactional and notification email delivery",
    location: "United States",
    usedFor: "Both",
  },
  {
    name: "Stripe",
    purpose: "International payment processing",
    location: "United States / Global",
    usedFor: "Client platform",
  },
  {
    name: "Paystack",
    purpose: "Payment processing for Ghana and Africa",
    location: "Ghana / Nigeria",
    usedFor: "Client platform",
  },
];

export default function LegalSubprocessors() {
  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <SEO
        title="Sub-processors"
        description="The third-party sub-processors NeuroDyne Corp engages across the public website and the client platform, including what each is used for, its purpose, and its location."
        canonical="https://neurodyne.dev/legal/subprocessors"
        ogUrl="https://neurodyne.dev/legal/subprocessors"
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

        <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
          NeuroDyne Corp engages a small number of third-party providers
          ("sub-processors") to help deliver, secure, and operate its services.
          Each is permitted to process personal data only as instructed by us.
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 5, lineHeight: 1.8 }}>
          <Box component="strong" sx={{ color: "text.primary" }}>
            This page covers both surfaces
          </Box>{" "}
          — the public website at neurodyne.dev and the client platform — so a
          provider that touches only one of them is still listed here, and the
          table says which. Infrastructure we run ourselves alongside the
          application, rather than buying as a managed service, is covered by the
          relevant hosting entry and is not listed separately.
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
                  Used for
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
                  <TableCell sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                    {row.usedFor}
                  </TableCell>
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
Email: info@neurodyne.dev`}
        </Typography>
      </Container>
    </Box>
  );
}
