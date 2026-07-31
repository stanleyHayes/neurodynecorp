import { Box, Container, Typography, Stack, Grid, Button } from "@mui/material";
import { Link } from "react-router";
import { motion } from "framer-motion";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutoAwesomeMotionOutlinedIcon from "@mui/icons-material/AutoAwesomeMotionOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import MemoryOutlinedIcon from "@mui/icons-material/MemoryOutlined";
import SEO from "@/components/seo/SEO";
import HeroWireframe from "@/components/shared/HeroWireframe";
import FounderNote from "@/components/shared/FounderNote";
import NewsletterCTA from "@/components/shared/NewsletterCTA";
import { Overline, SectionHeading } from "@/components/shared/Marketing";
import { WatermarkConstellation, BlueprintGrid } from "@/components/shared/Watermark";
import HudCorners from "@/components/shared/HudCorners";
import Honeycomb from "@/components/shared/Honeycomb";
import { BRAND, WHAT_WE_DO, WHY_NEURODYNE, INITIATIVES, INDUSTRY_LIST } from "@/content/positioning";

const MotionBox = motion.create(Box);

const DO_ICONS: Record<string, React.ReactNode> = {
  "digital-transformation": <AutoAwesomeMotionOutlinedIcon />,
  "enterprise-software": <StorageOutlinedIcon />,
  "artificial-intelligence": <PsychologyOutlinedIcon />,
  "open-standards": <AccountTreeOutlinedIcon />,
  "research-innovation": <ScienceOutlinedIcon />,
};

const ACCENTS = ["#6C63FF", "#00D4AA", "#8B85FF", "#F59E0B", "#38BDF8"];

