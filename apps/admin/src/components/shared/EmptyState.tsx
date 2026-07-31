import { ReactNode, useState } from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";

const MotionBox = motion.create(Box);

const BORDER = "rgba(108, 99, 255, 0.12)";
const BRACKET_IDLE = "rgba(108, 99, 255, 0.18)";

/* ── Orbit ring ── */
function OrbitRing({ color, size = 120, duration = 8 }: { color: string; size?: number; duration?: number }) {
  return (
    <MotionBox
      animate={{ rotate: 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
      sx={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        border: `1.5px dashed ${color}25`,
        pointerEvents: "none",
      }}
    />
  );
}

/* ── Floating dot ── */
function FloatingDot({ color, delay = 0, x = 0, y = 0 }: { color: string; delay?: number; x?: number; y?: number }) {
  return (
    <MotionBox
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.6, 0],
        scale: [0.5, 1, 0.5],
        y: [y, y - 8, y],
      }}
      transition={{ duration: 3, delay, repeat: Infinity, ease: "easeInOut" }}
      sx={{
        position: "absolute",
        width: 6,
        height: 6,
        borderRadius: "50%",
        bgcolor: color,
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        filter: `drop-shadow(0 0 4px ${color})`,
        pointerEvents: "none",
      }}
    />
  );
}

/* ── Small cross doodle ── */
function CrossMark({ color, delay = 0, x = 0, y = 0, size = 8 }: { color: string; delay?: number; x?: number; y?: number; size?: number }) {
  return (
    <MotionBox
      initial={{ opacity: 0, rotate: 0 }}
      animate={{ opacity: [0, 0.4, 0], rotate: [0, 90, 180] }}
      transition={{ duration: 5, delay, repeat: Infinity, ease: "easeInOut" }}
      sx={{
        position: "absolute",
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        width: size,
        height: size,
        pointerEvents: "none",
        "&::before, &::after": {
          content: '""',
          position: "absolute",
          bgcolor: color,
          borderRadius: 1,
        },
        "&::before": {
          width: "100%",
          height: 1.5,
          top: "50%",
          transform: "translateY(-50%)",
        },
        "&::after": {
          height: "100%",
          width: 1.5,
          left: "50%",
          transform: "translateX(-50%)",
        },
      }}
    />
  );
}

/* ── Diamond doodle ── */
function Diamond({ color, delay = 0, x = 0, y = 0, size = 6 }: { color: string; delay?: number; x?: number; y?: number; size?: number }) {
  return (
    <MotionBox
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 0.5, 0], scale: [0.6, 1, 0.6] }}
      transition={{ duration: 4, delay, repeat: Infinity, ease: "easeInOut" }}
      sx={{
        position: "absolute",
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        width: size,
        height: size,
        border: `1.5px solid ${color}`,
        borderRadius: 0.5,
        transform: "rotate(45deg)",
        pointerEvents: "none",
      }}
    />
  );
}

