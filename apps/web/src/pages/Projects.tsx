import { useState } from "react";
import { Box, Container, Typography, Stack, Grid, Chip } from "@mui/material";
import { Link } from "react-router";
import { motion } from "framer-motion";
import WorkspacesOutlinedIcon from "@mui/icons-material/WorkspacesOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import { Overline, CTABand } from "@/components/shared/Marketing";
import { WatermarkConstellation, BlueprintGrid } from "@/components/shared/Watermark";
import HudCorners from "@/components/shared/HudCorners";
import { PROJECTS, PROJECT_CATEGORIES, type ProjectCategory } from "@/content/projects";

const MotionBox = motion.create(Box);

export default function Projects() {
  const [filter, setFilter] = useState<ProjectCategory | "All">("All");
  const shown = filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.category === filter);

  return (
    <>
      <SEO
        title="Projects | NeuroDyne Corp"
        description="The systems we've engineered — industry operating systems, government platforms, healthcare interoperability, and civic infrastructure across Ghana and Africa."
      />

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 }, position: "relative" }}>
        <BlueprintGrid opacity={0.6} />
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <PageHero
            icon={<WorkspacesOutlinedIcon />}
            iconLabel="NDC-PROJ"
            tag="Portfolio"
            title="Systems, not deliverables"
            accentWord="Systems"
            description="Each of these began the same way: study how the industry actually works, model it, standardize the language, then engineer the operating system it runs on."
            iconColor="#00D4AA"
          />
        </Box>

        {/* Filter */}
        <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1, mt: { xs: 4, md: 6 }, position: "relative", zIndex: 1 }}>
          {(["All", ...PROJECT_CATEGORIES] as const).map((c) => {
            const active = filter === c;
            return (
              <Box
                key={c}
                onClick={() => setFilter(c as ProjectCategory | "All")}
                sx={{
                  cursor: "pointer",
                  px: 1.75,
                  py: 0.9,
                  border: "1px solid",
                  borderColor: active ? "primary.main" : "divider",
                  bgcolor: active ? "action.selected" : "transparent",
                  color: active ? "primary.main" : "text.secondary",
                  fontFamily: "monospace",
                  fontSize: "0.7rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  transition: "all 0.2s",
                  "&:hover": { borderColor: "primary.main", color: "primary.main" },
                }}
              >
                {c}
              </Box>
            );
          })}
        </Stack>
      </Container>

      <Box sx={{ position: "relative", pb: { xs: 8, md: 12 }, overflow: "hidden" }}>
        <WatermarkConstellation
          items={[
            { icon: <HubOutlinedIcon />, at: { top: "2%", left: "-4%" }, size: 340, tone: "brand" },
            { icon: <PublicOutlinedIcon />, at: { bottom: "0%", right: "-4%" }, size: 360, tone: "accent" },
          ]}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={2.5}>
            {shown.map((p, i) => (
              <Grid size={{ xs: 12, md: 6 }} key={p.slug}>
                <MotionBox
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
                  sx={{ height: "100%" }}
                >
                <Box
                  component={Link}
                  to={`/projects/${p.slug}`}
                  sx={{
                    position: "relative",
                    display: "block",
                    height: "100%",
                    p: { xs: 3, md: 3.5 },
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: `${p.accent}08`,
                    textDecoration: "none",
                    color: "inherit",
                    transition: "border-color 0.3s, background 0.3s, transform 0.3s",
                    "&:hover": {
                      borderColor: `${p.accent}66`,
                      bgcolor: `${p.accent}14`,
                      transform: "translateY(-3px)",
                      "& .arrow": { transform: "translateX(4px)" },
                    },
                  }}
                >
                  <HudCorners color={`${p.accent}44`} />

                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                    <Overline color={p.accent}>{p.category}</Overline>
                    <Typography
                      sx={{ fontFamily: "monospace", fontSize: "0.6rem", color: "text.secondary", opacity: 0.65, letterSpacing: "0.1em" }}
                    >
                      {p.status.toUpperCase()}
                    </Typography>
                  </Stack>

                  <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "-0.01em" }}>
                    {p.name}
                  </Typography>
                  <Typography sx={{ color: p.accent, fontSize: "0.9rem", mt: 0.5, fontWeight: 500 }}>
                    {p.tagline}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.8 }}>
                    {p.summary}
                  </Typography>

                  <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.75, mt: 2.5 }}>
                    {p.stack.slice(0, 4).map((t) => (
                      <Chip
                        key={t}
                        label={t}
                        size="small"
                        sx={{
                          borderRadius: 0,
                          height: 22,
                          fontFamily: "monospace",
                          fontSize: "0.62rem",
                          bgcolor: "transparent",
                          border: "1px solid",
                          borderColor: "divider",
                          color: "text.secondary",
                        }}
                      />
                    ))}
                  </Stack>

                  <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mt: 2.5, color: p.accent }}>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>Read the case study</Typography>
                    <ArrowForwardIcon className="arrow" sx={{ fontSize: 16, transition: "transform 0.3s" }} />
                  </Stack>
                </Box>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 12 } }}>
        <CTABand
          to="/start-project"
          tag="Your industry next"
          title="What does your industry actually run on?"
          description="If the answer is spreadsheets, disconnected tools and institutional memory — that's where we start."
        />
      </Container>
    </>
  );
}
