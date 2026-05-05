import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion.create(Box);

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

const shapes = [
  { top: "12%", left: "10%", size: 60, delay: 0, color: "rgba(108,99,255,0.06)", type: "circle" },
  { top: "25%", right: "15%", size: 90, delay: 0.4, color: "rgba(0,212,170,0.05)", type: "square" },
  { top: "65%", left: "8%", size: 45, delay: 0.7, color: "rgba(139,133,255,0.05)", type: "square" },
  { top: "78%", right: "10%", size: 70, delay: 0.3, color: "rgba(0,212,170,0.04)", type: "circle" },
  { top: "45%", left: "75%", size: 30, delay: 0.9, color: "rgba(108,99,255,0.05)", type: "circle" },
];

export default function SplashScreen({ onComplete, duration = 3500 }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <MotionBox
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "radial-gradient(ellipse at center, #111827 0%, #0A0E1A 70%)",
            overflow: "hidden",
          }}
        >
          {/* Grid background */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `
                linear-gradient(rgba(108,99,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(108,99,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: "80px 80px",
              pointerEvents: "none",
            }}
          />

          {/* Floating doodles */}
          {shapes.map((s, i) => (
            <MotionBox
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, -10, 0] }}
              transition={{
                opacity: { duration: 0.6, delay: s.delay },
                y: { duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: s.delay },
              }}
              sx={{
                position: "absolute",
                top: s.top,
                left: "left" in s ? s.left : undefined,
                right: "right" in s ? s.right : undefined,
                width: s.size,
                height: s.size,
                borderRadius: s.type === "circle" ? "50%" : "12%",
                border: `2px solid ${s.color}`,
                pointerEvents: "none",
              }}
            />
          ))}

          {/* Glowing halo */}
          <MotionBox
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 0.4, 0.2, 0.4], scale: [0.5, 1.2, 1, 1.1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            sx={{
              position: "absolute",
              width: 280,
              height: 280,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(108,99,255,0.25) 0%, rgba(0,212,170,0.1) 50%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />

          {/* Logo mark */}
          <MotionBox
            initial={{ opacity: 0, scale: 0.3, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
            sx={{
              position: "relative",
              zIndex: 1,
              width: 100,
              height: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              component="img"
              src="/favicon.svg"
              alt="NeuroDyne Corp"
              sx={{
                width: 90,
                height: 90,
                filter: "drop-shadow(0 0 20px rgba(108,99,255,0.4)) drop-shadow(0 0 60px rgba(0,212,170,0.2))",
              }}
            />
          </MotionBox>

          {/* Company name */}
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            sx={{ mt: 4, textAlign: "center", position: "relative", zIndex: 1 }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                letterSpacing: "0.08em",
                background: "linear-gradient(135deg, #6C63FF 0%, #00D4AA 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textTransform: "uppercase",
              }}
            >
              NeuroDyne Corp
            </Typography>
          </MotionBox>

          {/* Subtitle */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
            sx={{ position: "relative", zIndex: 1 }}
          >
            <Typography
              variant="h6"
              sx={{
                mt: 1.5,
                color: "text.secondary",
                fontWeight: 400,
                letterSpacing: "0.15em",
                fontSize: "1rem",
                fontFamily: "monospace",
              }}
            >
              Client Portal
            </Typography>
          </MotionBox>

          {/* Loading bar */}
          <MotionBox
            initial={{ width: 0 }}
            animate={{ width: 200 }}
            transition={{ duration: duration / 1000 - 0.5, ease: "easeInOut", delay: 0.5 }}
            sx={{
              mt: 5,
              height: 2,
              borderRadius: 1,
              background: "linear-gradient(90deg, #6C63FF, #00D4AA)",
              position: "relative",
              zIndex: 1,
            }}
          />
        </MotionBox>
      )}
    </AnimatePresence>
  );
}
