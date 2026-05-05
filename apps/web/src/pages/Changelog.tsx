import { Box, Typography, Container, Stack, Chip } from "@mui/material";
import { motion } from "framer-motion";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import HistoryEduOutlinedIcon from "@mui/icons-material/HistoryEduOutlined";

const MotionBox = motion.create(Box);

interface Entry {
  version: string;
  date: string;
  type: "feature" | "improvement" | "fix";
  title: string;
  body: string[];
}

const TYPE_COLORS: Record<Entry["type"], string> = {
  feature: "#10B981",
  improvement: "#6C63FF",
  fix: "#F59E0B",
};

const entries: Entry[] = [
  {
    version: "v0.6.0",
    date: "2026-04-22",
    type: "feature",
    title: "Cmd+K command palette + cursor trail",
    body: [
      "Press ⌘K (or Ctrl+K) anywhere to navigate, toggle theme, or jump to socials.",
      "Subtle particle trail follows the cursor on desktop — auto-disabled on touch and reduced-motion.",
    ],
  },
  {
    version: "v0.5.0",
    date: "2026-04-15",
    type: "feature",
    title: "Instant cost estimator",
    body: [
      "Pick a project type, toggle features, see ballpark range and timeline immediately.",
      "Locks scope expectations before the spec call — saves a back-and-forth round.",
    ],
  },
  {
    version: "v0.4.2",
    date: "2026-04-08",
    type: "improvement",
    title: "Markdown across blog and project descriptions",
    body: [
      "Full WYSIWYG editor in the admin (MDXEditor) for blog posts and case studies.",
      "Code blocks now syntax-highlight in TypeScript, Go, Python, Rust, and SQL.",
    ],
  },
  {
    version: "v0.4.1",
    date: "2026-03-30",
    type: "fix",
    title: "Light theme parity on Start Project",
    body: [
      "Fullscreen wizard now respects light/dark mode end-to-end.",
      "Form field borders, success screen, and grid lines adapt to the active theme.",
    ],
  },
  {
    version: "v0.4.0",
    date: "2026-03-22",
    type: "feature",
    title: "Team profiles with rich details",
    body: [
      "Click any team member to see their full profile — skills, projects, responsibilities.",
      "Founder profile pulls real bio and links from stanleyhayford.com.",
    ],
  },
  {
    version: "v0.3.0",
    date: "2026-03-12",
    type: "feature",
    title: "Content management dashboard",
    body: [
      "Manage blog, portfolio, services, testimonials, and contact submissions from one place.",
      "Each entity has its own create + detail pages with live preview.",
    ],
  },
  {
    version: "v0.2.1",
    date: "2026-02-28",
    type: "improvement",
    title: "Empty states and skeleton loaders",
    body: [
      "Every list now has a proper empty state instead of a blank screen.",
      "Loading states use shimmer skeletons so layout doesn't jump on data load.",
    ],
  },
  {
    version: "v0.2.0",
    date: "2026-02-18",
    type: "feature",
    title: "AI-assisted specification engine",
    body: [
      "Adaptive questionnaire generates a delivery-ready spec doc.",
      "Spec includes feature breakdown, timeline, role permissions, and tech architecture.",
    ],
  },
  {
    version: "v0.1.0",
    date: "2026-01-12",
    type: "feature",
    title: "Initial public beta",
    body: ["First launch of NeuroDyne Corp — the productized software engineering platform."],
  },
];

export default function Changelog() {
  return (
    <>
      <SEO
        title="Changelog"
        description="Recent changes, new features, and improvements to the NeuroDyne Corp platform."
      />

      <PageHero
        icon={<HistoryEduOutlinedIcon />}
        title="Changelog"
        description="Every shipped feature, polish pass, and fix — in reverse order. We ship in the open."
        tag="WHAT'S // NEW"
        accentWord="log"
        iconColor="#6C63FF"
        iconLabel="LIVE FEED"
      />

      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={5}>
          {entries.map((e, i) => (
            <MotionBox
              key={e.version}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
              sx={{
                position: "relative",
                pl: { xs: 3, md: 4 },
                borderLeft: "1px solid rgba(108,99,255,0.15)",
                pb: 2,
              }}
            >
              {/* Dot */}
              <Box
                sx={{
                  position: "absolute",
                  left: -6,
                  top: 4,
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: TYPE_COLORS[e.type],
                  boxShadow: `0 0 12px ${TYPE_COLORS[e.type]}`,
                  border: "2px solid #0A0E1A",
                }}
              />

              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1, flexWrap: "wrap", gap: 1 }}>
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#6C63FF", fontWeight: 700 }}>
                  {e.version}
                </Typography>
                <Typography sx={{ fontFamily: "monospace", fontSize: "0.65rem", color: "text.secondary", opacity: 0.5 }}>
                  {e.date}
                </Typography>
                <Chip
                  label={e.type.toUpperCase()}
                  size="small"
                  sx={{
                    fontFamily: "monospace",
                    fontSize: "0.55rem",
                    fontWeight: 700,
                    height: 18,
                    bgcolor: `${TYPE_COLORS[e.type]}18`,
                    color: TYPE_COLORS[e.type],
                    border: `1px solid ${TYPE_COLORS[e.type]}30`,
                  }}
                />
              </Stack>

              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}>
                {e.title}
              </Typography>

              <Stack spacing={0.75}>
                {e.body.map((line, idx) => (
                  <Typography key={idx} sx={{ color: "text.secondary", lineHeight: 1.7, fontSize: "0.92rem" }}>
                    — {line}
                  </Typography>
                ))}
              </Stack>
            </MotionBox>
          ))}
        </Stack>
      </Container>
    </>
  );
}
