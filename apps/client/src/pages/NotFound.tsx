import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import { Link } from "react-router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HeadsetMicOutlinedIcon from "@mui/icons-material/HeadsetMicOutlined";

const MotionBox = motion.create(Box);

const doodles = [
  { top: "10%", left: "8%", size: 70, rotate: 15, delay: 0, color: "rgba(108,99,255,0.07)", type: "circle" as const },
  { top: "22%", right: "10%", size: 100, rotate: -20, delay: 0.4, color: "rgba(0,212,170,0.05)", type: "square" as const },
  { top: "60%", left: "5%", size: 50, rotate: 45, delay: 0.8, color: "rgba(139,133,255,0.06)", type: "square" as const },
  { top: "75%", right: "12%", size: 80, rotate: -10, delay: 0.3, color: "rgba(0,212,170,0.04)", type: "circle" as const },
  { top: "40%", left: "70%", size: 35, rotate: 60, delay: 1, color: "rgba(108,99,255,0.05)", type: "circle" as const },
  { top: "85%", left: "30%", size: 45, rotate: 30, delay: 0.6, color: "rgba(139,133,255,0.05)", type: "square" as const },
];

export default function NotFound() {
  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background:
          "radial-gradient(ellipse at 30% 30%, rgba(108,99,255,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(0,212,170,0.06) 0%, transparent 50%), #0A0E1A",
        px: 3,
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

      {/* Floating shapes */}
      {doodles.map((s, i) => (
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
            left: "left" in s ? s.left : undefined,
            right: "right" in s ? s.right : undefined,
            width: s.size,
            height: s.size,
            borderRadius: s.type === "circle" ? "50%" : "12%",
            border: `2px solid ${s.color}`,
            background: "transparent",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Content */}
      <MotionBox
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        sx={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 600 }}
      >
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: "8rem", md: "12rem" },
            fontWeight: 900,
            lineHeight: 1,
            background: "linear-gradient(135deg, #6C63FF 0%, #00D4AA 50%, #8B85FF 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            userSelect: "none",
          }}
        >
          404
        </Typography>

        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Typography variant="h4" sx={{ mt: 1, fontWeight: 700, color: "text.primary" }}>
            Page Not Found
          </Typography>
        </MotionBox>

        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Typography
            variant="body1"
            sx={{ mt: 2, color: "text.secondary", maxWidth: 450, mx: "auto", lineHeight: 1.8 }}
          >
            The page you're looking for doesn't exist or has been moved.
            Let's get you back to your dashboard.
          </Typography>
        </MotionBox>

        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}
        >
          <Button
            component={Link}
            to="/"
            variant="contained"
            size="large"
            startIcon={<ArrowBackIcon />}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: "1rem",
              background: "linear-gradient(135deg, #6C63FF 0%, #00D4AA 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5B54EE 0%, #00C49A 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 25px rgba(108,99,255,0.3)",
              },
              transition: "all 0.3s ease",
            }}
          >
            My Dashboard
          </Button>
          <Button
            component={Link}
            to="/messages"
            variant="outlined"
            size="large"
            startIcon={<HeadsetMicOutlinedIcon />}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: "1rem",
              borderColor: "rgba(108,99,255,0.4)",
              color: "text.primary",
              "&:hover": {
                borderColor: "#6C63FF",
                background: "rgba(108,99,255,0.08)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Contact Support
          </Button>
        </MotionBox>
      </MotionBox>
    </Box>
  );
}