export default function Home() {
  return (
    <>
      <SEO
        title="NeuroDyne Corp — Engineering the Operating Systems of Tomorrow"
        description="NeuroDyne is an engineering company building intelligent digital infrastructure for organizations, industries, and nations — through software engineering, AI, cloud, and open standards."
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          // The whole hero is one 3D volume, not a flat band with a 3D widget
          // bolted onto the right. Children below sit at explicit depths.
          perspective: { md: "1100px" },
          perspectiveOrigin: "50% 38%",
        }}
      >
        {/* Hero-wide ground plane: the same grid the cube stands on, extended
            across the full section so the copy shares its space. */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            left: "50%",
            bottom: "-20%",
            width: "300%",
            // The plane is tipped about its bottom edge, so its own "up" is the
            // distance. It needs real length to have anywhere to recede to.
            height: "260%",
            transform: "translateX(-50%) rotateX(72deg)",
            transformOrigin: "50% 100%",
            backgroundImage:
              "linear-gradient(rgba(108,99,255,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.16) 1px, transparent 1px)",
            backgroundSize: "104px 104px",
            // Fade only as it approaches the horizon. The previous mask hit
            // full transparency at 78%, which erased the entire far field and
            // left the grid visible only in the foreground.
            maskImage:
              "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 34%, rgba(0,0,0,0.4) 62%, rgba(0,0,0,0.16) 84%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 34%, rgba(0,0,0,0.4) 62%, rgba(0,0,0,0.16) 84%, transparent 100%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <WatermarkConstellation
          tone="brand"
          items={[
            { icon: <LayersOutlinedIcon />, at: { top: "6%", left: "-5%" }, size: 380, rotate: -6 },
            { icon: <MemoryOutlinedIcon />, at: { bottom: "-8%", right: "-4%" }, size: 340 },
          ]}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, pt: { xs: 6, md: 10 }, pb: { xs: 6, md: 9 } }}>
          <Grid container spacing={{ xs: 4, md: 6 }} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, md: 7 }} sx={{ transformStyle: "preserve-3d" }}>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                sx={{ transform: { md: "translateZ(52px)" } }}
              >
                <Overline color="#00D4AA">Engineering Company · Accra, Ghana</Overline>
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 900,
                    letterSpacing: "-0.03em",
                    fontSize: { xs: "2.5rem", sm: "3.2rem", md: "4.2rem" },
                    lineHeight: 1.03,
                    mt: 2,
                  }}
                >
                  Engineering the{" "}
                  <Box
                    component="span"
                    sx={{
                      background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Operating Systems
                  </Box>{" "}
                  of Tomorrow.
                </Typography>

                <Typography sx={{ mt: 3, fontSize: { xs: "1.05rem", md: "1.2rem" }, lineHeight: 1.7, maxWidth: 620 }}>
                  {BRAND.hero.lead}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 2, lineHeight: 1.9, maxWidth: 600 }}>
                  {BRAND.hero.sub}
                </Typography>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4.5 }}>
                  <Button
                    component={Link}
                    to={BRAND.hero.primaryCta.to}
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ borderRadius: 0, px: 4, py: 1.5 }}
                  >
                    {BRAND.hero.primaryCta.label}
                  </Button>
                  <Button
                    component={Link}
                    to={BRAND.hero.secondaryCta.to}
                    variant="outlined"
                    size="large"
                    sx={{ borderRadius: 0, px: 4, py: 1.5 }}
                  >
                    {BRAND.hero.secondaryCta.label}
                  </Button>
                </Stack>
              </MotionBox>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <HeroWireframe />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── More Than Software ───────────────────────────────────────────── */}
      <Box sx={{ position: "relative", borderTop: "1px solid", borderColor: "divider", py: { xs: 7, md: 11 }, overflow: "hidden" }}>
        <WatermarkConstellation items={[{ icon: <HubOutlinedIcon />, at: { top: "-10%", right: "2%" }, size: 400 }]} />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={{ xs: 3, md: 8 }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Overline>Positioning</Overline>
              <Typography variant="h3" sx={{ fontWeight: 800, mt: 1.5, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
                {BRAND.intro.title}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={2.5}>
                {BRAND.intro.body.map((p, i) => (
                  <Typography key={i} color="text.secondary" sx={{ lineHeight: 1.95, fontSize: "1.04rem" }}>
                    {p}
                  </Typography>
                ))}
                <Box>
                  <Button
                    component={Link}
                    to="/philosophy"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ borderRadius: 0, mt: 1, px: 0, fontWeight: 700 }}
                  >
                    Read our engineering philosophy
                  </Button>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── What We Do ───────────────────────────────────────────────────── */}
      <Box sx={{ position: "relative", borderTop: "1px solid", borderColor: "divider", py: { xs: 7, md: 11 } }}>
        <Container maxWidth="lg">
          <SectionHeading tag="What We Do" title="Five disciplines, one system of work" align="center" />
          <Honeycomb
            cell={300}
            perRow={3}
            items={WHAT_WE_DO.map((d, i) => {
              const accent = ACCENTS[i % ACCENTS.length]!;
              return {
                key: d.slug,
                accent,
                content: (
                  <>
                    <Box sx={{ color: accent, display: "flex", justifyContent: "center", "& .MuiSvgIcon-root": { fontSize: 26 }, mb: 1 }}>
                      {DO_ICONS[d.slug]}
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", lineHeight: 1.2, mb: 0.6 }}>{d.title}</Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.45, fontSize: "0.7rem" }}
                    >
                      {d.blurb}
                    </Typography>
                  </>
                ),
              };
            })}
          />
        </Container>
      </Box>

      {/* ── Industries ───────────────────────────────────────────────────── */}
      <Box sx={{ position: "relative", borderTop: "1px solid", borderColor: "divider", py: { xs: 7, md: 11 }, overflow: "hidden" }}>
        <WatermarkConstellation
          tone="accent"
          items={[{ icon: <PublicOutlinedIcon />, at: { bottom: "-14%", left: "-4%" }, size: 420 }]}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <SectionHeading
            tag="Industries"
            title="We build technology for"
            lead="Every industry has common language, common processes, and common data. Once modelled, they become building blocks."
            color="#00D4AA"
          />
          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1.25 }}>
            {INDUSTRY_LIST.map((ind, i) => (
              <MotionBox
                key={ind}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: (i % 10) * 0.03 }}
                sx={{
                  px: 2,
                  py: 1.1,
                  border: "1px solid",
                  borderColor: "divider",
                  fontSize: "0.9rem",
                  color: "text.secondary",
                  transition: "all 0.25s",
                  "&:hover": { borderColor: "rgba(0,212,170,0.5)", color: "text.primary", bgcolor: "rgba(0,212,170,0.06)" },
                }}
              >
                {ind}
              </MotionBox>
            ))}
          </Stack>
          <Button component={Link} to="/industries" endIcon={<ArrowForwardIcon />} sx={{ borderRadius: 0, mt: 3, px: 0, fontWeight: 700 }}>
            How we transform each sector
          </Button>
        </Container>
      </Box>

      {/* ── Why NeuroDyne ────────────────────────────────────────────────── */}
      <Box sx={{ position: "relative", borderTop: "1px solid", borderColor: "divider", py: { xs: 7, md: 11 } }}>
        <Container maxWidth="lg">
          <SectionHeading tag="Why NeuroDyne" title="How we differ" align="center" />
          <Grid container spacing={2}>
            {WHY_NEURODYNE.map((w, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={w.title}>
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
                    {w.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    {w.body}
                  </Typography>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Featured Initiatives ─────────────────────────────────────────── */}
      <Box sx={{ position: "relative", borderTop: "1px solid", borderColor: "divider", py: { xs: 7, md: 11 }, overflow: "hidden" }}>
        <BlueprintGrid opacity={0.5} />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <SectionHeading
            tag="Featured Initiatives"
            title="Operating systems in the making"
            lead="Each one models an entire industry — not an application within it."
            color="#8B85FF"
          />
          <Honeycomb
            cell={260}
            perRow={4}
            items={INITIATIVES.map((init, i) => {
              const accent = ACCENTS[i % ACCENTS.length]!;
              return {
                key: init.slug,
                accent,
                content: (
                  <>
                    <Typography
                      sx={{ fontFamily: "monospace", fontSize: "0.55rem", color: accent, letterSpacing: "0.18em", mb: 0.75 }}
                    >
                      {String(i + 1).padStart(2, "0")} · {init.status.toUpperCase()}
                    </Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.92rem", lineHeight: 1.2, mb: 0.5 }}>{init.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4, fontSize: "0.68rem" }}>
                      {init.blurb}
                    </Typography>
                  </>
                ),
              };
            })}
          />
          <Button component={Link} to="/projects" endIcon={<ArrowForwardIcon />} sx={{ borderRadius: 0, mt: 3.5, px: 0, fontWeight: 700 }}>
            See the systems we've engineered
          </Button>
        </Container>
      </Box>

      {/* ── Founder note ─────────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <FounderNote />
      </Container>

      {/* ── Closing CTA ──────────────────────────────────────────────────── */}
      <Box sx={{ position: "relative", borderTop: "1px solid", borderColor: "divider", py: { xs: 8, md: 12 }, overflow: "hidden" }}>
        <WatermarkConstellation
          tone="brand"
          items={[
            { icon: <LayersOutlinedIcon />, at: { top: "-12%", left: "6%" }, size: 320 },
            { icon: <HubOutlinedIcon />, at: { bottom: "-14%", right: "8%" }, size: 340, tone: "accent" },
          ]}
        />
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <Overline color="#00D4AA">Let's build</Overline>
          <Typography
            variant="h2"
            sx={{ fontWeight: 900, mt: 2, mb: 2.5, letterSpacing: "-0.025em", fontSize: { xs: "2rem", md: "3rem" }, lineHeight: 1.12 }}
          >
            Let's Build the Future Together.
          </Typography>
          <Typography color="text.secondary" sx={{ lineHeight: 1.9, mb: 4.5, fontSize: "1.05rem" }}>
            Whether you're a startup, enterprise, university, or government institution, NeuroDyne can help transform
            your ideas into scalable digital systems.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "center" }}>
            <Button component={Link} to="/start-project" variant="contained" size="large" endIcon={<ArrowForwardIcon />} sx={{ borderRadius: 0, px: 4, py: 1.5 }}>
              Start a Project
            </Button>
            <Button component={Link} to="/contact" variant="outlined" size="large" sx={{ borderRadius: 0, px: 4, py: 1.5 }}>
              Talk to an Engineer
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 10 } }}>
        <NewsletterCTA />
      </Container>
    </>
  );
}
