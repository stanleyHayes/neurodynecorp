import { useEffect, useState } from "react";
import { Box, Typography, Container, Stack, Chip, CircularProgress, Alert } from "@mui/material";
import { motion } from "framer-motion";
import SEO from "@/components/seo/SEO";
import PageHero from "@/components/shared/PageHero";
import HistoryEduOutlinedIcon from "@mui/icons-material/HistoryEduOutlined";
import { api } from "@/api/client";

const MotionBox = motion.create(Box);

interface Entry {
  id: string;
  version: string;
  date: string;
  type: "feature" | "improvement" | "fix" | "security";
  title: string;
  body: string[];
}

const TYPE_COLORS: Record<string, string> = {
  feature: "#10B981",
  improvement: "#6C63FF",
  fix: "#F59E0B",
  security: "#EF4444",
};

function formatDate(value?: string | Date): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toISOString().slice(0, 10);
}

function mapEntry(raw: any): Entry {
  const bodyRaw = raw.body ?? "";
  const body = Array.isArray(bodyRaw)
    ? bodyRaw.map(String)
    : String(bodyRaw)
        .split(/\n+/)
        .map((line) => line.replace(/^[-•*]\s*/, "").trim())
        .filter(Boolean);
  const type = (raw.category ?? raw.type ?? "improvement") as Entry["type"];
  return {
    id: raw.id ?? `${raw.version}-${raw.title}`,
    version: raw.version ?? "",
    date: formatDate(raw.publishedAt ?? raw.published_at ?? raw.createdAt ?? raw.created_at),
    type: TYPE_COLORS[type] ? type : "improvement",
    title: raw.title ?? "Update",
    body: body.length > 0 ? body : ["—"],
  };
}

export default function Changelog() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await api.get<{ items?: any[] }>("/api/v1/changelog");
        if (cancelled) return;
        const items = (res.items ?? []).map(mapEntry);
        items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setEntries(items);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load changelog");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

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
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : entries.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: "center", py: 6 }}>
            No published changelog entries yet.
          </Typography>
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

                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1, flexWrap: "wrap", gap: 1 }}>
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
                    <Typography key={idx} sx={{ color: "text.secondary", lineHeight: 1.7, fontSize: "0.92rem" }}>
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
