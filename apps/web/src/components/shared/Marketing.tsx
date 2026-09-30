import { ReactNode } from "react";
import { Box, Typography, Stack } from "@mui/material";
import { Link } from "react-router";
import HudCorners from "@/components/shared/HudCorners";
import { motion } from "framer-motion";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const MotionBox = motion.create(Box);
export const BORDER = "rgba(59, 130, 246, 0.12)";

/** Monospace, uppercase section marker — matches the §-style register used across the site. */
export function Overline({ children, color = "#3B82F6" }: { children: ReactNode; color?: string }) {
  return (
    <Typography
      sx={{
        fontFamily: "monospace",
        fontSize: "0.6rem",
        fontWeight: 600,
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        color,
        opacity: 0.75,
      }}
    >
      {children}
    </Typography>
  );
}

/** Section heading with an overline tag and optional lead paragraph. */
export function SectionHeading({
  tag,
  title,
  lead,
  color = "#3B82F6",
  align = "left",
  component = "h2",
}: {
  tag?: string;
  title: ReactNode;
  lead?: ReactNode;
  color?: string;
  align?: "left" | "center";
  /** Outline level. Defaults to h2 — override only to nest deeper. */
  component?: "h2" | "h3" | "h4";
}) {
  return (
    <Stack spacing={1.5} sx={{ mb: { xs: 3, md: 4 }, textAlign: align, alignItems: align === "center" ? "center" : "flex-start" }}>
      {tag && <Overline color={color}>{tag}</Overline>}
      {/* `variant` is the type scale; `component` is the document outline. A
          section heading is an h2 under the page's h1 regardless of how big it
          looks, and the lead is body copy — rendering it as an h6 put ordinary
          prose into the outline and announced it as a heading. */}
      <Typography variant="h4" component={component} sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
        {title}
      </Typography>
      {lead && (
        <Typography variant="h6" component="p" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 760, opacity: 0.8 }}>
          {lead}
        </Typography>
      )}
    </Stack>
  );
}

/** Bordered content card with optional accent, icon, corner-bracket aesthetic on hover. */
export function InfoCard({
  children,
  accent = "#3B82F6",
  icon,
  title,
  subtitle,
  delay = 0,
  sx,
}: {
  children?: ReactNode;
  accent?: string;
  icon?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  delay?: number;
  sx?: object;
}) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      sx={{
        height: "100%",
        p: { xs: 3, md: 3.5 },
        borderRadius: 0,
        position: "relative",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: `${accent}0A`,
        transition: "border-color 0.3s, background 0.3s",
        "&:hover": { borderColor: `${accent}55`, bgcolor: `${accent}12` },
        ...sx,
      }}
    >
      <HudCorners />
      {(icon || title) && (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: subtitle ? 0.75 : 1.5 }}>
          {icon && <Box sx={{ color: accent, display: "flex", "& .MuiSvgIcon-root": { fontSize: 28 } }}>{icon}</Box>}
          {title && (
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
          )}
        </Stack>
      )}
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {subtitle}
        </Typography>
      )}
      {children}
    </MotionBox>
  );
}

/** Responsive grid wrapper for cards. */
export function CardGrid({ children, columns = 3 }: { children: ReactNode; columns?: 2 | 3 | 4 }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: `repeat(${columns}, 1fr)`,
        },
        gap: { xs: 2.5, md: 3 },
      }}
    >
      {children}
    </Box>
  );
}

/** Full-width call-to-action band linking to a route. */
export function CTABand({
  to,
  tag,
  title,
  description,
  color = "#06B6D4",
}: {
  to: string;
  tag: string;
  title: string;
  description?: string;
  color?: string;
}) {
  return (
    <Box
      component={Link}
      to={to}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 3,
        p: { xs: 3, md: 4 },
        borderRadius: 0,
        position: "relative",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: `${color}0A`,
        textDecoration: "none",
        color: "inherit",
        transition: "border-color 0.3s, background 0.3s",
        "&:hover": { borderColor: `${color}66`, bgcolor: `${color}14` },
      }}
    >
      <HudCorners />
      <Box>
        <Overline color={color}>{tag}</Overline>
        <Typography variant="h5" sx={{ fontWeight: 800, mt: 1, letterSpacing: "-0.01em" }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 620 }}>
            {description}
          </Typography>
        )}
      </Box>
      <ArrowForwardIcon sx={{ color, fontSize: 28, flexShrink: 0 }} />
    </Box>
  );
}

/**
 * A list marker that sits on the first line of the text beside it.
 *
 * Every one of these used to carry its own hardcoded top margin — `mt: "9px"`
 * in two places, `mt: "7px"` in two others. Each number was picked to look
 * right against one font size and one line height, and drifted the moment
 * either changed; the result was markers floating above their text.
 *
 * Centring the dot inside a box exactly one line tall tracks the type instead
 * of guessing at it, so it stays aligned whatever the body size becomes.
 */
export function BulletMarker({
  color = "primary.main",
  size = 6,
  round = false,
  opacity = 0.7,
  lineHeight = 1.7,
}: {
  color?: string;
  size?: number;
  round?: boolean;
  opacity?: number;
  /** Must match the lineHeight of the text it sits beside. */
  lineHeight?: number;
}) {
  return (
    <Box
      aria-hidden
      sx={(theme) => ({
        fontSize: theme.typography.body2.fontSize,
        height: `${lineHeight}em`,
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
      })}
    >
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: round ? "50%" : 0,
          bgcolor: color,
          opacity,
        }}
      />
    </Box>
  );
}
