import { Box, Typography, Container, Stack, Chip } from "@mui/material";
import { motion } from "framer-motion";
import GitHubIcon from "@mui/icons-material/GitHub";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import CallSplitOutlinedIcon from "@mui/icons-material/CallSplitOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import CommunityBlock from "@/components/shared/CommunityBlock";

const MotionBox = motion.create(Box);

interface Repo {
  name: string;
  description: string;
  language: string;
  langColor: string;
  stars: number;
  forks: number;
  href: string;
  tags: string[];
}

const repos: Repo[] = [
  {
    name: "neurodyne-spec-engine",
    description: "Adaptive questionnaire engine that turns 30-minute intake answers into a delivery-ready software spec. Pluggable rule packs, JSON output.",
    language: "Go",
    langColor: "#00ADD8",
    stars: 142,
    forks: 18,
    href: "https://github.com/stanleyHayes",
    tags: ["AI", "Specs", "DSL"],
  },
  {
    name: "hexagonal-go-template",
    description: "Production-grade hexagonal architecture starter for Go services — domain, ports, adapters, and a clean testing setup out of the box.",
    language: "Go",
    langColor: "#00ADD8",
    stars: 89,
    forks: 24,
    href: "https://github.com/stanleyHayes",
    tags: ["Architecture", "Template", "Go"],
  },
  {
    name: "react-cell-grid",
    description: "The grid-cell UI primitive used across all NeuroDyne apps. Animated corner brackets, hover glow, and zero runtime CSS.",
    language: "TypeScript",
    langColor: "#3178C6",
    stars: 67,
    forks: 8,
    href: "https://github.com/stanleyHayes",
    tags: ["UI", "React", "Design system"],
  },
  {
    name: "kafka-promo-engine",
    description: "Reference implementation of a high-throughput, event-driven promotion engine. 10K+ events/sec on commodity hardware.",
    language: "Go",
    langColor: "#00ADD8",
    stars: 54,
    forks: 12,
    href: "https://github.com/stanleyHayes",
    tags: ["Kafka", "Events", "Backend"],
  },
  {
    name: "mdx-doc-kit",
    description: "Minimal markdown editor + renderer pair tuned for product docs. Code highlighting, tables, image upload — Jira-style toolbar.",
    language: "TypeScript",
    langColor: "#3178C6",
    stars: 41,
    forks: 5,
    href: "https://github.com/stanleyHayes",
    tags: ["Markdown", "Editor", "MDX"],
  },
];

export default function OpenSource() {
  const totalStars = repos.reduce((s, r) => s + r.stars, 0);
  const totalForks = repos.reduce((s, r) => s + r.forks, 0);

  return (
    <>
      <SEO
        title="Open Source"
        description="Tools, libraries, and references we've open-sourced from inside NeuroDyne Corp."
      />

      <PageHero
        icon={<GitHubIcon />}
        title="Open Source"
        description="Tools and references we've extracted from real client work. Use them, fork them, send PRs."
        tag="BUILD // IN PUBLIC"
        accentWord="Source"
        iconColor="#6C63FF"
        iconLabel="GITHUB"
      />

      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        {/* Stats row */}
        <Stack direction="row" spacing={4} justifyContent="center" sx={{ mb: 8, flexWrap: "wrap", gap: 4 }}>
          {[
            { label: "Repositories", value: repos.length },
            { label: "Stars", value: totalStars },
            { label: "Forks", value: totalForks },
          ].map((s) => (
            <Box key={s.label} sx={{ textAlign: "center" }}>
              <Typography sx={{ fontWeight: 800, fontSize: "2rem", background: "linear-gradient(135deg, #6C63FF, #00D4AA)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {s.value}
              </Typography>
              <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.2em", color: "text.secondary", opacity: 0.5, textTransform: "uppercase" }}>
                {s.label}
              </Typography>
            </Box>
          ))}
        </Stack>

        {/* Repo grid */}
        <Stack spacing={2}>
          {repos.map((r, i) => (
            <MotionBox
              key={r.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
            >
              <Box
                component="a"
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "block",
                  p: 3,
                  borderRadius: 2,
                  border: "1px solid rgba(108, 99, 255, 0.12)",
                  bgcolor: "rgba(108, 99, 255, 0.02)",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "rgba(108, 99, 255, 0.4)",
                    bgcolor: "rgba(108, 99, 255, 0.06)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px rgba(108,99,255,0.15)",
                  },
                }}
              >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <GitHubIcon sx={{ fontSize: 18, color: "text.secondary", opacity: 0.6 }} />
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.95rem", fontWeight: 700, color: "#6C63FF" }}>
                    {r.name}
                  </Typography>
                </Stack>
                <OpenInNewIcon sx={{ fontSize: 14, color: "text.secondary", opacity: 0.4 }} />
              </Stack>

              <Typography sx={{ color: "text.secondary", lineHeight: 1.7, mb: 2, fontSize: "0.9rem" }}>
                {r.description}
              </Typography>

              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: r.langColor }} />
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "text.secondary" }}>
                    {r.language}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <StarBorderOutlinedIcon sx={{ fontSize: 14, color: "text.secondary", opacity: 0.6 }} />
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "text.secondary" }}>
                    {r.stars}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <CallSplitOutlinedIcon sx={{ fontSize: 14, color: "text.secondary", opacity: 0.6 }} />
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "text.secondary" }}>
                    {r.forks}
                  </Typography>
                </Stack>
                <Box sx={{ flex: 1 }} />
                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                  {r.tags.map((t) => (
                    <Chip
                      key={t}
                      label={t}
                      size="small"
                      sx={{ fontFamily: "monospace", fontSize: "0.55rem", height: 18, bgcolor: "rgba(108,99,255,0.08)", color: "text.secondary", border: "1px solid rgba(108,99,255,0.15)" }}
                    />
                  ))}
                </Stack>
              </Stack>
              </Box>
            </MotionBox>
          ))}
        </Stack>

        <Box sx={{ mt: 8 }}>
          <CommunityBlock />
        </Box>
      </Container>
    </>
  );
}
