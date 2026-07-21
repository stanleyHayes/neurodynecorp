import { ReactNode } from "react";
import { Box, Typography, Stack } from "@mui/material";
import { Link } from "react-router";
import { motion } from "framer-motion";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const MotionBox = motion.create(Box);
export const BORDER = "rgba(108, 99, 255, 0.12)";

/** Monospace, uppercase section marker — matches the §-style register used across the site. */
export function Overline({ children, color = "#6C63FF" }: { children: ReactNode; color?: string }) {
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
  color = "#6C63FF",
  align = "left",
}: {
  tag?: string;
  title: ReactNode;
  lead?: ReactNode;
  color?: string;
  align?: "left" | "center";
}) {
  return (
    <Stack spacing={1.5} sx={{ mb: { xs: 3, md: 4 }, textAlign: align, alignItems: align === "center" ? "center" : "flex-start" }}>
      {tag && <Overline color={color}>{tag}</Overline>}
      <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
        {title}
      </Typography>
      {lead && (
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 760, opacity: 0.8 }}>
          {lead}
        </Typography>
      )}
    </Stack>
  );
}

/** Bordered content card with optional accent, icon, corner-bracket aesthetic on hover. */
export function InfoCard({
  children,
  accent = "#6C63FF",
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
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: `${accent}0A`,
        transition: "border-color 0.3s, background 0.3s",
        "&:hover": { borderColor: `${accent}55`, bgcolor: `${accent}12` },
        ...sx,
      }}
    >
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
  color = "#00D4AA",
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
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: `${color}0A`,
        textDecoration: "none",
        color: "inherit",
        transition: "border-color 0.3s, background 0.3s",
        "&:hover": { borderColor: `${color}66`, bgcolor: `${color}14` },
      }}
    >
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
