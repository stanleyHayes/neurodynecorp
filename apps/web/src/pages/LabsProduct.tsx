import { Box, Container, Stack, Typography, Chip, Button } from "@mui/material";
import { useParams, Link } from "react-router";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import { SectionHeading, InfoCard, CardGrid, CTABand, Overline } from "@/components/shared/Marketing";
import { getLabsProduct } from "@/data/labs";

export default function LabsProduct() {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getLabsProduct(slug) : undefined;

  if (!product) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 10, md: 16 }, textAlign: "center" }}>
        <SEO title="Platform not found" />
        <Overline>404 // LABS</Overline>
        <Typography variant="h4" sx={{ fontWeight: 800, mt: 2, mb: 2 }}>
          That platform isn't here yet
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          The Labs product you're looking for doesn't exist or hasn't been published.
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
        structuredData={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: product.name,
          applicationCategory: "BusinessApplication",
          description: product.tagline,
          publisher: { "@type": "Organization", name: "NeuroDyne Corp" },
        }}
      />

      <PageHero
        icon={<ScienceOutlinedIcon />}
        title={product.name}
        description={product.tagline}
        tag={`LABS // ${product.kicker}`}
        accentWord={product.name}
        iconColor={product.color}
        iconLabel={product.status.toUpperCase()}
      />

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Stack spacing={{ xs: 6, md: 9 }}>
          <Button component={Link} to="/labs" startIcon={<ArrowBackIcon />} sx={{ alignSelf: "flex-start", color: "text.secondary" }}>
            All Labs platforms
          </Button>

          {/* Problem + Platform */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: { xs: 3, md: 4 } }}>
            <InfoCard accent="#6C63FF" title="The problem">
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                {product.problem}
              </Typography>
            </InfoCard>
            <InfoCard accent={product.color} title="The platform">
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                {product.platform}
              </Typography>
            </InfoCard>
          </Box>

          {/* Capabilities */}
          <Box>
            <SectionHeading tag="§ 01 — CAPABILITIES" title="What it does" color={product.color} />
            <CardGrid columns={2}>
              {product.features.map((f, i) => (
                <InfoCard key={f.title} accent={product.color} delay={i * 0.05} icon={<CheckCircleOutlineIcon />} title={f.title}>
                  <Typography variant="body2" color="text.secondary">
                    {f.body}
                  </Typography>
                </InfoCard>
              ))}
            </CardGrid>
          </Box>

          {/* Architecture + Sectors */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.4fr 0.6fr" }, gap: { xs: 3, md: 4 } }}>
            <InfoCard accent="#8B85FF" icon={<LayersOutlinedIcon />} title="Technical architecture">
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {product.architecture.map((a) => (
                  <Stack sx={{ alignItems: "flex-start" }} key={a} direction="row" spacing={1.5}>
                    <CheckCircleOutlineIcon sx={{ color: "#8B85FF", fontSize: 18, mt: "3px" }} />
                    <Typography variant="body2" color="text.secondary">
                      {a}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </InfoCard>
            <InfoCard accent="#33DDBB" title="Sectors served">
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", mt: 1 }}>
                {product.sectors.map((s) => (
                  <Chip key={s} label={s} variant="outlined" sx={{ borderColor: "#33DDBB55" }} />
                ))}
              </Stack>
            </InfoCard>
          </Box>

          <CTABand
            to="/contact"
            tag="§ 02 — REQUEST ACCESS"
            title={`Request access to ${product.name}`}
            description="Tell us about your organisation and how you'd use the platform. Access is granted by qualification."
            color={product.color}
          />
        </Stack>
      </Container>
    </Box>
  );
}
