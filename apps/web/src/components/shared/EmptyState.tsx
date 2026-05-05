import { ReactNode } from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { motion } from "framer-motion";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";

const MotionBox = motion.create(Box);

const BORDER = "rgba(108, 99, 255, 0.12)";

/* ── Animated doodle ring that orbits the icon ── */
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

/* ── Floating dot accent ── */
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

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  color?: string;
  onRefresh?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  color = "#6C63FF",
  onRefresh,
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
        py: { xs: 10, md: 14 },
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
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}06 0%, transparent 70%)`,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {/* Animated icon area */}
      <Box sx={{ position: "relative", mb: 4, display: "flex", alignItems: "center", justifyContent: "center", width: 180, height: 180 }}>
        <OrbitRing color={color} size={160} duration={12} />
        <OrbitRing color={color} size={110} duration={8} />

        <FloatingDot color={color} delay={0} x={-55} y={-35} />
        <FloatingDot color={color} delay={1} x={50} y={-28} />
        <FloatingDot color={color} delay={2} x={-40} y={45} />
        <FloatingDot color={color} delay={0.5} x={60} y={38} />

        {/* Pulsing ring */}
        <MotionBox
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.04, 0.15] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          sx={{
            position: "absolute",
            width: 90,
            height: 90,
            borderRadius: "50%",
            border: `2px solid ${color}`,
            pointerEvents: "none",
          }}
        />

        {/* Icon */}
        <MotionBox
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          sx={{
            "& .MuiSvgIcon-root": { fontSize: 56 },
            color,
            opacity: 0.3,
            filter: `drop-shadow(0 0 20px ${color}30)`,
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
          fontFamily: "monospace",
          fontSize: "0.6rem",
          fontWeight: 700,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color,
          opacity: 0.5,
          mb: 2,
        }}
      >
        NOTHING HERE YET
      </Typography>

      {/* Title */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          mb: 1.5,
          textAlign: "center",
          color: "text.secondary",
          opacity: 0.6,
        }}
      >
        {title}
      </Typography>

      {/* Description */}
      <Typography
        sx={{
          fontFamily: "monospace",
          fontSize: "0.8rem",
          color: "text.secondary",
          opacity: 0.35,
          textAlign: "center",
          maxWidth: 420,
          lineHeight: 1.7,
          mb: 3,
        }}
      >
        {description}
      </Typography>

      {onRefresh && (
        <Stack direction="row" spacing={1.5}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshOutlinedIcon />}
            onClick={onRefresh}
            sx={{
              fontFamily: "monospace",
              fontSize: "0.7rem",
              letterSpacing: "0.05em",
              textTransform: "none",
              borderColor: `${color}30`,
              color,
              "&:hover": {
                borderColor: `${color}60`,
                bgcolor: `${color}08`,
              },
            }}
          >
            Refresh
          </Button>
        </Stack>
      )}
    </MotionBox>
  );
}
