import { Box, Container, Typography, Stack, Grid } from "@mui/material";
import { motion, useReducedMotion } from "framer-motion";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import SchemaOutlinedIcon from "@mui/icons-material/SchemaOutlined";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import NewsletterCTA from "@/components/shared/NewsletterCTA";
import HudCorners from "@/components/shared/HudCorners";
import { Overline } from "@/components/shared/Marketing";
import { WatermarkConstellation, BlueprintGrid } from "@/components/shared/Watermark";
import { CANON, VISION_PHASES } from "@/content/company";
import type { VisionPhase } from "@/content/company";
import { PHILOSOPHY_SECTIONS, PRINCIPLES } from "@/content/positioning";

const MotionBox = motion.create(Box);

const VIEWPORT = { once: true, margin: "-60px" } as const;

/**
 * How each phase state is shown.
 *
 * This is the honesty layer of the page. Phases 1 and 2 are things that exist
 * or are being built; phases 3 and 4 are direction. They must not look the
 * same, so state controls colour, rail style, weight and the gloss printed
 * next to the badge — not just a label a reader can skim past.
 */
const STATE_META: Record<
  VisionPhase["state"],
  { color: string; gloss: string; dashed: boolean; built: boolean }
> = {
  Current: {
    color: "#00D4AA",
    gloss: "Where Neurodyne is today.",
    dashed: false,
    built: true,
  },
  Underway: {
    color: "#6C63FF",
    gloss: "Started. Not finished.",
    dashed: false,
    built: true,
  },
  Ahead: {
    color: "#F59E0B",
    gloss: "Intended direction. Not built yet.",
    dashed: true,
    built: false,
  },
};

const STATE_KEY: { state: VisionPhase["state"]; meaning: string }[] = [
  {
    state: "Current",
    meaning:
      "Work that exists now and can be looked at. This is the phase the company is actually operating in.",
  },
  {
    state: "Underway",
    meaning:
      "Work that has begun and is partially built. Real, but incomplete — and described that way everywhere on this site.",
  },
  {
    state: "Ahead",
    meaning:
      "Where the strategy points. Nothing here has been built, adopted or proven. It is stated so the direction is legible, not to imply progress.",
  },
];

/**
 * Engineering doctrine kept from the long-form philosophy, narrowed to the
 * sections that explain *why* the phase order is what it is. Referenced by id
 * so the text stays in one place.
 */
const DOCTRINE_IDS = ["not-software", "standards", "reuse", "engineering", "knowledge"] as const;

const DOCTRINE = DOCTRINE_IDS.map((id) =>
  PHILOSOPHY_SECTIONS.find((section) => section.id === id),
).filter((section): section is (typeof PHILOSOPHY_SECTIONS)[number] => Boolean(section));

