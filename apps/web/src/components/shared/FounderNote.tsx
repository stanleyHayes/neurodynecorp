import { Box, Typography, Stack, Avatar, Chip } from "@mui/material";
import { motion } from "framer-motion";
import FormatQuoteOutlinedIcon from "@mui/icons-material/FormatQuoteOutlined";

const MotionBox = motion.create(Box);

interface FounderNoteProps {
  message?: string;
  date?: string;
}

const DEFAULT_MESSAGE =
  "We're spending this week deepening our spec-engine: the goal is for any 30-minute intake to produce a doc your engineering team would happily accept. If you'd like to be one of the first to test it, hit Start a Project — we're taking 3 design partners.";

export default function FounderNote({ message = DEFAULT_MESSAGE, date = "This week" }: FounderNoteProps) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      sx={{
        position: "relative",
        my: 6,
        mx: { xs: 2, md: 6 },
        p: { xs: 3, md: 5 },
        borderRadius: 3,
        border: "1px solid rgba(108, 99, 255, 0.18)",
        background: "linear-gradient(135deg, rgba(108,99,255,0.06), rgba(0,212,170,0.04))",
        overflow: "hidden",
      }}
    >
      <FormatQuoteOutlinedIcon
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          fontSize: 80,
          color: "#6C63FF",
          opacity: 0.08,
        }}
      />

      <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: "rgba(108,99,255,0.15)",
            color: "#6C63FF",
            border: "2px solid rgba(108,99,255,0.3)",
            fontWeight: 700,
            fontSize: "1rem",
          }}
        >
          SH
        </Avatar>
        <Box>
          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "text.primary" }}>
            Stanley Hayford
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ fontFamily: "monospace", fontSize: "0.65rem", color: "text.secondary", opacity: 0.6, letterSpacing: "0.05em" }}>
              Founder · NeuroDyne Corp
            </Typography>
            <Chip
              label={date}
              size="small"
              sx={{
                fontFamily: "monospace",
                fontSize: "0.55rem",
                height: 18,
                bgcolor: "rgba(0,212,170,0.12)",
                color: "#00D4AA",
                border: "1px solid rgba(0,212,170,0.3)",
              }}
            />
          </Stack>
        </Box>
      </Stack>

      <Typography
        sx={{
          fontSize: { xs: "0.95rem", md: "1.05rem" },
          lineHeight: 1.75,
          color: "text.secondary",
          opacity: 0.9,
          maxWidth: 720,
          position: "relative",
          zIndex: 1,
        }}
      >
        {message}
      </Typography>

      <Typography
        sx={{
          mt: 2.5,
          fontFamily: "monospace",
          fontSize: "0.65rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "text.secondary",
          opacity: 0.4,
        }}
      >
        — Founder note · weekly
      </Typography>
    </MotionBox>
  );
}
