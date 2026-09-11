import { ReactNode } from "react";
import { Box, Button, Chip, Container, Grid, Stack, Typography } from "@mui/material";
import { Link } from "react-router";
import { motion, useReducedMotion } from "framer-motion";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import TerminalOutlinedIcon from "@mui/icons-material/TerminalOutlined";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import NewsletterCTA from "@/components/shared/NewsletterCTA";
import HudCorners from "@/components/shared/HudCorners";
import { Overline } from "@/components/shared/Marketing";
import { WatermarkConstellation } from "@/components/shared/Watermark";
import { CANON, PILLARS, WHY_AFRICA } from "@/content/company";
import { NOSI, SOLUTIONS } from "@/content/positioning";

const MotionBox = motion.create(Box);

const PILLAR_ICONS: Record<string, ReactNode> = {
  "ai-developer-infrastructure": <TerminalOutlinedIcon />,
  "digital-public-infrastructure": <AccountTreeOutlinedIcon />,
  platforms: <LayersOutlinedIcon />,
  labs: <ScienceOutlinedIcon />,
};

const MONO = {
  fontFamily: "monospace",
  fontSize: "0.62rem",
  letterSpacing: "0.2em",
  textTransform: "uppercase" as const,
};

/**
 * Mirrors the look of `SectionHeading` from @/components/shared/Marketing while
 * pinning the semantic level to <h2>, so this page keeps a valid h1 → h2 → h3
 * outline underneath PageHero's h1.
 */
function SectionTitle({
  tag,
  title,
  lead,
  color = "#6C63FF",
  align = "left",
}: {
  tag?: string;
  title: string;
  lead?: string;
  color?: string;
  align?: "left" | "center";
}) {
  return (
    <Stack
      spacing={1.5}
      sx={{
        mb: { xs: 3, md: 4 },
        textAlign: align,
        alignItems: align === "center" ? "center" : "flex-start",
      }}
    >
      {tag && <Overline color={color}>{tag}</Overline>}
      <Typography variant="h4" component="h2" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
        {title}
      </Typography>
      {lead && (
        <Typography
          variant="h6"
          component="p"
          color="text.secondary"
          sx={{ fontWeight: 400, maxWidth: 760, opacity: 0.8 }}
        >
          {lead}
        </Typography>
      )}
    </Stack>
  );
}

