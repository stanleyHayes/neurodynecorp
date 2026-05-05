import { useState, useMemo } from "react";
import { Box, Typography, Stack, Chip, Button } from "@mui/material";
import { motion } from "framer-motion";
import { Link } from "react-router";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";

const MotionBox = motion.create(Box);

const projectTypes = [
  { id: "web_app", label: "Web App", baseCost: 35000, baseWeeks: 8 },
  { id: "mobile_app", label: "Mobile App", baseCost: 50000, baseWeeks: 12 },
  { id: "ai_system", label: "AI / ML", baseCost: 60000, baseWeeks: 14 },
  { id: "blockchain", label: "Blockchain", baseCost: 75000, baseWeeks: 16 },
];

const features = [
  { id: "auth", label: "Authentication", cost: 4000, weeks: 1 },
  { id: "payments", label: "Payments", cost: 6000, weeks: 1.5 },
  { id: "realtime", label: "Real-time / Chat", cost: 8000, weeks: 2 },
  { id: "ai", label: "AI Integration", cost: 10000, weeks: 2.5 },
  { id: "admin", label: "Admin Dashboard", cost: 7000, weeks: 1.5 },
  { id: "mobile", label: "Mobile Companion", cost: 12000, weeks: 3 },
  { id: "analytics", label: "Analytics", cost: 5000, weeks: 1 },
  { id: "integrations", label: "3rd-party Integrations", cost: 4500, weeks: 1 },
];

const fmtMoney = (n: number) => {
  if (n >= 1000) return `$${Math.round(n / 1000)}K`;
  return `$${n}`;
};

export default function CostEstimator() {
  const [type, setType] = useState(projectTypes[0]!.id);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const estimate = useMemo(() => {
    const t = projectTypes.find((p) => p.id === type)!;
    const featureCost = selectedFeatures.reduce(
      (sum, fid) => sum + (features.find((f) => f.id === fid)?.cost ?? 0),
      0
    );
    const featureWeeks = selectedFeatures.reduce(
      (sum, fid) => sum + (features.find((f) => f.id === fid)?.weeks ?? 0),
      0
    );
    const min = t.baseCost + featureCost;
    const max = Math.round(min * 1.4);
    const weeks = Math.round(t.baseWeeks + featureWeeks);
    return { min, max, weeks };
  }, [type, selectedFeatures]);

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
      <Typography
        sx={{
          fontFamily: "monospace",
          fontSize: "0.65rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "#6C63FF",
          opacity: 0.7,
          mb: 1,
        }}
      >
        // INSTANT ESTIMATE
      </Typography>
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: { xs: "1.6rem", md: "2.2rem" },
          letterSpacing: "-0.02em",
          mb: 1,
          background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Ballpark in 10 seconds
      </Typography>
      <Typography sx={{ color: "text.secondary", opacity: 0.7, mb: 4, maxWidth: 480 }}>
        Pick a project type, toggle features, and see the range. Final scope is locked in your kickoff spec.
      </Typography>

      {/* Project type */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.2em", color: "text.secondary", opacity: 0.6, mb: 1.5, textTransform: "uppercase" }}>
          Project type
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
          {projectTypes.map((p) => (
            <Chip
              key={p.id}
              label={p.label}
              onClick={() => setType(p.id)}
              sx={{
                fontFamily: "monospace",
                fontSize: "0.7rem",
                fontWeight: 600,
                px: 1,
                cursor: "pointer",
                bgcolor: type === p.id ? "rgba(108,99,255,0.15)" : "transparent",
                color: type === p.id ? "#6C63FF" : "text.secondary",
                border: type === p.id ? "1px solid #6C63FF" : "1px solid rgba(108,99,255,0.2)",
                transition: "all 0.2s",
                "&:hover": { borderColor: "#6C63FF", bgcolor: "rgba(108,99,255,0.08)" },
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* Features */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.2em", color: "text.secondary", opacity: 0.6, mb: 1.5, textTransform: "uppercase" }}>
          Features ({selectedFeatures.length} selected)
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
          {features.map((f) => {
            const active = selectedFeatures.includes(f.id);
            return (
              <Chip
                key={f.id}
                label={`${f.label} +${fmtMoney(f.cost)}`}
                onClick={() => toggle(f.id)}
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.65rem",
                  px: 0.5,
                  cursor: "pointer",
                  bgcolor: active ? "rgba(0,212,170,0.15)" : "transparent",
                  color: active ? "#00D4AA" : "text.secondary",
                  border: active ? "1px solid #00D4AA" : "1px solid rgba(108,99,255,0.15)",
                  transition: "all 0.2s",
                  "&:hover": { borderColor: "#00D4AA50" },
                }}
              />
            );
          })}
        </Stack>
      </Box>

      {/* Result */}
      <MotionBox
        key={`${type}-${selectedFeatures.length}-${estimate.min}`}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr auto" },
          gap: { xs: 2, md: 3 },
          alignItems: "center",
          p: { xs: 2, md: 3 },
          borderRadius: 2,
          background: "rgba(10, 14, 26, 0.4)",
          border: "1px solid rgba(108, 99, 255, 0.2)",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <AttachMoneyIcon sx={{ fontSize: 32, color: "#6C63FF", filter: "drop-shadow(0 0 12px rgba(108,99,255,0.5))" }} />
          <Box>
            <Typography sx={{ fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.2em", color: "text.secondary", opacity: 0.5, textTransform: "uppercase" }}>
              Estimated cost
            </Typography>
            <Typography sx={{ fontWeight: 800, fontSize: "1.5rem", color: "text.primary" }}>
              {fmtMoney(estimate.min)} – {fmtMoney(estimate.max)}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <ScheduleOutlinedIcon sx={{ fontSize: 32, color: "#00D4AA", filter: "drop-shadow(0 0 12px rgba(0,212,170,0.5))" }} />
          <Box>
            <Typography sx={{ fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.2em", color: "text.secondary", opacity: 0.5, textTransform: "uppercase" }}>
              Timeline
            </Typography>
            <Typography sx={{ fontWeight: 800, fontSize: "1.5rem", color: "text.primary" }}>
              ~{estimate.weeks} weeks
            </Typography>
          </Box>
        </Stack>

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
          Lock the spec
        </Button>
      </MotionBox>

      <Typography sx={{ mt: 2, fontFamily: "monospace", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5, textAlign: "center" }}>
        Estimate is indicative. Final pricing reflects scope locked in your spec doc.
      </Typography>
    </Box>
  );
}
