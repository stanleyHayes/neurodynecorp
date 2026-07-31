import { Box, Container, Typography, Stack, Grid, Chip } from "@mui/material";
import { motion } from "framer-motion";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import DesignServicesOutlinedIcon from "@mui/icons-material/DesignServicesOutlined";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import { SectionHeading, CTABand, Overline } from "@/components/shared/Marketing";
import { WatermarkConstellation, BlueprintGrid } from "@/components/shared/Watermark";
import HudCorners from "@/components/shared/HudCorners";
import { SOLUTIONS } from "@/content/positioning";

const MotionBox = motion.create(Box);

const ICONS: Record<string, React.ReactNode> = {
  "enterprise-software": <StorageOutlinedIcon />,
  "artificial-intelligence": <PsychologyOutlinedIcon />,
  "cloud-engineering": <CloudOutlinedIcon />,
  "data-engineering": <InsightsOutlinedIcon />,
  cybersecurity: <ShieldOutlinedIcon />,
  "ux-engineering": <DesignServicesOutlinedIcon />,
};

const ACCENTS = ["#6C63FF", "#00D4AA", "#8B85FF", "#F59E0B", "#EF4444", "#38BDF8"];

export default function Solutions() {
  return (
    <>
      <SEO
        title="Solutions | NeuroDyne Corp"
        description="Enterprise software, artificial intelligence, cloud, data, cybersecurity and UX engineering — the capabilities behind every NeuroDyne operating system."
      />

      <Container maxWidth="lg" sx={{ pt: 0, pb: { xs: 6, md: 10 }, position: "relative" }}>
        <BlueprintGrid opacity={0.6} />
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <PageHero
            icon={<GridViewOutlinedIcon />}
            iconLabel="NDC-SOLV"
            tag="Capabilities"
            title="The engineering disciplines behind every system"
            accentWord="engineering disciplines"
            description="We don't sell websites or apps. We combine six disciplines into digital infrastructure organizations can operate on for decades."
            iconColor="#6C63FF"
          />
        </Box>
      </Container>

      <Box sx={{ position: "relative", pb: { xs: 6, md: 10 }, overflow: "hidden" }}>
        <WatermarkConstellation
          items={[
            { icon: <CloudOutlinedIcon />, at: { top: "2%", right: "-3%" }, size: 320 },
            { icon: <ShieldOutlinedIcon />, at: { bottom: "4%", left: "-4%" }, size: 340, tone: "brand" },
          ]}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Stack spacing={{ xs: 3, md: 4 }}>
            {SOLUTIONS.map((s, i) => {
              const accent = ACCENTS[i % ACCENTS.length]!;
              return (
                <MotionBox
                  key={s.slug}
                  id={s.slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: (i % 3) * 0.05 }}
                  sx={{
                    position: "relative",
                    p: { xs: 3, md: 4.5 },
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: `${accent}08`,
                    transition: "border-color 0.3s, background 0.3s",
                    "&:hover": { borderColor: `${accent}55`, bgcolor: `${accent}12` },
                  }}
                >
                  <HudCorners color={`${accent}44`} />
                  <Grid container spacing={{ xs: 2, md: 5 }} sx={{ alignItems: "flex-start" }}>
                    <Grid size={{ xs: 12, md: 5 }}>
                      <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 1.5 }}>
                        <Box sx={{ color: accent, display: "flex", "& .MuiSvgIcon-root": { fontSize: 34 } }}>
                          {ICONS[s.slug]}
                        </Box>
                        <Overline color={accent}>{String(i + 1).padStart(2, "0")}</Overline>
                      </Stack>
                      <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "-0.01em" }}>
                        {s.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.8, maxWidth: 380 }}>
                        {s.blurb}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 7 }}>
                      <Overline color={accent}>Capabilities</Overline>
                      <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1, mt: 1.5 }}>
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
                    </Grid>
                  </Grid>
                </MotionBox>
              );
            })}
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 10 } }}>
        <SectionHeading
          tag="How they combine"
          title="Capabilities become platforms. Platforms become operating systems."
          lead="Authentication, payments, notifications, workflows, AI, analytics, identity, permissions, messaging and search are built once — then reused across every industry operating system we ship."
          align="center"
        />
        <CTABand
          to="/industries"
          tag="See it applied"
          title="Explore the industries we engineer for"
          description="Healthcare, education, government, finance, agriculture, media and more."
        />
      </Container>
    </>
  );
}
