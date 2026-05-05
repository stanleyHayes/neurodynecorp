import { useEffect, useState } from "react";
import { Box, Typography, Stack } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import { playSound } from "@/hooks/useSound";

const MotionBox = motion.create(Box);

const SEQUENCE = [
  "ArrowUp", "ArrowUp",
  "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight",
  "ArrowLeft", "ArrowRight",
  "b", "a",
];

export default function KonamiEgg() {
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const expected = SEQUENCE[progress.length];
      if (key === expected?.toLowerCase() || key === expected) {
        const next = [...progress, key];
        setProgress(next);
        if (next.length === SEQUENCE.length) {
          setActive(true);
          setProgress([]);
          playSound("success");
          setTimeout(() => setActive(false), 6000);
        }
      } else {
        setProgress([]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [progress]);

  return (
    <AnimatePresence>
      {active && (
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 9997,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Particle explosion */}
          {Array.from({ length: 60 }).map((_, i) => {
            const angle = (Math.PI * 2 * i) / 60;
            const dist = 200 + Math.random() * 400;
            return (
              <MotionBox
                key={i}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{
                  x: Math.cos(angle) * dist,
                  y: Math.sin(angle) * dist,
                  scale: [0, 1.2, 0],
                  opacity: [1, 1, 0],
                  rotate: 360,
                }}
                transition={{ duration: 2, ease: "easeOut" }}
                sx={{
                  position: "absolute",
                  width: 8,
                  height: 8,
                  borderRadius: i % 3 === 0 ? "50%" : "12%",
                  background: i % 3 === 0 ? "#6C63FF" : i % 3 === 1 ? "#00D4AA" : "#F59E0B",
                  boxShadow: `0 0 12px ${i % 3 === 0 ? "#6C63FF" : i % 3 === 1 ? "#00D4AA" : "#F59E0B"}`,
                }}
              />
            );
          })}

          {/* Center message */}
          <MotionBox
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 14 }}
            sx={{
              position: "relative",
              px: 6,
              py: 4,
              borderRadius: 3,
              background: "linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,212,170,0.12))",
              border: "1px solid rgba(108,99,255,0.4)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 0 80px rgba(108,99,255,0.4), 0 0 200px rgba(0,212,170,0.2)",
              textAlign: "center",
              maxWidth: 480,
            }}
          >
            <Stack alignItems="center" spacing={1.5}>
              <RocketLaunchOutlinedIcon sx={{ fontSize: 56, color: "#6C63FF", filter: "drop-shadow(0 0 16px #6C63FF)" }} />
              <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", letterSpacing: "0.3em", color: "#00D4AA", textTransform: "uppercase", opacity: 0.8 }}>
                ░░░ ACHIEVEMENT UNLOCKED ░░░
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.5rem", md: "2rem" }, background: "linear-gradient(135deg, #6C63FF, #00D4AA)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                You found the cheat code
              </Typography>
              <Typography sx={{ color: "text.secondary", opacity: 0.85, fontSize: "0.9rem", lineHeight: 1.6 }}>
                Mention <Box component="span" sx={{ fontFamily: "monospace", color: "#00D4AA", px: 0.75, py: 0.25, bgcolor: "rgba(0,212,170,0.1)", borderRadius: 1, mx: 0.5 }}>KONAMI20</Box> in your project intake for 20% off your first sprint.
              </Typography>
            </Stack>
          </MotionBox>
        </MotionBox>
      )}
    </AnimatePresence>
  );
}
