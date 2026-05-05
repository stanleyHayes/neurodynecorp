import { useState, useCallback } from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Timeline,
  ChatBubbleOutline,
  Receipt,
  Description,
  NotificationsActive,
  ArrowForward,
  ArrowBack,
} from "@mui/icons-material";

const MotionBox = motion.create(Box);
const MotionTypography = motion.create(Typography);

interface Particle {
  id: number;
  x: string;
  y: string;
  size: number;
  delay: number;
  duration: number;
}

const particles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: `${Math.random() * 100}%`,
  y: `${Math.random() * 100}%`,
  size: 2 + Math.random() * 4,
  delay: Math.random() * 3,
  duration: 4 + Math.random() * 6,
}));

const slides = [
  {
    icon: <Rocket sx={{ fontSize: 64 }} />,
    title: "Welcome to NeuroDyne",
    subtitle: "Your gateway to professional software engineering",
    description: "We transform your ideas into production-ready software. From concept to delivery, every step is tracked, transparent, and collaborative.",
    color: "#6C63FF",
    accent: "#8B85FF",
  },
  {
    icon: <Timeline sx={{ fontSize: 64 }} />,
    title: "Track Every Milestone",
    subtitle: "Real-time project visibility",
    description: "Follow your project through every phase — specifications, design, development, testing, and deployment. Never be in the dark again.",
    color: "#00D4AA",
    accent: "#33DDBB",
  },
  {
    icon: <ChatBubbleOutline sx={{ fontSize: 64 }} />,
    title: "Collaborate Seamlessly",
    subtitle: "Direct communication with your team",
    description: "Message your engineering team, provide feedback on deliverables, and approve milestones — all from one place.",
    color: "#6C63FF",
    accent: "#8B85FF",
  },
  {
    icon: <Description sx={{ fontSize: 64 }} />,
    title: "Specs & Documents",
    subtitle: "Everything organized and accessible",
    description: "Access your project specifications, technical documents, design assets, and final deliverables anytime.",
    color: "#00D4AA",
    accent: "#33DDBB",
  },
  {
    icon: <Receipt sx={{ fontSize: 64 }} />,
    title: "Transparent Billing",
    subtitle: "Clear invoices, easy payments",
    description: "View detailed invoices, track payment history, and manage your billing — no surprises, no hidden fees.",
    color: "#6C63FF",
    accent: "#8B85FF",
  },
  {
    icon: <NotificationsActive sx={{ fontSize: 64 }} />,
    title: "Stay in the Loop",
    subtitle: "Instant notifications on what matters",
    description: "Get notified about milestone completions, new messages, invoice updates, and everything important to your project.",
    color: "#00D4AA",
    accent: "#33DDBB",
  },
];

const slideVariants: any = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = useCallback(
    (newDirection: number) => {
      const next = page + newDirection;
      if (next < 0 || next >= slides.length) return;
      setPage([next, newDirection]);
    },
    [page],
  );

  const slide = slides[page]!;
  const isLast = page === slides.length - 1;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg, #0A0E1A 0%, #0F1629 50%, #111827 100%)",
        overflow: "hidden",
      }}
    >
      {/* Floating particles */}
      {particles.map((p) => (
        <MotionBox
          key={p.id}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.6, 0],
            y: [0, -40, 0],
            x: [0, (p.id % 2 === 0 ? 1 : -1) * 15, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
          sx={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.id % 2 === 0 ? "#6C63FF" : "#00D4AA",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Grid background */}
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
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

      {/* Gradient orbs */}
      <MotionBox
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        sx={{ position: "absolute", top: "-15%", left: "-10%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${slide.color}20 0%, transparent 70%)`, filter: "blur(100px)", pointerEvents: "none", transition: "background 0.5s" }}
      />
      <MotionBox
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        sx={{ position: "absolute", bottom: "-15%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, ${slide.accent}15 0%, transparent 70%)`, filter: "blur(100px)", pointerEvents: "none", transition: "background 0.5s" }}
      />

      {/* Skip button */}
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        sx={{ position: "absolute", top: 32, right: 40, zIndex: 10 }}
      >
        <Button
          onClick={onComplete}
          sx={{ color: "text.secondary", fontWeight: 600, "&:hover": { color: "text.primary" } }}
        >
          Skip
        </Button>
      </MotionBox>

      {/* Slide content */}
      <Box sx={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 600, px: 4 }}>
        <AnimatePresence mode="wait" custom={direction}>
          <MotionBox
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            {/* Icon with pulsing ring */}
            <Box sx={{ position: "relative", mb: 4 }}>
              <MotionBox
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                sx={{
                  position: "absolute",
                  inset: -20,
                  borderRadius: "50%",
                  border: `2px solid ${slide.color}`,
                  opacity: 0.3,
                }}
              />
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `linear-gradient(135deg, ${slide.color}20, ${slide.accent}10)`,
                  border: `1px solid ${slide.color}30`,
                  color: slide.color,
                }}
              >
                {slide.icon}
              </Box>
            </Box>

            <MotionTypography
              variant="h2"
              fontWeight={800}
              sx={{
                mb: 1.5,
                background: `linear-gradient(135deg, ${slide.color}, ${slide.accent})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
              }}
            >
              {slide.title}
            </MotionTypography>

            <Typography variant="h6" color="text.secondary" fontWeight={600} sx={{ mb: 2.5 }}>
              {slide.subtitle}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, maxWidth: 480 }}>
              {slide.description}
            </Typography>
          </MotionBox>
        </AnimatePresence>
      </Box>

      {/* Navigation controls */}
      <Box
        sx={{
          position: "absolute",
          bottom: 48,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          zIndex: 10,
        }}
      >
        <IconButton
          onClick={() => paginate(-1)}
          disabled={page === 0}
          sx={{
            color: "text.secondary",
            border: "1px solid rgba(108,99,255,0.15)",
            "&:disabled": { opacity: 0.3 },
            "&:hover": { borderColor: "rgba(108,99,255,0.3)" },
          }}
        >
          <ArrowBack />
        </IconButton>

        {/* Dots */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {slides.map((_, i) => (
            <MotionBox
              key={i}
              animate={{
                width: i === page ? 32 : 8,
                background: i === page ? slide.color : "rgba(148, 163, 184, 0.3)",
              }}
              transition={{ duration: 0.3 }}
              sx={{
                height: 8,
                borderRadius: 4,
                cursor: "pointer",
              }}
              onClick={() => setPage([i, i > page ? 1 : -1])}
            />
          ))}
        </Box>

        {isLast ? (
          <Button
            onClick={onComplete}
            variant="contained"
            endIcon={<ArrowForward />}
            sx={{
              px: 3,
              py: 1,
              fontWeight: 700,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${slide.color}, ${slide.accent})`,
              boxShadow: `0 4px 16px ${slide.color}40`,
              "&:hover": { boxShadow: `0 6px 24px ${slide.color}50` },
            }}
          >
            Get Started
          </Button>
        ) : (
          <IconButton
            onClick={() => paginate(1)}
            sx={{
              color: "text.primary",
              border: `1px solid ${slide.color}40`,
              bgcolor: `${slide.color}10`,
              "&:hover": { bgcolor: `${slide.color}20` },
            }}
          >
            <ArrowForward />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
