import { Box, Container, Typography, Stack, Grid, Button } from "@mui/material";
import { Link } from "react-router";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import TerminalOutlinedIcon from "@mui/icons-material/TerminalOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import NewsletterCTA from "@/components/shared/NewsletterCTA";
import HudCorners from "@/components/shared/HudCorners";
import { Overline } from "@/components/shared/Marketing";
import { WatermarkConstellation } from "@/components/shared/Watermark";
import { CANON, PARTNER_PATHWAYS, TRACTION_NOTE } from "@/content/company";

const MotionBox = motion.create(Box);

const VIEWPORT = { once: true, margin: "-60px" } as const;

/**
 * The contact form pre-selects an inquiry type from this query parameter.
 * Built with URLSearchParams so the encoding is exactly what
 * `new URLSearchParams(location.search).get(CONTACT_TYPE_PARAM)` reads back —
 * e.g. "/contact?type=Government+%2F+Institution".
 */
const CONTACT_TYPE_PARAM = "type";

function contactHref(inquiryType: string): string {
  return `/contact?${new URLSearchParams({ [CONTACT_TYPE_PARAM]: inquiryType }).toString()}`;
}

/** One icon per pathway slug, so the content file stays free of component imports. */
const PATHWAY_ICONS: Record<string, ReactNode> = {
  "governments-institutions": <AccountBalanceOutlinedIcon />,
  companies: <BusinessOutlinedIcon />,
  developers: <TerminalOutlinedIcon />,
  "startups-investors": <TrendingUpOutlinedIcon />,
};

/** How the work actually runs today. Deliberately makes no promise about timing or capacity. */
const REALITY = [
  {
    title: "You are talking to the engineer",
    body: "Neurodyne is founder-led. An enquiry about architecture, integration or feasibility is read by the person who would design and write it, not relayed through an account layer.",
  },
  {
    title: "Engagements are scoped, not open-ended",
    body: "Work starts from a defined problem with a defined boundary — one integration, one pilot, one system. Narrow scope is how a small operation ships something that holds up.",
  },
  {
    title: "Technical diligence is welcome",
    body: "Ask to see the architecture, the failure handling, the data model, the code. Every claim on this site is meant to survive being checked.",
  },
  {
    title: "Early is stated, not hidden",
    body: TRACTION_NOTE,
  },
];

