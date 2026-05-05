import { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box);

interface SectionLabelProps {
  children: string;
  color?: string;
}

export default function SectionLabel({ children, color = "#6C63FF" }: SectionLabelProps) {
  return (
    <Box
      sx={{
        borderBottom: "1px solid rgba(108, 99, 255, 0.12)",
        py: 2,
        px: 3,
      }}
    >
      <Typography
        sx={{
          fontFamily: "monospace",
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

interface AnimatedGridItemProps {
  children: ReactNode;
  index: number;
}

export function AnimatedGridItem({ children, index }: AnimatedGridItemProps) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      {children}
    </MotionBox>
  );
}
