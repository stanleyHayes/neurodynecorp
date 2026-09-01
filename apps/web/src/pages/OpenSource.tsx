import { Box, Typography, Container, Stack, Chip } from "@mui/material";
import { motion } from "framer-motion";
import GitHubIcon from "@mui/icons-material/GitHub";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import CommunityBlock from "@/components/shared/CommunityBlock";

const MotionBox = motion.create(Box);

interface Repo {
  name: string;
  description: string;
  language: string;
  langColor: string;
  stage: "Planned" | "In preparation" | "Published";
  href?: string;
  tags: string[];
}

const repos: Repo[] = [
  {
    name: "github-actions-field-guide",
    description: "A practical, security-first guide to GitHub Actions, from its event model through reusable workflows, OIDC deployment, releases and operational governance.",
    language: "Markdown",
    langColor: "#6C63FF",
    stage: "In preparation",
    tags: ["CI/CD", "OIDC", "DevOps"],
  },
  {
    name: "bash-field-guide",
    description: "A plain-language learning series on Bash as the connective tissue of local development, CI runners, containers and production operations.",
    language: "Markdown",
    langColor: "#00D4AA",
    stage: "In preparation",
    tags: ["Bash", "Learning", "Operations"],
  },
  {
    name: "engineering-standards-kit",
    description: "Reusable engineering standards, conventional-commit guidance, testing practices and delivery checklists extracted into a project-neutral starter kit.",
    language: "Documentation",
    langColor: "#F59E0B",
    stage: "Planned",
    tags: ["Standards", "Quality", "Templates"],
  },
  {
    name: "designforge-handbook",
    description: "An engineering handbook for moving from product intent to architecture, implementation evidence and release-quality verification.",
    language: "Documentation",
    langColor: "#8B85FF",
    stage: "Planned",
    tags: ["Architecture", "Delivery", "Handbook"],
  },
];

export default function OpenSource() {
  const preparing = repos.filter((repo) => repo.stage === "In preparation").length;

  return (
    <>
      <SEO
        title="Open Source"
        description="Tools, libraries, and references we've open-sourced from inside NeuroDyne Corp."
      />

      <PageHero
        icon={<GitHubIcon />}
        title="Open Source"
        description="The tools and field guides we're preparing to release publicly. Publication links appear only when a repository is genuinely live."
        tag="BUILD // IN PUBLIC"
        accentWord="Source"
        iconColor="#6C63FF"
        iconLabel="GITHUB"
      />

      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        {/* Stats row */}
        <Stack direction="row" spacing={4} sx={{ justifyContent: "center", mb: 8, flexWrap: "wrap", gap: 4 }}>
          {[
            { label: "Repositories", value: repos.length },
            { label: "In preparation", value: preparing },
            { label: "Published", value: repos.filter((repo) => repo.stage === "Published").length },
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
                component={r.href ? "a" : "article"}
                href={r.href}
                target={r.href ? "_blank" : undefined}
                rel={r.href ? "noopener noreferrer" : undefined}
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
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                <Stack sx={{ alignItems: "center" }} direction="row" spacing={1}>
                  <GitHubIcon sx={{ fontSize: 18, color: "text.secondary", opacity: 0.6 }} />
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.95rem", fontWeight: 700, color: "#6C63FF" }}>
                    {r.name}
                  </Typography>
                </Stack>
                <Chip label={r.stage} size="small" sx={{ borderRadius: 0, fontFamily: "monospace", fontSize: "0.56rem", height: 20 }} />
              </Stack>

              <Typography sx={{ color: "text.secondary", lineHeight: 1.7, mb: 2, fontSize: "0.9rem" }}>
                {r.description}
              </Typography>

              <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                <Stack sx={{ alignItems: "center" }} direction="row" spacing={0.75}>
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: r.langColor }} />
                  <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "text.secondary" }}>
                    {r.language}
                  </Typography>
                </Stack>
                <Box sx={{ flex: 1 }} />
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5 }}>
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
