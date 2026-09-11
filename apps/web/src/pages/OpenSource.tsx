import { Box, Typography, Container, Stack, Chip, Button, Skeleton, Alert } from "@mui/material";
import { motion } from "framer-motion";
import GitHubIcon from "@mui/icons-material/GitHub";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import CommunityBlock from "@/components/shared/CommunityBlock";
import { Overline } from "@/components/shared/Marketing";
import MaturityBadge from "@/components/shared/MaturityBadge";
import { useGitHubRepos, GH_USER, type Repo } from "@/hooks/useGitHubRepos";

const MotionBox = motion.create(Box);

const PROFILE_URL = `https://github.com/${GH_USER}`;

/**
 * Work Neurodyne intends to publish. These are labelled IN DEVELOPMENT or
 * RESEARCH and carry no links, because none of them are public yet — a repo
 * card that 404s is worse than no card. Anything that goes live appears
 * automatically in the live section above from the GitHub API; delete it from
 * here once it does.
 */
const PLANNED = [
  {
    name: "agent-skills-africa",
    description:
      "AI agent skills for African services: mobile money, identity lookups, logistics. Making local infrastructure reachable by agents, not only by people using apps.",
    maturity: "RESEARCH" as const,
    tags: ["AI Agents", "MCP"],
  },
  {
    name: "github-actions-field-guide",
    description:
      "A practical, security-first guide to GitHub Actions, from its event model through reusable workflows, OIDC deployment, releases and operational governance.",
    maturity: "IN DEVELOPMENT" as const,
    tags: ["CI/CD", "OIDC", "DevOps"],
  },
  {
    name: "bash-field-guide",
    description:
      "A plain-language learning series on Bash as the connective tissue of local development, CI runners, containers and production operations.",
    maturity: "IN DEVELOPMENT" as const,
    tags: ["Bash", "Learning", "Operations"],
  },
];

function RepoCard({ repo, index }: { repo: Repo; index: number }) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
    >
      <Box
        component="a"
        href={repo.url}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          display: "block",
          p: 3,
          border: "1px solid",
          borderColor: "divider",
          textDecoration: "none",
          color: "inherit",
          transition: "border-color .25s ease, transform .25s ease",
          "&:hover, &:focus-visible": { borderColor: "#6C63FF66", transform: "translateY(-2px)" },
        }}
      >
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", gap: 2, mb: 1 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
            <GitHubIcon sx={{ fontSize: 18, color: "text.secondary", opacity: 0.6, flexShrink: 0 }} />
            <Typography sx={{ fontFamily: "monospace", fontSize: "0.95rem", fontWeight: 700, color: "#6C63FF", wordBreak: "break-word" }}>
              {repo.name}
            </Typography>
          </Stack>
          {repo.stars > 0 && (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", flexShrink: 0 }}>
              <StarBorderIcon sx={{ fontSize: 15, color: "text.secondary" }} />
              <Typography sx={{ fontFamily: "monospace", fontSize: "0.75rem", color: "text.secondary" }}>
                {repo.stars}
              </Typography>
            </Stack>
          )}
        </Stack>

        {repo.description && (
          <Typography sx={{ color: "text.secondary", lineHeight: 1.7, mb: 2, fontSize: "0.9rem" }}>
            {repo.description}
          </Typography>
        )}

        <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
          {repo.language && (
            <Typography sx={{ fontFamily: "monospace", fontSize: "0.68rem", color: "text.secondary", letterSpacing: "0.1em" }}>
              {repo.language.toUpperCase()}
            </Typography>
          )}
          {repo.license && (
            <Typography sx={{ fontFamily: "monospace", fontSize: "0.68rem", color: "text.secondary", opacity: 0.7 }}>
              {repo.license}
            </Typography>
          )}
          <Typography sx={{ fontFamily: "monospace", fontSize: "0.68rem", color: "text.secondary", opacity: 0.7 }}>
            Updated {new Date(repo.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </Typography>
        </Stack>
      </Box>
    </MotionBox>
  );
}

