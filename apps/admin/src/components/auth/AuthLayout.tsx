import type { ReactNode } from "react";
import { Box, Typography, Stack } from "@mui/material";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box);

// Floating doodle shapes
function Doodles() {
  const shapes = [
    { top: "8%", left: "12%", size: 80, rotate: 15, delay: 0, color: "rgba(108,99,255,0.07)", type: "circle" },
    { top: "20%", right: "8%", size: 120, rotate: -20, delay: 0.5, color: "rgba(0,212,170,0.05)", type: "square" },
    { top: "55%", left: "5%", size: 60, rotate: 45, delay: 1, color: "rgba(139,133,255,0.06)", type: "square" },
    { top: "70%", right: "15%", size: 90, rotate: -10, delay: 0.3, color: "rgba(0,212,170,0.04)", type: "circle" },
    { top: "85%", left: "25%", size: 50, rotate: 30, delay: 0.8, color: "rgba(108,99,255,0.05)", type: "triangle" },
    { top: "35%", left: "60%", size: 40, rotate: -35, delay: 1.2, color: "rgba(139,133,255,0.06)", type: "circle" },
    { top: "15%", left: "40%", size: 30, rotate: 60, delay: 0.6, color: "rgba(0,212,170,0.06)", type: "square" },
    { top: "90%", right: "30%", size: 70, rotate: -25, delay: 0.9, color: "rgba(108,99,255,0.04)", type: "circle" },
  ];

  return (
    <>
      {shapes.map((s, i) => (
        <MotionBox
          key={i}
          initial={{ opacity: 0, y: 20, rotate: s.rotate - 10 }}
          animate={{
            opacity: 1,
            y: [0, -12, 0],
            rotate: [s.rotate, s.rotate + 8, s.rotate],
          }}
          transition={{
            opacity: { duration: 0.8, delay: s.delay },
            y: { duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: s.delay },
            rotate: { duration: 8 + i, repeat: Infinity, ease: "easeInOut", delay: s.delay },
          }}
          sx={{
            position: "absolute",
            top: s.top,
            left: s.left,
            right: s.right,
            width: s.size,
            height: s.size,
            borderRadius: s.type === "circle" ? "50%" : s.type === "square" ? "16%" : 0,
            border: `1.5px solid ${s.color}`,
            background: s.type === "triangle" ? "none" : s.color,
            clipPath: s.type === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" : undefined,
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}

// Animated grid lines
function GridLines() {
  return (
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
        backgroundSize: "60px 60px",
        pointerEvents: "none",
      }}
    />
  );
}

interface InfoCard {
  icon: ReactNode;
  title: string;
  desc: string;
}

interface AuthLayoutProps {
  children: ReactNode;
  brandTitle: string;
  brandSubtitle: string;
  cards: InfoCard[];
}

const cardVariants: any = {
  hidden: { opacity: 0, x: -30 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, delay: 0.3 + i * 0.15, ease: "easeOut" },
  }),
};

const formVariants: any = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function AuthLayout({ children, brandTitle, brandSubtitle, cards }: AuthLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      {/* Left — Info panel */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: { xs: 4, md: 8 },
          py: { xs: 6, md: 0 },
          background: "linear-gradient(160deg, #0A0E1A 0%, #0F1629 50%, #111827 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <GridLines />
        <Doodles />

        {/* Gradient orbs */}
        <Box sx={{ position: "absolute", top: "-20%", left: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)", filter: "blur(100px)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", bottom: "-20%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,170,0.1) 0%, transparent 70%)", filter: "blur(100px)", pointerEvents: "none" }} />

        <Box sx={{ position: "relative", zIndex: 1, maxWidth: 480 }}>
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box component="img" src="/favicon.svg" alt="NeuroDyne Corp" sx={{ width: 52, height: 52, mb: 3 }} />
            <Typography
              variant="h3"
              sx={{ fontWeight: 800,
                background: "linear-gradient(135deg, #6C63FF, #8B85FF, #00D4AA)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
                mb: 1.5,
              }}
            >
              {brandTitle}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 5, lineHeight: 1.7 }}>
              {brandSubtitle}
            </Typography>
          </MotionBox>

          <Stack spacing={2.5}>
            {cards.map((card, i) => (
              <MotionBox
                key={card.title}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "flex-start",
                  p: 2.5,
                  borderRadius: 1.5,
                  background: "rgba(17, 24, 39, 0.6)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(108, 99, 255, 0.08)",
                  transition: "border-color 0.2s",
                  "&:hover": {
                    borderColor: "rgba(108, 99, 255, 0.2)",
                  },
                }}
              >
                <Box sx={{ color: "#6C63FF", mt: 0.25, flexShrink: 0 }}>{card.icon}</Box>
                <Box>
                  <Typography sx={{ fontWeight: 700 }} variant="subtitle2" color="text.primary">
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {card.desc}
                  </Typography>
                </Box>
              </MotionBox>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Right — Form */}
      <MotionBox
        initial="hidden"
        animate="visible"
        variants={formVariants}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: { xs: 4, md: 8 },
          py: { xs: 6, md: 0 },
          bgcolor: "#111827",
          borderLeft: { md: "1px solid rgba(108, 99, 255, 0.1)" },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid on form side too */}
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(108,99,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(108,99,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            pointerEvents: "none",
          }}
        />
        <Box sx={{ position: "relative", zIndex: 1, maxWidth: 440, width: "100%", mx: "auto" }}>
          {children}
        </Box>
      </MotionBox>
    </Box>
  );
}
