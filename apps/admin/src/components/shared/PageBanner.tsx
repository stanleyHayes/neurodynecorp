import { ReactNode, useState } from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box);

const BORDER = "rgba(108, 99, 255, 0.12)";

/* ── Reusable hero cell (same pattern as web app) ────────────── */

function HeroCell({
  children,
  color,
  index,
  colInRow,
  totalCols,
  minH,
}: {
  children: ReactNode;
  color: string;
  index: string;
  colInRow: number;
  totalCols: number;
  minH: Record<string, number>;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: colInRow * 0.15 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        minHeight: minH,
        p: { xs: 3, md: 5 },
        position: "relative",
        overflow: "hidden",
        borderRight: {
          xs: "none",
          md: colInRow < totalCols - 1 ? `1px solid ${BORDER}` : "none",
        },
        borderBottom: `1px solid ${BORDER}`,
        background: hovered ? `${color}04` : "transparent",
        transition: "background 0.3s",
      }}
    >
      {/* Corner brackets */}
      {[
        { top: 12, left: 12, bT: true, bL: true },
        { top: 12, right: 12, bT: true, bR: true },
        { bottom: 12, left: 12, bB: true, bL: true },
        { bottom: 12, right: 12, bB: true, bR: true },
      ].map((pos, ci) => (
        <Box
          key={ci}
          sx={{
            position: "absolute",
            ...(pos.top !== undefined && { top: pos.top }),
            ...(pos.bottom !== undefined && { bottom: pos.bottom }),
            ...(pos.left !== undefined && { left: pos.left }),
            ...(pos.right !== undefined && { right: pos.right }),
            width: 16,
            height: 16,
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
      <Typography
        sx={{
          position: "absolute",
          top: 16,
          left: 40,
          fontSize: "0.65rem",
          fontFamily: "monospace",
          color: hovered ? color : "text.secondary",
          opacity: 0.5,
          letterSpacing: "0.15em",
          transition: "color 0.3s",
          zIndex: 2,
        }}
      >
        {index}
      </Typography>

      {/* Bottom accent */}
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

/* ── PageBanner (game-grid PageHero style) ───────────────────── */

interface PageBannerProps {
  icon: ReactNode;
  title: string;
  description: string;
  tag?: string;
  accentWord?: string;
  iconColor?: string;
  iconLabel?: string;
}

export default function PageBanner({
  icon,
  title,
  description,
  tag,
  accentWord,
  iconColor = "#00D4AA",
  iconLabel,
}: PageBannerProps) {
  let titleBefore = title;
  let titleAccent = "";
  let titleAfter = "";
  if (accentWord) {
    const idx = title.indexOf(accentWord);
    if (idx >= 0) {
      titleBefore = title.slice(0, idx);
      titleAccent = accentWord;
      titleAfter = title.slice(idx + accentWord.length);
    }
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.6fr 0.4fr" },
        borderBottom: `1px solid ${BORDER}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Scanline overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(108,99,255,0.04) 2px, rgba(108,99,255,0.04) 4px)",
          pointerEvents: "none",
          zIndex: 50,
        }}
      />

      {/* Left cell — text */}
      <HeroCell color="#6C63FF" index="00" colInRow={0} totalCols={2} minH={{ xs: 220, md: 260 }}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Typography
            sx={{
              fontSize: "0.6rem",
              fontFamily: "monospace",
              fontWeight: 600,
              color: "#6C63FF",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              mb: 2.5,
              opacity: 0.7,
            }}
          >
            {tag || title.toUpperCase().replace(/\s+/g, " // ")}
          </Typography>

          <Typography
            variant="h1"
            sx={{
              mb: 2,
              fontSize: { xs: "1.8rem", md: "2.6rem" },
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: "text.secondary",
            }}
          >
            {accentWord ? (
              <>
                {titleBefore}
                <Box
                  component="span"
                  sx={{
                    background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {titleAccent}
                </Box>
                {titleAfter}
              </>
            ) : (
              title
            )}
          </Typography>

          <Typography
            variant="body1"
            sx={{ maxWidth: 500, color: "text.secondary", opacity: 0.6, lineHeight: 1.8 }}
          >
            {description}
          </Typography>
        </MotionBox>
      </HeroCell>

      {/* Right cell — icon */}
      <HeroCell color={iconColor} index="--" colInRow={1} totalCols={2} minH={{ xs: 140, md: 260 }}>
        <Box sx={{ textAlign: "center" }}>
          <MotionBox
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 180, delay: 0.2 }}
          >
            <Box
              sx={{
                "& .MuiSvgIcon-root": { fontSize: { xs: 72, md: 100 } },
                color: iconColor,
                filter: `drop-shadow(0 0 20px ${iconColor}40) drop-shadow(0 0 60px ${iconColor}18)`,
              }}
            >
              {icon}
            </Box>
          </MotionBox>
          <Typography
            sx={{
              mt: 2,
              fontFamily: "monospace",
              fontSize: "0.65rem",
              color: "text.secondary",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              opacity: 0.4,
            }}
          >
            {iconLabel || "SYSTEM READY"}
          </Typography>
        </Box>
      </HeroCell>
    </Box>
  );
}
