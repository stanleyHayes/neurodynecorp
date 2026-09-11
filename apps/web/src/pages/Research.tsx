import { Box, Container, Typography, Stack, Grid } from "@mui/material";
import { motion } from "framer-motion";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import BiotechOutlinedIcon from "@mui/icons-material/BiotechOutlined";
import MemoryOutlinedIcon from "@mui/icons-material/MemoryOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import { SectionHeading, CTABand, Overline } from "@/components/shared/Marketing";
import { WatermarkConstellation, BlueprintGrid } from "@/components/shared/Watermark";
import HudCorners from "@/components/shared/HudCorners";
import { RESEARCH_AREAS } from "@/content/positioning";

const MotionBox = motion.create(Box);

export default function Research() {
  return (
    <>
      <SEO
        title="Research"
        description="Applied research in AI, distributed systems, digital identity, interoperability, knowledge graphs, digital twins and edge computing — grounded in African infrastructure realities."
      />

      <Container maxWidth="lg" sx={{ pt: 0, pb: { xs: 6, md: 10 }, position: "relative" }}>
        <BlueprintGrid opacity={0.7} />
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <PageHero
            icon={<ScienceOutlinedIcon />}
            iconLabel="NDC-LAB"
            tag="Research Lab"
            title="Research meant to become infrastructure"
            accentWord="infrastructure"
            description="Research threads here come out of building. Each one exists because a system under construction ran into a question that couldn't be bought off the shelf."
            iconColor="#8B85FF"
          />
        </Box>
      </Container>

      <Box sx={{ position: "relative", pb: { xs: 8, md: 12 }, overflow: "hidden" }}>
        <WatermarkConstellation
          tone="brand"
          items={[
            { icon: <BiotechOutlinedIcon />, at: { top: "-4%", left: "-4%" }, size: 340 },
            { icon: <MemoryOutlinedIcon />, at: { bottom: "-6%", right: "-3%" }, size: 320, rotate: -6 },
            { icon: <HubOutlinedIcon />, at: { top: "40%", right: "44%" }, size: 240, tone: "accent" },
          ]}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={2}>
            {RESEARCH_AREAS.map((r, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={r.title}>
                <MotionBox
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: (i % 6) * 0.04 }}
                  sx={{
                    position: "relative",
                    height: "100%",
                    p: { xs: 2.5, md: 3 },
                    border: "1px solid",
                    borderColor: "divider",
                    transition: "border-color 0.3s, background 0.3s",
                    "&:hover": { borderColor: "rgba(139,133,255,0.5)", bgcolor: "rgba(139,133,255,0.06)" },
                  }}
                >
                  <HudCorners />
                  <Overline color="#8B85FF">R-{String(i + 1).padStart(2, "0")}</Overline>
                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 1.25, mb: 1 }}>
                    {r.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    {r.blurb}
                  </Typography>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 12 } }}>
        <SectionHeading
          tag="How we work"
          title="Research with a build attached"
          lead="Research here isn't done in isolation. Each thread is tied to a system being built — schools, housing, creators, public finance — so questions are tested against real constraints: intermittent connectivity, low-spec devices, thin budgets, and regulation."
          align="center"
          color="#8B85FF"
        />
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 4 }}>
          {[
            { k: "Publish", v: "Findings, schemas and reference implementations are intended to be released openly where they help the ecosystem. Nothing is published yet." },
            { k: "Collaborate", v: "Open to applied research collaboration with universities, public-sector units and industry bodies. No such partnerships are in place today." },
            { k: "Productize", v: "Results that hold up under real constraints are intended to graduate into platform capabilities." },
          ].map((c, i) => (
            <Box
              key={c.k}
              sx={{ position: "relative", flex: 1, p: 3, border: "1px solid", borderColor: "divider" }}
            >
              <HudCorners />
              <Overline color={i === 1 ? "#00D4AA" : "#6C63FF"}>{c.k}</Overline>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.8 }}>
                {c.v}
              </Typography>
            </Box>
          ))}
        </Stack>

        <Box sx={{ mt: { xs: 6, md: 8 } }}>
          <CTABand
            to="/infrastructure"
            tag="Related"
            title="Research feeds the standards"
            description="Research here is intended to become schemas, APIs and validation tools in the NeuroDyne Open Standards Initiative."
            color="#00D4AA"
          />
        </Box>
      </Container>
    </>
  );
}
