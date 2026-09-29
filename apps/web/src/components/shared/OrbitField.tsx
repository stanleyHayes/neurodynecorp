import { Box } from "@mui/material";
import { aurora } from "@/theme/tokens";

/**
 * A sparse orbital backdrop.
 *
 * Replaces DoodleBackground, which scattered literal brains, circuit chips and
 * lightbulbs — the exact imagery §2 rejects ("robot heads, literal brains,
 * generic circuit-board imagery") — and ran fifteen `infinite` CSS animations
 * that the global reduced-motion guard now catches but which should not have
 * existed.
 *
 * This is deliberately static and deliberately faint. §18: background elements,
 * if used at all, should be extremely sparse and purposeful, and moving
 * gradients, particles and parallax must not stack in one viewport. A page that
 * needs decoration to feel finished usually needs better spacing instead, so
 * there are three arcs here and nothing more.
 *
 * Arcs are their own device, not a trace of the mark — §26 forbids
 * approximating the logo geometry anywhere.
 */
export default function OrbitField() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMid slice"
        sx={{ width: "100%", height: "100%", opacity: 0.16 }}
      >
        <defs>
          <linearGradient id="orbitfield" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={aurora.emerald} />
            <stop offset="50%" stopColor={aurora.teal} />
            <stop offset="100%" stopColor={aurora.violet} />
          </linearGradient>
        </defs>

        <g fill="none" stroke="url(#orbitfield)" strokeWidth={0.6}>
          <ellipse cx="200" cy="200" rx="170" ry="120" transform="rotate(-18 200 200)" />
          <ellipse cx="200" cy="200" rx="120" ry="168" transform="rotate(22 200 200)" />
          <circle cx="200" cy="200" r="86" />
        </g>

        {/* Two nodes, where the arcs cross. Purposeful rather than scattered. */}
        <circle cx="318" cy="150" r="3" fill={aurora.teal} opacity={0.5} />
        <circle cx="96" cy="268" r="2.5" fill={aurora.violet} opacity={0.45} />
      </Box>
    </Box>
  );
}
