import { Box, Container, Stack, Typography, Chip, Button, Divider } from "@mui/material";
import { useParams, Link } from "react-router";
import MiscellaneousServicesOutlinedIcon from "@mui/icons-material/MiscellaneousServicesOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import { SectionHeading, InfoCard, CardGrid, CTABand, Overline } from "@/components/shared/Marketing";
import { getServiceLine } from "@/data/serviceLines";

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const svc = slug ? getServiceLine(slug) : undefined;

  if (!svc) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 10, md: 16 }, textAlign: "center" }}>
        <SEO title="Service not found" />
        <Overline>404 // SERVICES</Overline>
        <Typography variant="h4" sx={{ fontWeight: 800, mt: 2, mb: 2 }}>
          That service line isn't here
        </Typography>
        <Button component={Link} to="/services" startIcon={<ArrowBackIcon />} variant="outlined">
          Back to Services
        </Button>
      </Container>
    );
  }

  return (
    <Box>
      <SEO
        title={svc.name}
        description={svc.positioning}
        canonical={`https://neurodynecorp.com/services/${svc.slug}`}
        ogUrl={`https://neurodynecorp.com/services/${svc.slug}`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: svc.name,
          description: svc.positioning,
          provider: { "@type": "Organization", name: "NeuroDyne Corp" },
        }}
      />

      <PageHero
        icon={<MiscellaneousServicesOutlinedIcon />}
        title={svc.name}
        description={svc.positioning}
        tag={`SERVICE // ${svc.kicker}`}
        iconColor={svc.color}
        iconLabel="SERVICE LINE"
      />

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Stack spacing={{ xs: 6, md: 8 }}>
          <Button component={Link} to="/services" startIcon={<ArrowBackIcon />} sx={{ alignSelf: "flex-start", color: "text.secondary" }}>
            All services
          </Button>

          {/* Methodology */}
          <Box>
            <SectionHeading tag="§ 01 — METHODOLOGY" title="How we run it" color={svc.color} />
            <CardGrid columns={4}>
              {svc.methodology.map((m, i) => (
                <InfoCard key={m.title} accent={svc.color} delay={i * 0.05} title={m.title}>
                  <Typography variant="body2" color="text.secondary">
                    {m.body}
                  </Typography>
                </InfoCard>
              ))}
            </CardGrid>
          </Box>

          {/* Deliverables + commercials */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.3fr 0.7fr" }, gap: { xs: 3, md: 4 } }}>
            <InfoCard accent={svc.color} title="What you get">
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {svc.deliverables.map((d) => (
                  <Stack sx={{ alignItems: "flex-start" }} key={d} direction="row" spacing={1.5}>
                    <CheckCircleOutlineIcon sx={{ color: svc.color, fontSize: 18, mt: "3px" }} />
                    <Typography variant="body2" color="text.secondary">
                      {d}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </InfoCard>

            <InfoCard accent="#6C63FF" title="Commercials">
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Stack sx={{ alignItems: "flex-start" }} direction="row" spacing={1.5}>
                  <ScheduleOutlinedIcon sx={{ color: "#6C63FF", fontSize: 20, mt: "2px" }} />
                  <Box>
                    <Overline>Indicative timeline</Overline>
                    <Typography variant="body2" sx={{ mt: 0.25 }}>{svc.timeline}</Typography>
                  </Box>
                </Stack>
                <Stack sx={{ alignItems: "flex-start" }} direction="row" spacing={1.5}>
                  <PaymentsOutlinedIcon sx={{ color: "#00D4AA", fontSize: 20, mt: "2px" }} />
                  <Box>
                    <Overline color="#00D4AA">Indicative price band</Overline>
                    <Typography variant="body2" sx={{ mt: 0.25 }}>{svc.priceBand}</Typography>
                  </Box>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
                  Indicative only — not a quote. Final scope is set after a qualified conversation.
                </Typography>
              </Stack>
            </InfoCard>
          </Box>

          {/* Sample work */}
          <Box>
            <SectionHeading tag="§ 02 — PRECEDENT" title="Sample work" color="#8B85FF" />
            <Stack sx={{ flexWrap: "wrap" }} direction="row" spacing={1} useFlexGap>
              {svc.sampleWork.map((w) => (
                <Chip key={w} label={w} variant="outlined" component="a" href="/portfolio" clickable sx={{ borderColor: "#8B85FF55" }} />
              ))}
            </Stack>
          </Box>

          {/* FAQ */}
          <Box>
            <SectionHeading tag="§ 03 — FAQ" title="Common questions" color="#F59E0B" />
            <Stack spacing={2}>
              {svc.faq.map((f) => (
                <InfoCard key={f.q} accent="#F59E0B">
                  <Typography sx={{ fontWeight: 700, mb: 0.75 }}>{f.q}</Typography>
                  <Typography variant="body2" color="text.secondary">{f.a}</Typography>
                </InfoCard>
              ))}
            </Stack>
          </Box>

          <Divider />

          <CTABand
            to="/start-project"
            tag="ENGAGE"
            title="Start an engagement on this service line"
            description="Tell us your brief through the intake. We'll route it and propose a tailored scope."
            color={svc.color}
          />
        </Stack>
      </Container>
    </Box>
  );
}