export default function OpenSource() {
  const { status, repos } = useGitHubRepos();

  return (
    <>
      <SEO
        title="Open Source"
        description="Open-source libraries, reference implementations and field guides from Neurodyne. Repository data is read live from GitHub — nothing here is hand-entered."
        canonical="https://neurodyne.dev/open-source"
        ogUrl="https://neurodyne.dev/open-source"
      />

      <PageHero
        icon={<GitHubIcon />}
        title="Open Source"
        description="Infrastructure that cannot be inspected is not infrastructure — it is a dependency. What is published is published in full; what is not yet public is listed as exactly that."
        tag="BUILD // IN PUBLIC"
        accentWord="Source"
        iconColor="#6C63FF"
        iconLabel="GITHUB"
      />

      <Container maxWidth="md" sx={{ py: { xs: 6, md: 9 } }}>
        {/* ── Live repositories ────────────────────────────────────────── */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{ alignItems: { sm: "flex-end" }, justifyContent: "space-between", gap: 2, mb: 3 }}
        >
          <Box>
            <Overline color="#6C63FF">Published</Overline>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 800, mt: 1.5, letterSpacing: "-0.02em" }}>
              Digital Ghana
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.8, maxWidth: 620, fontSize: "0.95rem" }}>
              An open portfolio of Ghanaian digital public infrastructure — registries, validators and
              reference data that any developer can build against. This is the published half of the
              Digital Public Infrastructure pillar. Repository data is read live from GitHub.
            </Typography>
          </Box>
          <Button
            component="a"
            href={PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<GitHubIcon />}
            sx={{ borderRadius: 0, fontWeight: 700, flexShrink: 0 }}
          >
            @{GH_USER}
          </Button>
        </Stack>

        {status === "loading" && (
          <Stack spacing={2} aria-busy="true" aria-label="Loading repositories">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} variant="rectangular" height={132} sx={{ borderRadius: 0 }} />
            ))}
          </Stack>
        )}

        {status === "unavailable" && (
          <Alert severity="info" sx={{ borderRadius: 0 }}>
            Repository data could not be loaded from GitHub right now. You can browse the work directly at{" "}
            <Box component="a" href={PROFILE_URL} target="_blank" rel="noopener noreferrer" sx={{ color: "#6C63FF" }}>
              github.com/{GH_USER}
            </Box>
            .
          </Alert>
        )}

        {status === "ready" && repos.length === 0 && (
          <Alert severity="info" sx={{ borderRadius: 0 }}>
            Nothing published under this collection yet. The work below is what is being prepared.
          </Alert>
        )}

        {status === "ready" && repos.length > 0 && (
          <Stack spacing={2}>
            {repos.map((r, i) => (
              <RepoCard key={r.name} repo={r} index={i} />
            ))}
          </Stack>
        )}
      </Container>

      {/* ── Planned work ───────────────────────────────────────────────── */}
      <Box sx={{ borderTop: "1px solid", borderColor: "divider", py: { xs: 6, md: 9 } }}>
        <Container maxWidth="md">
          <Overline color="#F59E0B">In preparation</Overline>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 800, mt: 1.5, letterSpacing: "-0.02em" }}>
            Not published yet
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2, lineHeight: 1.85, maxWidth: 680 }}>
            These have no links because they are not public. They appear in the live section above the
            moment they are.
          </Typography>

          <Stack spacing={2} sx={{ mt: 4 }}>
            {PLANNED.map((r, i) => (
              <MotionBox
                key={r.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
              >
                <Box component="article" sx={{ p: 3, border: "1px dashed", borderColor: "divider" }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", gap: 2, mb: 1 }}>
                    <Typography sx={{ fontFamily: "monospace", fontSize: "0.95rem", fontWeight: 700, color: "text.secondary", wordBreak: "break-word" }}>
                      {r.name}
                    </Typography>
                    <MaturityBadge maturity={r.maturity} size="small" />
                  </Stack>
                  <Typography sx={{ color: "text.secondary", lineHeight: 1.7, mb: 2, fontSize: "0.9rem" }}>
                    {r.description}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                    {r.tags.map((t) => (
                      <Chip
                        key={t}
                        label={t}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: 0, fontFamily: "monospace", fontSize: "0.58rem", height: 20 }}
                      />
                    ))}
                  </Stack>
                </Box>
              </MotionBox>
            ))}
          </Stack>

          <Button
            component="a"
            href={`${PROFILE_URL}?tab=repositories`}
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<ArrowForwardIcon />}
            sx={{ borderRadius: 0, mt: 4, px: 0, fontWeight: 700 }}
          >
            Follow the work on GitHub
          </Button>
        </Container>
      </Box>

      <CommunityBlock />
    </>
  );
}
