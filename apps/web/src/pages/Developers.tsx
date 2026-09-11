import EditorialGrid from "@/components/shared/EditorialGrid";
import { DEVELOPER_PRINCIPLES } from "@/content/interface";
import { Box, Container, Typography, Stack, Grid, Button } from "@mui/material";
import { motion, useReducedMotion } from "framer-motion";
import TerminalOutlinedIcon from "@mui/icons-material/TerminalOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import DataObjectOutlinedIcon from "@mui/icons-material/DataObjectOutlined";
import GitHubIcon from "@mui/icons-material/GitHub";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import HudCorners from "@/components/shared/HudCorners";
import MaturityBadge, { MaturityLegend } from "@/components/shared/MaturityBadge";
import CommunityBlock from "@/components/shared/CommunityBlock";
import NewsletterCTA from "@/components/shared/NewsletterCTA";
import { Overline } from "@/components/shared/Marketing";
import { WatermarkConstellation, BlueprintGrid } from "@/components/shared/Watermark";
import { PILLARS, FOUNDER, type Pillar } from "@/content/company";
import type { Maturity } from "@/content/maturity";

const MotionBox = motion.create(Box);

/**
 * Pillar 1 as a developer destination.
 *
 * Hard rule for this page: nothing described here is publicly available. There
 * is no package to install, no endpoint to call and no key to request, so this
 * page contains no code samples, no URLs and no documentation links that would
 * imply otherwise. A developer who tries a fake artifact and finds nothing is
 * worse off than a developer who read an honest plan.
 */

/** Canonical pillar record. Cast is safe: the slug is defined in content/company.ts. */
const PILLAR = (PILLARS.find((p) => p.slug === "ai-developer-infrastructure") ??
  PILLARS[0]) as Pillar;

interface Surface {
  name: string;
  /** Index into the pillar's canonical scope list — the label is not retyped here. */
  scopeIndex: number;
  maturity: Maturity;
  accent: string;
  body: string;
  /** What has to be true before this stops being a plan. */
  gate: string;
}

const SURFACES: Surface[] = [
  {
    name: "SDKs",
    scopeIndex: 3,
    maturity: "IN DEVELOPMENT",
    accent: "#6C63FF",
    body:
      "Client libraries for the payment, identity and messaging integrations each Neurodyne platform has already had to build privately. They are being extracted from code those platforms already had to get right, rather than written speculatively against a spec.",
    gate: "Published when a second platform has used the library instead of its own copy.",
  },
  {
    name: "AI Agent Skills",
    scopeIndex: 0,
    maturity: "IN DEVELOPMENT",
    accent: "#8B85FF",
    body:
      "Packaged instructions that let an AI agent carry out a real African workflow — initiating a mobile money collection, reconciling a wallet settlement, validating an identity document format — instead of guessing at an interface nobody documented.",
    gate: "Published when a skill completes its workflow against a live service without hand-holding.",
  },
  {
    name: "MCP Servers",
    scopeIndex: 1,
    maturity: "IN DEVELOPMENT",
    accent: "#00D4AA",
    body:
      "Model Context Protocol servers exposing the same capabilities to any MCP-capable agent, so the integration work is done once and reused rather than rebuilt inside every assistant.",
    gate: "Published when the server is stable enough that a breaking change would be a versioned release, not a surprise.",
  },
  {
    name: "African API Registry",
    scopeIndex: 2,
    maturity: "RESEARCH",
    accent: "#F59E0B",
    body:
      "A catalogue of which African digital services are actually reachable by software: what exists, who operates it, whether it is documented, what access requires, and what breaks in practice. Right now this is a cataloguing exercise, not a running service.",
    gate: "Becomes real when the catalogue is complete enough to be wrong in public and get corrected.",
  },
  {
    name: "Open-source libraries",
    scopeIndex: 4,
    maturity: "IN DEVELOPMENT",
    accent: "#6C63FF",
    body:
      "Reference implementations for the parts every company here rewrites: wallet reconciliation, retry and idempotency behaviour over unreliable mobile data, identity format validation across several authorities.",
    gate: "Published under an open licence when the implementation is correct enough for someone else to depend on.",
  },
  {
    name: "Documentation",
    scopeIndex: 5,
    maturity: "RESEARCH",
    accent: "#94A3B8",
    body:
      "Documentation is treated as a deliverable rather than a byproduct — the failure modes, the rate limits, the things that go wrong at settlement time. Until an interface is stable enough to document honestly, there is nothing worth publishing.",
    gate: "Written alongside the first interface that stops changing weekly.",
  },
];


const USED_MATURITIES: Maturity[] = ["IN DEVELOPMENT", "RESEARCH"];

