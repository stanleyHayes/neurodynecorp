import { Box, Container, Stack, Typography } from "@mui/material";
import { Link } from "react-router";
import DomainOutlinedIcon from "@mui/icons-material/DomainOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import { CardGrid, CTABand, Overline } from "@/components/shared/Marketing";
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

      <PageHero
        icon={<DomainOutlinedIcon />}
        title="Industries"
        description="The firm's capability lattice maps differently to every sector. Pick yours to see how we approach its specific problems, and the precedent behind it."
        tag="SECTORS // COVERAGE"
        accentWord="Industries"
        iconColor="#00D4AA"
        iconLabel="SECTOR MAP"
      />

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Stack spacing={{ xs: 6, md: 9 }}>
          <CardGrid columns={4}>
            {INDUSTRIES.map((ind) => (
              <Box
                key={ind.slug}
                component={Link}
                to={`/industries/${ind.slug}`}
                sx={{
                  display: "block",
                  height: "100%",
                  p: { xs: 3, md: 3.5 },
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: `${ind.color}0A`,
                  textDecoration: "none",
                  color: "inherit",
                  transition: "border-color 0.3s, background 0.3s, transform 0.3s",
                  "&:hover": { borderColor: `${ind.color}66`, bgcolor: `${ind.color}14`, transform: "translateY(-3px)" },
                }}
              >
                <Overline color={ind.color}>{ind.kicker}</Overline>
                <Typography variant="h6" sx={{ fontWeight: 800, mt: 1, mb: 1 }}>
                  {ind.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {ind.summary}
                </Typography>
                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: ind.color }}>
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.1em" }}>
                    VIEW SECTOR
                  </Typography>
                  <ArrowForwardIcon sx={{ fontSize: 15 }} />
                </Stack>
              </Box>
            ))}
          </CardGrid>

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
