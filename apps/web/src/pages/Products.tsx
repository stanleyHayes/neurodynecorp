import { useMemo, useState } from "react";
import { Box, Container, Typography, Stack, Grid, Button, Chip } from "@mui/material";
import { Link } from "react-router";
import { motion } from "framer-motion";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import { Overline } from "@/components/shared/Marketing";
import MaturityBadge, { MaturityLegend } from "@/components/shared/MaturityBadge";
import { PLATFORMS, LABS, CLIENT_WORK, OPEN_SOURCE, type Project } from "@/content/projects";
import { CANON } from "@/content/company";

const MotionBox = motion.create(Box);

function ProductCard({ project, to, compact = false }: { project: Project; to: string; compact?: boolean }) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      sx={{ height: "100%" }}
    >
    <Box
      component={Link}
      to={to}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        p: compact ? 2.5 : { xs: 3, md: 3.5 },
        border: "1px solid",
        borderColor: "divider",
        textDecoration: "none",
        color: "inherit",
        transition: "border-color .25s ease, transform .25s ease",
        "&:hover, &:focus-visible": {
          borderColor: `${project.accent}66`,
          transform: "translateY(-2px)",
        },
      }}
    >
      <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between", gap: 1.5 }}>
        <Typography
          variant={compact ? "h6" : "h5"}
          component="h3"
          sx={{ fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1.2 }}
        >
          {project.name}
        </Typography>
        {project.maturity ? (
          <MaturityBadge maturity={project.maturity} size="small" />
        ) : project.engagement ? (
          <Typography
            component="span"
            sx={{
              fontFamily: "monospace",
              fontSize: "0.56rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "text.secondary",
              border: "1px solid",
              borderColor: "divider",
              px: 0.9,
              py: 0.3,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {project.engagement}
          </Typography>
        ) : null}
      </Stack>

      <Typography sx={{ mt: 1.25, fontWeight: 600, color: project.accent, fontSize: compact ? "0.85rem" : "0.9rem" }}>
        {project.tagline}
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mt: 1.5, lineHeight: 1.8, fontSize: compact ? "0.87rem" : "0.93rem", flexGrow: 1 }}
      >
        {project.summary}
      </Typography>

      <Typography
        sx={{
          mt: 2.5,
          fontFamily: "monospace",
          fontSize: "0.6rem",
          letterSpacing: "0.16em",
          color: "text.secondary",
          textTransform: "uppercase",
        }}
      >
        {project.industry}
      </Typography>
    </Box>
    </MotionBox>
  );
}

