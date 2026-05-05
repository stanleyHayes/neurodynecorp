import { useState, useRef, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";

const MotionBox = motion.create(Box);

const items = [
  { label: "HOME", subtitle: "MAIN SECTOR", path: "/", index: "01" },
  { label: "ABOUT", subtitle: "INTEL BRIEF", path: "/about", index: "02" },
  { label: "SERVICES", subtitle: "CAPABILITIES", path: "/services", index: "03" },
  { label: "PORTFOLIO", subtitle: "OPERATIONS LOG", path: "/portfolio", index: "04" },
  { label: "BLOG", subtitle: "TRANSMISSIONS", path: "/blog", index: "05" },
  { label: "CONTACT", subtitle: "COMM LINK", path: "/contact", index: "06" },
];

const ctaItem = {
  label: "START A PROJECT",
  subtitle: "INITIATE SEQUENCE",
  path: "/start-project",
  index: "07",
};

// Synthesize a short select blip
function playSelectSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(2640, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.08, ctx.currentTime + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc2.start(ctx.currentTime + 0.05);
    osc2.stop(ctx.currentTime + 0.25);
  } catch {
    // Audio not available
  }
}

function playHoverSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // Audio not available
  }
}

const BORDER = "rgba(108, 99, 255, 0.10)";
const BRACKET_COLOR = "rgba(108, 99, 255, 0.18)";
const BRACKET_HOVER = "rgba(108, 99, 255, 0.45)";

function CornerBrackets({ active }: { active?: boolean }) {
  const color = active ? BRACKET_HOVER : BRACKET_COLOR;
  return (
    <>
      {[
        { top: 10, left: 10, bT: true, bL: true },
        { top: 10, right: 10, bT: true, bR: true },
        { bottom: 10, left: 10, bB: true, bL: true },
        { bottom: 10, right: 10, bB: true, bR: true },
      ].map((pos, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            ...(pos.top !== undefined && { top: pos.top }),
            ...(pos.bottom !== undefined && { bottom: pos.bottom }),
            ...(pos.left !== undefined && { left: pos.left }),
            ...(pos.right !== undefined && { right: pos.right }),
            width: 20,
            height: 20,
            borderTop: pos.bT ? `2px solid ${color}` : "none",
            borderBottom: pos.bB ? `2px solid ${color}` : "none",
            borderLeft: pos.bL ? `2px solid ${color}` : "none",
            borderRight: pos.bR ? `2px solid ${color}` : "none",
            pointerEvents: "none",
            zIndex: 3,
            transition: "border-color 0.3s",
          }}
        />
      ))}
    </>
  );
}

interface GridMenuProps {
  onNavigate: () => void;
}

