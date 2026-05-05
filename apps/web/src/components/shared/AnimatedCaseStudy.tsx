import { useState } from "react";
import { Box, Typography, Stack, Chip } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import { playSound } from "@/hooks/useSound";

const MotionBox = motion.create(Box);

interface CaseStudyCardProps {
  title: string;
  category: string;
  tags: string[];
  description: string;
  impact?: string;
  results?: string[];
  color: string;
  index: string;
  href?: string;
}

const STEPS = [
  { label: "PROBLEM", color: "#F59E0B" },
  { label: "APPROACH", color: "#6C63FF" },
  { label: "OUTCOME", color: "#10B981" },
];

export default function AnimatedCaseStudy({
  title,
  category,
  tags,
  description,
  impact,
  results,
  color,
  index,
  href,
}: CaseStudyCardProps) {
  const [hovered, setHovered] = useState(false);
  const [step, setStep] = useState(0);

  const slides = [
    description,
    `Built with ${tags.join(", ")}. Architecture optimized for the constraints in this domain.`,
    impact ? `Delivered: ${impact}.${results?.length ? " " + results.slice(0, 2).join(" · ") : ""}` : "Delivered on time, on spec.",
  ];

  return (
    <MotionBox
      onHoverStart={() => {
        setHovered(true);
        setStep(0);
        playSound("hover");
      }}
      onHoverEnd={() => {
        setHovered(false);
        setStep(0);
      }}
      onClick={() => {
        if (href) window.location.href = href;
        playSound("click");
      }}
      sx={{
        position: "relative",
        p: { xs: 3, md: 4 },
        minHeight: { xs: 280, md: 360 },
        cursor: href ? "pointer" : "default",
        overflow: "hidden",
        background: hovered ? `${color}06` : "transparent",
        borderRight: { md: "1px solid rgba(108,99,255,0.1)" },
        borderBottom: "1px solid rgba(108,99,255,0.1)",
        transition: "background 0.3s",
      }}
    >
      {/* Index */}
      <Typography
        sx={{
          position: "absolute",
          top: 16,
          left: 24,
          fontFamily: "monospace",
          fontSize: "0.65rem",
          color: hovered ? color : "text.secondary",
          opacity: 0.5,
          letterSpacing: "0.15em",
          transition: "color 0.3s",
        }}
      >
        {index}
      </Typography>

      {/* Corner brackets */}
      {[
        { top: 12, left: 12, bT: true, bL: true },
        { top: 12, right: 12, bT: true, bR: true },
        { bottom: 12, left: 12, bB: true, bL: true },
        { bottom: 12, right: 12, bB: true, bR: true },
      ].map((pos, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            ...(pos.top !== undefined && { top: pos.top }),
            ...(pos.bottom !== undefined && { bottom: pos.bottom }),
            ...(pos.left !== undefined && { left: pos.left }),
            ...(pos.right !== undefined && { right: pos.right }),
            width: 16,
            height: 16,
            borderTop: pos.bT ? `2px solid ${color}${hovered ? "70" : "20"}` : "none",
            borderBottom: pos.bB ? `2px solid ${color}${hovered ? "70" : "20"}` : "none",
            borderLeft: pos.bL ? `2px solid ${color}${hovered ? "70" : "20"}` : "none",
            borderRight: pos.bR ? `2px solid ${color}${hovered ? "70" : "20"}` : "none",
            filter: hovered ? `drop-shadow(0 0 6px ${color}50)` : "none",
            transition: "all 0.3s",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Title + arrow */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mt: 3, mb: 1.5 }}>
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.02em",
              background: hovered ? `linear-gradient(135deg, ${color}, #00D4AA)` : "transparent",
              backgroundClip: hovered ? "text" : "unset",
              WebkitBackgroundClip: hovered ? "text" : "unset",
              WebkitTextFillColor: hovered ? "transparent" : "inherit",
              transition: "all 0.3s",
            }}
          >
            {title}
          </Typography>
          <Typography sx={{ fontFamily: "monospace", fontSize: "0.65rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.15em", textTransform: "uppercase", mt: 0.5 }}>
            {category}
          </Typography>
        </Box>
        <ArrowOutwardIcon
          sx={{
            color: hovered ? color : "text.secondary",
            opacity: hovered ? 1 : 0.4,
            transform: hovered ? "translate(4px, -4px)" : "none",
            transition: "all 0.3s",
            fontSize: 22,
          }}
        />
      </Stack>

      {/* Step indicator dots */}
      <Stack direction="row" spacing={0.75} sx={{ mb: 2 }}>
        {STEPS.map((s, i) => (
          <Box
            key={s.label}
            onClick={(e) => {
              e.stopPropagation();
              setStep(i);
            }}
            onMouseEnter={() => hovered && setStep(i)}
            sx={{
              flex: 1,
              height: 3,
              borderRadius: 1,
              bgcolor: i <= step && hovered ? s.color : "rgba(108,99,255,0.12)",
              boxShadow: i === step && hovered ? `0 0 6px ${s.color}` : "none",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
          />
        ))}
      </Stack>

      {/* Step label + slide content */}
      <Box sx={{ minHeight: 100 }}>
        <Typography
          sx={{
            fontFamily: "monospace",
            fontSize: "0.6rem",
            letterSpacing: "0.25em",
            color: hovered ? STEPS[step]!.color : "text.secondary",
            opacity: hovered ? 0.9 : 0.5,
            mb: 1.5,
            transition: "color 0.3s",
          }}
        >
          {hovered ? STEPS[step]!.label : "HOVER TO EXPLORE"}
        </Typography>
        <AnimatePresence mode="wait">
          <MotionBox
            key={`${step}-${hovered}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <Typography sx={{ color: "text.secondary", lineHeight: 1.7, fontSize: "0.9rem", opacity: 0.85 }}>
              {hovered ? slides[step] : description}
            </Typography>
          </MotionBox>
        </AnimatePresence>
      </Box>

      {/* Tag chips at bottom */}
      <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ gap: 0.75, mt: 2.5 }}>
        {tags.slice(0, 4).map((t) => (
          <Chip
            key={t}
            label={t}
            size="small"
            sx={{
              fontFamily: "monospace",
              fontSize: "0.6rem",
              height: 20,
              bgcolor: hovered ? `${color}15` : "rgba(108,99,255,0.06)",
              color: hovered ? color : "text.secondary",
              border: hovered ? `1px solid ${color}40` : "1px solid rgba(108,99,255,0.15)",
              transition: "all 0.3s",
            }}
          />
        ))}
      </Stack>

      {/* Bottom gradient accent */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: "10%",
          right: "10%",
          height: 2,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: hovered ? 0.6 : 0,
          transition: "opacity 0.3s",
          pointerEvents: "none",
        }}
      />
    </MotionBox>
  );
}
