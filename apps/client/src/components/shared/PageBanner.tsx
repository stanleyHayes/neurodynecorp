import { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import Cell from "@/components/shared/AnimatedCard";

const MotionBox = motion.create(Box);

const BORDER = "rgba(108, 99, 255, 0.12)";

interface PageBannerProps {
  icon: ReactNode;
  title: string;
  description: string;
  tag?: string;
  accentWord?: string;
  iconColor?: string;
  iconLabel?: string;
  action?: ReactNode;
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
  // Split title at accentWord if provided
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
        mb: 0,
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

      {/* Left cell -- text */}
      <Cell color="#6C63FF" index="00" colInRow={0} totalCols={2} minH={{ xs: 220, md: 280 }}>
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
              mb: 2.5,
              fontSize: { xs: "1.8rem", md: "2.8rem" },
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
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
      </Cell>

      {/* Right cell -- icon */}
      <Cell color={iconColor} index="--" colInRow={1} totalCols={2} minH={{ xs: 140, md: 280 }}>
        <Box sx={{ textAlign: "center" }}>
          <MotionBox
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 180, delay: 0.2 }}
          >
            <Box
              sx={{
                "& .MuiSvgIcon-root": { fontSize: { xs: 70, md: 100 } },
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
      </Cell>
    </Box>
  );
}
