import { Box, Container, Stack } from "@mui/material";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import ScopeEstimator from "@/components/shared/ScopeEstimator";
import { CTABand } from "@/components/shared/Marketing";

export default function Estimator() {
  return (
    <Box>
      <SEO
        title="Scope Estimator"
        description="Configure an indicative scope with NeuroDyne Corp — pick a service line, toggle what's in scope, and see indicative components, a weeks-band, a price-band, and a sample architecture."
        canonical="https://neurodynecorp.com/estimator"
        ogUrl="https://neurodynecorp.com/estimator"
      />

      <PageHero
        icon={<CalculateOutlinedIcon />}
        title="Project Scope Estimator"
        description="Pick a service line, toggle what's in scope, and get an indicative component set, timeline, and price band. Not a quote — a signal that we understand the brief."
        tag="INTAKE // CONFIGURATOR"
        accentWord="Scope"
        iconColor="#00D4AA"
        iconLabel="CONFIGURE"
      />

      <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
        <Stack spacing={{ xs: 4, md: 5 }}>
          <ScopeEstimator />
          <CTABand
            to="/diagnostic"
            tag="GO DEEPER"
            title="Not sure where you fit?"
            description="Run the two-minute Engagement Readiness Diagnostic and we'll route your brief to the right path."
            color="#6C63FF"
          />
        </Stack>
      </Container>
    </Box>
  );
}
