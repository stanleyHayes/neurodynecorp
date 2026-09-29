import { useReducedMotion } from "framer-motion";
import { duration, easing, distance, reduced, stagger } from "@/theme/tokens";

/**
 * The single place a primitive asks "how should this move?".
 *
 * §20 is specific that reduced motion is not "animate less": path drawing,
 * orbiting, parallax, fragment assembly, magnetic effects and eclipse
 * transitions are *removed* and replaced with immediate states or a short
 * opacity change. Encoding that once means a primitive cannot forget it, and
 * cannot invent its own interpretation.
 *
 * Content must never depend on an animation completing, so everything here
 * degrades to "visible, quickly" rather than "visible, eventually".
 */
export interface MotionPreference {
  /** True when the reader has asked for reduced motion. */
  reduce: boolean;
  /** Entrance duration for the given band. */
  dur: (band: keyof typeof duration) => number;
  /** Travel distance for the given kind of movement — always 0 when reduced. */
  dist: (kind: keyof typeof distance) => number;
  /** Stagger between related items — always 0 when reduced. */
  gap: (size?: keyof typeof stagger) => number;
  /** Entrance easing. */
  ease: readonly [number, number, number, number];
  /**
   * True when an effect should not run at all rather than run faster:
   * scroll-linked drawing, orbit, magnetism, eclipse. §20 removes these.
   */
  allowDecorative: boolean;
}

export function useMotionPreference(): MotionPreference {
  const reduce = useReducedMotion() ?? false;

  return {
    reduce,
    dur: (band) => (reduce ? reduced.duration : duration[band]),
    dist: (kind) => (reduce ? reduced.distance : distance[kind]),
    gap: (size = "normal") => (reduce ? 0 : stagger[size]),
    ease: easing.out,
    allowDecorative: !reduce,
  };
}

/**
 * Viewport trigger shared by every entrance.
 *
 * §10: reveals should happen slightly before content reaches the centre of the
 * viewport. A negative bottom margin fires the reveal while the element is
 * still rising into view, so it has finished by the time it is being read —
 * rather than animating under the reader's eyes.
 */
export const VIEWPORT = { once: true, margin: "-15% 0px -10% 0px" } as const;
