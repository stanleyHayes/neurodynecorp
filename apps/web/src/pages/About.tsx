import { Box, Container, Typography, Stack, Grid, Button } from "@mui/material";
import { Link } from "react-router";
import { motion } from "framer-motion";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import TrackChangesOutlinedIcon from "@mui/icons-material/TrackChangesOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import { SectionHeading, Overline, CTABand } from "@/components/shared/Marketing";
import { WatermarkConstellation, BlueprintGrid } from "@/components/shared/Watermark";
import HudCorners from "@/components/shared/HudCorners";
import { ABOUT } from "@/content/positioning";

const MotionBox = motion.create(Box);
const ACCENTS = ["#6C63FF", "#00D4AA", "#8B85FF", "#F59E0B", "#38BDF8"];

export default function About() {
  return (
    <>
      <SEO
        title="About | NeuroDyne Corp"
        description="NeuroDyne is an engineering company building intelligent digital infrastructure that connects people, organizations, and industries through scalable software, AI, and open standards."
      />

      <Container maxWidth="lg" sx={{ pt: 0, pb: { xs: 6, md: 10 }, position: "relative" }}>
        <BlueprintGrid opacity={0.7} />
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <PageHero
            icon={<InfoOutlinedIcon />}
            iconLabel="NDC-ABT"
            tag="About NeuroDyne"
            title="An engineering company, not a software agency"
            accentWord="engineering company"
            description="Much of today's software is fragmented, incompatible and hard to scale. NeuroDyne was founded to solve that."
            iconColor="#8B85FF"
          />
        </Box>

        <Grid container spacing={{ xs: 3, md: 8 }} sx={{ mt: { xs: 3, md: 5 }, position: "relative", zIndex: 1 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={2.5}>
              {ABOUT.intro.map((p, i) => (
                <Typography
                  key={i}
                  color={i === 2 ? "text.primary" : "text.secondary"}
                  sx={{
                    lineHeight: 1.95,
                    fontSize: i === 2 ? "1.15rem" : "1.02rem",
                    fontWeight: i === 2 ? 700 : 400,
                  }}
                >
                  {p}
                </Typography>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2}>
              {[
                { tag: "Vision", icon: <RocketLaunchOutlinedIcon />, body: ABOUT.vision, accent: "#6C63FF" },
                { tag: "Mission", icon: <TrackChangesOutlinedIcon />, body: ABOUT.mission, accent: "#00D4AA" },
              ].map((c) => (
                <Box
                  key={c.tag}
                  sx={{ position: "relative", p: { xs: 2.5, md: 3 }, border: "1px solid", borderColor: "divider", bgcolor: `${c.accent}08` }}
                >
                  <HudCorners color={`${c.accent}44`} />
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
                    <Box sx={{ color: c.accent, display: "flex", "& .MuiSvgIcon-root": { fontSize: 26 } }}>{c.icon}</Box>
                    <Overline color={c.accent}>{c.tag}</Overline>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.85 }}>
                    {c.body}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* Philosophy strip */}
      <Box sx={{ position: "relative", py: { xs: 7, md: 11 }, borderTop: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        <WatermarkConstellation
          tone="brand"
          items={[
            { icon: <LayersOutlinedIcon />, at: { top: "-10%", left: "-3%" }, size: 340 },
            { icon: <HubOutlinedIcon />, at: { bottom: "-12%", right: "-2%" }, size: 320, tone: "accent" },
          ]}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <SectionHeading tag="Our Philosophy" title="Technology should be" align="center" />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
              borderTop: "1px solid",
              borderLeft: "1px solid",
              borderColor: "divider",
            }}
          >
            {ABOUT.philosophy.map((word, i) => (
              <MotionBox
                key={word}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                sx={{
                  position: "relative",
                  minHeight: { xs: 96, md: 128 },
                  p: { xs: 2.5, md: 3 },
                  borderRight: "1px solid",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  overflow: "hidden",
                  transition: "background-color 0.25s ease, color 0.25s ease",
                  "&::after": {
                    content: '""', position: "absolute", inset: "auto 0 0", height: 3,
                    bgcolor: i % 2 === 0 ? "primary.main" : "#00D4AA",
                    transform: "scaleX(0)", transformOrigin: "left", transition: "transform 0.3s ease",
                  },
                  "&:hover": { bgcolor: i % 2 === 0 ? "rgba(108,99,255,0.07)" : "rgba(0,212,170,0.06)" },
                  "&:hover::after": { transform: "scaleX(1)" },
                }}
              >
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.58rem", letterSpacing: "0.16em", color: "text.secondary", opacity: 0.68 }}>
                  PRINCIPLE / {String(i + 1).padStart(2, "0")}
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: { xs: "1rem", md: "1.12rem" }, letterSpacing: "-0.015em" }}>
                  {word}
                </Typography>
              </MotionBox>
            ))}
          </Box>
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button component={Link} to="/philosophy" endIcon={<ArrowForwardIcon />} sx={{ borderRadius: 0, fontWeight: 700 }}>
              The full engineering doctrine
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Values */}
      <Box sx={{ position: "relative", py: { xs: 7, md: 11 }, borderTop: "1px solid", borderColor: "divider" }}>
        <Container maxWidth="lg">
          <SectionHeading tag="Our Values" title="What we hold to" align="center" color="#00D4AA" />
          <Grid container spacing={2}>
            {ABOUT.values.map((v, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={v.title}>
                <MotionBox
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
                  sx={{ position: "relative", height: "100%", p: 3, border: "1px solid", borderColor: "divider" }}
                >
                  <HudCorners />
                  <Overline color={ACCENTS[i % ACCENTS.length]}>{String(i + 1).padStart(2, "0")}</Overline>
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 1.25, mb: 1 }}>
                    {v.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    {v.body}
                  </Typography>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Founder / origin */}
      <Box sx={{ position: "relative", py: { xs: 7, md: 11 }, borderTop: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        <WatermarkConstellation items={[{ icon: <PublicOutlinedIcon />, at: { top: "-6%", right: "-3%" }, size: 380 }]} />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={{ xs: 3, md: 8 }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Overline color="#8B85FF">Where we work</Overline>
              <Typography variant="h3" sx={{ fontWeight: 800, mt: 1.5, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                Built in Accra. Engineered for anywhere.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={2.5}>
                <Typography color="text.secondary" sx={{ lineHeight: 1.95, fontSize: "1.02rem" }}>
                  Our systems are designed against the constraints that actually exist in the markets we serve:
                  intermittent connectivity, low-spec devices, mobile-money rails, multiple local languages, thin
                  budgets and real regulatory obligations.
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.95, fontSize: "1.02rem" }}>
                  Software engineered for those conditions works everywhere. Software engineered only for ideal
                  conditions works nowhere that matters to us.
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.95, fontSize: "1.02rem" }}>
                  That is why our portfolio spans housing, education, disaster response, healthcare interoperability,
                  commerce, culture and public investment — and why every one of those systems contributes reusable
                  infrastructure back to the next.
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <CTABand
          to="/projects"
          tag="See the work"
          title="Systems we've engineered"
          description="Housing, schools, disaster response, healthcare, public investment — and the primitives each one proved out."
        />
      </Container>
    </>
  );
}
