import { useRef } from "react";
import { Box, type SxProps, type Theme } from "@mui/material";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { AURORA_STOPS } from "@/theme/tokens";
import { useMotionPreference } from "./useMotionPreference";

/**
 * The signature orbital path, drawn as the reader scrolls (§10).
 *
 * An SVG stroke whose dash offset is bound to scroll position, so the line
 * appears to be drawn through the page as the reader travels down it. SVG
 * rather than canvas because §22 asks for it: scalable, controllable, and it
 * stays in the accessibility tree's control rather than becoming an opaque
 * bitmap.
 *
 * LIBRARY CHOICE. The specification suggests GSAP + ScrollTrigger for this, but
 * that advice is written for a Next.js build and this project already ships
 * framer-motion. §22 also says not to mix animation libraries for the same
 * responsibility. `useScroll` + `useTransform` covers scroll-linked drawing
 * exactly, so adding GSAP would mean a second library and roughly 50 KB for
 * capability already present. framer-motion it is.
 *
 * PERFORMANCE. Only `stroke-dashoffset` animates, on one element. §21 warns
 * about animating dash offsets carelessly — the mitigation here is that the
 * path is a single stroke, the value is spring-smoothed so it does not thrash
 * on every scroll event, and mobile gets a simplified geometry.
 *
 * REDUCED MOTION. §20 removes path drawing outright. The path renders complete
 * and static instead, so the composition still reads without the animation.
 */

interface ScrollPathProps {
  /**
   * The path geometry in a 0 0 100 100 viewBox, so it scales to any container.
   * Keep it simple: §23 asks for reduced path complexity below desktop.
   */
  d?: string;
  /** Simplified geometry used at small sizes. Falls back to `d`. */
  dMobile?: string;
  /** Stroke width in viewBox units. */
  width?: number;
  sx?: SxProps<Theme>;
}

/** A single sweeping orbit — the default signature line. */
const DEFAULT_PATH = "M 50 0 C 10 18, 10 42, 50 50 C 90 58, 90 82, 50 100";
const DEFAULT_PATH_MOBILE = "M 50 0 C 24 25, 24 75, 50 100";

export default function ScrollPath({
  d = DEFAULT_PATH,
  dMobile = DEFAULT_PATH_MOBILE,
  width = 0.4,
  sx,
}: ScrollPathProps) {
  const pref = useMotionPreference();
  const ref = useRef<HTMLDivElement>(null);

  // Progress across the element's own travel through the viewport, so the line
  // draws in step with the section it belongs to rather than the whole page.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Smoothing keeps the stroke from stuttering on coarse scroll events without
  // introducing a visible lag.
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.4 });
  const drawn = useTransform(progress, [0, 1], [0, 1]);

  const gradientId = "scrollpath-aurora";

  return (
    <Box
      ref={ref}
      aria-hidden
      sx={{ position: "absolute", inset: 0, pointerEvents: "none", ...sx }}
    >
      <Box
        component="svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        sx={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            {AURORA_STOPS.map((s) => (
              <stop key={s.offset} offset={s.offset} stopColor={s.color} />
            ))}
          </linearGradient>
        </defs>

        <Box
          component={motion.path}
          d={d}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={width}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          // pathLength normalises the dash maths to 0-1 regardless of the real
          // geometry, so changing `d` never requires recomputing offsets.
          pathLength={1}
          style={
            pref.allowDecorative
              ? { pathLength: drawn, opacity: 0.55 }
              : { pathLength: 1, opacity: 0.35 }
          }
          sx={{
            // Simplified geometry below md, per §23.
            "@media (max-width: 899px)": { d: `path("${dMobile}")` },
          }}
        />
      </Box>
    </Box>
  );
}
