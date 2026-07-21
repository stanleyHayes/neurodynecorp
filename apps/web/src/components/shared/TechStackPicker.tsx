import { useState } from "react";
import { Box, Typography, Stack, Chip, Button } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import { playSound } from "@/hooks/useSound";

const MotionBox = motion.create(Box);

interface TechItem {
  id: string;
  label: string;
  category: "frontend" | "backend" | "data" | "infra";
}

const ITEMS: TechItem[] = [
  { id: "react", label: "React", category: "frontend" },
  { id: "nextjs", label: "Next.js", category: "frontend" },
  { id: "react-native", label: "React Native", category: "frontend" },
  { id: "vue", label: "Vue", category: "frontend" },
  { id: "go", label: "Go", category: "backend" },
  { id: "node", label: "Node.js", category: "backend" },
  { id: "python", label: "Python", category: "backend" },
  { id: "rust", label: "Rust", category: "backend" },
  { id: "postgres", label: "PostgreSQL", category: "data" },
  { id: "mongo", label: "MongoDB", category: "data" },
  { id: "redis", label: "Redis", category: "data" },
  { id: "kafka", label: "Kafka", category: "data" },
  { id: "docker", label: "Docker", category: "infra" },
  { id: "k8s", label: "Kubernetes", category: "infra" },
  { id: "aws", label: "AWS", category: "infra" },
  { id: "vercel", label: "Vercel", category: "infra" },
];

const CAT_COLORS: Record<TechItem["category"], string> = {
  frontend: "#6C63FF",
  backend: "#00D4AA",
  data: "#F59E0B",
  infra: "#8B85FF",
};

const CAT_LABELS: Record<TechItem["category"], string> = {
  frontend: "FRONTEND",
  backend: "BACKEND",
  data: "DATA",
  infra: "INFRASTRUCTURE",
};

function recommend(picked: string[]): string {
  if (picked.length === 0) return "Pick a few pieces above and we'll suggest a starting blueprint.";
  const has = (id: string) => picked.includes(id);
  const recs: string[] = [];
  if (has("react") || has("nextjs")) recs.push("React frontend with SSR-ready routing");
  if (has("react-native")) recs.push("Cross-platform mobile via React Native");
  if (has("go") && has("kafka")) recs.push("Go services with event-driven Kafka pipelines");
  if (has("go") && !has("kafka")) recs.push("Go services with hexagonal architecture");
  if (has("node")) recs.push("Node.js APIs with TypeScript and gRPC");
  if (has("postgres")) recs.push("PostgreSQL with logical replication and read replicas");
  if (has("mongo")) recs.push("MongoDB with multi-tenant collection sharding");
  if (has("k8s")) recs.push("Kubernetes-native deployment with autoscaling");
  if (has("aws") || has("vercel")) recs.push("Managed cloud with observability baked in");
  if (recs.length === 0) recs.push("A custom architecture tailored to your scale and team");
  return recs.join(" · ");
}

export default function TechStackPicker() {
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (id: string) => {
    playSound("hover");
    setPicked((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const groups: TechItem["category"][] = ["frontend", "backend", "data", "infra"];

  return (
    <Box
      sx={{
        position: "relative",
        p: { xs: 3, md: 5 },
        borderRadius: 3,
        border: "1px solid rgba(108, 99, 255, 0.18)",
        background: "linear-gradient(135deg, rgba(108,99,255,0.04), rgba(0,212,170,0.03))",
      }}
    >
      <Typography sx={{ fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#6C63FF", opacity: 0.7, mb: 1 }}>
        // BUILD WITH US
      </Typography>
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: { xs: "1.5rem", md: "2rem" },
          letterSpacing: "-0.02em",
          mb: 1,
          background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Pick your stack
      </Typography>
      <Typography sx={{ color: "text.secondary", opacity: 0.7, mb: 4, maxWidth: 480 }}>
        Tap pieces below. We'll suggest a battle-tested architecture as you build.
      </Typography>

      {/* Category groups */}
      <Stack spacing={3} sx={{ mb: 4 }}>
        {groups.map((cat) => (
          <Box key={cat}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.25 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: CAT_COLORS[cat], boxShadow: `0 0 6px ${CAT_COLORS[cat]}` }} />
              <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", color: "text.secondary", opacity: 0.6, letterSpacing: "0.25em" }}>
                {CAT_LABELS[cat]}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
              {ITEMS.filter((i) => i.category === cat).map((item) => {
                const active = picked.includes(item.id);
                const c = CAT_COLORS[cat];
                return (
                  <Chip
                    key={item.id}
                    label={item.label}
                    onClick={() => toggle(item.id)}
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      px: 0.5,
                      bgcolor: active ? `${c}20` : "transparent",
                      color: active ? c : "text.secondary",
                      border: active ? `1px solid ${c}` : "1px solid rgba(108,99,255,0.15)",
                      transition: "all 0.2s",
                      "&:hover": { borderColor: c, bgcolor: `${c}10` },
                    }}
                  />
                );
              })}
            </Stack>
          </Box>
        ))}
      </Stack>

      {/* Recommendation */}
      <AnimatePresence mode="wait">
        <MotionBox
          key={picked.join(",")}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            background: "rgba(10, 14, 26, 0.4)",
            border: "1px solid rgba(108, 99, 255, 0.2)",
            mb: 3,
          }}
        >
          <Typography sx={{ fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.25em", color: "#00D4AA", opacity: 0.8, textTransform: "uppercase", mb: 1 }}>
            Suggested blueprint
          </Typography>
          <Typography sx={{ color: "text.primary", lineHeight: 1.6, fontSize: "0.9rem" }}>
            {recommend(picked)}
          </Typography>
          {picked.length > 0 && (
            <Typography sx={{ mt: 1.5, fontFamily: "monospace", fontSize: "0.65rem", color: "text.secondary", opacity: 0.5 }}>
              {picked.length} component{picked.length === 1 ? "" : "s"} selected
            </Typography>
          )}
        </MotionBox>
      </AnimatePresence>

      <Button
        component={Link}
        to="/start-project"
        variant="contained"
        startIcon={<RocketLaunchOutlinedIcon />}
        sx={{
          fontFamily: "monospace",
          fontWeight: 700,
          letterSpacing: "0.1em",
          background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
          px: 3,
          py: 1.25,
          "&:hover": { boxShadow: "0 8px 30px rgba(108,99,255,0.4)" },
        }}
      >
        Brief us with this stack
      </Button>
    </Box>
  );
}
