import { useRef, useState, type ReactNode } from "react";
import { Box, type SxProps, type Theme } from "@mui/material";
import { motion, useMotionValue, useSpring, useMotionValueEvent } from "framer-motion";
import { aurora, duration, easing, spring } from "@/theme/tokens";
import { useMotionPreference } from "./useMotionPreference";

/**
 * A card that responds to pointer proximity with restraint (§12).
 *
 * Cards stay mostly dark and quiet. Pointer proximity raises a soft radial
 * illumination behind the surface and lets the nearest edge take on teal
 * energy. The whole card drifts magnetically within a very small range —
 * §12 says 2-6px, and text never chases the pointer.
 *
 * Three rules this encodes so callers cannot get them wrong:
 *
 *   Keyboard focus produces the equivalent visible state without a pointer
 *   position (§12), because an effect only reachable by mouse is an effect half
 *   the audience never sees.
 *
 *   Coarse pointers get none of it (§23: touch gets no hover-only information
 *   and no interaction requiring precise pointer tracking). The pointer
 *   listener is not even attached.
 *
 *   Reduced motion removes the magnetism and the glow rather than shortening
 *   them (§20), leaving a plain border change.
 */

interface EnergyCardProps {
  children: ReactNode;
  /** Accent for the illumination. Defaults to the core brand energy, teal. */
  accent?: string;
  /** Rendered element — pass "a"/Link wrappers from the caller instead of nesting. */
  component?: React.ElementType;
  sx?: SxProps<Theme>;
  [key: string]: unknown;
}

export default function EnergyCard({
  children,
  accent = aurora.teal,
  component = "div",
  sx,
  ...rest
}: EnergyCardProps) {
  const pref = useMotionPreference();
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  // Pointer position within the card, 0-100%, for the radial highlight.
  const px = useMotionValue(50);
  const py = useMotionValue(50);

  // Magnetic drift. Spring, because §19 allows spring for small physical
  // interactions — and this is the smallest one on the site.
  const mx = useSpring(useMotionValue(0), spring.gentle);
  const my = useSpring(useMotionValue(0), spring.gentle);

  // A fine pointer is required. `hover: hover` alone is true for some styluses
  // and TV remotes that cannot track continuously.
  const finePointer =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const interactive = finePointer && pref.allowDecorative;

  const [glow, setGlow] = useState("50% 50%");
  useMotionValueEvent(px, "change", (v) => setGlow(`${v}% ${py.get()}%`));
  useMotionValueEvent(py, "change", (v) => setGlow(`${px.get()}% ${v}%`));

  function onPointerMove(e: React.PointerEvent) {
    if (!interactive) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const nx = ((e.clientX - r.left) / r.width) * 100;
    const ny = ((e.clientY - r.top) / r.height) * 100;
    px.set(nx);
    py.set(ny);
    // Pull toward the pointer, clamped hard. §12: 2-6px.
    const pull = pref.dist("magnetic");
    mx.set(((nx - 50) / 50) * pull);
    my.set(((ny - 50) / 50) * pull);
  }

  function reset() {
    mx.set(0);
    my.set(0);
    px.set(50);
    py.set(50);
  }

  return (
    <motion.div
      ref={ref}
      style={{ x: interactive ? mx : 0, y: interactive ? my : 0, height: "100%" }}
      onPointerMove={interactive ? onPointerMove : undefined}
      onPointerLeave={
        interactive
          ? () => {
              setActive(false);
              reset();
            }
          : undefined
      }
      onPointerEnter={interactive ? () => setActive(true) : undefined}
    >
      <Box
        component={component}
        // Focus drives the same visible state as hover, with no pointer needed.
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          border: "1px solid",
          borderColor: active ? `${accent}59` : "divider",
          bgcolor: "background.paper",
          transition: `border-color ${duration.ui}s ${easing.css.out}`,
          "&:focus-visible": {
            outline: `2px solid ${accent}`,
            outlineOffset: 2,
          },
          ...sx,
        }}
        {...rest}
      >
        {/* Radial illumination behind the content. Decorative, pointer-inert,
            and absent entirely under reduced motion or on touch. */}
        {interactive && (
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: `radial-gradient(420px circle at ${glow}, ${accent}1F, transparent 60%)`,
              opacity: active ? 1 : 0,
              transition: `opacity ${duration.ui}s ${easing.css.out}`,
            }}
          />
        )}
        <Box sx={{ position: "relative", display: "flex", flexDirection: "column", height: "100%" }}>
          {children}
        </Box>
      </Box>
    </motion.div>
  );
}

