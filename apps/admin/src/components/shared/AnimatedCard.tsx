import { ReactNode, useState } from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box);

const BORDER = "rgba(108, 99, 255, 0.12)";

interface CellProps {
  children: ReactNode;
  color?: string;
  index?: string;
  colInRow?: number;
  totalCols?: number;
  minH?: Record<string, number> | number;
  animDelay?: number;
}

export default function Cell({
  children,
  color = "#6C63FF",
  index,
  colInRow = 0,
  totalCols = 1,
  minH,
  animDelay,
}: CellProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: animDelay ?? colInRow * 0.12 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        minHeight: minH,
        p: { xs: 2.5, md: 3 },
        position: "relative",
        overflow: "hidden",
        borderRight:
          colInRow < totalCols - 1
            ? `1px solid ${BORDER}`
            : "none",
        borderBottom: `1px solid ${BORDER}`,
        background: hovered ? `${color}06` : "transparent",
        transition: "background 0.3s",
      }}
    >
      {/* Corner brackets */}
      {[
        { top: 10, left: 10, bT: true, bL: true },
        { top: 10, right: 10, bT: true, bR: true },
        { bottom: 10, left: 10, bB: true, bL: true },
        { bottom: 10, right: 10, bB: true, bR: true },
      ].map((pos, ci) => (
        <Box
          key={ci}
          sx={{
            position: "absolute",
            ...(pos.top !== undefined && { top: pos.top }),
            ...(pos.bottom !== undefined && { bottom: pos.bottom }),
            ...(pos.left !== undefined && { left: pos.left }),
            ...(pos.right !== undefined && { right: pos.right }),
            width: 14,
            height: 14,
            borderTop: pos.bT ? `2px solid ${color}${hovered ? "70" : "25"}` : "none",
            borderBottom: pos.bB ? `2px solid ${color}${hovered ? "70" : "25"}` : "none",
            borderLeft: pos.bL ? `2px solid ${color}${hovered ? "70" : "25"}` : "none",
            borderRight: pos.bR ? `2px solid ${color}${hovered ? "70" : "25"}` : "none",
            filter: hovered ? `drop-shadow(0 0 6px ${color}40)` : "none",
            transition: "all 0.3s",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      ))}

      {/* Hover glow */}
      {hovered && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60%",
            height: "60%",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color}08 0%, transparent 70%)`,
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Index */}
      {index !== undefined && (
        <Typography
          sx={{
            position: "absolute",
            top: 14,
            left: 34,
            fontSize: "0.6rem",
            fontFamily: "'Outfit', sans-serif",
            color: hovered ? color : "text.secondary",
            opacity: 0.5,
            letterSpacing: "0.15em",
            transition: "color 0.3s",
            zIndex: 2,
          }}
        >
          {index}
        </Typography>
      )}

      {/* Bottom accent line */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: "10%",
          right: "10%",
          height: 2,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: hovered ? 0.5 : 0,
          transition: "opacity 0.3s",
          pointerEvents: "none",
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1 }}>{children}</Box>
    </MotionBox>
  );
}
