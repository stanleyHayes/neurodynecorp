import { useState } from "react";
import { Box, Typography } from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

const BORDER = "rgba(108, 99, 255, 0.12)";
const BRACKET_IDLE = "rgba(108, 99, 255, 0.18)";

interface ActionBarProps {
  label: string;
  subtitle?: string;
  color?: string;
  onClick: () => void;
}

export default function ActionBar({ label, subtitle, color = "#6C63FF", onClick }: ActionBarProps) {
  const [hovered, setHovered] = useState(false);
  const bracketColor = hovered ? `${color}70` : BRACKET_IDLE;

  return (
    <Box
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.5,
        py: { xs: 3, md: 4 },
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        borderBottom: `1px solid ${BORDER}`,
        background: hovered ? `${color}06` : "transparent",
        transition: "background 0.3s",
        userSelect: "none",
      }}
    >
      {/* Corner brackets */}
      {[
        { top: 10, left: 10, bT: true, bL: true },
        { top: 10, right: 10, bT: true, bR: true },
        { bottom: 10, left: 10, bB: true, bL: true },
        { bottom: 10, right: 10, bB: true, bR: true },
      ].map((pos, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            ...(pos.top !== undefined && { top: pos.top }),
            ...(pos.bottom !== undefined && { bottom: pos.bottom }),
            ...(pos.left !== undefined && { left: pos.left }),
            ...(pos.right !== undefined && { right: pos.right }),
            width: 16,
            height: 16,
            borderTop: pos.bT ? `2px solid ${bracketColor}` : "none",
            borderBottom: pos.bB ? `2px solid ${bracketColor}` : "none",
            borderLeft: pos.bL ? `2px solid ${bracketColor}` : "none",
            borderRight: pos.bR ? `2px solid ${bracketColor}` : "none",
            pointerEvents: "none",
            zIndex: 3,
            transition: "border-color 0.3s",
          }}
        />
      ))}

      {/* Index */}
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
        ++
      </Typography>

      {/* Subtitle */}
      <Typography
        sx={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "0.55rem",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.3em",
          color: hovered ? `${color}90` : "rgba(108, 99, 255, 0.35)",
          transition: "color 0.3s",
        }}
      >
        {subtitle ?? "CREATE NEW"}
      </Typography>

      {/* Main label + icon */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <AddOutlinedIcon
          sx={{
            fontSize: { xs: 20, md: 26 },
            color: hovered ? color : "#475569",
            transition: "color 0.3s",
            filter: hovered ? `drop-shadow(0 0 8px ${color}50)` : "none",
          }}
        />
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: { xs: "1rem", md: "1.4rem" },
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: hovered ? "#CBD5E1" : "#475569",
            transition: "color 0.3s, text-shadow 0.3s",
            ...(hovered && {
              textShadow: `0 0 20px ${color}30`,
            }),
          }}
        >
          {label}
        </Typography>
      </Box>

      {/* Hover glow */}
      {hovered && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "40%",
            height: "80%",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color}08 0%, transparent 70%)`,
            filter: "blur(30px)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Bottom accent line */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: "20%",
          right: "20%",
          height: 2,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: hovered ? 0.4 : 0,
          transition: "opacity 0.3s",
          pointerEvents: "none",
        }}
      />
    </Box>
  );
}
