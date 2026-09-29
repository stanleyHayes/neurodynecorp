import { type ElementType, type ReactNode } from "react";
import { Box, type SxProps, type Theme } from "@mui/material";
import { motion } from "framer-motion";
import { useMotionPreference, VIEWPORT } from "./useMotionPreference";
import { section } from "@/theme/tokens";

/**
 * A page section with a calm entrance and the brand's vertical rhythm (§10).
 *
 * Section reveals fire slightly before the content reaches the centre of the
 * viewport, so they have finished by the time the reader is actually reading —
 * animating under someone's eyes is worse than not animating at all.
 *
 * This deliberately does NOT stagger its children. §9 asks for staggering
 * "sparingly", and a section that ripples every child on entry is the
 * decorative motion §2 rejects. Children that should stagger opt in with their
 * own RevealText delay.
 */

interface MotionSectionProps {
  children: ReactNode;
  /** Semantic element. Defaults to <section>. */
  component?: ElementType;
  /** Vertical rhythm. §4 asks for generous negative space around statements. */
  rhythm?: keyof typeof section;
  /** A hairline above the section, the site's existing chapter divider. */
  divided?: boolean;
  id?: string;
  "aria-labelledby"?: string;
  "aria-label"?: string;
  sx?: SxProps<Theme>;
}

export default function MotionSection({
  children,
  component = "section",
  rhythm = "normal",
  divided = true,
  sx,
  ...rest
}: MotionSectionProps) {
  const pref = useMotionPreference();

  return (
    <Box
      component={component}
      {...rest}
      sx={{
        position: "relative",
        py: { xs: Math.round(section[rhythm] * 0.64), md: section[rhythm] },
        ...(divided && { borderTop: "1px solid", borderColor: "divider" }),
        ...sx,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: pref.dist("body") }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT}
        transition={{ duration: pref.dur("narrative"), ease: pref.ease }}
      >
        {children}
      </motion.div>
    </Box>
  );
}