export default function GridMenu({ onNavigate }: GridMenuProps) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState<"grid" | "selected" | "done">("grid");
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback(
    (path: string) => {
      if (phase !== "grid") return;
      playSelectSound();
      setSelected(path);
      setPhase("selected");

      setTimeout(() => {
        setPhase("done");
        navigate(path);
        onNavigate();
      }, 800);
    },
    [phase, navigate, onNavigate],
  );

  const handleHover = useCallback(
    (path: string) => {
      if (phase !== "grid") return;
      setHoveredPath(path);
      playHoverSound();
    },
    [phase],
  );

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        bgcolor: "#0A0E1A",
        overflow: "hidden",
      }}
    >
      {/* Scanlines */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(108,99,255,0.03) 2px, rgba(108,99,255,0.03) 4px)",
          pointerEvents: "none",
          zIndex: 50,
        }}
      />

      {/* Grid */}
      <AnimatePresence>
        {(phase === "grid" || phase === "selected") && (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            sx={{
              position: "absolute",
              inset: 0,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gridTemplateRows: "1fr 1fr auto",
            }}
          >
            {items.map((item, i) => {
              const isHovered = hoveredPath === item.path;
              const isSelected = selected === item.path;
              const active = isHovered || isSelected;
              const col = i % 3;

              return (
                <MotionBox
                  key={item.path}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    background: isSelected
                      ? "rgba(108, 99, 255, 0.06)"
                      : isHovered
                        ? "rgba(108, 99, 255, 0.03)"
                        : "transparent",
                  }}
                  transition={{
                    opacity: { duration: 0.3, delay: i * 0.05 },
                    background: { duration: 0.2 },
                  }}
                  onHoverStart={() => handleHover(item.path)}
                  onHoverEnd={() => setHoveredPath(null)}
                  onClick={() => handleSelect(item.path)}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    cursor: phase === "grid" ? "pointer" : "default",
                    position: "relative",
                    borderRight: col < 2 ? `1px solid ${BORDER}` : "none",
                    borderBottom: `1px solid ${BORDER}`,
                    overflow: "hidden",
                    userSelect: "none",
                  }}
                >
                  <CornerBrackets active={active} />

                  {/* Index */}
                  <Typography
                    sx={{
                      position: "absolute",
                      top: 14,
                      left: 18,
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: "rgba(108, 99, 255, 0.35)",
                      letterSpacing: "0.15em",
                      fontFamily: "monospace",
                    }}
                  >
                    {item.index}
                  </Typography>

                  {/* Subtitle */}
                  <Typography
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.6rem",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.3em",
                      color: "rgba(108, 99, 255, 0.35)",
                      transition: "color 0.3s",
                      ...(active && { color: "rgba(108, 99, 255, 0.55)" }),
                    }}
                  >
                    {item.subtitle}
                  </Typography>

                  {/* Title */}
                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontSize: { xs: "1.5rem", sm: "2rem", md: "2.8rem" },
                      letterSpacing: "0.04em",
                      color: active ? "#CBD5E1" : "#475569",
                      transition: "color 0.3s, text-shadow 0.3s",
                      textTransform: "uppercase",
                      ...(isSelected && {
                        color: "#E2E8F0",
                        textShadow: "0 0 30px rgba(108, 99, 255, 0.3)",
                      }),
                    }}
                  >
                    {item.label}
                  </Typography>

                  {/* Selected flash */}
                  {isSelected && (
                    <MotionBox
                      initial={{ scale: 0, opacity: 0.6 }}
                      animate={{ scale: 4, opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      sx={{
                        position: "absolute",
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        border: "2px solid rgba(108, 99, 255, 0.5)",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                </MotionBox>
              );
            })}

            {/* CTA row — spans all 3 columns */}
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                background:
                  selected === ctaItem.path
                    ? "rgba(0, 212, 170, 0.06)"
                    : hoveredPath === ctaItem.path
                      ? "rgba(0, 212, 170, 0.03)"
                      : "transparent",
              }}
              transition={{
                opacity: { duration: 0.3, delay: 0.35 },
                background: { duration: 0.2 },
              }}
              onHoverStart={() => handleHover(ctaItem.path)}
              onHoverEnd={() => setHoveredPath(null)}
              onClick={() => handleSelect(ctaItem.path)}
              sx={{
                gridColumn: "1 / -1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                py: { xs: 4, md: 6 },
                cursor: phase === "grid" ? "pointer" : "default",
                position: "relative",
                overflow: "hidden",
                userSelect: "none",
              }}
            >
              <CornerBrackets active={hoveredPath === ctaItem.path || selected === ctaItem.path} />

              {/* Index */}
              <Typography
                sx={{
                  position: "absolute",
                  top: 14,
                  left: 18,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "rgba(108, 99, 255, 0.35)",
                  letterSpacing: "0.15em",
                  fontFamily: "monospace",
                }}
              >
                {ctaItem.index}
              </Typography>

              {/* Subtitle */}
              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.6rem",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.3em",
                  color: "rgba(108, 99, 255, 0.35)",
                  transition: "color 0.3s",
                  ...((hoveredPath === ctaItem.path || selected === ctaItem.path) && {
                    color: "rgba(108, 99, 255, 0.55)",
                  }),
                }}
              >
                {ctaItem.subtitle}
              </Typography>

              {/* Title with gradient */}
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3.2rem" },
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  fontStyle: "italic",
                  background:
                    hoveredPath === ctaItem.path || selected === ctaItem.path
                      ? "linear-gradient(135deg, #6C63FF, #00D4AA)"
                      : "linear-gradient(135deg, #475569, #334155)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  transition: "filter 0.3s",
                  ...(selected === ctaItem.path && {
                    filter: "drop-shadow(0 0 20px rgba(0, 212, 170, 0.3))",
                  }),
                }}
              >
                {ctaItem.label}
              </Typography>

              {selected === ctaItem.path && (
                <MotionBox
                  initial={{ scale: 0, opacity: 0.6 }}
                  animate={{ scale: 6, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  sx={{
                    position: "absolute",
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    border: "2px solid rgba(0, 212, 170, 0.5)",
                    pointerEvents: "none",
                  }}
                />
              )}
            </MotionBox>
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  );
}
