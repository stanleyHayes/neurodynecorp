import { Box, Container, Stack, Typography, Chip, Button } from "@mui/material";
import { useParams, Link } from "react-router";
import DomainOutlinedIcon from "@mui/icons-material/DomainOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import { InfoCard, CTABand, Overline } from "@/components/shared/Marketing";
import { getIndustry } from "@/data/industries";

export default function IndustryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const industry = slug ? getIndustry(slug) : undefined;

  if (!industry) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 10, md: 16 }, textAlign: "center" }}>
        <SEO title="Sector not found" />
        <Overline>404 // INDUSTRIES</Overline>
        <Typography variant="h4" sx={{ fontWeight: 800, mt: 2, mb: 2 }}>
          That sector isn't listed
        </Typography>
        <Button component={Link} to="/industries" startIcon={<ArrowBackIcon />} variant="outlined">
          Back to Industries
        </Button>
      </Container>
    );
  }

  return (
    <Box>
      <SEO
        title={`${industry.name} — Industries`}
        description={industry.summary}
        canonical={`https://neurodynecorp.com/industries/${industry.slug}`}
        ogUrl={`https://neurodynecorp.com/industries/${industry.slug}`}
      />

      <PageHero
        icon={<DomainOutlinedIcon />}
        title={industry.name}
        description={industry.summary}
        tag={`SECTOR // ${industry.kicker}`}
        accentWord={industry.name}
        iconColor={industry.color}
        iconLabel="SECTOR BRIEF"
      />

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Stack spacing={{ xs: 5, md: 7 }}>
          <Button component={Link} to="/industries" startIcon={<ArrowBackIcon />} sx={{ alignSelf: "flex-start", color: "text.secondary" }}>
            All industries
          </Button>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: { xs: 3, md: 4 } }}>
            <InfoCard accent="#F59E0B" icon={<ReportProblemOutlinedIcon />} title="Sector challenges">
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {industry.challenges.map((c) => (
                  <Stack sx={{ alignItems: "flex-start" }} key={c} direction="row" spacing={1.5}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#F59E0B", mt: "7px", flexShrink: 0 }} />
                    <Typography variant="body2" color="text.secondary">
                      {c}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </InfoCard>

            <InfoCard accent={industry.color} icon={<CheckCircleOutlineIcon />} title="How we approach it">
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {industry.approach.map((a) => (
                  <Stack sx={{ alignItems: "flex-start" }} key={a} direction="row" spacing={1.5}>
                    <CheckCircleOutlineIcon sx={{ color: industry.color, fontSize: 18, mt: "3px" }} />
                    <Typography variant="body2" color="text.secondary">
                      {a}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </InfoCard>
          </Box>

          <InfoCard accent="#8B85FF" icon={<WorkOutlineIcon />} title="Relevant work">
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", mt: 1 }}>
              {industry.work.map((w) => (
                <Chip key={w} label={w} variant="outlined" sx={{ borderColor: "#8B85FF55" }} />
              ))}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2, opacity: 0.7 }}>
              See the full record in <Link to="/portfolio" style={{ color: "#8B85FF" }}>Case Dossiers</Link>.
            </Typography>
          </InfoCard>

          <CTABand
            to="/start-project"
            tag="ENGAGE"
            title={`Start a ${industry.name.toLowerCase()} engagement`}
            description="Tell us your brief. We'll route it to the right team and show you the closest precedent."
            color={industry.color}
          />
        </Stack>
      </Container>
    </Box>
  );
}