export default function Partners() {
  const reduce = useReducedMotion();
  const rise = reduce ? 0 : 16;

  return (
    <>
      <SEO
        title="Partner With Neurodyne"
        description="Ways to work with Neurodyne — interoperability and verification work for institutions, platform engineering for companies, open infrastructure for developers, and the infrastructure thesis for startups and investors."
        canonical="https://neurodyne.dev/partners"
        ogUrl="https://neurodyne.dev/partners"
      />

      <PageHero
        icon={<HandshakeOutlinedIcon />}
        iconLabel="PARTNERS"
        tag="Partnership"
        title="Partner With Neurodyne"
        accentWord="Partner"
        description="Four ways to work with an African AI and digital infrastructure company. Each one starts from a concrete piece of work, not a meeting about a meeting."
      />

      {/* ── Pathway index ─────────────────────────────────────────────────── */}
      <Box sx={{ position: "relative", py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Overline color="#00D4AA">Choose a pathway</Overline>
          <Typography
            color="text.secondary"
            sx={{ mt: 1.5, mb: 3, lineHeight: 1.9, maxWidth: 720, fontSize: "1.02rem" }}
          >
            {CANON.extended}
          </Typography>

          <Box
            component="nav"
            aria-label="Partnership pathways"
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
              gap: { xs: 1.5, md: 2 },
            }}
          >
            {PARTNER_PATHWAYS.map((pathway, i) => (
              <MotionBox
                key={pathway.slug}
                initial={{ opacity: 0, y: rise }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.4, delay: reduce ? 0 : i * 0.05 }}
                sx={{ height: "100%" }}
              >
                {/* The anchor is a plain Box so MUI's polymorphic `component`
                    typing still applies — motion.create() erases it. */}
                <Box
                  component="a"
                  href={`#${pathway.slug}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    height: "100%",
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 0,
                    textDecoration: "none",
                    color: "inherit",
                    transition: "border-color .25s ease, background .25s ease",
                    "&:hover, &:focus-visible": {
                      borderColor: `${pathway.accent}66`,
                      bgcolor: `${pathway.accent}0F`,
                    },
                  }}
                >
                  <Box
                    aria-hidden
                    sx={{ color: pathway.accent, display: "flex", "& .MuiSvgIcon-root": { fontSize: 22 } }}
                  >
                    {PATHWAY_ICONS[pathway.slug]}
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", lineHeight: 1.3 }}>
                    {pathway.audience}
                  </Typography>
                </Box>
              </MotionBox>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── One section per pathway ───────────────────────────────────────── */}
      {PARTNER_PATHWAYS.map((pathway, index) => (
        <Box
          key={pathway.slug}
          component="section"
          id={pathway.slug}
          aria-labelledby={`${pathway.slug}-heading`}
          sx={{
            position: "relative",
            borderTop: "1px solid",
            borderColor: "divider",
            py: { xs: 7, md: 11 },
            scrollMarginTop: { xs: 80, md: 96 },
            overflow: "hidden",
          }}
        >
          <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
            <Grid container spacing={{ xs: 4, md: 8 }} sx={{ alignItems: "flex-start" }}>
              <Grid size={{ xs: 12, md: 5 }}>
                <MotionBox
                  initial={{ opacity: 0, y: rise }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEWPORT}
                  transition={{ duration: 0.45 }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <Box
                      aria-hidden
                      sx={{
                        color: pathway.accent,
                        display: "flex",
                        "& .MuiSvgIcon-root": { fontSize: 30 },
                      }}
                    >
                      {PATHWAY_ICONS[pathway.slug]}
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.62rem",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: pathway.accent,
                        opacity: 0.85,
                      }}
                    >
                      Pathway {String(index + 1).padStart(2, "0")}
                    </Typography>
                  </Stack>

                  <Typography
                    id={`${pathway.slug}-heading`}
                    variant="h3"
                    component="h2"
                    sx={{
                      fontWeight: 800,
                      mt: 2,
                      letterSpacing: "-0.02em",
                      lineHeight: 1.15,
                      fontSize: { xs: "1.9rem", md: "2.6rem" },
                    }}
                  >
                    {pathway.audience}
                  </Typography>

                  <Box aria-hidden sx={{ width: 48, height: 2, background: pathway.accent, mt: 2.5 }} />

                  <Typography
                    color="text.secondary"
                    sx={{ mt: 2.5, lineHeight: 1.95, fontSize: "1.02rem" }}
                  >
                    {pathway.proposition}
                  </Typography>

                  <Button
                    component={Link}
                    to={contactHref(pathway.inquiryType)}
                    variant="contained"
                    size="large"
                    aria-label={`Start a conversation about ${pathway.audience}`}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      borderRadius: 0,
                      mt: 4,
                      px: 4,
                      py: 1.5,
                      fontWeight: 700,
                      bgcolor: pathway.accent,
                      color: "#060911",
                      "&:hover, &:focus-visible": {
                        bgcolor: pathway.accent,
                        boxShadow: `0 0 0 2px ${pathway.accent}55`,
                      },
                    }}
                  >
                    Start a conversation
                  </Button>
                </MotionBox>
              </Grid>

              <Grid size={{ xs: 12, md: 7 }}>
                <Overline color={pathway.accent}>What this looks like</Overline>
                <Grid container spacing={{ xs: 2, md: 2.5 }} sx={{ mt: 0.5 }}>
                  {pathway.engagements.map((engagement, i) => (
                    <Grid key={engagement} size={{ xs: 12, sm: 6 }}>
                      <MotionBox
                        initial={{ opacity: 0, y: rise }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={VIEWPORT}
                        transition={{ duration: 0.4, delay: reduce ? 0 : i * 0.05 }}
                        sx={{
                          position: "relative",
                          height: "100%",
                          p: { xs: 2.5, md: 3 },
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 0,
                          transition: "border-color .25s ease, background .25s ease",
                          "&:hover": {
                            borderColor: `${pathway.accent}55`,
                            bgcolor: `${pathway.accent}0D`,
                          },
                        }}
                      >
                        <HudCorners color={`${pathway.accent}40`} />
                        <Typography
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "0.62rem",
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            color: "text.secondary",
                            opacity: 0.65,
                          }}
                        >
                          {String(index + 1).padStart(2, "0")}.{String(i + 1).padStart(2, "0")}
                        </Typography>
                        <Typography sx={{ mt: 1.25, fontWeight: 700, fontSize: "1rem", lineHeight: 1.45 }}>
                          {engagement}
                        </Typography>
                      </MotionBox>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Container>
        </Box>
      ))}

      {/* ── Honest picture of what partnering means today ─────────────────── */}
      <Box
        sx={{
          position: "relative",
          borderTop: "1px solid",
          borderColor: "divider",
          py: { xs: 7, md: 11 },
          overflow: "hidden",
        }}
      >
        <WatermarkConstellation
          items={[{ icon: <HubOutlinedIcon />, at: { bottom: "-12%", right: "-4%" }, size: 380 }]}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          {/* Built inline rather than with SectionHeading so the heading can be an
              <h2> and the document outline stays h1 → h2 across the page. */}
          <Stack spacing={1.5} sx={{ mb: { xs: 3, md: 4 } }}>
            <Overline>No surprises</Overline>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
              What partnering actually looks like right now
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 760, opacity: 0.8 }}>
              Neurodyne is early and founder-led. That shapes the work, so it is worth saying before a first
              conversation rather than after it.
            </Typography>
          </Stack>
          <Grid container spacing={3} sx={{ mt: { xs: 1, md: 2 } }}>
            {REALITY.map((item, i) => (
              <Grid key={item.title} size={{ xs: 12, md: 6 }}>
                <MotionBox
                  initial={{ opacity: 0, y: rise }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEWPORT}
                  transition={{ duration: 0.4, delay: reduce ? 0 : i * 0.05 }}
                  sx={{ height: "100%", borderTop: "2px solid", borderColor: "#6C63FF", pt: 2.25 }}
                >
                  <Typography sx={{ fontWeight: 800, fontSize: "1.02rem", lineHeight: 1.35 }}>
                    {item.title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 1.25, lineHeight: 1.85, fontSize: "0.94rem" }}>
                    {item.body}
                  </Typography>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Closing ───────────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          borderTop: "1px solid",
          borderColor: "divider",
          py: { xs: 7, md: 10 },
          textAlign: "center",
        }}
      >
        <Container maxWidth="md" sx={{ position: "relative" }}>
          <HudCorners color="rgba(108, 99, 255, 0.25)" />
          <Typography
            variant="h4"
            component="h2"
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
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mt: 4, justifyContent: "center" }}
          >
            <Button
              component={Link}
              to="/contact"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{ borderRadius: 0, px: 4, py: 1.5 }}
            >
              Get in touch
            </Button>
            <Button
              component={Link}
              to="/infrastructure"
              variant="outlined"
              size="large"
              sx={{ borderRadius: 0, px: 4, py: 1.5 }}
            >
              See what we&rsquo;re building
            </Button>
          </Stack>
        </Container>
      </Box>

      <NewsletterCTA />
    </>
  );
}
