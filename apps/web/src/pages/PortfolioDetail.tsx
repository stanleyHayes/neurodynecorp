import { useEffect, useState } from "react";
import { Box, Container, Stack, Typography, Chip, Button, CircularProgress, Divider } from "@mui/material";
import { useParams, Link } from "react-router";
import WorkIcon from "@mui/icons-material/Work";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import { SectionHeading, InfoCard, CTABand, Overline } from "@/components/shared/Marketing";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

interface Dossier {
  id: string;
  slug?: string;
  title: string;
  client: string;
  category: string;
  tags: string[];
  description: string;
  impact: string;
  results: string[];
  color?: string;
  sector?: string;
  serviceLine?: string;
  scale?: string;
  stage?: string;
  brief?: string;
  constraints?: string[];
  architecture?: string;
  shipped?: string[];
  retained?: string[];
  learnt?: string[];
}

export default function PortfolioDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);

    const param = encodeURIComponent(slug);
    // Prefer the SEO-friendly slug endpoint; fall back to id for un-migrated records.
    fetch(`${API_URL}/api/v1/portfolio/slug/${param}`)
      .then((res) => (res.ok ? res.json() : fetch(`${API_URL}/api/v1/portfolio/${param}`).then((r) => (r.ok ? r.json() : Promise.reject()))))
      .then((data) => setDossier(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 16 }}>
        <CircularProgress size={32} sx={{ color: "#6C63FF" }} />
      </Box>
    );
  }

  if (notFound || !dossier) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 10, md: 16 }, textAlign: "center" }}>
        <SEO title="Dossier not found" />
        <Overline>404 // CASE DOSSIER</Overline>
        <Typography variant="h4" sx={{ fontWeight: 800, mt: 2, mb: 2 }}>
          That dossier isn't on file
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          The case dossier you're looking for doesn't exist or hasn't been declassified.
        </Typography>
        <Button component={Link} to="/portfolio" startIcon={<ArrowBackIcon />} variant="outlined">
          Back to Case Dossiers
        </Button>
      </Container>
    );
  }

  const color = dossier.color || "#6C63FF";
  const facts: { label: string; value?: string }[] = [
    { label: "Client", value: dossier.client },
    { label: "Sector", value: dossier.sector ?? dossier.category },
    { label: "Service line", value: dossier.serviceLine },
    { label: "Scale", value: dossier.scale },
    { label: "Stage", value: dossier.stage },
  ];
  const hasList = (a?: string[]) => Array.isArray(a) && a.length > 0;

  return (
    <Box>
      <SEO
        title={`${dossier.title} — Case Dossier`}
        description={dossier.brief || dossier.description}
        canonical={`https://neurodynecorp.com/portfolio/${dossier.slug ?? dossier.id}`}
        ogUrl={`https://neurodynecorp.com/portfolio/${dossier.slug ?? dossier.id}`}
        ogType="article"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: dossier.title,
          about: dossier.sector ?? dossier.category,
          description: dossier.brief || dossier.description,
          creator: { "@type": "Organization", name: "NeuroDyne Corp" },
        }}
      />

      <PageHero
        icon={<WorkIcon />}
        title={dossier.title}
        description={dossier.brief || dossier.description}
        tag={`CASE DOSSIER // ${(dossier.stage ?? "ARCHIVE").toUpperCase()}`}
        iconColor={color}
        iconLabel="DECLASSIFIED"
      />

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Stack spacing={{ xs: 5, md: 7 }}>
          <Button component={Link} to="/portfolio" startIcon={<ArrowBackIcon />} sx={{ alignSelf: "flex-start", color: "text.secondary" }}>
            All case dossiers
          </Button>

          {/* Fact table */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", md: `repeat(${facts.filter((f) => f.value).length}, 1fr)` },
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            {facts.filter((f) => f.value).map((f, i) => (
              <Box key={f.label} sx={{ p: { xs: 2, md: 2.5 }, borderRight: { md: i < facts.filter((x) => x.value).length - 1 ? "1px solid" : "none" }, borderColor: "divider" }}>
                <Overline color={color}>{f.label}</Overline>
                <Typography sx={{ fontWeight: 700, mt: 0.5, fontSize: "0.95rem" }}>{f.value}</Typography>
              </Box>
            ))}
          </Box>

          {/* Brief */}
          <InfoCard accent={color} title="The brief">
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              {dossier.brief || dossier.description}
            </Typography>
          </InfoCard>

          {/* Constraints + Architecture */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: { xs: 3, md: 4 } }}>
            {hasList(dossier.constraints) && (
              <InfoCard accent="#F59E0B" icon={<BlockOutlinedIcon />} title="Constraint set">
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  {dossier.constraints!.map((c) => (
                    <Stack sx={{ alignItems: "flex-start" }} key={c} direction="row" spacing={1.5}>
                      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#F59E0B", mt: "7px", flexShrink: 0 }} />
                      <Typography variant="body2" color="text.secondary">{c}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </InfoCard>
            )}
            {dossier.architecture && (
              <InfoCard accent="#8B85FF" icon={<LayersOutlinedIcon />} title="Architecture chosen">
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mt: 1 }}>
                  {dossier.architecture}
                </Typography>
              </InfoCard>
            )}
          </Box>

          {/* What shipped */}
          {hasList(dossier.shipped) && (
            <Box>
              <SectionHeading tag="§ — WHAT SHIPPED" title="What we delivered" color={color} />
              <Stack spacing={1.5}>
                {dossier.shipped!.map((s) => (
                  <Stack sx={{ alignItems: "flex-start" }} key={s} direction="row" spacing={1.5}>
                    <CheckCircleOutlineIcon sx={{ color, fontSize: 18, mt: "3px" }} />
                    <Typography variant="body2" color="text.secondary">{s}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}

          {/* Retained IP + Learnt */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: { xs: 3, md: 4 } }}>
            {hasList(dossier.retained) && (
              <InfoCard accent="#00D4AA" icon={<LockOutlinedIcon />} title="Retained as IP">
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  {dossier.retained!.map((r) => (
                    <Stack sx={{ alignItems: "flex-start" }} key={r} direction="row" spacing={1.5}>
                      <LockOutlinedIcon sx={{ color: "#00D4AA", fontSize: 16, mt: "3px" }} />
                      <Typography variant="body2" color="text.secondary">{r}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </InfoCard>
            )}
            {hasList(dossier.learnt) && (
              <InfoCard accent="#33DDBB" icon={<LightbulbOutlinedIcon />} title="What we learnt">
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  {dossier.learnt!.map((l) => (
                    <Stack sx={{ alignItems: "flex-start" }} key={l} direction="row" spacing={1.5}>
                      <LightbulbOutlinedIcon sx={{ color: "#33DDBB", fontSize: 16, mt: "3px" }} />
                      <Typography variant="body2" color="text.secondary">{l}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </InfoCard>
            )}
          </Box>

          {/* Outcome / results */}
          {(dossier.impact || hasList(dossier.results)) && (
            <InfoCard accent={color} title="Outcome">
              {dossier.impact && (
                <Typography sx={{ fontWeight: 700, color, mb: hasList(dossier.results) ? 1.5 : 0 }}>{dossier.impact}</Typography>
              )}
              {hasList(dossier.results) && (
                <Stack sx={{ flexWrap: "wrap" }} direction="row" spacing={1} useFlexGap>
                  {dossier.results.map((r) => (
                    <Chip key={r} label={r} variant="outlined" sx={{ borderColor: `${color}55` }} />
                  ))}
                </Stack>
              )}
            </InfoCard>
          )}

          {/* Stack tags */}
          {hasList(dossier.tags) && (
            <Box>
              <Overline>Stack</Overline>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap", mt: 1 }}>
                {dossier.tags.map((t) => (
                  <Chip key={t} label={t} size="small" sx={{ fontFamily: "monospace", fontSize: "0.65rem", bgcolor: "rgba(108,99,255,0.06)" }} />
                ))}
              </Stack>
            </Box>
          )}

          <Divider />

          <CTABand
            to="/start-project"
            tag="ENGAGE"
            title="Want an engagement like this?"
            description="Tell us your brief through the intake. We'll route it and show you the closest precedent."
            color={color}
          />
        </Stack>
      </Container>
    </Box>
  );
}