export default function Vision() {
  const reduce = useReducedMotion();

  /** Entrance animation that collapses to a plain fade under reduced motion. */
  const rise = (delay = 0) => ({
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: VIEWPORT,
    transition: { duration: reduce ? 0.2 : 0.5, delay: reduce ? 0 : delay },
  });

  return (
    <>
      <SEO
        title="Vision | Neurodyne"
        description="Neurodyne's ten-year strategy in four phases — products, infrastructure, ecosystem, digital infrastructure — with an honest marker of which phases exist today and which are still ahead."
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ pt: 0, pb: { xs: 6, md: 9 }, position: "relative" }}>
        <BlueprintGrid opacity={0.7} />
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <PageHero
            icon={<TimelineOutlinedIcon />}
            iconLabel="NDC-VISION"
            tag="TEN // YEAR"
            title="Vision"
            accentWord="Vision"
            description="A ten-year strategy in four phases — products, infrastructure, ecosystem, and eventually infrastructure other people depend on. The first two are work in progress today. The last two are direction, not achievement."
            iconColor="#6C63FF"
          />
        </Box>

        <Grid container spacing={{ xs: 3, md: 6 }} sx={{ mt: { xs: 4, md: 6 }, position: "relative", zIndex: 1 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={2.5}>
              <Typography color="text.secondary" sx={{ lineHeight: 1.95, fontSize: "1.02rem" }}>
                {CANON.extended}
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.95, fontSize: "1.02rem" }}>
                The phases below are sequential on purpose. Each one is only possible because the one before it
                forced something to be built. Skipping ahead — announcing an ecosystem before the infrastructure
                underneath it works — is how infrastructure companies become demos.
              </Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                position: "relative",
                p: { xs: 3, md: 3.5 },
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "action.hover",
              }}
            >
              <HudCorners color="rgba(245,158,11,0.35)" />
              <Overline color="#F59E0B">Read this first</Overline>
              <Typography
                variant="h5"
                component="h2"
                sx={{ fontWeight: 800, mt: 1.5, lineHeight: 1.35, letterSpacing: "-0.01em" }}
              >
                Neurodyne is at phase one, entering phase two.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, lineHeight: 1.85 }}>
                Phases three and four are ambition. They are written down so the direction is legible — not because
                any part of them has been built, adopted or proven. Every phase below carries its real state, and
                the two that are still ahead are drawn differently for that reason.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* ── State key ────────────────────────────────────────────────────── */}
      <Box sx={{ position: "relative", borderTop: "1px solid", borderColor: "divider", py: { xs: 5, md: 6 } }}>
        <Container maxWidth="lg">
          <Overline color="#8B85FF">Key</Overline>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 800, mt: 1.5, letterSpacing: "-0.02em" }}
          >
            Three states, and what they actually mean
          </Typography>

          <Grid container spacing={3} sx={{ mt: { xs: 2, md: 3.5 } }}>
            {STATE_KEY.map((entry, i) => {
              const meta = STATE_META[entry.state];
              return (
                <Grid key={entry.state} size={{ xs: 12, md: 4 }}>
                  <MotionBox
                    {...rise(i * 0.06)}
                    sx={{
                      height: "100%",
                      pt: 2,
                      borderTop: `2px ${meta.dashed ? "dashed" : "solid"} ${meta.color}`,
                    }}
                  >
                    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                      <Box
                        component="span"
                        sx={{
                          fontFamily: "monospace",
                          fontSize: "0.62rem",
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          fontWeight: 700,
                          color: meta.color,
                          border: "1px solid",
                          borderStyle: meta.dashed ? "dashed" : "solid",
                          borderColor: `${meta.color}59`,
                          px: 1.2,
                          py: 0.45,
                        }}
                      >
                        {entry.state}
                      </Box>
                      <Typography
                        sx={{ fontSize: "0.82rem", fontWeight: 600, color: meta.color, opacity: 0.9 }}
                      >
                        {meta.gloss}
                      </Typography>
                    </Stack>
                    <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: "0.92rem", lineHeight: 1.8 }}>
                      {entry.meaning}
                    </Typography>
                  </MotionBox>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* ── The four phases ──────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          borderTop: "1px solid",
          borderColor: "divider",
          py: { xs: 5, md: 6 },
          overflow: "hidden",
        }}
      >
        <WatermarkConstellation
          tone="brand"
          items={[
            { icon: <LayersOutlinedIcon />, at: { top: "-6%", left: "-4%" }, size: 360, rotate: -6 },
            { icon: <HubOutlinedIcon />, at: { bottom: "-10%", right: "-3%" }, size: 380 },
          ]}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Overline>The progression</Overline>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 800, mt: 1.5, letterSpacing: "-0.02em" }}
          >
            Products → Infrastructure → Ecosystem → Digital Infrastructure
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontWeight: 400, mt: 1.5, maxWidth: 760, opacity: 0.8 }}
          >
            Four phases over ten years. The rail is solid where the work exists and dashed where it does not.
          </Typography>

          {/* Vertical timeline on mobile, stepped horizontal rail from md up.
              A zero-gap grid keeps the rail continuous in both directions. */}
          <Box
            component="ol"
            sx={{
              listStyle: "none",
              m: 0,
              mt: { xs: 4, md: 7 },
              p: 0,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
            }}
          >
            {VISION_PHASES.map((phase, i) => {
              const meta = STATE_META[phase.state];
              return (
                <Box
                  key={phase.phase}
                  component="li"
                  sx={{
                    position: "relative",
                    // Mobile: the rail runs down the left edge of each phase.
                    borderLeft: { xs: `2px ${meta.dashed ? "dashed" : "solid"} ${meta.color}`, md: "none" },
                    pl: { xs: 3, md: 0 },
                    pb: { xs: 5, md: 0 },
                    // Desktop: the rail runs across the top of the row.
                    borderTop: { md: `2px ${meta.dashed ? "dashed" : "solid"} ${meta.color}` },
                    pt: { xs: 0, md: 4 },
                    pr: { md: 3.5 },
                    opacity: meta.built ? 1 : 0.9,
                  }}
                >
                  {/* Node on the rail. */}
                  <Box
                    aria-hidden
                    sx={{
                      position: "absolute",
                      left: { xs: -7, md: 0 },
                      top: { xs: 4, md: -7 },
                      width: 12,
                      height: 12,
                      background: meta.built ? meta.color : "transparent",
                      border: `2px solid ${meta.color}`,
                    }}
                  />

                  <MotionBox {...rise(i * 0.08)}>
                    <Typography
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.62rem",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: meta.color,
                      }}
                    >
                      Phase {String(phase.phase).padStart(2, "0")}
                    </Typography>

                    {/* State sits directly under the phase number, not buried in body copy. */}
                    <Box
                      component="span"
                      sx={{
                        display: "inline-block",
                        mt: 1.5,
                        fontFamily: "monospace",
                        fontSize: "0.62rem",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        fontWeight: 700,
                        color: meta.color,
                        border: "1px solid",
                        borderStyle: meta.dashed ? "dashed" : "solid",
                        borderColor: `${meta.color}59`,
                        px: 1.1,
                        py: 0.4,
                      }}
                    >
                      {phase.state}
                    </Box>

                    <Typography
                      variant="h5"
                      component="h3"
                      sx={{ fontWeight: 800, mt: 1.5, letterSpacing: "-0.01em", lineHeight: 1.2 }}
                    >
                      {phase.name}
                    </Typography>

                    <Typography
                      sx={{ mt: 1, fontWeight: 600, fontSize: "0.92rem", color: meta.color, lineHeight: 1.6 }}
                    >
                      {meta.gloss}
                    </Typography>

                    <Typography color="text.secondary" sx={{ mt: 1.75, fontSize: "0.95rem", lineHeight: 1.8 }}>
                      {phase.summary}
                    </Typography>

                    <Stack spacing={1.5} sx={{ mt: 2 }}>
                      {phase.detail.map((paragraph, di) => (
                        <Typography
                          key={di}
                          color="text.secondary"
                          sx={{ fontSize: "0.88rem", lineHeight: 1.8, opacity: 0.85 }}
                        >
                          {paragraph}
                        </Typography>
                      ))}
                    </Stack>
                  </MotionBox>
                </Box>
              );
            })}
          </Box>

          {/* Restating the position in plain words, after the reader has seen all four. */}
          <Box
            sx={{
              position: "relative",
              mt: { xs: 2, md: 7 },
              p: { xs: 3, md: 3.5 },
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "action.hover",
            }}
          >
            <HudCorners />
            <Typography sx={{ fontSize: { xs: "0.98rem", md: "1.04rem" }, lineHeight: 1.9 }}>
              The first two phases describe work that is actually underway. The last two describe where that
              work is pointed, and nothing more. A ten-year plan is only useful if a reader can tell which is
              which, so the difference is drawn on the page rather than explained in a footnote.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* ── Expansion path ───────────────────────────────────────────────── */}
      <Box sx={{ position: "relative", borderTop: "1px solid", borderColor: "divider", py: { xs: 5, md: 6 }, overflow: "hidden" }}>
        <WatermarkConstellation
          items={[{ icon: <PublicOutlinedIcon />, at: { top: "-14%", right: "-4%" }, size: 400 }]}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={{ xs: 3, md: 8 }} sx={{ alignItems: "flex-start" }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Overline color="#00D4AA">Geography</Overline>
              <Typography
                variant="h4"
                component="h2"
                sx={{ fontWeight: 800, mt: 1.5, letterSpacing: "-0.02em", lineHeight: 1.2 }}
              >
                Outward in the same order.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography color="text.secondary" sx={{ lineHeight: 1.95, fontSize: "1.02rem" }}>
                The market path follows the same discipline as the phases: prove it where the constraints are
                hardest and best understood, then widen. Ghana is where the payment rails, identity realities and
                connectivity limits are lived rather than researched. Everything after it is sequence, not a
                claim of presence.
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: "wrap", gap: 1, mt: 3 }}
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
                        borderStyle: i === 0 ? "solid" : "dashed",
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
              <Typography
                color="text.secondary"
                sx={{ mt: 1.75, fontSize: "0.85rem", lineHeight: 1.7, opacity: 0.8 }}
              >
                Solid marks where the work is based. Dashed marks where it is headed.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Engineering doctrine ─────────────────────────────────────────── */}
      <Box sx={{ position: "relative", borderTop: "1px solid", borderColor: "divider", py: { xs: 5, md: 6 }, overflow: "hidden" }}>
        <WatermarkConstellation
          tone="brand"
          items={[
            { icon: <SchemaOutlinedIcon />, at: { top: "2%", left: "-4%" }, size: 340, rotate: -8 },
            { icon: <HubOutlinedIcon />, at: { bottom: "-12%", right: "-2%" }, size: 360, tone: "accent" },
          ]}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Overline>Doctrine</Overline>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 800, mt: 1.5, letterSpacing: "-0.02em" }}
          >
            Why the phases are in that order
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontWeight: 400, mt: 1.5, maxWidth: 760, opacity: 0.8 }}
          >
            The engineering positions underneath the strategy. They are the reason products come before
            infrastructure, and standards before scale.
          </Typography>

          <Stack spacing={{ xs: 5, md: 8 }} sx={{ mt: { xs: 5, md: 8 } }}>
            {DOCTRINE.map((section, i) => (
              <MotionBox key={section.id} id={section.id} {...rise(0)}>
                <Grid container spacing={{ xs: 2, md: 6 }}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Overline color={i % 2 === 0 ? "#6C63FF" : "#00D4AA"}>
                      {String(i + 1).padStart(2, "0")} — Position
                    </Overline>
                    <Typography
                      variant="h5"
                      component="h3"
                      sx={{ fontWeight: 800, mt: 1.5, letterSpacing: "-0.01em", lineHeight: 1.25 }}
                    >
                      {section.title}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 8 }}>
                    <Stack spacing={2}>
                      {section.body.map((paragraph, pi) => (
                        <Typography
                          key={pi}
                          color="text.secondary"
                          sx={{ lineHeight: 1.9, fontSize: "1rem" }}
                        >
                          {paragraph}
                        </Typography>
                      ))}

                      {"list" in section && section.list && (
                        <Box
                          sx={{
                            position: "relative",
                            mt: 1,
                            p: { xs: 2.5, md: 3 },
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "action.hover",
                          }}
                        >
                          <HudCorners />
                          <Grid container spacing={1.25}>
                            {section.list.map((item) => (
                              <Grid size={{ xs: 12, sm: 6 }} key={item}>
                                <Stack direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
                                  <Box
                                    aria-hidden
                                    sx={{
                                      mt: "9px",
                                      width: 6,
                                      height: 6,
                                      flexShrink: 0,
                                      bgcolor: "primary.main",
                                      opacity: 0.7,
                                    }}
                                  />
                                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                    {item}
                                  </Typography>
                                </Stack>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}

                      {"outro" in section && section.outro && (
                        <Typography
                          color="text.secondary"
                          sx={{ lineHeight: 1.9, fontStyle: "italic", opacity: 0.9 }}
                        >
                          {section.outro}
                        </Typography>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </MotionBox>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ── Operating principles ─────────────────────────────────────────── */}
      <Box sx={{ position: "relative", borderTop: "1px solid", borderColor: "divider", py: { xs: 5, md: 6 } }}>
        <Container maxWidth="lg">
          <Overline color="#00D4AA">Operating principles</Overline>
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 800, mt: 1.5, letterSpacing: "-0.02em" }}
          >
            Nine rules the work is engineered by
          </Typography>

          <Grid container spacing={3} sx={{ mt: { xs: 3, md: 5 } }}>
            {PRINCIPLES.map((principle, i) => (
              <Grid key={principle.title} size={{ xs: 12, sm: 6, md: 4 }}>
                <MotionBox
                  {...rise((i % 3) * 0.05)}
                  sx={{
                    height: "100%",
                    p: { xs: 3, md: 3.25 },
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "border-color .25s ease",
                    "&:hover, &:focus-visible": {
                      borderColor: i % 2 === 0 ? "#6C63FF66" : "#00D4AA66",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.62rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: i % 2 === 0 ? "#6C63FF" : "#00D4AA",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </Typography>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ fontWeight: 700, mt: 1.25, fontSize: "1rem", lineHeight: 1.35 }}
                  >
                    {principle.title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 1.25, fontSize: "0.9rem", lineHeight: 1.8 }}>
                    {principle.body}
                  </Typography>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Closing ──────────────────────────────────────────────────────── */}
      <Box sx={{ borderTop: "1px solid", borderColor: "divider", py: { xs: 5, md: 6 } }}>
        <Container maxWidth="md">
          <Stack spacing={4} sx={{ alignItems: "center", textAlign: "center" }}>
            <Overline>The thesis</Overline>
            <Typography sx={{ fontSize: { xs: "1.02rem", md: "1.12rem" }, lineHeight: 1.9 }}>
              {CANON.thesis}
            </Typography>
            <Box>
              <Typography
                variant="h4"
                component="p"
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
            </Box>
          </Stack>
        </Container>
      </Box>

      <NewsletterCTA />
    </>
  );
}
