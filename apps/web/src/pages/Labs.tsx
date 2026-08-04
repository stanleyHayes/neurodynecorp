import { Box, Container, Stack, Typography, Chip } from "@mui/material";
import HudCorners from "@/components/shared/HudCorners";
import { Link } from "react-router";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import { SectionHeading, InfoCard, CardGrid, CTABand, Overline } from "@/components/shared/Marketing";
import { LABS_PRODUCTS } from "@/data/labs";

const LOOP = [
  { stage: "01", title: "Mandate", body: "A real problem at the altitude of national infrastructure, sourced from an engagement or a market gap.", Icon: AssignmentOutlinedIcon, color: "#6C63FF" },
  { stage: "02", title: "Build", body: "We build the platform as defensible IP — owned by Labs, not the client — with intelligence, scale, and sovereignty designed in.", Icon: BuildOutlinedIcon, color: "#00D4AA" },
  { stage: "03", title: "License", body: "The platform is licensed to operators and distribution partners across markets, retaining the core IP.", Icon: KeyOutlinedIcon, color: "#8B85FF" },
  { stage: "04", title: "Spin out", body: "Proven platforms spin out into dedicated subsidiaries with their own leadership and trajectory.", Icon: RocketLaunchOutlinedIcon, color: "#33DDBB" },
];

export default function Labs() {
  return (
    <Box>
      <SEO
        title="NeuroDyne Labs"
        description="NeuroDyne Labs is the IP arm of NeuroDyne Corp — we build and own defensible, national-scale platforms through a Mandate → Build → License → Spin-out operating loop. Home of ILIVVON."
        canonical="https://neurodyne.dev/labs"
        ogUrl="https://neurodyne.dev/labs"
      />

      <PageHero
        icon={<ScienceOutlinedIcon />}
        title="NeuroDyne Labs"
        description="The IP arm. We build and own defensible platforms that solve real problems at national scale — then license and spin them out."
        tag="LABS // INTELLECTUAL PROPERTY"
        accentWord="Labs"
        iconColor="#8B85FF"
        iconLabel="R&D ONLINE"
      />

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Stack spacing={{ xs: 6, md: 9 }}>
          {/* Operating loop */}
          <Box>
            <SectionHeading
              tag="§ 01 — OPERATING LOOP"
              title="How Labs compounds"
              lead="Every Labs platform moves through the same loop. Each stage earns the next; the IP stays with the firm."
              color="#8B85FF"
            />
            <CardGrid columns={4}>
              {LOOP.map((s, i) => (
                <InfoCard key={s.title} accent={s.color} delay={i * 0.06} icon={<s.Icon />} title={s.title}>
                  <Overline color={s.color}>{s.stage}</Overline>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {s.body}
                  </Typography>
                </InfoCard>
              ))}
            </CardGrid>
          </Box>

          {/* Products */}
          <Box>
            <SectionHeading
              tag="§ 02 — PLATFORMS"
              title="Platforms in development"
              lead="Each Labs product is treated as a first-class product, not a case study."
              color="#00D4AA"
            />
            <CardGrid columns={2}>
              {LABS_PRODUCTS.map((p) => (
                <Box
                  key={p.slug}
                  component={Link}
                  to={`/labs/${p.slug}`}
                  sx={{
                    display: "block",
                    p: { xs: 3, md: 4 },
                    borderRadius: 0,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: `${p.color}0A`,
                    textDecoration: "none",
                    color: "inherit",
                    transition: "border-color 0.3s, background 0.3s, transform 0.3s",
                    "&:hover": { borderColor: `${p.color}66`, bgcolor: `${p.color}14`, transform: "translateY(-3px)" },
                  }}
                >
                  <HudCorners />
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                    <Overline color={p.color}>{p.kicker}</Overline>
                    <Chip
                      label={p.status}
                      size="small"
                      sx={{ bgcolor: `${p.color}1A`, color: p.color, fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
                    />
                  </Stack>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                    {p.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {p.tagline}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", color: p.color }}>
                    <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.1em" }}>
                      EXPLORE PLATFORM
                    </Typography>
                    <ArrowForwardIcon sx={{ fontSize: 16 }} />
                  </Stack>
                </Box>
              ))}
            </CardGrid>
          </Box>

          <CTABand
            to="/contact"
            tag="§ 03 — COLLABORATE"
            title="Have a platform that needs intelligence, scale, or distribution?"
            description="NeuroDyne Labs partners with existing products that solve real problems. Tell us about yours."
            color="#6C63FF"
          />
        </Stack>
      </Container>
    </Box>
  );
}
