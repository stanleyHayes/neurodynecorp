import { Children, type ElementType, type ReactNode } from "react";
import { Box, type SxProps, type Theme } from "@mui/material";
import { motion } from "framer-motion";
import { useMotionPreference, VIEWPORT } from "./useMotionPreference";

/**
 * Text entrances (§9).
 *
 * The specification is explicit that a universal fade-up is NOT the default —
 * motion should read as assembly, computation and connection. So this offers
 * three distinct behaviours and asks the caller which one the text is:
 *
 *   heading  Fragment -> Resolve. Word slices start offset by 4-12px and align
 *            cleanly. Reads as something assembling itself.
 *   label    Tracking contraction: B U I L D -> BUILD. Reads as a system
 *            resolving an identifier.
 *   body     Calm opacity plus a 12-20px rise. The quiet one, for prose.
 *
 * Text stays readable throughout, and nothing is hidden waiting for an
 * animation to finish. Under reduced motion every variant collapses to a short
 * opacity change with zero translation (§20).
 *
 * Structure note: the semantic element is a plain MUI Box and the motion lives
 * on framer-motion primitives inside it. MUI's `component` prop and
 * `motion.create(Box)` do not type together, and nesting keeps the outer
 * element's semantics under the caller's control either way.
 */

type RevealAs = "heading" | "label" | "body";

interface RevealTextProps {
  children: ReactNode;
  /** Which motion vocabulary this text belongs to. */
  as?: RevealAs;
  /** The element rendered. Defaults to a span so the caller owns semantics. */
  component?: ElementType;
  /** Delay before the reveal starts, in seconds. */
  delay?: number;
  sx?: SxProps<Theme>;
}

export default function RevealText({
  children,
  as = "body",
  component = "span",
  delay = 0,
  sx,
}: RevealTextProps) {
  const pref = useMotionPreference();
  const text = toText(children);

  // Fragment → Resolve needs a plain string to split. Anything with markup
  // keeps its nodes and takes the calm treatment instead — rearranging
  // arbitrary children would reorder the DOM.
  const canFragment = as === "heading" && text !== null && !pref.reduce;

  if (canFragment) {
    const words = text.split(" ");
    const offset = pref.dist("fragment");

    return (
      <Box
        component={component}
        // The whole string is announced once, here. The per-word spans are
        // hidden from assistive technology so the split stays purely visual —
        // otherwise a screen reader reads a heading one word per node.
        aria-label={text}
        sx={{ display: "inline-block", ...sx }}
      >
        {words.map((word, i) => (
          <Box
            key={`${word}-${i}`}
            aria-hidden
            component="span"
            sx={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}
          >
            <motion.span
              initial={{ opacity: 0, y: i % 2 === 0 ? offset : -offset, x: offset * 0.4 }}
              whileInView={{ opacity: 1, y: 0, x: 0 }}
              viewport={VIEWPORT}
              transition={{
                duration: pref.dur("narrative"),
                ease: pref.ease,
                delay: delay + i * pref.gap("tight"),
              }}
              style={{ display: "inline-block", willChange: "transform" }}
            >
              {word}
            </motion.span>
            {i < words.length - 1 && " "}
          </Box>
        ))}
      </Box>
    );
  }

  if (as === "label") {
    // Only letter-spacing and opacity move. The element keeps its final width,
    // so nothing around it reflows.
    return (
      <Box component={component} sx={{ display: "inline-block", whiteSpace: "nowrap", ...sx }}>
        <motion.span
          initial={{ opacity: 0, letterSpacing: pref.reduce ? "0.2em" : "0.62em" }}
          whileInView={{ opacity: 1, letterSpacing: "0.2em" }}
          viewport={VIEWPORT}
          transition={{ duration: pref.dur("narrative"), ease: pref.ease, delay }}
          style={{ display: "inline-block" }}
        >
          {children}
        </motion.span>
      </Box>
    );
  }

  // Body, and the reduced-motion / markup fallback for headings.
  return (
    <Box component={component} sx={{ display: "block", ...sx }}>
      <motion.span
        initial={{ opacity: 0, y: as === "heading" ? 0 : pref.dist("body") }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT}
        transition={{ duration: pref.dur("ui"), ease: pref.ease, delay }}
        style={{ display: "block" }}
      >
        {children}
      </motion.span>
    </Box>
  );
}

/** Flattens children to a string when they are plain text, otherwise null. */
function toText(children: ReactNode): string | null {
  const parts = Children.toArray(children);
  return parts.every((p) => typeof p === "string" || typeof p === "number")
    ? parts.join("")
    : null;
}
