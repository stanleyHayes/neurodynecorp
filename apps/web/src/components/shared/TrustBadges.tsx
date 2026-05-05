import { Box, Typography, Stack } from "@mui/material";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";

const badges = [
  { icon: <VerifiedUserOutlinedIcon />, label: "NDA Ready", sub: "Day 1", color: "#10B981" },
  { icon: <GavelOutlinedIcon />, label: "SOC-2 Track", sub: "In progress", color: "#6C63FF" },
  { icon: <BoltOutlinedIcon />, label: "4hr Avg Reply", sub: "Mon–Fri", color: "#F59E0B" },
  { icon: <ScheduleOutlinedIcon />, label: "98% On-Time", sub: "Last 12 mo", color: "#00D4AA" },
];

export default function TrustBadges() {
  return (
    <Stack
      direction="row"
      spacing={0}
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
        borderTop: "1px solid rgba(108, 99, 255, 0.1)",
        borderBottom: "1px solid rgba(108, 99, 255, 0.1)",
      }}
    >
      {badges.map((b, i) => (
        <Box
          key={b.label}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1.5,
            py: 2.5,
            px: 2,
            borderRight: { xs: i % 2 === 0 ? "1px solid rgba(108,99,255,0.08)" : "none", md: i < 3 ? "1px solid rgba(108,99,255,0.08)" : "none" },
            borderBottom: { xs: i < 2 ? "1px solid rgba(108,99,255,0.08)" : "none", md: "none" },
          }}
        >
          <Box sx={{ color: b.color, "& .MuiSvgIcon-root": { fontSize: 22 }, filter: `drop-shadow(0 0 8px ${b.color}60)` }}>
            {b.icon}
          </Box>
          <Box>
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "text.primary", lineHeight: 1.2 }}>
              {b.label}
            </Typography>
            <Typography sx={{ fontFamily: "monospace", fontSize: "0.6rem", color: "text.secondary", opacity: 0.5, letterSpacing: "0.1em" }}>
              {b.sub}
            </Typography>
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
