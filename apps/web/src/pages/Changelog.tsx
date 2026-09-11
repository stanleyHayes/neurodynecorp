import { useEffect, useState } from "react";
import { Box, Typography, Container, Stack, Chip, Button } from "@mui/material";
import { motion } from "framer-motion";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import HistoryEduOutlinedIcon from "@mui/icons-material/HistoryEduOutlined";
import { Link } from "react-router";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloudOffOutlinedIcon from "@mui/icons-material/CloudOffOutlined";
import ContentSkeleton from "@/components/shared/ContentSkeleton";
import { CHANGELOG_COPY } from "@/content/interface";
import { loadChangelog, type ChangelogEntry as Entry } from "@/api/changelog";

const MotionBox = motion.create(Box);

const TYPE_COLORS: Record<string, string> = {
  feature: "#10B981",
  improvement: "#6C63FF",
  fix: "#F59E0B",
  security: "#EF4444",
};

export default function Changelog() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    setLoading(true);
    setError("");
    const baseUrl =
      import.meta.env.VITE_PUBLIC_CONTENT_API_URL ??
      import.meta.env.VITE_API_URL ??
      "https://api.neurodyne.dev";
    void loadChangelog(baseUrl, controller.signal)
      .then((items) => {
        if (!cancelled) setEntries(items);
      })
      .catch(() => {
        if (!cancelled) setError("unavailable");
      })
      .finally(() => {
        clearTimeout(timeout);
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  return (
    <>
      <SEO
        title="Changelog"
        description="Recent changes, new features, and improvements to the NeuroDyne Corp platform."
      />

      <PageHero
        icon={<HistoryEduOutlinedIcon />}
        title="Changelog"
        description={CHANGELOG_COPY.description}
        tag="WHAT'S // NEW"
        accentWord="log"
        iconColor="#6C63FF"
        iconLabel="RELEASE NOTES"
      />

      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        {loading ? (
          <ContentSkeleton />
        ) : error || entries.length === 0 ? (
          <Box
            role={error ? "alert" : "status"}
            sx={{
              position: "relative",
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
              p: { xs: 3, md: 5 },
            }}
          >
            <Box aria-hidden sx={{ position: "absolute", right: -20, bottom: -35, opacity: 0.045 }}>
              <HistoryEduOutlinedIcon sx={{ fontSize: 260 }} />
            </Box>
            <Box sx={{ position: "relative", maxWidth: 570 }}>
              {error ? (
                <CloudOffOutlinedIcon sx={{ color: "primary.main", fontSize: 38, mb: 2 }} />
              ) : (
                <HistoryEduOutlinedIcon sx={{ color: "primary.main", fontSize: 38, mb: 2 }} />
              )}
              <Typography component="h2" variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
                {error ? CHANGELOG_COPY.unavailableTitle : CHANGELOG_COPY.emptyTitle}
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.75 }}>
                {error ? CHANGELOG_COPY.unavailableBody : CHANGELOG_COPY.emptyBody}
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3 }}>
                {error && (
                  <Button
                    variant="contained"
                    startIcon={<RefreshOutlinedIcon />}
                    onClick={() => setAttempt((value) => value + 1)}
                  >
                    Try again
                  </Button>
                )}
                <Button
                  component={Link}
                  to="/open-source"
                  variant={error ? "outlined" : "contained"}
                  endIcon={<ArrowForwardIcon />}
                >
                  Explore open source
                </Button>
                <Button component={Link} to="/contact">
                  Contact Neurodyne
                </Button>
              </Stack>
            </Box>
          </Box>
        ) : (
          <Stack spacing={5}>
            {entries.map((e, i) => (
              <MotionBox
                key={e.id}
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
                <Box
                  sx={{
                    position: "absolute",
                    left: -6,
                    top: 4,
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    bgcolor: TYPE_COLORS[e.type] ?? TYPE_COLORS.improvement,
                    boxShadow: `0 0 12px ${TYPE_COLORS[e.type] ?? TYPE_COLORS.improvement}`,
                    border: "2px solid #0A0E1A",
                  }}
                />

                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: "center", mb: 1, flexWrap: "wrap", gap: 1 }}
                >
                  <Typography
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.75rem",
                      color: "#6C63FF",
                      fontWeight: 700,
                    }}
                  >
                    {e.version}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.65rem",
                      color: "text.secondary",
                      opacity: 0.5,
                    }}
                  >
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
                      bgcolor: `${TYPE_COLORS[e.type] ?? TYPE_COLORS.improvement}18`,
                      color: TYPE_COLORS[e.type] ?? TYPE_COLORS.improvement,
                      border: `1px solid ${TYPE_COLORS[e.type] ?? TYPE_COLORS.improvement}30`,
                    }}
                  />
                </Stack>

                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}>
                  {e.title}
                </Typography>

                <Stack spacing={0.75}>
                  {e.body.map((line, idx) => (
                    <Typography
                      key={idx}
                      sx={{ color: "text.secondary", lineHeight: 1.7, fontSize: "0.92rem" }}
                    >
                      — {line}
                    </Typography>
                  ))}
                </Stack>
              </MotionBox>
            ))}
          </Stack>
        )}
      </Container>
    </>
  );
}