export default function Infrastructure() {
  const reduceMotion = useReducedMotion();
  const rise = (delay = 0) => ({
    initial: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: reduceMotion ? 0.2 : 0.45, delay: reduceMotion ? 0 : delay },
  });

  return (
    <>
      <SEO
        title="Infrastructure"
        description="The four pillars of Neurodyne's infrastructure work — AI and developer infrastructure, digital public infrastructure, platforms, and Labs — and the African conditions each one is designed around."
      />

      <PageHero
        icon={<HubOutlinedIcon />}
        iconLabel="NDC-INFRA"
        tag="What we're building"
        title="Infrastructure"
        accentWord="Infrastructure"
        description={CANON.short}
        iconColor="#00D4AA"
      />

      {/* ── The thesis ───────────────────────────────────────────────────── */}
      <Box
        component="section"
        sx={{ position: "relative", py: { xs: 7, md: 11 }, overflow: "hidden" }}
      >
        <WatermarkConstellation
          items={[{ icon: <HubOutlinedIcon />, at: { top: "-12%", right: "0%" }, size: 400 }]}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={{ xs: 3, md: 8 }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Overline>The thesis</Overline>
              <Typography
                variant="h3"
                component="h2"
                sx={{ fontWeight: 800, mt: 1.5, letterSpacing: "-0.02em", lineHeight: 1.15 }}
              >
                Products and infrastructure are the same strategy.
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
                          ...MONO,
                          fontSize: "0.7rem",
                          letterSpacing: "0.14em",
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

      {/* ── The four pillars ─────────────────────────────────────────────── */}
      <Box
        component="section"
        sx={{ borderTop: "1px solid", borderColor: "divider", py: { xs: 7, md: 11 } }}
      >
        <Container maxWidth="lg">
          <SectionTitle
            tag="Structure"
            title="Four pillars, one system"
            lead="Everything Neurodyne builds sits under one of four pillars. Each one exists because the others need it to."
          />

          <Stack spacing={{ xs: 4, md: 6 }} sx={{ mt: { xs: 4, md: 6 } }}>
            {PILLARS.map((pillar, i) => (
              <MotionBox
                key={pillar.slug}
                id={pillar.slug}
                {...rise((i % 2) * 0.05)}
                sx={{
                  position: "relative",
                  p: { xs: 3, md: 5 },
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: `${pillar.accent}08`,
                  transition: "border-color .3s ease, background .3s ease",
                  "&:hover": { borderColor: `${pillar.accent}44` },
                }}
              >
                <HudCorners color={`${pillar.accent}44`} />
                <Grid container spacing={{ xs: 3, md: 6 }} sx={{ alignItems: "flex-start" }}>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 2 }}>
                      <Box
                        aria-hidden
                        sx={{ color: pillar.accent, display: "flex", "& .MuiSvgIcon-root": { fontSize: 34 } }}
                      >
                        {PILLAR_ICONS[pillar.slug]}
                      </Box>
                      <Typography component="span" sx={{ ...MONO, color: pillar.accent }}>
                        Pillar {String(i + 1).padStart(2, "0")}
                      </Typography>
                    </Stack>

                    <Typography
                      variant="h4"
                      component="h3"
                      sx={{ fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.15 }}
                    >
                      {pillar.name}
                    </Typography>
                    <Typography
                      sx={{ mt: 1.5, fontWeight: 600, color: pillar.accent, fontSize: "0.95rem", lineHeight: 1.6 }}
                    >
                      {pillar.tagline}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      sx={{ mt: 2, lineHeight: 1.9, fontSize: "0.97rem" }}
                    >
                      {pillar.summary}
                    </Typography>

                    <Button
                      component={Link}
                      to={pillar.to}
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        borderRadius: 0,
                        mt: 3,
                        px: 0,
                        fontWeight: 700,
                        color: pillar.accent,
                        "&:hover, &:focus-visible": { background: `${pillar.accent}14` },
                      }}
                    >
                      Go to {pillar.name}
                    </Button>
                  </Grid>

                  <Grid size={{ xs: 12, md: 7 }}>
                    <Overline color={pillar.accent}>What sits here</Overline>
                    <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mt: 0.5 }}>
                      {pillar.scope.map((item, si) => (
                        <Grid key={item} size={{ xs: 12, sm: 6 }}>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            sx={{
                              alignItems: "flex-start",
                              borderTop: "1px solid",
                              borderColor: "divider",
                              py: 1.5,
                              height: "100%",
                            }}
                          >
                            <Typography
                              component="span"
                              aria-hidden
                              sx={{ ...MONO, color: pillar.accent, mt: 0.3, opacity: 0.8 }}
                            >
                              {String(si + 1).padStart(2, "0")}
                            </Typography>
                            <Typography
                              color="text.secondary"
                              sx={{ fontSize: "0.93rem", lineHeight: 1.7 }}
                            >
                              {item}
                            </Typography>
                          </Stack>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                </Grid>
              </MotionBox>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ── NOSI — named initiative under Digital Public Infrastructure ──── */}
      <Box
        component="section"
        id="nosi"
        sx={{
          position: "relative",
          borderTop: "1px solid",
          borderColor: "divider",
          py: { xs: 7, md: 11 },
          overflow: "hidden",
        }}
      >
        <WatermarkConstellation
          tone="accent"
          items={[{ icon: <AccountTreeOutlinedIcon />, at: { bottom: "-14%", left: "-4%" }, size: 380 }]}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <SectionTitle
            tag="Initiative · Digital Public Infrastructure"
            title="The Neurodyne Open Standards Initiative (NOSI)"
            lead="The interoperability work under the second pillar, given a name so it can be adopted by people who do not work here."
            color="#00D4AA"
          />

          <Grid container spacing={{ xs: 3, md: 6 }} sx={{ alignItems: "flex-start" }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={2}>
                {NOSI.intro.map((p) => (
                  <Typography key={p} color="text.secondary" sx={{ lineHeight: 1.9, fontSize: "1rem" }}>
                    {p}
                  </Typography>
                ))}
                <Typography color="text.secondary" sx={{ lineHeight: 1.9, fontSize: "1rem" }}>
                  NOSI is being established, not reported on. There are no adopters, no member
                  organisations and no ratified specifications yet — what exists is the design work
                  and the intent to publish it openly as it is written.
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  position: "relative",
                  p: { xs: 3, md: 4 },
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "action.hover",
                }}
              >
                <HudCorners color="rgba(0,212,170,0.35)" />
                <Overline color="#00D4AA">The core belief</Overline>
                <Typography variant="h5" component="h3" sx={{ fontWeight: 800, mt: 1.5, lineHeight: 1.35 }}>
                  Software is temporary.
                  <br />
                  Data lives forever.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, lineHeight: 1.8 }}>
                  The standard describes what information means, not the technology that stores it.
                  Whether a system runs PostgreSQL, MongoDB, MySQL or SQL Server is irrelevant — if
                  two systems speak the same language, they can exchange records without a bespoke
                  integration between them.
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: { xs: 5, md: 7 } }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 800, letterSpacing: "-0.01em" }}>
              Intended domains
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, mb: 3, lineHeight: 1.8, maxWidth: 760, fontSize: "0.95rem" }}>
              The domains the initiative is being scoped around. These are areas of intended work —
              none of them is an active committee, and none has participants to announce.
            </Typography>
            <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
              {NOSI.workingGroups.map((g) => (
                <Box
                  key={g}
                  component="span"
                  sx={{
                    ...MONO,
                    fontSize: "0.68rem",
                    letterSpacing: "0.12em",
                    border: "1px solid",
                    borderColor: "rgba(0,212,170,0.28)",
                    color: "text.secondary",
                    px: 1.4,
                    py: 0.6,
                  }}
                >
                  {g}
                </Box>
              ))}
            </Stack>
          </Box>

          <Box sx={{ mt: { xs: 5, md: 7 } }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 800, letterSpacing: "-0.01em" }}>
              Who it is being designed for
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, mb: 3, lineHeight: 1.8, maxWidth: 760, fontSize: "0.95rem" }}>
              A standard written by one company is a file format. NOSI is intended to be reviewed and
              revised by the people who would have to live with it.
            </Typography>
            <Grid container spacing={2}>
              {NOSI.join.map((who, i) => (
                <Grid key={who} size={{ xs: 6, sm: 4, md: 2 }}>
                  <MotionBox
                    {...rise((i % 6) * 0.04)}
                    sx={{
                      position: "relative",
                      height: "100%",
                      p: 2.25,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                    }}
                  >
                    <Box
                      aria-hidden
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: 3,
                        height: "100%",
                        bgcolor: i % 2 ? "primary.main" : "#00D4AA",
                      }}
                    />
                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>{who}</Typography>
                  </MotionBox>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* ── Shared platform capabilities ─────────────────────────────────── */}
      <Box
        component="section"
        sx={{ borderTop: "1px solid", borderColor: "divider", py: { xs: 7, md: 11 } }}
      >
        <Container maxWidth="lg">
          <SectionTitle
            tag="Shared layer"
            title="Capabilities built once, reused across platforms"
            lead="Authentication, payments, notifications, workflows, AI, analytics, identity, permissions, messaging and search are the parts every platform would otherwise rebuild. They are engineered once and carried forward."
          />
          <Grid container spacing={3} sx={{ mt: { xs: 2, md: 4 } }}>
            {SOLUTIONS.map((s, i) => {
              const accent = ["#6C63FF", "#00D4AA", "#8B85FF", "#F59E0B"][i % 4]!;
              return (
                <Grid key={s.slug} size={{ xs: 12, md: 6 }}>
                  <MotionBox
                    {...rise((i % 2) * 0.05)}
                    sx={{
                      height: "100%",
                      p: { xs: 3, md: 3.5 },
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "border-color .25s ease",
                      "&:hover": { borderColor: `${accent}55` },
                    }}
                  >
                    <Box aria-hidden sx={{ width: 28, height: 2, background: accent, mb: 2 }} />
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 800, letterSpacing: "-0.01em" }}>
                      {s.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 1, lineHeight: 1.8, fontSize: "0.93rem" }}>
                      {s.blurb}
                    </Typography>
                    <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1, mt: 2.5 }}>
                      {s.capabilities.map((c) => (
                        <Chip
                          key={c}
                          label={c}
                          size="small"
                          sx={{
                            borderRadius: 0,
                            fontFamily: "monospace",
                            fontSize: "0.68rem",
                            letterSpacing: "0.04em",
                            bgcolor: "transparent",
                            border: "1px solid",
                            borderColor: `${accent}40`,
                            color: "text.secondary",
                          }}
                        />
                      ))}
                    </Stack>
                  </MotionBox>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* ── Why Africa ───────────────────────────────────────────────────── */}
      <Box
        component="section"
        id="why-africa"
        sx={{
          position: "relative",
          borderTop: "1px solid",
          borderColor: "divider",
          py: { xs: 7, md: 11 },
          overflow: "hidden",
        }}
      >
        <WatermarkConstellation
          items={[{ icon: <PublicOutlinedIcon />, at: { top: "-8%", right: "-3%" }, size: 420 }]}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <SectionTitle tag="Design conditions" title={WHY_AFRICA.title} lead={WHY_AFRICA.lead} color="#00D4AA" />

          <Stack sx={{ mt: { xs: 3, md: 5 } }}>
            {WHY_AFRICA.conditions.map((c, i) => (
              <MotionBox
                key={c.title}
                {...rise(0)}
                sx={{
                  borderTop: "1px solid",
                  borderColor: "divider",
                  py: { xs: 3, md: 4 },
                  ...(i === WHY_AFRICA.conditions.length - 1 && {
                    borderBottom: "1px solid",
                    borderBottomColor: "divider",
                  }),
                }}
              >
                <Grid container spacing={{ xs: 2, md: 5 }} sx={{ alignItems: "flex-start" }}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography component="span" sx={{ ...MONO, color: "#00D4AA", opacity: 0.85 }}>
                      Condition {String(i + 1).padStart(2, "0")}
                    </Typography>
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{ fontWeight: 800, mt: 1, letterSpacing: "-0.01em", lineHeight: 1.3 }}
                    >
                      {c.title}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography component="span" sx={{ ...MONO, color: "text.secondary", opacity: 0.6 }}>
                      Reality
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 1, lineHeight: 1.85, fontSize: "0.95rem" }}>
                      {c.reality}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography component="span" sx={{ ...MONO, color: "#00D4AA", opacity: 0.85 }}>
                      Implication for the build
                    </Typography>
                    <Typography
                      sx={{
                        mt: 1,
                        lineHeight: 1.85,
                        fontSize: "0.95rem",
                        borderLeft: "2px solid",
                        borderColor: "#00D4AA",
                        pl: 2,
                      }}
                    >
                      {c.implication}
                    </Typography>
                  </Grid>
                </Grid>
              </MotionBox>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ── Closing CTA ──────────────────────────────────────────────────── */}
      <Box
        component="section"
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          py: { xs: 7, md: 11 },
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Overline color="#00D4AA">Partnership</Overline>
          <Typography
            variant="h3"
            component="h2"
            sx={{ fontWeight: 900, mt: 2, letterSpacing: "-0.02em", lineHeight: 1.15 }}
          >
            Infrastructure is only useful if other people can build on it.
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2.5, lineHeight: 1.9, fontSize: "1rem" }}>
            Governments and institutions, companies, developers, and investors each meet this work at
            a different layer. The partnership page sets out what engaging actually looks like for
            each of them.
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mt: 4.5, justifyContent: "center" }}
          >
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
            <Button
              component={Link}
              to="/products"
              variant="outlined"
              size="large"
              sx={{ borderRadius: 0, px: 4, py: 1.5 }}
            >
              See the platforms
            </Button>
          </Stack>

          <Typography
            variant="h5"
            sx={{
              mt: { xs: 6, md: 8 },
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
          <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: "0.92rem" }}>
            {CANON.geography}
          </Typography>
        </Container>
      </Box>

      <NewsletterCTA />
    </>
  );
}
