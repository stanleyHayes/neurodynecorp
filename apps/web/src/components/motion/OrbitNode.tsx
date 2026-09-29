import { type ReactNode } from "react";
import { Box, useMediaQuery, useTheme, type SxProps, type Theme } from "@mui/material";
import { motion } from "framer-motion";
import { aurora, duration, easing, distance, spring } from "@/theme/tokens";
import { useMotionPreference } from "./useMotionPreference";

/**
 * A satellite in the ecosystem orbit (§11).
 *
 * Neurodyne sits conceptually at the centre with products as satellites. A node
 * drifts extremely slowly when idle; hover or focus pulls it a few pixels
 * toward the interaction and reveals concise information.
 *
 * THE LAYOUT RULE THAT MATTERS. §11 requires the orbit to become an accessible
 * vertical sequence on small screens — not a shrunken orbit. So below `md` this
 * renders in normal document flow and the orbital positioning is dropped
 * entirely. Absolute positioning that merely scales down produces overlapping,
 * unreachable targets on a phone.
 *
 * DOM ORDER. Nodes are positioned visually by angle but remain in source order,
 * so keyboard traversal and screen-reader reading follow the list the author
 * wrote (§20: logical DOM order even when layouts are visually orbital).
 */

interface OrbitNodeProps {
  children: ReactNode;
  /** Angle on the orbit in degrees, 0 = top, clockwise. */
  angle: number;
  /** Distance from centre as a percentage of the container's half-size. */
  radius?: number;
  /** Accent for the node. Defaults to the core brand energy. */
  accent?: string;
  /** Index, used to desynchronise idle drift between neighbours. */
  index?: number;
  component?: React.ElementType;
  sx?: SxProps<Theme>;
  [key: string]: unknown;
}

export default function OrbitNode({
  children,
  angle,
  radius = 38,
  accent = aurora.teal,
  index = 0,
  component = "div",
  sx,
  ...rest
}: OrbitNodeProps) {
  const pref = useMotionPreference();
  const theme = useTheme();
  const orbital = useMediaQuery(theme.breakpoints.up("md"));

  const rad = ((angle - 90) * Math.PI) / 180;
  const x = 50 + Math.cos(rad) * radius;
  const y = 50 + Math.sin(rad) * radius;

  const idle =
    pref.allowDecorative && orbital
      ? {
          // Barely perceptible, and multi-second — §18: idle motion must be
          // nearly imperceptible, and ambient sits in the slowest band.
          y: [0, -3, 0],
          transition: {
            duration: duration.ambient + (index % 4),
            repeat: Infinity,
            ease: "easeInOut" as const,
            delay: index * 0.7,
          },
        }
      : {};

  return (
    <motion.div
      animate={idle}
      whileHover={pref.allowDecorative ? { scale: 1.02 } : undefined}
      transition={spring.gentle}
      style={
        orbital
          ? { position: "absolute", left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }
          : undefined
      }
    >
      <Box
        component={component}
        sx={{
          position: "relative",
          display: "block",
          p: 2.5,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          textDecoration: "none",
          color: "inherit",
          transition: `border-color ${duration.ui}s ${easing.css.out}, transform ${duration.feedback}s ${easing.css.out}`,
          "&:hover, &:focus-visible": {
            borderColor: `${accent}66`,
            // §11: a few pixels toward the interaction, nothing more.
            transform: `translateY(-${distance.magnetic}px)`,
          },
          "&:focus-visible": { outline: `2px solid ${accent}`, outlineOffset: 2 },
          "@media (prefers-reduced-motion: reduce)": {
            transition: `border-color ${duration.feedback}s linear`,
            "&:hover, &:focus-visible": { transform: "none" },
          },
          ...sx,
        }}
        {...rest}
      >
        {children}
      </Box>
    </motion.div>
  );
}

/**
 * The container a set of OrbitNodes sits in.
 *
 * Provides the positioning context above `md` and a plain responsive grid
 * below it, which is what turns the orbit into the "accessible vertical/card
 * sequence" §11 asks for rather than a cramped circle.
 */
export function Orbit({ children, sx }: { children: ReactNode; sx?: SxProps<Theme> }) {
  return (
    <Box
      sx={{
        position: { xs: "static", md: "relative" },
        display: { xs: "grid", md: "block" },
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        gap: { xs: 2, sm: 2.5 },
        width: "100%",
        aspectRatio: { md: "1 / 1" },
        maxWidth: { md: 680 },
        mx: { md: "auto" },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
