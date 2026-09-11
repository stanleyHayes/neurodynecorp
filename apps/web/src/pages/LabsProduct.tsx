import { Box, Container, Stack, Typography, Chip, Button } from "@mui/material";
import { useParams, Link } from "react-router";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import MaturityBadge from "@/components/shared/MaturityBadge";
import { SectionHeading, InfoCard, CardGrid, CTABand, Overline } from "@/components/shared/Marketing";
import { getLabsProduct } from "@/data/labs";

export default function LabsProduct() {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getLabsProduct(slug) : undefined;

  if (!product) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 10, md: 16 }, textAlign: "center" }}>
        <SEO title="Not found" noIndex />
        <Overline>404 // LABS</Overline>
        <Typography variant="h4" sx={{ fontWeight: 800, mt: 2, mb: 2 }}>
          That exploration isn't here
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          The Labs entry you're looking for doesn't exist or hasn't been published.
        </Typography>
        <Button component={Link} to="/labs" startIcon={<ArrowBackIcon />} variant="outlined">
          Back to Labs
        </Button>
      </Container>
    );
  }

  return (
    <Box>
      <SEO
        title={`${product.name} — NeuroDyne Labs`}
        description={product.tagline}
        canonical={`https://neurodyne.dev/labs/${product.slug}`}
        ogUrl={`https://neurodyne.dev/labs/${product.slug}`}
        ogType="article"
      />

      <PageHero
        icon={<ScienceOutlinedIcon />}
        title={product.name}
        description={product.tagline}
        tag={`LABS // ${product.industry.toUpperCase()}`}
        accentWord={product.name}
        iconColor={product.accent}
        iconLabel={product.maturity ?? "RESEARCH"}
      />

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Stack spacing={{ xs: 6, md: 9 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between" }}
          >
            <Button component={Link} to="/labs" startIcon={<ArrowBackIcon />} sx={{ color: "text.secondary" }}>
              All Labs explorations
            </Button>
            {product.maturity ? <MaturityBadge maturity={product.maturity} /> : null}
          </Stack>

          <Box
            sx={{
              p: { xs: 2.5, md: 3 },
              border: "1px solid",
              borderColor: "divider",
              bgcolor: `${product.accent}0A`,
            }}
          >
            <Overline color={product.accent}>Read this as early work</Overline>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.8 }}>
              {product.name} is a design being explored, not a product you can buy or use today. There is no
              release date and no commitment to ship it.
            </Typography>
          </Box>

          {/* Problem + Approach */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: { xs: 3, md: 4 } }}>
            <InfoCard accent="#6C63FF" title="The problem">
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {product.problem.map((p) => (
                  <Typography key={p} variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    {p}
                  </Typography>
                ))}
              </Stack>
            </InfoCard>
            <InfoCard accent={product.accent} title="The approach">
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {product.approach.map((a) => (
                  <Typography key={a} variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    {a}
                  </Typography>
                ))}
              </Stack>
            </InfoCard>
          </Box>

          {/* Capabilities */}
          <Box>
            <SectionHeading
              tag="§ 01 — SCOPE"
              title="What it is designed to do"
              lead="Capabilities described here are the intended shape of the system, not a list of shipped features."
              color={product.accent}
            />
            <CardGrid columns={2}>
              {product.capabilities.map((c, i) => (
                <InfoCard key={c} accent={product.accent} delay={i * 0.05} icon={<CheckCircleOutlineIcon />} title={c} />
              ))}
            </CardGrid>
          </Box>

          {/* Stack + Audience */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.4fr 0.6fr" }, gap: { xs: 3, md: 4 } }}>
            <InfoCard accent="#8B85FF" icon={<LayersOutlinedIcon />} title="Technical direction">
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {product.stack.map((s) => (
                  <Stack sx={{ alignItems: "flex-start" }} key={s} direction="row" spacing={1.5}>
                    <CheckCircleOutlineIcon sx={{ color: "#8B85FF", fontSize: 18, mt: "3px" }} />
                    <Typography variant="body2" color="text.secondary">
                      {s}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </InfoCard>
            <InfoCard accent="#33DDBB" title="Designed for">
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", mt: 1 }}>
                {product.audience.map((a) => (
                  <Chip key={a} label={a} variant="outlined" sx={{ borderColor: "#33DDBB55" }} />
                ))}
              </Stack>
            </InfoCard>
          </Box>

          <CTABand
            to="/contact"
            tag="§ 02 — COLLABORATE"
            title={`Working on the same problem as ${product.name}?`}
            description="This is early research. If the problem overlaps something you are building, start a conversation."
            color={product.accent}
          />
        </Stack>
      </Container>
    </Box>
  );
}
