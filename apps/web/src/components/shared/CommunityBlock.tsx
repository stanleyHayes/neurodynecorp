import { Box, Typography, Stack, Button } from "@mui/material";
import HudCorners from "@/components/shared/HudCorners";
import { motion } from "framer-motion";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import XIcon from "@mui/icons-material/X";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";

const MotionBox = motion.create(Box);

const links = [
  { icon: <GitHubIcon />, label: "GitHub", href: "https://github.com/stanleyHayes", color: "#fff" },
  { icon: <LinkedInIcon />, label: "LinkedIn", href: "https://linkedin.com/in/stanley-asoku-hayford", color: "#0A66C2" },
  { icon: <XIcon />, label: "Twitter / X", href: "https://x.com/stanley_hayford", color: "#fff" },
  { icon: <FavoriteOutlinedIcon />, label: "Sponsor", href: "https://github.com/sponsors/stanleyHayes", color: "#FF6B9D" },
];

export default function CommunityBlock() {
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
        border: "1px solid rgba(108, 99, 255, 0.15)",
        background: "linear-gradient(135deg, rgba(108,99,255,0.04), rgba(0,212,170,0.03))",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      <HudCorners />
      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, mb: 2 }}>
        <GroupsOutlinedIcon sx={{ fontSize: 22, color: "#6C63FF" }} />
        <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#6C63FF", opacity: 0.8 }}>
          // JOIN THE COMMUNITY
        </Typography>
      </Box>

      <Typography
        sx={{
          fontWeight: 800,
          fontSize: { xs: "1.4rem", md: "1.8rem" },
          letterSpacing: "-0.02em",
          mb: 1.5,
        }}
      >
        Engineers, hang out with us.
      </Typography>
      <Typography sx={{ color: "text.secondary", opacity: 0.75, mb: 3.5, maxWidth: 480, mx: "auto", lineHeight: 1.7 }}>
        Follow along, weigh in on architecture decisions, or sponsor the open-source side. Pick your channel.
      </Typography>

      <Stack direction="row" spacing={1.5} sx={{ justifyContent: "center", flexWrap: "wrap", gap: 1.5 }}>
        {links.map((l) => (
          <Button
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={l.icon}
            variant="outlined"
            sx={{
              fontFamily: "monospace",
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              px: 2.5,
              py: 0.75,
              borderColor: "rgba(108,99,255,0.2)",
              color: "text.primary",
              "&:hover": {
                borderColor: l.color,
                color: l.color,
                bgcolor: `${l.color === "#fff" ? "rgba(255,255,255,0.05)" : l.color + "10"}`,
                transform: "translateY(-2px)",
              },
              transition: "all 0.2s",
            }}
          >
            {l.label}
          </Button>
        ))}
      </Stack>
    </MotionBox>
  );
}
