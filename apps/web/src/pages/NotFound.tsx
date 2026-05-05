import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import DoodleBackground from "@/components/doodles/DoodleBackground";

const MotionBox = motion.create(Box);

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | NeuroDyne Corp</title>
      </Helmet>

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
        {/* Doodles everywhere */}
        <DoodleBackground density="dense" />

        {/* Center content */}
        <MotionBox
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          sx={{
            position: "relative",
            zIndex: 10,
            textAlign: "center",
            maxWidth: 600,
          }}
        >
          {/* Big 404 */}
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
              Lost in the Neural Network
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
              The page you're looking for has drifted beyond our neural pathways. Even the smartest
              algorithms can't find it. Let's get you back on track.
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
              Back to Home
            </Button>
            <Button
              component={Link}
              to="/contact"
              variant="outlined"
              size="large"
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
              Contact Us
            </Button>
          </MotionBox>
        </MotionBox>
      </Box>
    </>
  );
}