export default function Products() {
  const [sector, setSector] = useState<string | null>(null);

  const sectors = useMemo(
    () => Array.from(new Set(CLIENT_WORK.map((p) => p.category))).sort(),
    [],
  );

  const clientWork = useMemo(
    () => (sector ? CLIENT_WORK.filter((p) => p.category === sector) : CLIENT_WORK),
    [sector],
  );

  const platformLabels = useMemo(
    () => PLATFORMS.map((p) => p.maturity).filter((m): m is NonNullable<typeof m> => Boolean(m)),
    [],
  );

  return (
    <>
      <SEO
        title="Products"
        description="Neurodyne's platforms, experiments and engineering work — each carrying the maturity stage it is actually at."
        canonical="https://neurodyne.dev/products"
        ogUrl="https://neurodyne.dev/products"
      />

      <PageHero
        icon={<WidgetsOutlinedIcon />}
        title="Products"
        description="Four platforms, the experiments behind them, and the engineering work delivered for other organisations. Every item carries the stage it is actually at."
        tag="BUILD // LOG"
        accentWord="Products"
        iconColor="#8B85FF"
        iconLabel="PRODUCTS"
      />

      {/* ── Platforms ────────────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Overline color="#8B85FF">Platforms</Overline>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 800, mt: 1.5, letterSpacing: "-0.02em" }}>
          Neurodyne&rsquo;s own products
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 2, lineHeight: 1.9, maxWidth: 760 }}>
          {CANON.thesis}
        </Typography>

        <Box sx={{ mt: 3.5 }}>
          <MaturityLegend labels={platformLabels} />
        </Box>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          {PLATFORMS.map((p) => (
            <Grid key={p.slug} size={{ xs: 12, sm: 6 }}>
              <ProductCard project={p} to={`/products/${p.slug}`} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ── Open source ──────────────────────────────────────────────────── */}
      {OPEN_SOURCE.length > 0 && (
        <Box sx={{ borderTop: "1px solid", borderColor: "divider", py: { xs: 6, md: 9 } }}>
          <Container maxWidth="lg">
            <Stack
              direction={{ xs: "column", sm: "row" }}
              sx={{ alignItems: { sm: "flex-end" }, justifyContent: "space-between", gap: 2 }}
            >
              <Box>
                <Overline color="#E2E8F0">Open source</Overline>
                <Typography variant="h4" component="h2" sx={{ fontWeight: 800, mt: 1.5, letterSpacing: "-0.02em" }}>
                  Built to be open
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 2, lineHeight: 1.85, maxWidth: 680 }}>
                  Infrastructure that cannot be inspected is not infrastructure — it is a dependency. Each
                  item carries its own stage: what is published says so, and what is still being built says
                  that instead.
                </Typography>
              </Box>
              <Button
                component={Link}
                to="/open-source"
                endIcon={<ArrowForwardIcon />}
                sx={{ borderRadius: 0, fontWeight: 700, flexShrink: 0 }}
              >
                All open source
              </Button>
            </Stack>

            <Grid container spacing={2.5} sx={{ mt: 2 }}>
              {OPEN_SOURCE.map((p) => (
                <Grid key={p.slug} size={{ xs: 12, sm: 6 }}>
                  <ProductCard project={p} to={`/products/${p.slug}`} />
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* ── Labs ─────────────────────────────────────────────────────────── */}
      {LABS.length > 0 && (
        <Box sx={{ borderTop: "1px solid", borderColor: "divider", py: { xs: 6, md: 9 } }}>
          <Container maxWidth="lg">
            <Stack
              direction={{ xs: "column", sm: "row" }}
              sx={{ alignItems: { sm: "flex-end" }, justifyContent: "space-between", gap: 2 }}
            >
              <Box>
                <Overline color="#F59E0B">Neurodyne Labs</Overline>
                <Typography variant="h4" component="h2" sx={{ fontWeight: 800, mt: 1.5, letterSpacing: "-0.02em" }}>
                  Documented, not built
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 2, lineHeight: 1.85, maxWidth: 680 }}>
                  Concepts worked through to a full specification — the problem, the architecture and the
                  decisions — and then deliberately left there. This is a blueprint library, not a roadmap:
                  none of it is in development, and none of it is a commitment to ship.
                </Typography>
              </Box>
              <Button
                component={Link}
                to="/labs"
                endIcon={<ArrowForwardIcon />}
                startIcon={<ScienceOutlinedIcon />}
                sx={{ borderRadius: 0, fontWeight: 700, flexShrink: 0 }}
              >
                All of Labs
              </Button>
            </Stack>

            <Grid container spacing={2.5} sx={{ mt: 2 }}>
              {LABS.map((p) => (
                <Grid key={p.slug} size={{ xs: 12, sm: 6, md: 4 }}>
                  <ProductCard project={p} to={`/labs/${p.slug}`} compact />
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* ── Client work ──────────────────────────────────────────────────── */}
      {CLIENT_WORK.length > 0 && (
        <Box sx={{ borderTop: "1px solid", borderColor: "divider", py: { xs: 6, md: 9 } }}>
          <Container maxWidth="lg">
            <Overline color="#00D4AA">Engineering work</Overline>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 800, mt: 1.5, letterSpacing: "-0.02em" }}>
              Work for other organisations
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 2, lineHeight: 1.9, maxWidth: 760 }}>
              Systems engineered for others rather than owned by Neurodyne. They carry no maturity label,
              because the stage is not Neurodyne&rsquo;s to declare. Each is marked with the kind of
              engagement it is &mdash; commissioned work, a partnership, non-profit work, or a scope still
              under discussion &mdash; and clients are not named without permission.
            </Typography>

            <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1, mt: 3.5 }} role="group" aria-label="Filter by sector">
              {/* Selected state was carried by fill alone, which neither a
                  screen reader nor a keyboard user can perceive. */}
              <Chip
                label="All"
                onClick={() => setSector(null)}
                variant={sector === null ? "filled" : "outlined"}
                aria-pressed={sector === null}
                role="button"
                sx={{ borderRadius: 0, "&:focus-visible": { outline: "2px solid #00D4AA", outlineOffset: 2 } }}
              />
              {sectors.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  onClick={() => setSector(s === sector ? null : s)}
                  variant={sector === s ? "filled" : "outlined"}
                  aria-pressed={sector === s}
                  role="button"
                  sx={{ borderRadius: 0, "&:focus-visible": { outline: "2px solid #00D4AA", outlineOffset: 2 } }}
                />
              ))}
            </Stack>

            <Grid container spacing={2.5} sx={{ mt: 2 }}>
              {clientWork.map((p) => (
                <Grid key={p.slug} size={{ xs: 12, sm: 6, md: 4 }}>
                  <ProductCard project={p} to={`/work/${p.slug}`} compact />
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <Box sx={{ borderTop: "1px solid", borderColor: "divider", py: { xs: 6, md: 9 }, textAlign: "center" }}>
        <Container maxWidth="sm">
          <Typography variant="h5" component="h2" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
            Building something that needs this infrastructure?
          </Typography>
          <Button
            component={Link}
            to="/partners"
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{ borderRadius: 0, px: 4, py: 1.5, mt: 3 }}
          >
            Partner With Neurodyne
          </Button>
        </Container>
      </Box>
    </>
  );
}
