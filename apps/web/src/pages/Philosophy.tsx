import { Box, Container, Typography, Stack, Grid } from "@mui/material";
import { motion } from "framer-motion";
import ArchitectureOutlinedIcon from "@mui/icons-material/ArchitectureOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import { SectionHeading, InfoCard, CardGrid, CTABand, Overline } from "@/components/shared/Marketing";
import { WatermarkConstellation, BlueprintGrid } from "@/components/shared/Watermark";
import HudCorners from "@/components/shared/HudCorners";
import { PHILOSOPHY_SECTIONS, PRINCIPLES } from "@/content/positioning";

const MotionBox = motion.create(Box);

export default function Philosophy() {
  return (
    <>
      <SEO
        title="Philosophy | NeuroDyne Corp"
        description="We don't start with software. We study how an industry actually works, standardize its language, and engineer the operating systems it runs on."
      />

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 }, position: "relative" }}>
        <BlueprintGrid opacity={0.7} />
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <PageHero
            icon={<ArchitectureOutlinedIcon />}
            iconLabel="NDC-PHIL"
            tag="Engineering Doctrine"
            title="We engineer industries, not applications."
            accentWord="industries"
            description="Applications come and go. Industries last for generations. This is the doctrine behind every operating system we build."
            iconColor="#6C63FF"
          />
        </Box>

        {/* Long-form doctrine */}
        <Stack spacing={{ xs: 6, md: 9 }} sx={{ mt: { xs: 6, md: 10 }, position: "relative", zIndex: 1 }}>
          {PHILOSOPHY_SECTIONS.map((section, i) => (
            <MotionBox
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              sx={{ position: "relative" }}
            >
              <Grid container spacing={{ xs: 2, md: 6 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Overline color={i % 2 === 0 ? "#6C63FF" : "#00D4AA"}>
                    {String(i + 1).padStart(2, "0")} — Principle
                  </Overline>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 800, mt: 1.5, letterSpacing: "-0.01em", lineHeight: 1.25 }}
                  >
                    {section.title}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                  <Stack spacing={2}>
                    {section.body.map((p, pi) => (
                      <Typography key={pi} color="text.secondary" sx={{ lineHeight: 1.9, fontSize: "1.02rem" }}>
                        {p}
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
                      <Typography color="text.secondary" sx={{ lineHeight: 1.9, fontStyle: "italic", opacity: 0.9 }}>
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

      {/* Principles grid */}
      <Box sx={{ position: "relative", py: { xs: 8, md: 12 }, borderTop: "1px solid", borderBottom: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        <WatermarkConstellation
          tone="brand"
          items={[
            { icon: <HubOutlinedIcon />, at: { top: "-6%", left: "-3%" }, size: 340 },
            { icon: <LayersOutlinedIcon />, at: { bottom: "-10%", right: "-2%" }, size: 380, rotate: -8 },
            { icon: <PublicOutlinedIcon />, at: { top: "30%", right: "38%" }, size: 260, tone: "accent" },
          ]}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <SectionHeading
            tag="Operating Principles"
            title="Nine rules we engineer by"
            lead="These recur across every operating system we've designed — from schools to housing to creators."
            align="center"
          />
          <CardGrid columns={3}>
            {PRINCIPLES.map((p, i) => (
              <InfoCard key={p.title} title={p.title} delay={i * 0.05} accent={i % 2 === 0 ? "#6C63FF" : "#00D4AA"}>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {p.body}
                </Typography>
              </InfoCard>
            ))}
          </CardGrid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <CTABand
          to="/open-standards"
          tag="Next"
          title="Standards are where it starts"
          description="Software is temporary. Data lives forever. See the NeuroDyne Open Standards Initiative."
        />
      </Container>
    </>
  );
}
