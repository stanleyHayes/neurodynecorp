import { Box, Container, Typography, Stack, Grid, Chip, Button, Divider } from "@mui/material";
import { Link, useParams, Navigate } from "react-router";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import ArchitectureOutlinedIcon from "@mui/icons-material/ArchitectureOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import SEO from "@/components/seo/SEO";
import { Overline } from "@/components/shared/Marketing";
import { WatermarkConstellation, BlueprintGrid, IconWatermark } from "@/components/shared/Watermark";
import HudCorners from "@/components/shared/HudCorners";
import { getProject, PROJECTS } from "@/content/projects";

const MotionBox = motion.create(Box);

function Section({
  tag,
  title,
  icon,
  accent,
  children,
}: {
  tag: string;
  title: string;
  icon: React.ReactNode;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45 }}
    >
      <Grid container spacing={{ xs: 2, md: 5 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1 }}>
            <Box sx={{ color: accent, display: "flex", "& .MuiSvgIcon-root": { fontSize: 26 } }}>{icon}</Box>
            <Overline color={accent}>{tag}</Overline>
          </Stack>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1.3 }}>
            {title}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>{children}</Grid>
      </Grid>
    </MotionBox>
  );
}

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const project = slug ? getProject(slug) : undefined;

  if (!project) return <Navigate to="/projects" replace />;

  const idx = PROJECTS.findIndex((p) => p.slug === project.slug);
  const next = PROJECTS[(idx + 1) % PROJECTS.length]!;
  const accent = project.accent;

  return (
    <>
      <SEO
        title={`${project.name} | NeuroDyne Corp`}
        description={project.summary}
      />

      {/* Hero */}
      <Box sx={{ position: "relative", overflow: "hidden", borderBottom: "1px solid", borderColor: "divider" }}>
        <BlueprintGrid opacity={0.8} />
        <IconWatermark
          icon={<LayersOutlinedIcon />}
          size={{ xs: 300, md: 460 }}
          sx={{ top: "-8%", right: "-4%" }}
          tone="brand"
        />
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 }, position: "relative", zIndex: 1 }}>
          <Button
            component={Link}
            to="/projects"
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 3, borderRadius: 0, color: "text.secondary", fontSize: "0.8rem" }}
          >
            All projects
          </Button>

          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1.5, alignItems: "center", mb: 2 }}>
            <Overline color={accent}>{project.category}</Overline>
            <Box sx={{ width: 4, height: 4, bgcolor: "text.secondary", opacity: 0.4 }} />
            <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "text.secondary", letterSpacing: "0.1em" }}>
              {project.industry.toUpperCase()}
            </Typography>
            <Box sx={{ width: 4, height: 4, bgcolor: "text.secondary", opacity: 0.4 }} />
            <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: accent, letterSpacing: "0.1em" }}>
              {project.status.toUpperCase()} · {project.year}
            </Typography>
          </Stack>

          <Typography
            variant="h2"
            sx={{ fontWeight: 900, letterSpacing: "-0.03em", fontSize: { xs: "2.4rem", md: "4rem" }, lineHeight: 1.05 }}
          >
            {project.name}
          </Typography>
          <Typography
            sx={{ color: accent, fontSize: { xs: "1.05rem", md: "1.3rem" }, fontWeight: 500, mt: 1.5, maxWidth: 760 }}
          >
            {project.tagline}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2.5, lineHeight: 1.9, maxWidth: 720, fontSize: "1.02rem" }}>
            {project.summary}
          </Typography>

          <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.75, mt: 3.5 }}>
            {project.stack.map((t) => (
              <Chip
                key={t}
                label={t}
                size="small"
                sx={{
                  borderRadius: 0,
                  fontFamily: "monospace",
                  fontSize: "0.65rem",
                  bgcolor: "transparent",
                  border: "1px solid",
                  borderColor: `${accent}40`,
                  color: "text.secondary",
                }}
              />
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Body */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={{ xs: 6, md: 9 }}>
          <Section tag="The problem" title="What was broken" icon={<ReportProblemOutlinedIcon />} accent="#EF4444">
            <Stack spacing={2}>
              {project.problem.map((p, i) => (
                <Typography key={i} color="text.secondary" sx={{ lineHeight: 1.95, fontSize: "1.02rem" }}>
                  {p}
                </Typography>
              ))}
            </Stack>
          </Section>

          <Divider />

          <Section tag="The approach" title="How we engineered it" icon={<ArchitectureOutlinedIcon />} accent={accent}>
            <Stack spacing={2}>
              {project.approach.map((p, i) => (
                <Typography key={i} color="text.secondary" sx={{ lineHeight: 1.95, fontSize: "1.02rem" }}>
                  {p}
                </Typography>
              ))}
            </Stack>

            <Box sx={{ position: "relative", mt: 3.5, p: { xs: 2.5, md: 3 }, border: "1px solid", borderColor: "divider", bgcolor: "action.hover" }}>
              <HudCorners color={`${accent}44`} />
              <Overline color={accent}>Capabilities</Overline>
              <Grid container spacing={1.25} sx={{ mt: 0.5 }}>
                {project.capabilities.map((c) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={c}>
                    <Stack direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
                      <Box sx={{ mt: "9px", width: 6, height: 6, flexShrink: 0, bgcolor: accent, opacity: 0.8 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {c}
                      </Typography>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Section>

          <Divider />

          <Section tag="Who it serves" title="The people on the other side" icon={<GroupsOutlinedIcon />} accent="#8B85FF">
            <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
              {project.audience.map((a) => (
                <Box
                  key={a}
                  sx={{
                    px: 2,
                    py: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    fontSize: "0.85rem",
                    color: "text.secondary",
                  }}
                >
                  {a}
                </Box>
              ))}
            </Stack>
          </Section>

          <Divider />

          <Box sx={{ position: "relative", overflow: "hidden", py: { xs: 4, md: 6 } }}>
            <WatermarkConstellation
              tone="accent"
              items={[{ icon: <PublicOutlinedIcon />, at: { top: "-20%", right: "0%" }, size: 380 }]}
            />
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Section tag="Why it matters" title="Impact on Ghana & the region" icon={<PublicOutlinedIcon />} accent="#00D4AA">
                <Stack spacing={2}>
                  {project.impact.map((p, i) => (
                    <Typography key={i} color="text.secondary" sx={{ lineHeight: 1.95, fontSize: "1.02rem" }}>
                      {p}
                    </Typography>
                  ))}
                </Stack>
              </Section>
            </Box>
          </Box>

          {project.provenPrimitives && project.provenPrimitives.length > 0 && (
            <>
              <Divider />
              <Section tag="What it proved" title="Primitives now reused elsewhere" icon={<LayersOutlinedIcon />} accent="#6C63FF">
                <Typography color="text.secondary" sx={{ lineHeight: 1.9, mb: 2.5 }}>
                  Every system we build contributes reusable capability back to the platform. These are the primitives
                  this project proved out — now available to every operating system that follows it.
                </Typography>
                <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                  {project.provenPrimitives.map((p) => (
                    <Chip
                      key={p}
                      label={p}
                      sx={{
                        borderRadius: 0,
                        fontFamily: "monospace",
                        fontSize: "0.7rem",
                        bgcolor: "transparent",
                        border: "1px solid",
                        borderColor: "rgba(108,99,255,0.4)",
                        color: "text.secondary",
                      }}
                    />
                  ))}
                </Stack>
              </Section>
            </>
          )}
        </Stack>
      </Container>

      {/* Next project */}
      <Box sx={{ borderTop: "1px solid", borderColor: "divider" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
          <Box
            component={Link}
            to={`/projects/${next.slug}`}
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 3,
              p: { xs: 3, md: 4 },
              border: "1px solid",
              borderColor: "divider",
              textDecoration: "none",
              color: "inherit",
              transition: "border-color 0.3s, background 0.3s",
              "&:hover": { borderColor: `${next.accent}66`, bgcolor: `${next.accent}0A` },
            }}
          >
            <HudCorners />
            <Box>
              <Overline color={next.accent}>Next project</Overline>
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 1 }}>
                {next.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {next.tagline}
              </Typography>
            </Box>
            <ArrowForwardIcon sx={{ color: next.accent, flexShrink: 0 }} />
          </Box>
        </Container>
      </Box>
    </>
  );
}
