import { Box, Typography, Stack, Button, Chip } from "@mui/material";
import HudCorners from "@/components/shared/HudCorners";
import { motion } from "framer-motion";
import VideoCallOutlinedIcon from "@mui/icons-material/VideoCallOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import { playSound } from "@/hooks/useSound";

const MotionBox = motion.create(Box);

// Set this to your Calendly URL when you have one (e.g. https://calendly.com/stanleyhayford/15min)
const CALENDLY_URL = "";
const CONTACT_EMAIL = "stanley@neurodynecorp.com";

export default function BookACall() {
  const subject = encodeURIComponent("15-min discovery call");
  const body = encodeURIComponent(
    "Hey Stanley,\n\nI'd like to chat about a project. Here are some times that work for me:\n\n— \n\nThanks,\n"
  );
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      sx={{
        position: "relative",
        p: { xs: 3, md: 5 },
        borderRadius: 0,
        border: "1px solid rgba(0, 212, 170, 0.25)",
        background: "linear-gradient(135deg, rgba(0,212,170,0.06), rgba(108,99,255,0.04))",
        overflow: "hidden",
      }}
    >
      <HudCorners />
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5 }}>
        <VideoCallOutlinedIcon sx={{ color: "#00D4AA", fontSize: 22, filter: "drop-shadow(0 0 6px rgba(0,212,170,0.4))" }} />
        <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#00D4AA", opacity: 0.85 }}>
          // SKIP THE FORM
        </Typography>
        <Chip
          label="15 min"
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

      <Typography
        sx={{
          fontWeight: 800,
          fontSize: { xs: "1.4rem", md: "1.8rem" },
          letterSpacing: "-0.02em",
          mb: 1,
          background: "linear-gradient(135deg, #00D4AA, #6C63FF)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Book a discovery call.
      </Typography>
      <Typography sx={{ color: "text.secondary", opacity: 0.8, mb: 3, maxWidth: 500, lineHeight: 1.7 }}>
        Quick chat — no slides, no sales pitch. Tell us where you're stuck and we'll tell you whether we can help (and if not, who can).
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
        {CALENDLY_URL ? (
          <Button
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playSound("click")}
            variant="contained"
            startIcon={<EventAvailableOutlinedIcon />}
            sx={{
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: "0.1em",
              px: 3,
              py: 1.25,
              background: "linear-gradient(135deg, #00D4AA, #6C63FF)",
              "&:hover": { boxShadow: "0 8px 24px rgba(0,212,170,0.4)" },
            }}
          >
            Pick a time
          </Button>
        ) : (
          <Button
            href={mailto}
            onClick={() => playSound("click")}
            variant="contained"
            startIcon={<EmailOutlinedIcon />}
            sx={{
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: "0.1em",
              px: 3,
              py: 1.25,
              background: "linear-gradient(135deg, #00D4AA, #6C63FF)",
              "&:hover": { boxShadow: "0 8px 24px rgba(0,212,170,0.4)" },
            }}
          >
            Email Stanley directly
          </Button>
        )}
        <Button
          href={`mailto:${CONTACT_EMAIL}`}
          onClick={() => playSound("hover")}
          variant="outlined"
          sx={{
            fontFamily: "monospace",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            borderColor: "rgba(108,99,255,0.25)",
            color: "text.primary",
            "&:hover": { borderColor: "rgba(108,99,255,0.5)", bgcolor: "rgba(108,99,255,0.06)" },
          }}
        >
          {CONTACT_EMAIL}
        </Button>
      </Stack>

      <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", color: "text.secondary", opacity: 0.4, letterSpacing: "0.1em" }}>
        Avg response: 4 hours · Mon–Fri
      </Typography>
    </MotionBox>
  );
}
