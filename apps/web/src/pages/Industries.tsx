import { Box, Container, Stack, Typography } from "@mui/material";
import DomainOutlinedIcon from "@mui/icons-material/DomainOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import Honeycomb from "@/components/shared/Honeycomb";
import { CTABand, Overline } from "@/components/shared/Marketing";
import { INDUSTRIES } from "@/data/industries";

export default function Industries() {
  return (
    <Box>
      <SEO
        title="Industries"
        description="The sectors NeuroDyne Corp operates in — Government, Health, Financial Services, Insurance, Retail/Commerce, Energy, Education, and NGO/Development — and how our capability lattice maps to each."
        canonical="https://neurodynecorp.com/industries"
        ogUrl="https://neurodynecorp.com/industries"
      />

      <Container maxWidth="lg" sx={{ pt: 0 }}>
        <PageHero
          icon={<DomainOutlinedIcon />}
          title="Industries"
          description="The firm's capability lattice maps differently to every sector. Pick yours to see how we approach its specific problems, and the precedent behind it."
          tag="SECTORS // COVERAGE"
          accentWord="Industries"
          iconColor="#00D4AA"
          iconLabel="SECTOR MAP"
        />
      </Container>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Stack spacing={{ xs: 6, md: 9 }}>
          <Honeycomb
            cell={216}
            perRow={5}
            items={INDUSTRIES.map((ind, i) => ({
              key: ind.slug,
              accent: ind.color,
              to: `/industries/${ind.slug}`,
              content: (
                <>
                  <Overline color={ind.color}>
                    {String(i + 1).padStart(2, "0")} / {ind.kicker}
                  </Overline>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      lineHeight: 1.15,
                      mt: 0.75,
                      mb: 0.75,
                    }}
                  >
                    {ind.name}
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", color: ind.color }}>
                    <Typography sx={{ fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.1em" }}>
                      EXPLORE
                    </Typography>
                    <ArrowForwardIcon sx={{ fontSize: 12 }} />
                  </Stack>
                </>
              ),
            }))}
          />

          <CTABand
            to="/start-project"
            tag="ENGAGE"
            title="Don't see your sector?"
            description="Our capability lattice transfers across domains. Tell us your brief and we'll show you the precedent that's closest."
            color="#6C63FF"
          />
        </Stack>
      </Container>
    </Box>
  );
}
