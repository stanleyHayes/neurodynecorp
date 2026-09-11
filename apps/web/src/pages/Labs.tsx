import { Box, Container, Stack, Typography } from "@mui/material";
import HudCorners from "@/components/shared/HudCorners";
import { Link } from "react-router";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import MaturityBadge, { MaturityLegend } from "@/components/shared/MaturityBadge";
import { SectionHeading, InfoCard, CardGrid, CTABand, Overline } from "@/components/shared/Marketing";
import { LABS_PRODUCTS } from "@/data/labs";

const LOOP = [
  { stage: "01", title: "Question", body: "A problem worth building for, usually surfaced by delivery work or by a gap with no off-the-shelf answer.", Icon: AssignmentOutlinedIcon, color: "#6C63FF" },
  { stage: "02", title: "Prototype", body: "A prototype built to test the hardest assumption in the idea — not a product launch, and not a commitment to ship.", Icon: BuildOutlinedIcon, color: "#00D4AA" },
  { stage: "03", title: "Assess", body: "What holds up under real constraints may graduate into a product later. Most of it stays research, and is labelled that way here.", Icon: FactCheckOutlinedIcon, color: "#8B85FF" },
];

export default function Labs() {
  return (
    <Box>
      <SEO
        title="Neurodyne Labs"
        description="A library of systems worked through to a full specification — the problem, the architecture and the decisions — then deliberately left there. Documented, not built."
        canonical="https://neurodyne.dev/labs"
        ogUrl="https://neurodyne.dev/labs"
      />

      <PageHero
        icon={<ScienceOutlinedIcon />}
        title="Neurodyne Labs"
        description="Systems worked through to a full specification and deliberately left there. This is a blueprint library, not a roadmap: nothing here is in development, and nothing here is a commitment to ship."
        tag="LABS // BLUEPRINTS"
        accentWord="Labs"
        iconColor="#8B85FF"
        iconLabel="RESEARCH"
      />

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Stack spacing={{ xs: 6, md: 9 }}>
          {/* How early work moves */}
          <Box>
            <SectionHeading
              tag="§ 01 — HOW A CONCEPT GETS DOCUMENTED"
              title="From question to specification"
              lead="Everything on this page is early. Nothing here is sold, licensed, or deployed, and most of it will never leave this stage."
              color="#8B85FF"
            />
            <CardGrid columns={3}>
              {LOOP.map((s, i) => (
                <InfoCard key={s.title} accent={s.color} delay={i * 0.06} icon={<s.Icon />} title={s.title}>
                  <Overline color={s.color}>{s.stage}</Overline>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {s.body}
                  </Typography>
                </InfoCard>
              ))}
            </CardGrid>
          </Box>

          {/* Explorations */}
          <Box>
            <SectionHeading
              tag="§ 02 — THE LIBRARY"
              title="What has been specified"
              lead="Each entry is a design or prototype being worked through. Read them as open questions, not as products with a release date."
              color="#00D4AA"
            />
            <Box sx={{ mb: 3 }}>
              <MaturityLegend labels={["RESEARCH"]} />
            </Box>
            <CardGrid columns={2}>
              {LABS_PRODUCTS.map((p) => (
                <Box
                  key={p.slug}
                  component={Link}
                  to={`/labs/${p.slug}`}
                  sx={{
                    display: "block",
                    p: { xs: 3, md: 4 },
                    borderRadius: 0,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: `${p.accent}0A`,
                    textDecoration: "none",
                    color: "inherit",
                    transition: "border-color 0.3s, background 0.3s, transform 0.3s",
                    "&:hover": { borderColor: `${p.accent}66`, bgcolor: `${p.accent}14`, transform: "translateY(-3px)" },
                  }}
                >
                  <HudCorners />
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                    <Overline color={p.accent}>{p.industry}</Overline>
                    {p.maturity ? <MaturityBadge maturity={p.maturity} size="small" /> : null}
                  </Stack>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                    {p.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {p.tagline}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", color: p.accent }}>
                    <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.1em" }}>
                      READ THE THINKING
                    </Typography>
                    <ArrowForwardIcon sx={{ fontSize: 16 }} />
                  </Stack>
                </Box>
              ))}
            </CardGrid>
          </Box>

          <CTABand
            to="/contact"
            tag="§ 03 — COLLABORATE"
            title="Working on a problem in the same territory?"
            description="These are open questions rather than products. If one overlaps something you are building, start a conversation."
            color="#6C63FF"
          />
        </Stack>
      </Container>
    </Box>
  );
}