export default function Developers() {
  const reduceMotion = useReducedMotion();
  const rise = reduceMotion ? 0 : 16;

  return (
    <>
      <SEO
        title="Developers"
        description="AI and developer infrastructure for African services — SDKs, agent skills, MCP servers and an API registry. Everything on this page is in development or research, and labelled as such."
      />

      <Container maxWidth="lg" sx={{ pt: 0, pb: { xs: 6, md: 9 }, position: "relative" }}>
        <BlueprintGrid opacity={0.7} />
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <PageHero
            icon={<TerminalOutlinedIcon />}
            iconLabel="DEV-INFRA"
            tag="AI & Developer Infrastructure"
            title="Build for Africa with Neurodyne"
            accentWord="Neurodyne"
            description={PILLAR.tagline}
            iconColor="#6C63FF"
          />
        </Box>
      </Container>

      {/* ── The gap ──────────────────────────────────────────────────────── */}
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
          items={[{ icon: <CodeOutlinedIcon />, at: { top: "-10%", left: "-4%" }, size: 380 }]}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={{ xs: 4, md: 8 }} sx={{ alignItems: "flex-start" }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Overline>The gap</Overline>
              <Typography
                variant="h4"
                component="h2"
                sx={{ fontWeight: 800, mt: 1.5, letterSpacing: "-0.02em", lineHeight: 1.2 }}
              >
                Africa&rsquo;s digital services are reachable by people, not by software.
              </Typography>
              <Stack spacing={2.5} sx={{ mt: 3 }}>
                <Typography color="text.secondary" sx={{ lineHeight: 1.95, fontSize: "1.02rem" }}>
                  Mobile money, identity, logistics and government data all work — through an app, a
                  portal, a USSD string, a person at a counter. Very little of it is reachable by
                  another program through a stable, documented interface with predictable failure
                  behaviour.
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.95, fontSize: "1.02rem" }}>
                  So every company here rebuilds the same integrations. The same wallet
                  reconciliation logic, the same retry behaviour over intermittent mobile data, the
                  same identity checks against several authorities that each trust a different
                  document. The work is repeated, privately, by everyone, and none of it compounds.
                </Typography>
                <Typography sx={{ lineHeight: 1.95, fontSize: "1.02rem", color: "#00D4AA" }}>
                  That duplicated cost is the gap this pillar exists to close.
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
                <HudCorners color="rgba(108,99,255,0.35)" />
                <Overline>Pillar scope</Overline>
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{ fontWeight: 800, mt: 1.5, lineHeight: 1.4 }}
                >
                  {PILLAR.name}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.85, fontSize: "0.93rem" }}>
                  {PILLAR.summary}
                </Typography>
                <Stack component="ul" spacing={1.25} sx={{ m: 0, mt: 3, p: 0, listStyle: "none" }}>
                  {PILLAR.scope.map((item) => (
                    <Stack
                      key={item}
                      component="li"
                      direction="row"
                      spacing={1.5}
                      sx={{ alignItems: "flex-start" }}
                    >
                      <Box
                        aria-hidden
                        sx={{ width: 6, height: 6, mt: 1.1, background: "#6C63FF", flexShrink: 0 }}
                      />
                      <Typography color="text.secondary" sx={{ fontSize: "0.9rem", lineHeight: 1.7 }}>
                        {item}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Status, stated before anything is described ──────────────────── */}
      <Box sx={{ borderTop: "1px solid", borderColor: "divider", py: { xs: 5, md: 6 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              position: "relative",
              p: { xs: 3, md: 4 },
              border: "1px solid",
              borderColor: "rgba(245,158,11,0.35)",
              bgcolor: "rgba(245,158,11,0.05)",
            }}
          >
            <HudCorners color="rgba(245,158,11,0.35)" />
            <Overline color="#F59E0B">Status</Overline>
            <Typography
              variant="h5"
              component="h2"
              sx={{ fontWeight: 800, mt: 1.5, letterSpacing: "-0.01em", lineHeight: 1.35 }}
            >
              None of this is available to use yet.
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 2, lineHeight: 1.9, maxWidth: 820 }}>
              Everything below is a plan, labelled with the stage it is actually at. There is no
              package to install, no endpoint to call, no key to request and no reference to read —
              which is why this page contains no install command and no sample request. When there
              is a real developer surface, it will live at{" "}
              <Box component="span" sx={{ fontFamily: "monospace", color: "text.primary" }}>
                developers.neurodyne.dev
              </Box>
              , and it will ship with documentation rather than an announcement.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <MaturityLegend labels={USED_MATURITIES} />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── The planned developer surface ────────────────────────────────── */}
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
          items={[
            { icon: <HubOutlinedIcon />, at: { top: "-6%", right: "-4%" }, size: 360, tone: "brand" },
            { icon: <DataObjectOutlinedIcon />, at: { bottom: "-10%", left: "-4%" }, size: 320 },
          ]}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Stack spacing={1.5} sx={{ mb: { xs: 3, md: 4 } }}>
            <Overline>What is being built</Overline>
            <Typography
              variant="h4"
              component="h2"
              sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}
            >
              The developer surface, and where each part actually stands
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 760, opacity: 0.8 }}>
              Six pieces. Each one carries its stage and the condition that has to be met before it
              is published.
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {SURFACES.map((s, i) => (
              <Grid key={s.name} size={{ xs: 12, md: 6 }}>
                <MotionBox
                  initial={{ opacity: 0, y: rise }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: reduceMotion ? 0 : (i % 2) * 0.06 }}
                  sx={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    p: { xs: 3, md: 3.5 },
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "border-color .25s ease, background .25s ease",
                    "&:hover, &:focus-visible": {
                      borderColor: `${s.accent}66`,
                      bgcolor: `${s.accent}0A`,
                    },
                  }}
                >
                  <HudCorners />
                  <Box
                    aria-hidden
                    sx={{ position: "absolute", top: 0, left: 0, width: 40, height: 2, background: s.accent }}
                  />
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}
                  >
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 800, letterSpacing: "-0.01em" }}>
                      {s.name}
                    </Typography>
                    <MaturityBadge maturity={s.maturity} size="small" />
                  </Stack>

                  <Typography
                    sx={{
                      mt: 1.25,
                      fontFamily: "monospace",
                      fontSize: "0.62rem",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: s.accent,
                      lineHeight: 1.6,
                    }}
                  >
                    {PILLAR.scope[s.scopeIndex] ?? s.name}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{ mt: 2, lineHeight: 1.85, fontSize: "0.94rem", flexGrow: 1 }}
                  >
                    {s.body}
                  </Typography>

                  <Box sx={{ mt: 2.5, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
                    <Typography
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.62rem",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "text.secondary",
                        opacity: 0.7,
                      }}
                    >
                      Ships when
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.75, fontSize: "0.88rem", lineHeight: 1.7 }}>
                      {s.gate}
                    </Typography>
                  </Box>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── How it gets built ────────────────────────────────────────────── */}
      <Box sx={{ borderTop: "1px solid", borderColor: "divider", py: { xs: 5, md: 6 } }}>
        <Container maxWidth="lg">
          <Stack spacing={1.5} sx={{ mb: { xs: 3, md: 4 } }}>
            <Overline color="#00D4AA">How it gets built</Overline>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
              Three rules this work is held to
            </Typography>
          </Stack>
          <EditorialGrid items={DEVELOPER_PRINCIPLES.map((p, i) => ({ title: p.k, description: p.v, icon: [<DataObjectOutlinedIcon />, <CodeOutlinedIcon />, <HubOutlinedIcon />][i] }))} />
        </Container>
      </Box>

      {/* ── The one thing you can actually look at ───────────────────────── */}
      <Box sx={{ borderTop: "1px solid", borderColor: "divider", py: { xs: 5, md: 6 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 8 }} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Overline>Available today</Overline>
              <Typography
                variant="h4"
                component="h2"
                sx={{ fontWeight: 800, mt: 1.5, letterSpacing: "-0.02em", lineHeight: 1.2 }}
              >
                One real link, rather than six imaginary ones.
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 2.5, lineHeight: 1.9, maxWidth: 640 }}>
                Neurodyne is founder-led, and the only public code behind this pillar today sits on
                the founder&rsquo;s GitHub. It is not a Neurodyne SDK and it is not presented as
                one — it is the engineering record underneath these plans, and the honest thing to
                point at while the rest is still being written.
              </Typography>
              <Stack direction="row" sx={{ flexWrap: "wrap", gap: 2, mt: 3.5 }}>
                {FOUNDER.links.map((l) => (
                  <Button
                    key={l.label}
                    component="a"
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    startIcon={<GitHubIcon />}
                    sx={{
                      borderRadius: 0,
                      px: 3,
                      py: 1.25,
                      fontWeight: 700,
                      "&:hover, &:focus-visible": { borderColor: "#6C63FF", bgcolor: "rgba(108,99,255,0.08)" },
                    }}
                  >
                    {FOUNDER.name} on {l.label}
                  </Button>
                ))}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  position: "relative",
                  p: { xs: 3, md: 4 },
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <HudCorners />
                <Overline>This page</Overline>
                <Typography color="text.secondary" sx={{ mt: 2, lineHeight: 1.9, fontSize: "0.93rem" }}>
                  This is the plan for Neurodyne&rsquo;s developer infrastructure, published early so
                  it can be argued with. It is not a product page, and it is not a waitlist dressed
                  up as one.
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 2, lineHeight: 1.9, fontSize: "0.93rem" }}>
                  When there is something to install, call and read,{" "}
                  <Box component="span" sx={{ fontFamily: "monospace", color: "text.primary" }}>
                    developers.neurodyne.dev
                  </Box>{" "}
                  will host it. Until then, this page stays a plan and says so.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Community ────────────────────────────────────────────────────── */}
      <Box sx={{ borderTop: "1px solid", borderColor: "divider", py: { xs: 5, md: 6 } }}>
        <Container maxWidth="lg">
          <CommunityBlock />
        </Container>
      </Box>

      <NewsletterCTA />
    </>
  );
}
