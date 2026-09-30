import type { ReactNode } from "react";
import { Box, Typography, Stack } from "@mui/material";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { makeTheme } from "@/theme/ThemeContext";

const MotionBox = motion.create(Box);

// Floating doodle shapes
function Doodles() {
  const shapes = [
    { top: "8%", left: "12%", size: 80, rotate: 15, delay: 0, color: "rgba(59,130,246,0.07)", type: "circle" },
    { top: "20%", right: "8%", size: 120, rotate: -20, delay: 0.5, color: "rgba(6,182,212,0.05)", type: "square" },
    { top: "55%", left: "5%", size: 60, rotate: 45, delay: 1, color: "rgba(139,92,246,0.06)", type: "square" },
    { top: "70%", right: "15%", size: 90, rotate: -10, delay: 0.3, color: "rgba(6,182,212,0.04)", type: "circle" },
    { top: "85%", left: "25%", size: 50, rotate: 30, delay: 0.8, color: "rgba(59,130,246,0.05)", type: "triangle" },
    { top: "35%", left: "60%", size: 40, rotate: -35, delay: 1.2, color: "rgba(139,92,246,0.06)", type: "circle" },
    { top: "15%", left: "40%", size: 30, rotate: 60, delay: 0.6, color: "rgba(6,182,212,0.06)", type: "square" },
    { top: "90%", right: "30%", size: 70, rotate: -25, delay: 0.9, color: "rgba(59,130,246,0.04)", type: "circle" },
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
          linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)
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

/*
 * These pages paint their own canvas.
 *
 * The background below is a hardcoded dark gradient — the sign-in screen is
 * always dark, whatever theme the dashboard is set to. But the text colours
 * were being taken from the theme, and `text.primary` is #1E293B in light
 * mode. So anyone who had ever toggled the dashboard to light got dark text
 * on a dark canvas: "Welcome back" and every feature card heading rendered
 * near-invisible, while the body copy, which uses text.secondary, stayed just
 * light enough to read. That is exactly what it looked like.
 *
 * Text on this canvas is therefore fixed to the on-dark values rather than
 * inherited from the mode.
 */
const ON_DARK = "#F1F5F9";
const ON_DARK_MUTED = "#94A3B8";

export default function AuthLayout({ children, brandTitle, brandSubtitle, cards }: AuthLayoutProps) {
  /*
   * Forcing the mode, not just the two colours above.
   *
   * Pinning ON_DARK on the headings fixed the cards but not "Welcome back",
   * which lives in the page rather than here, and not the form — field labels,
   * outlines, helper text and placeholders all take their colour from the mode
   * too. Rather than have every auth page remember to override, the whole
   * subtree gets a dark theme, which is the one thing that is actually true
   * about this screen: its canvas is always dark.
   */
  const darkTheme = useMemo(() => makeTheme("dark"), []);

  return (
    <MuiThemeProvider theme={darkTheme}>
    <Box
      sx={{
        // The nested theme reaches MUI components, but a Typography with no
        // `color` prop simply inherits — and what it inherits is the colour
        // CssBaseline put on <body> from the OUTER theme. Setting it here is
        // what actually fixes "Welcome back" and anything else a page renders
        // into this canvas without stating a colour.
        color: ON_DARK,
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
          background: "linear-gradient(160deg, #0A0F1F 0%, #0F1629 50%, #111a2e 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <GridLines />
        <Doodles />

        {/* Gradient orbs */}
        <Box sx={{ position: "absolute", top: "-20%", left: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)", filter: "blur(100px)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", bottom: "-20%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)", filter: "blur(100px)", pointerEvents: "none" }} />

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
                background: "linear-gradient(135deg, #3B82F6, #8B5CF6, #06B6D4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
                mb: 1.5,
              }}
            >
              {brandTitle}
            </Typography>
            <Typography variant="body1" sx={{ color: ON_DARK_MUTED, mb: 5, lineHeight: 1.7 }}>
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
                  background: "rgba(17, 26, 46, 0.6)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(59, 130, 246, 0.08)",
                  transition: "border-color 0.2s",
                  "&:hover": {
                    borderColor: "rgba(59, 130, 246, 0.2)",
                  },
                }}
              >
                <Box sx={{ color: "#3B82F6", mt: 0.25, flexShrink: 0 }}>{card.icon}</Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: ON_DARK }}>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: ON_DARK_MUTED, lineHeight: 1.6 }}>
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
          bgcolor: "#111a2e",
          borderLeft: { md: "1px solid rgba(59, 130, 246, 0.1)" },
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
              linear-gradient(rgba(59,130,246,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,0.02) 1px, transparent 1px)
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
    </MuiThemeProvider>
  );
}
