import { Box, Container, Typography, Stack, Grid, Button } from "@mui/material";
import { Link } from "react-router";
import { motion } from "framer-motion";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import DataObjectOutlinedIcon from "@mui/icons-material/DataObjectOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import SchemaOutlinedIcon from "@mui/icons-material/SchemaOutlined";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import { SectionHeading, InfoCard, CardGrid, Overline } from "@/components/shared/Marketing";
import { WatermarkConstellation, BlueprintGrid } from "@/components/shared/Watermark";
import HudCorners from "@/components/shared/HudCorners";
import Honeycomb from "@/components/shared/Honeycomb";
import { NOSI } from "@/content/positioning";

const MotionBox = motion.create(Box);

const DELIVERABLES = [
  { title: "Schemas", body: "Implementation-independent models describing what information means, not where it lives." },
  { title: "APIs", body: "Consistent, versioned interfaces so systems can exchange records without bespoke integrations." },
  { title: "Validation Tools", body: "Conformance checkers that tell you — objectively — whether your data speaks the standard." },
  { title: "Reference Implementations", body: "Working code in multiple languages so adoption starts from something real, not a PDF." },
];

export default function OpenStandards() {
  return (
    <>
      <SEO
        title="Open Standards Initiative (NOSI) | NeuroDyne Corp"
        description="Software is temporary. Data lives forever. NOSI builds open, community-driven data standards so organizations never lose their information when they change vendors."
      />

      <Container maxWidth="lg" sx={{ pt: 0, pb: { xs: 6, md: 10 }, position: "relative" }}>
        <BlueprintGrid opacity={0.8} />
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <PageHero
            icon={<AccountTreeOutlinedIcon />}
            iconLabel="NOSI"
            tag="NeuroDyne Open Standards Initiative"
            title="Building the future through open standards"
            accentWord="open standards"
            description="Modern organizations shouldn't lose data simply because they change software providers."
            iconColor="#00D4AA"
          />
        </Box>

        <Grid container spacing={{ xs: 3, md: 6 }} sx={{ mt: { xs: 2, md: 4 }, position: "relative", zIndex: 1 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={2}>
              {NOSI.intro.map((p, i) => (
                <Typography key={i} color="text.secondary" sx={{ lineHeight: 1.9, fontSize: "1.02rem" }}>
                  {p}
                </Typography>
              ))}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ position: "relative", p: { xs: 3, md: 4 }, border: "1px solid", borderColor: "divider", bgcolor: "action.hover" }}>
              <HudCorners color="rgba(0,212,170,0.35)" />
              <Overline color="#00D4AA">The core belief</Overline>
              <Typography variant="h5" sx={{ fontWeight: 800, mt: 1.5, lineHeight: 1.35 }}>
                Software is temporary.
                <br />
                Data lives forever.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, lineHeight: 1.8 }}>
                We standardize the meaning of information — not the technology used to store it. Whether a system runs
                PostgreSQL, MongoDB, MySQL or SQL Server is irrelevant. If they speak the same language, they can work
                together.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* What the initiative produces */}
      <Box sx={{ position: "relative", py: { xs: 8, md: 12 }, borderTop: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        <WatermarkConstellation
          tone="accent"
          items={[
            { icon: <DataObjectOutlinedIcon />, at: { top: "-8%", left: "-3%" }, size: 340 },
            { icon: <SchemaOutlinedIcon />, at: { bottom: "-8%", right: "-3%" }, size: 360, rotate: 6 },
          ]}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <SectionHeading tag="Deliverables" title="What the initiative produces" align="center" color="#00D4AA" />
          <CardGrid columns={4}>
            {DELIVERABLES.map((d, i) => (
              <InfoCard key={d.title} title={d.title} delay={i * 0.05} accent="#00D4AA">
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {d.body}
                </Typography>
              </InfoCard>
            ))}
          </CardGrid>
        </Container>
      </Box>

      {/* Working groups */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <SectionHeading
          tag="Current Working Groups"
          title="Fifteen domains, one shared language"
          lead="Each working group defines the vocabulary, records and exchange rules for its domain."
        />
        <Honeycomb
          cell={210}
          perRow={5}
          gap={8}
          items={NOSI.workingGroups.map((g, i) => ({
            key: g,
            accent: i % 3 === 0 ? "#6C63FF" : "#00D4AA",
            content: (
              <>
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.55rem", color: "text.secondary", opacity: 0.7, letterSpacing: "0.16em", mb: 0.8 }}>
                  WG / {String(i + 1).padStart(2, "0")}
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", lineHeight: 1.25 }}>{g}</Typography>
              </>
            ),
          }))}
        />
      </Container>

      {/* Join */}
      <Box sx={{ position: "relative", py: { xs: 8, md: 12 }, borderTop: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        <WatermarkConstellation
          items={[
            { icon: <PublicOutlinedIcon />, at: { top: "10%", right: "6%" }, size: 300, tone: "brand" },
            { icon: <HubOutlinedIcon />, at: { bottom: "-6%", left: "4%" }, size: 280 },
          ]}
        />
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <Overline color="#00D4AA">Join the Initiative</Overline>
          <Typography variant="h3" sx={{ fontWeight: 800, mt: 2, mb: 2, letterSpacing: "-0.02em" }}>
            Standards are built by communities, not companies
          </Typography>
          <Typography color="text.secondary" sx={{ lineHeight: 1.9, mb: 4 }}>
            NOSI is open to anyone who depends on data outliving the software that produced it.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
              gap: 1.5,
              mb: 5,
              textAlign: "left",
            }}
          >
            {NOSI.join.map((who, i) => (
              <MotionBox
                key={who}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                sx={{
                  position: "relative",
                  p: 2.25,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  overflow: "hidden",
                  transition: "transform 0.25s ease, border-color 0.25s ease",
                  "&:hover": { transform: "translateY(-3px)", borderColor: "rgba(0,212,170,0.5)" },
                }}
              >
                <Box sx={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", bgcolor: i % 2 ? "primary.main" : "#00D4AA" }} />
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.16em", color: "text.secondary", opacity: 0.65, mb: 1 }}>
                  COMMUNITY / {String(i + 1).padStart(2, "0")}
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>{who}</Typography>
              </MotionBox>
            ))}
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "center" }}>
            <Button
              component={Link}
              to="/contact"
              variant="contained"
              size="large"
              sx={{ borderRadius: 0, px: 4 }}
            >
              Contribute to NOSI
            </Button>
            <Button
              component={Link}
              to="/research"
              variant="outlined"
              size="large"
              sx={{ borderRadius: 0, px: 4 }}
            >
              See our research
            </Button>
          </Stack>
        </Container>
      </Box>
    </>
  );
}