/* ── Grid-style action button (matches ActionBar / AnimatedCard aesthetic) ── */
function GridButton({
  label,
  icon,
  color,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  color: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const bracketColor = hovered ? `${color}70` : BRACKET_IDLE;

  return (
    <Box
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        px: { xs: 3, md: 4 },
        py: { xs: 1.8, md: 2.2 },
        cursor: "pointer",
        overflow: "hidden",
        borderRight: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
        background: hovered ? `${color}06` : "transparent",
        transition: "background 0.3s",
        userSelect: "none",
        minWidth: 140,
      }}
    >
      {/* Corner brackets */}
      {[
        { top: 6, left: 6, bT: true, bL: true },
        { top: 6, right: 6, bT: true, bR: true },
        { bottom: 6, left: 6, bB: true, bL: true },
        { bottom: 6, right: 6, bB: true, bR: true },
      ].map((pos, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            ...(pos.top !== undefined && { top: pos.top }),
            ...(pos.bottom !== undefined && { bottom: pos.bottom }),
            ...(pos.left !== undefined && { left: pos.left }),
            ...(pos.right !== undefined && { right: pos.right }),
            width: 10,
            height: 10,
            borderTop: pos.bT ? `1.5px solid ${bracketColor}` : "none",
            borderBottom: pos.bB ? `1.5px solid ${bracketColor}` : "none",
            borderLeft: pos.bL ? `1.5px solid ${bracketColor}` : "none",
            borderRight: pos.bR ? `1.5px solid ${bracketColor}` : "none",
            pointerEvents: "none",
            zIndex: 3,
            transition: "border-color 0.3s",
          }}
        />
      ))}

      {/* Icon */}
      <Box
        sx={{
          "& .MuiSvgIcon-root": { fontSize: 16 },
          color: hovered ? color : "#475569",
          transition: "color 0.3s",
          filter: hovered ? `drop-shadow(0 0 6px ${color}50)` : "none",
          display: "flex",
        }}
      >
        {icon}
      </Box>

      {/* Label */}
      <Typography
        sx={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: hovered ? "#CBD5E1" : "#475569",
          transition: "color 0.3s, text-shadow 0.3s",
          ...(hovered && { textShadow: `0 0 16px ${color}30` }),
        }}
      >
        {label}
      </Typography>

      {/* Hover glow */}
      {hovered && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60%",
            height: "80%",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color}08 0%, transparent 70%)`,
            filter: "blur(20px)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Bottom accent line */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: "15%",
          right: "15%",
          height: 1.5,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: hovered ? 0.4 : 0,
          transition: "opacity 0.3s",
          pointerEvents: "none",
        }}
      />
    </Box>
  );
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  color?: string;
  onRefresh?: () => void;
  onAdd?: () => void;
  addLabel?: string;
  /** True when showing "no search results" vs "no data at all" */
  isFiltered?: boolean;
}

export default function EmptyState({
  icon,
  title,
  description,
  color = "#6C63FF",
  onRefresh,
  onAdd,
  addLabel = "Add New",
  isFiltered = false,
}: EmptyStateProps) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 8, md: 10 },
        px: 3,
        position: "relative",
        overflow: "hidden",
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      {/* Corner brackets */}
      {[
        { top: 16, left: 16, bT: true, bL: true },
        { top: 16, right: 16, bT: true, bR: true },
        { bottom: 16, left: 16, bB: true, bL: true },
        { bottom: 16, right: 16, bB: true, bR: true },
      ].map((pos, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            ...(pos.top !== undefined && { top: pos.top }),
            ...(pos.bottom !== undefined && { bottom: pos.bottom }),
            ...(pos.left !== undefined && { left: pos.left }),
            ...(pos.right !== undefined && { right: pos.right }),
            width: 18,
            height: 18,
            borderTop: pos.bT ? `2px solid ${color}20` : "none",
            borderBottom: pos.bB ? `2px solid ${color}20` : "none",
            borderLeft: pos.bL ? `2px solid ${color}20` : "none",
            borderRight: pos.bR ? `2px solid ${color}20` : "none",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      ))}

      {/* Background glow */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}06 0%, transparent 70%)`,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {/* Animated icon area */}
      <Box sx={{ position: "relative", mb: 3, display: "flex", alignItems: "center", justifyContent: "center", width: 160, height: 160 }}>
        {/* Orbit rings */}
        <OrbitRing color={color} size={140} duration={10} />
        <OrbitRing color={color} size={100} duration={7} />

        {/* Floating dots */}
        <FloatingDot color={color} delay={0} x={-50} y={-30} />
        <FloatingDot color={color} delay={1} x={45} y={-25} />
        <FloatingDot color={color} delay={2} x={-35} y={40} />
        <FloatingDot color={color} delay={0.5} x={55} y={35} />

        {/* Cross marks */}
        <CrossMark color={color} delay={0.3} x={-60} y={-10} size={7} />
        <CrossMark color={color} delay={1.8} x={58} y={8} size={9} />
        <CrossMark color={color} delay={3.2} x={-10} y={55} size={6} />

        {/* Diamonds */}
        <Diamond color={color} delay={0.8} x={-45} y={45} size={7} />
        <Diamond color={color} delay={2.5} x={50} y={-45} size={5} />
        <Diamond color={color} delay={1.5} x={-55} y={-45} size={6} />

        {/* Pulsing ring behind icon */}
        <MotionBox
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.05, 0.15] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          sx={{
            position: "absolute",
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: `2px solid ${color}`,
            pointerEvents: "none",
          }}
        />

        {/* Icon */}
        <MotionBox
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          sx={{
            "& .MuiSvgIcon-root": { fontSize: 48 },
            color,
            opacity: 0.35,
            filter: `drop-shadow(0 0 16px ${color}30)`,
            position: "relative",
            zIndex: 1,
          }}
        >
          {icon}
        </MotionBox>
      </Box>

      {/* Tag */}
      <Typography
        sx={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "0.6rem",
          fontWeight: 700,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color,
          opacity: 0.5,
          mb: 1.5,
        }}
      >
        {isFiltered ? "NO RESULTS" : "EMPTY"}
      </Typography>

      {/* Title */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          mb: 1,
          textAlign: "center",
          color: "text.secondary",
          opacity: 0.7,
        }}
      >
        {title}
      </Typography>

      {/* Description */}
      <Typography
        sx={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "0.75rem",
          color: "text.secondary",
          opacity: 0.4,
          textAlign: "center",
          maxWidth: 380,
          lineHeight: 1.7,
          mb: 4,
        }}
      >
        {description}
      </Typography>

      {/* Action buttons — grid cell style */}
      {(onRefresh || onAdd) && (
        <Box
          sx={{
            display: "inline-grid",
            gridTemplateColumns: onRefresh && onAdd ? "1fr 1fr" : "1fr",
            borderTop: `1px solid ${BORDER}`,
            borderLeft: `1px solid ${BORDER}`,
          }}
        >
          {onRefresh && (
            <GridButton
              label="Refresh"
              icon={<RefreshOutlinedIcon />}
              color={color}
              onClick={onRefresh}
            />
          )}
          {onAdd && (
            <GridButton
              label={addLabel}
              icon={<AddOutlinedIcon />}
              color={color}
              onClick={onAdd}
            />
          )}
        </Box>
      )}
    </MotionBox>
  );
}
