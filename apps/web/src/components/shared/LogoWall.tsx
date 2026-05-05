import { Box, Typography, Stack } from "@mui/material";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box);

const logos = [
  { name: "FinanceFlow", outcome: "+50K users in year one", color: "#6C63FF" },
  { name: "HealthTrack", outcome: "95% early detection rate", color: "#00D4AA" },
  { name: "LogiChain", outcome: "60% fraud reduction", color: "#8B85FF" },
  { name: "NexGen", outcome: "2M events / day pipeline", color: "#F59E0B" },
  { name: "Apex Finance", outcome: "3x faster reporting", color: "#33DDBB" },
];

export default function LogoWall() {
  return (
    <Box sx={{ py: 4, borderTop: "1px solid rgba(108,99,255,0.1)", borderBottom: "1px solid rgba(108,99,255,0.1)" }}>
      <Typography
        sx={{
          textAlign: "center",
          fontFamily: "monospace",
          fontSize: "0.65rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "text.secondary",
          opacity: 0.5,
          mb: 3,
        }}
      >
        Trusted by teams shipping at scale
      </Typography>
      <Stack
        direction="row"
        spacing={0}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr", md: "repeat(5, 1fr)" },
          alignItems: "center",
        }}
      >
        {logos.map((l, i) => (
          <MotionBox
            key={l.name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            sx={{
              textAlign: "center",
              py: 2,
              px: 2,
              borderRight: { md: i < 4 ? "1px solid rgba(108,99,255,0.08)" : "none" },
              transition: "background 0.2s",
              "&:hover": { background: `${l.color}06` },
            }}
          >
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: "1rem", md: "1.15rem" },
                background: `linear-gradient(135deg, ${l.color}, #00D4AA)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "0.02em",
                mb: 0.75,
              }}
            >
              {l.name}
            </Typography>
            <Typography
              sx={{
                fontFamily: "monospace",
                fontSize: "0.6rem",
                color: "text.secondary",
                opacity: 0.6,
                letterSpacing: "0.05em",
              }}
            >
              {l.outcome}
            </Typography>
          </MotionBox>
        ))}
      </Stack>
    </Box>
  );
}
