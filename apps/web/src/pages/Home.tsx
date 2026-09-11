import AfricaConditionsGrid from "@/components/shared/AfricaConditionsGrid";
import Honeycomb from "@/components/shared/Honeycomb";
import { Box, Container, Typography, Stack, Grid, Button } from "@mui/material";
import { Link } from "react-router";
import { motion } from "framer-motion";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import GitHubIcon from "@mui/icons-material/GitHub";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import MemoryOutlinedIcon from "@mui/icons-material/MemoryOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import TerminalOutlinedIcon from "@mui/icons-material/TerminalOutlined";
import SEO from "@/components/seo/SEO";
import HeroWireframe from "@/components/shared/HeroWireframe";
import NewsletterCTA from "@/components/shared/NewsletterCTA";
import MaturityBadge from "@/components/shared/MaturityBadge";
import { Overline, SectionHeading } from "@/components/shared/Marketing";
import { WatermarkConstellation } from "@/components/shared/Watermark";
import { CANON, HERO, PILLARS, WHY_AFRICA, FOUNDER, PARTNER_PATHWAYS } from "@/content/company";
import { PLATFORMS } from "@/content/projects";
import { RESEARCH_AREAS } from "@/content/positioning";

const MotionBox = motion.create(Box);

export default function Home() {
  return (
    <>
      <SEO
        title="Neurodyne — Building Africa's Digital Infrastructure"
        description={CANON.extended}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          perspective: { md: "1100px" },
          perspectiveOrigin: "50% 38%",
        }}
      >
        {/* Ground plane the hero copy and the cube share, tipped about its
            bottom edge so it has somewhere to recede to. */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            left: "50%",
            bottom: "-20%",
            width: "300%",
            height: "260%",
            transform: "translateX(-50%) rotateX(72deg)",
            transformOrigin: "50% 100%",
            backgroundImage:
              "linear-gradient(rgba(108,99,255,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(108,99,255,0.16) 1px, transparent 1px)",
            backgroundSize: "104px 104px",
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
                <Overline color="#00D4AA">AI &amp; Digital Infrastructure · Accra, Ghana</Overline>
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
                  Building Africa&rsquo;s{" "}
                  <Box
                    component="span"
                    sx={{
                      background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Digital Infrastructure
                  </Box>
                  .
                </Typography>

                <Typography sx={{ mt: 3, fontSize: { xs: "1.05rem", md: "1.2rem" }, lineHeight: 1.7, maxWidth: 620 }}>
                  {HERO.lead}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 2, lineHeight: 1.9, maxWidth: 600 }}>
                  {HERO.sub}
                </Typography>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4.5 }}>
                  <Button
                    component={Link}
                    to={HERO.primaryCta.to}
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ borderRadius: 0, px: 4, py: 1.5 }}
                  >
                    {HERO.primaryCta.label}
                  </Button>
                  <Button
                    component={Link}
                    to={HERO.secondaryCta.to}
                    variant="outlined"
                    size="large"
                    sx={{ borderRadius: 0, px: 4, py: 1.5 }}
                  >
                    {HERO.secondaryCta.label}
                  </Button>
                </Stack>

                <Button
                  component={Link}
                  to={HERO.developerCta.to}
                  startIcon={<GitHubIcon />}
                  sx={{ borderRadius: 0, mt: 2.5, px: 0, fontWeight: 700, fontSize: "0.85rem" }}
                >
                  {HERO.developerCta.label}
                </Button>
              </MotionBox>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <HeroWireframe />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── The thesis ───────────────────────────────────────────────────── */}
      <Box sx={{ position: "relative", borderTop: "1px solid", borderColor: "divider", py: { xs: 5, md: 6 }, overflow: "hidden" }}>
        <WatermarkConstellation items={[{ icon: <HubOutlinedIcon />, at: { top: "-10%", right: "2%" }, size: 400 }]} />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={{ xs: 3, md: 8 }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Overline>What we&rsquo;re building</Overline>
              <Typography variant="h3" component="h2" sx={{ fontWeight: 800, mt: 1.5, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
                Products are how the infrastructure gets proven.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={2.5}>
                <Typography color="text.secondary" sx={{ lineHeight: 1.95, fontSize: "1.04rem" }}>
                  {CANON.thesis}
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.95, fontSize: "1.04rem" }}>
                  {CANON.extended}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ flexWrap: "wrap", gap: 1, pt: 1 }}
                  aria-label="Expansion path"
                >
                  {CANON.expansion.map((step, i) => (
                    <Box key={step} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        component="span"
                        sx={{
                          fontFamily: "monospace",
                          fontSize: "0.7rem",
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: i === 0 ? "#00D4AA" : "text.secondary",
                          border: "1px solid",
                          borderColor: i === 0 ? "#00D4AA59" : "divider",
                          px: 1.2,
                          py: 0.4,
                        }}
                      >
                        {step}
                      </Box>
                      {i < CANON.expansion.length - 1 && (
                        <Box component="span" aria-hidden sx={{ color: "text.secondary", opacity: 0.4 }}>
                          →
                        </Box>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Four strategic pillars ───────────────────────────────────────── */}
      <Box sx={{ position: "relative", borderTop: "1px solid", borderColor: "divider", py: { xs: 5, md: 6 } }}>
        <Container maxWidth="lg">
          <SectionHeading
            tag="Infrastructure"
            title="Four pillars, one system"
            align="center"
          />
          <Grid container spacing={3} sx={{ mt: { xs: 3, md: 5 } }}>
            {PILLARS.map((pillar, i) => (
              <Grid key={pillar.slug} size={{ xs: 12, md: 6 }}>
                <MotionBox
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: i * 0.06 }}
                  sx={{ height: "100%" }}
                >
                <Box
                  component={Link}
                  to={pillar.to}
                  sx={{
                    display: "block",
                    height: "100%",
                    p: { xs: 3, md: 3.5 },
                    border: "1px solid",
                    borderColor: "divider",
                    textDecoration: "none",
                    color: "inherit",
                    position: "relative",
                    transition: "border-color .25s ease, transform .25s ease",
                    "&:hover, &:focus-visible": {
                      borderColor: `${pillar.accent}66`,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Box
                    aria-hidden
                    sx={{ position: "absolute", top: 0, left: 0, width: 40, height: 2, background: pillar.accent }}
                  />
                  <Typography
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.62rem",
                      letterSpacing: "0.2em",
                      color: pillar.accent,
                      textTransform: "uppercase",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </Typography>
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 800, mt: 1.5, letterSpacing: "-0.01em" }}>
                    {pillar.name}
                  </Typography>
                  <Typography sx={{ mt: 1, fontWeight: 600, color: pillar.accent, fontSize: "0.92rem" }}>
                    {pillar.tagline}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 2, lineHeight: 1.85, fontSize: "0.95rem" }}>
                    {pillar.summary}
                  </Typography>
                </Box>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Flagship platforms ───────────────────────────────────────────── */}
      <Box sx={{ position: "relative", borderTop: "1px solid", borderColor: "divider", py: { xs: 5, md: 6 } }}>
        <Container maxWidth="lg">
          <SectionHeading
            tag="Platforms"
            title="What we've built"
            lead="Every product carries the stage it is actually at. Nothing here is described as further along than it is."
            align="center"
          />
          <Grid container spacing={3} sx={{ mt: { xs: 3, md: 5 } }}>
            {PLATFORMS.map((product, i) => (
              <Grid key={product.slug} size={{ xs: 12, sm: 6 }}>
                <MotionBox
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: i * 0.06 }}
                  sx={{ height: "100%" }}
                >
                <Box
                  component={Link}
                  to={`/products/${product.slug}`}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    p: { xs: 3, md: 3.5 },
                    border: "1px solid",
                    borderColor: "divider",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "border-color .25s ease, transform .25s ease",
                    "&:hover, &:focus-visible": {
                      borderColor: `${product.accent}66`,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 800, letterSpacing: "-0.01em" }}>
                      {product.name}
                    </Typography>
                    {product.maturity && <MaturityBadge maturity={product.maturity} size="small" />}
                  </Stack>
                  <Typography sx={{ mt: 1.25, fontWeight: 600, color: product.accent, fontSize: "0.9rem" }}>
                    {product.tagline}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.8, fontSize: "0.93rem", flexGrow: 1 }}>
                    {product.summary}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 2.5,
                      fontFamily: "monospace",
                      fontSize: "0.62rem",
                      letterSpacing: "0.16em",
                      color: "text.secondary",
                      textTransform: "uppercase",
                    }}
                  >
                    {product.industry}
                  </Typography>
                </Box>
                </MotionBox>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: "center", mt: 5 }}>
            <Button
              component={Link}
              to="/products"
              endIcon={<ArrowForwardIcon />}
              sx={{ borderRadius: 0, fontWeight: 700 }}
            >
              All products, labs and client work
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── Developer infrastructure ─────────────────────────────────────── */}
      <Box sx={{ position: "relative", borderTop: "1px solid", borderColor: "divider", py: { xs: 5, md: 6 }, overflow: "hidden" }}>
        <WatermarkConstellation items={[{ icon: <TerminalOutlinedIcon />, at: { bottom: "-14%", left: "-3%" }, size: 380 }]} />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={{ xs: 4, md: 8 }} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Overline color="#6C63FF">Developers</Overline>
              <Typography variant="h3" component="h2" sx={{ fontWeight: 800, mt: 1.5, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
                Build for Africa with Neurodyne.
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 2.5, lineHeight: 1.9 }}>
                African services are reachable by people through apps, and largely unreachable by software.
                We are building the layer that changes that: SDKs, AI agent skills, MCP servers and a registry
                of what exists and how to call it.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4 }}>
                <Button
                  component={Link}
                  to="/developers"
                  variant="outlined"
                  sx={{ borderRadius: 0, px: 3, py: 1.25 }}
                  endIcon={<ArrowForwardIcon />}
                >
                  Developer infrastructure
                </Button>
                <Button
                  component={Link}
                  to="/open-source"
                  startIcon={<GitHubIcon />}
                  sx={{ borderRadius: 0, px: 3, py: 1.25, fontWeight: 700 }}
                >
                  Open source
                </Button>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={1.5}>
                {(PILLARS.find((p) => p.slug === "ai-developer-infrastructure")?.scope ?? []).map((item) => (
                  <Stack key={item} direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                    <Box
                      aria-hidden
                      sx={{ width: 6, height: 6, mt: 1, background: "#6C63FF", flexShrink: 0 }}
                    />
                    <Typography color="text.secondary" sx={{ fontSize: "0.95rem", lineHeight: 1.7 }}>
                      {item}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Why Africa ───────────────────────────────────────────────────── */}
      <Box sx={{ position: "relative", borderTop: "1px solid", borderColor: "divider", py: { xs: 5, md: 6 }, overflow: "hidden" }}>
        <WatermarkConstellation items={[{ icon: <PublicOutlinedIcon />, at: { top: "-8%", right: "-3%" }, size: 420 }]} />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <SectionHeading tag="Why Africa" title={WHY_AFRICA.title} lead={WHY_AFRICA.lead} align="center" />
          <AfricaConditionsGrid />
        </Container>
      </Box>

      {/* ── Founder ──────────────────────────────────────────────────────── */}
      <Box sx={{ position: "relative", borderTop: "1px solid", borderColor: "divider", py: { xs: 5, md: 6 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 8 }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Overline>Who is building this</Overline>
              <Typography variant="h4" component="h2" sx={{ fontWeight: 800, mt: 1.5, letterSpacing: "-0.02em" }}>
                {FOUNDER.name}
              </Typography>
              <Typography sx={{ mt: 0.75, color: "#00D4AA", fontWeight: 600, fontSize: "0.92rem" }}>
                {FOUNDER.role} · {FOUNDER.location}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 2.5 }}>
                {FOUNDER.links.map((l) => (
                  <Button
                    key={l.label}
                    component="a"
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<GitHubIcon />}
                    sx={{ borderRadius: 0, px: 0, fontWeight: 700, fontSize: "0.82rem" }}
                  >
                    {l.label}
                  </Button>
                ))}
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography sx={{ fontSize: "1.05rem", lineHeight: 1.75, fontWeight: 500 }}>
                {FOUNDER.summary}
              </Typography>
              <Stack spacing={2} sx={{ mt: 2.5 }}>
                {FOUNDER.bio.map((p, i) => (
                  <Typography key={i} color="text.secondary" sx={{ lineHeight: 1.9, fontSize: "0.97rem" }}>
                    {p}
                  </Typography>
                ))}
              </Stack>
              <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1, mt: 3 }}>
                {FOUNDER.focus.map((f) => (
                  <Box
                    key={f}
                    component="span"
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.65rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      border: "1px solid",
                      borderColor: "divider",
                      color: "text.secondary",
                      px: 1.2,
                      py: 0.5,
                    }}
                  >
                    {f}
                  </Box>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Partnership pathways ─────────────────────────────────────────── */}
      <Box sx={{ position: "relative", borderTop: "1px solid", borderColor: "divider", py: { xs: 5, md: 6 } }}>
        <Container maxWidth="lg">
          <SectionHeading
            tag="Partnership"
            title="Ways to work with Neurodyne"
            align="center"
          />
          <Grid container spacing={0} sx={{ mt: 3, borderTop: "1px solid", borderLeft: "1px solid", borderColor: "divider" }}>
            {PARTNER_PATHWAYS.map((p, i) => (
              <Grid key={p.slug} size={{ xs: 12, sm: 6, md: 3 }}>
                <MotionBox
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  sx={{ height: "100%" }}
                >
                <Box
                  component={Link}
                  to={`/partners#${p.slug}`}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    p: 3,
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 0,
                    borderRight: "1px solid",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "border-color .25s ease",
                    "&:hover, &:focus-visible": { borderColor: `${p.accent}66` },
                  }}
                >
                  <Box aria-hidden sx={{ color: p.accent, mb: 2 }}><LayersOutlinedIcon sx={{ fontSize: 30 }} /></Box>
                  <Box aria-hidden sx={{ position: "absolute", right: -15, bottom: -20, color: p.accent, opacity: .06 }}><HubOutlinedIcon sx={{ fontSize: 160 }} /></Box>
                  <Typography sx={{ fontWeight: 800, fontSize: "1rem", lineHeight: 1.3 }}>
                    {p.audience}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: "0.88rem", lineHeight: 1.75, flexGrow: 1 }}>
                    {p.proposition}
                  </Typography>
                </Box>
                </MotionBox>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: "center", mt: 5 }}>
            <Button
              component={Link}
              to="/partners"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{ borderRadius: 0, px: 4, py: 1.5 }}
            >
              Partner With Neurodyne
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── Research ─────────────────────────────────────────────────────── */}
      <Box sx={{ position: "relative", borderTop: "1px solid", borderColor: "divider", py: { xs: 5, md: 6 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 3 }}>
            <Box><Overline>Research</Overline><Typography variant="h4" component="h2" sx={{ fontWeight: 800, mt: 1 }}>Open questions we&rsquo;re working on.</Typography></Box>
            <Button component={Link} to="/research" endIcon={<ArrowForwardIcon />}>Read the research</Button>
          </Box>
          <Honeycomb cell={280} perRow={3} gap={6} items={RESEARCH_AREAS.slice(0, 6).map((r, i) => ({ key: r.title, accent: i % 2 ? "#00D4AA" : "#8B85FF", content: <>
            <HubOutlinedIcon aria-hidden sx={{ color: i % 2 ? "#00D4AA" : "#8B85FF", mb: 1 }} />
            <Typography component="h3" sx={{ fontWeight: 800, fontSize: ".92rem", lineHeight: 1.25, minHeight: "2.5em", display: "flex", alignItems: "center" }}>{r.title}</Typography>
            <Typography color="text.secondary" sx={{ mt: 1, fontSize: ".78rem", lineHeight: 1.5 }}>{r.blurb}</Typography>
          </> }))} />
        </Container>
      </Box>

      {/* ── Closing ──────────────────────────────────────────────────────── */}
      <Box sx={{ borderTop: "1px solid", borderColor: "divider", py: { xs: 5, md: 6 }, textAlign: "center" }}>
        <Container maxWidth="md">
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {CANON.brandLine}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2, fontSize: "0.95rem" }}>
            {CANON.geography}
          </Typography>
        </Container>
      </Box>

      <NewsletterCTA />
    </>
  );
}
