import { Box } from "@mui/material";
import { motion } from "framer-motion";
import { aurora, AURORA_STOPS, duration, easing } from "@/theme/tokens";
import { useMotionPreference } from "@/components/motion";

/**
 * The hero identity formation (§8).
 *
 * A node appears, accelerates along a curved trajectory drawing an orbital
 * trail, a second trajectory joins it, and the structure resolves into the
 * supplied Neural Orbit mark. A violet pulse then travels through the completed
 * form. The whole sequence lands in about 1.7s.
 *
 * It must never block: the mark is in the DOM from the first frame and only its
 * opacity is animated, so a reader who arrives mid-sequence — or whose browser
 * is busy — still sees the identity. §8 is explicit that the hero must not hold
 * the user through a long cinematic intro.
 *
 * REPLACES HeroWireframe, which was a Rubik's cube driving `setRotation` from a
 * requestAnimationFrame loop — a full React reconcile of ~162 nodes every frame,
 * on the busiest page of the site. §21 asks for transform and opacity only, and
 * §2 rejects generic tech imagery in favour of the brand's own geometry. Here
 * nothing animates but `pathLength`, `opacity` and `transform`, all composited.
 *
 * Under reduced motion the mark is simply present and the trails are static
 * (§20: path drawing is removed, not accelerated).
 */

/** Two orbital trajectories. Hand-drawn arcs, not a trace of the mark — §26
 *  forbids approximating the logo geometry, and these are their own device. */
const ORBIT_A = "M 96 18 C 28 34, 18 126, 96 172";
const ORBIT_B = "M 96 172 C 164 156, 174 64, 96 18";

export default function HeroOrbit({ size = 320 }: { size?: number }) {
  const pref = useMotionPreference();
  const animate = pref.allowDecorative;

  // §8's beats, in seconds. Named so the sequence reads as a timeline rather
  // than a pile of magic delays.
  const t = { node: 0.2, trailA: 0.4, trailB: 0.8, mark: 1.1, pulse: 1.3 };

  return (
    <Box
      aria-hidden
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: size,
        aspectRatio: "1 / 1",
        mx: "auto",
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 192 192"
        sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="hero-orbit-aurora" x1="0" y1="0" x2="1" y2="1">
            {AURORA_STOPS.map((s) => (
              <stop key={s.offset} offset={s.offset} stopColor={s.color} />
            ))}
          </linearGradient>
        </defs>

        {[ORBIT_A, ORBIT_B].map((d, i) => (
          <motion.path
            key={d}
            d={d}
            fill="none"
            stroke="url(#hero-orbit-aurora)"
            strokeWidth={1.25}
            strokeLinecap="round"
            initial={animate ? { pathLength: 0, opacity: 0 } : false}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{
              duration: 0.75,
              ease: easing.out,
              delay: i === 0 ? t.trailA : t.trailB,
            }}
          />
        ))}

        {/* The node. It appears first and settles onto the orbit — §8's "small
            emerald/cyan node" that starts the whole system. */}
        <motion.circle
          r={4}
          fill={aurora.emerald}
          initial={animate ? { cx: 96, cy: 18, opacity: 0, scale: 0.4 } : false}
          animate={{ cx: 150, cy: 52, opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: easing.out, delay: t.node }}
          style={{ filter: `drop-shadow(0 0 8px ${aurora.teal})` }}
        />
      </Box>

      {/* The supplied mark. Present from the first frame; only opacity moves,
          so the identity is never gated on the animation finishing. */}
      <Box
        component={motion.img}
        src="/brand/mark-512.png"
        srcSet="/brand/mark-256.png 256w, /brand/mark-512.png 512w"
        sizes={`${size}px`}
        alt=""
        initial={animate ? { opacity: 0, scale: 0.94 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: duration.narrative, ease: easing.out, delay: animate ? t.mark : 0 }}
        sx={{
          position: "absolute",
          inset: "12%",
          width: "76%",
          height: "76%",
          objectFit: "contain",
        }}
      />

      {/* The violet energy pulse crossing the completed form (§8, 1.3s). One
          transform on one element, and it runs exactly once — §18 forbids
          stacking ambient loops, and a hero that pulses forever is decoration. */}
      {animate && (
        <Box
          component={motion.div}
          initial={{ opacity: 0, x: "-60%" }}
          animate={{ opacity: [0, 0.55, 0], x: "60%" }}
          transition={{ duration: 0.9, ease: easing.inOut, delay: t.pulse }}
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `linear-gradient(105deg, transparent 42%, ${aurora.violet} 50%, transparent 58%)`,
            mixBlendMode: "screen",
          }}
        />
      )}
    </Box>
  );
}
