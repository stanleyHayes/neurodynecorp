import { Box, Typography } from "@mui/material";

interface SectionLabelProps {
  children: string;
  color?: string;
}

export default function SectionLabel({ children, color = "#3B82F6" }: SectionLabelProps) {
  return (
    <Box
      sx={{
        borderBottom: "1px solid rgba(59, 130, 246, 0.12)",
        py: 2,
        px: 3,
      }}
    >
      <Typography
        sx={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color,
          filter: `drop-shadow(0 0 6px ${color}60)`,
        }}
      >
        {children}
      </Typography>
    </Box>
  );
}
