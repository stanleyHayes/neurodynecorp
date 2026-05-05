import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/logo/Logo";
import DoodleBackground from "@/components/doodles/DoodleBackground";

const MotionBox = motion.create(Box);

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

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
          {/* Doodles everywhere */}
          <DoodleBackground density="dense" />

          {/* Glowing halo behind logo */}
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

          {/* Logo */}
          <MotionBox
            initial={{ opacity: 0, scale: 0.3, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
            sx={{ position: "relative", zIndex: 1 }}
          >
            <Logo size={120} />
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

          {/* Slogan */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
            sx={{ position: "relative", zIndex: 1, textAlign: "center", px: 3 }}
          >
            <Typography
              variant="h6"
              sx={{
                mt: 1.5,
                color: "text.secondary",
                fontWeight: 400,
                letterSpacing: "0.15em",
                fontSize: "1.1rem",
              }}
            >
              Engineering Intelligence. Solving Tomorrow.
            </Typography>
          </MotionBox>

          {/* Animated loading bar */}
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
