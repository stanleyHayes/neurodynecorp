import { Box, Button, Container, Link, Paper, Stack, Typography } from "@mui/material";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import SEO from "@/components/seo/SEO";

const PORTAL_SECURITY_URL = "https://client.neurodyne.dev/security";

export default function AccountDeletion() {
  return (
    <>
      <SEO
        title="Delete your NeuroDyne account"
        description="Request deletion of your NeuroDyne account and associated personal data."
        canonical="https://neurodyne.dev/account-deletion"
        ogUrl="https://neurodyne.dev/account-deletion"
      />
      <Container maxWidth="md" sx={{ py: { xs: 8, md: 14 } }}>
        <Stack spacing={4}>
          <Box>
            <Typography variant="overline" color="secondary.main">Privacy choices</Typography>
            <Typography variant="h2" component="h1" sx={{ mt: 1 }}>Delete your account</Typography>
            <Typography color="text.secondary" sx={{ mt: 2, maxWidth: 680, lineHeight: 1.8 }}>
              You can request permanent deletion from the NeuroDyne mobile app or client portal. The request covers your account and associated personal data, except records we must retain for legal, security, tax, or contractual reasons.
            </Typography>
          </Box>

          <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={2.5}>
              <Typography variant="h5">Request deletion online</Typography>
              <Typography color="text.secondary">
                Sign in, open <strong>Security &amp; Privacy</strong>, and choose <strong>Request account erasure</strong>. We use sign-in to protect accounts from unauthorised deletion requests.
              </Typography>
              <Button href={PORTAL_SECURITY_URL} variant="contained" startIcon={<LoginOutlinedIcon />} sx={{ alignSelf: "flex-start" }}>
                Sign in to request deletion
              </Button>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={2}>
              <Typography variant="h5">Cannot access your account?</Typography>
              <Typography color="text.secondary">
                Email us from the address associated with your account. We will verify ownership before processing the request.
              </Typography>
              <Button href="mailto:privacy@neurodynecorp.com?subject=NeuroDyne%20account%20deletion%20request" variant="outlined" startIcon={<MailOutlineIcon />} sx={{ alignSelf: "flex-start" }}>
                Email the privacy team
              </Button>
            </Stack>
          </Paper>

          <Box>
            <Typography variant="h5">What happens next</Typography>
            <Typography component="ol" color="text.secondary" sx={{ pl: 3, lineHeight: 1.9 }}>
              <li>We acknowledge and verify your request.</li>
              <li>We remove or anonymise account data that we are not legally required to retain.</li>
              <li>We normally complete verified requests within 30 days and confirm completion by email.</li>
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              Read our <Link href="/privacy">Privacy Policy</Link> for more information about retention and your rights.
            </Typography>
          </Box>
        </Stack>
      </Container>
    </>
  );
}
