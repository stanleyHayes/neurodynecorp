/**
 * Neurodyne design tokens.
 *
 * The single source for colour, type, space, radius, elevation and motion.
 * Derived from the Brand Experience + Motion Specification; section references
 * below point back at it. Components should import from here rather than
 * writing literals, so the brand can move without a search-and-replace.
 *
 * See docs/NEURODYNE_POSITIONING.md for the positioning these express.
 */

// ── Colour (§4) ──────────────────────────────────────────────────────────────

/**
 * The Aurora spectrum. Order matters: Emerald → Teal → Electric Blue → Violet
 * is the canonical gradient direction, read as energy travelling from origin to
 * culmination.
 *
 * CONTRAST, measured — this is why there are two sets. On Deep Navy every
 * Aurora colour clears AA for body text. On white, none of them do:
 *
 *            on #0A0F1F      on #FFFFFF
 *   Emerald      7.52            2.54     <- unusable as light-mode text
 *   Teal         7.86            2.43     <- unusable as light-mode text
 *   Blue         5.19            3.68     <- large text / UI only
 *   Violet       4.50            4.23     <- large text / UI only
 *
 * So `aurora` is for dark surfaces and for non-text roles anywhere (nodes,
 * paths, borders, gradient stops). `auroraOnLight` holds hue-matched darker
 * variants that clear 4.5:1 on white, for the rare case where accent *text* is
 * genuinely needed in light mode. Never use `aurora` for text on a light
 * surface — that is the specific mistake §4 and §24 warn against.
 */
export const aurora = {
  emerald: "#10B981",
  teal: "#06B6D4",
  blue: "#3B82F6",
  violet: "#8B5CF6",
} as const;

/** Hue-matched Aurora, darkened until each clears AA (4.5:1) on white. */
export const auroraOnLight = {
  emerald: "#0C875E", // 4.52:1 on white
  teal: "#048197", // 4.57:1
  blue: "#1E6FF5", // 4.52:1
  violet: "#7C3AED", // 5.70:1 — more headroom than the minimum, same hue
} as const;

/** The brand canvas and its neighbours. Darkness is the canvas (§4). */
export const canvas = {
  /** Deep Navy — the primary canvas. */
  deep: "#0A0F1F",
  /** One step up, for raised surfaces on dark. */
  raised: "#111A2E",
  /** Two steps up, for overlays and popovers on dark. */
  overlay: "#16203A",
  /** Light mode is architectural and technical, not washed out (§24). */
  light: "#FFFFFF",
  lightRaised: "#F6F8FC",
  lightOverlay: "#EDF1F8",
} as const;

/**
 * Text ramps, each verified against its own canvas.
 * Dark: 19.07 / 9.03 / 7.44. Light: 19.07 / 8.59 / 5.74.
 */
export const ink = {
  onDark: { primary: "#FFFFFF", secondary: "#A8B3C7", muted: "#94A3B8" },
  onLight: { primary: "#0A0F1F", secondary: "#41506B", muted: "#5A6B87" },
} as const;

/**
 * The Aurora gradient. A function rather than a constant because the angle
 * varies by surface, and because callers reaching for a hand-rolled
 * `linear-gradient(...)` is how the spectrum drifts out of order.
 *
 * §4: it may move slowly through surfaces or paths, but must never become a
 * constantly animated rainbow.
 */
export function auroraGradient(angle = 135): string {
  return `linear-gradient(${angle}deg, ${aurora.emerald} 0%, ${aurora.teal} 34%, ${aurora.blue} 68%, ${aurora.violet} 100%)`;
}

/** The ordered stops, for SVG gradients and anywhere CSS will not do. */
export const AURORA_STOPS = [
  { offset: "0%", color: aurora.emerald },
  { offset: "34%", color: aurora.teal },
  { offset: "68%", color: aurora.blue },
  { offset: "100%", color: aurora.violet },
] as const;

// ── Typography (§5) ──────────────────────────────────────────────────────────

/**
 * Engineered and spacious. Hierarchy comes from scale, space and composition —
 * not from making every heading uppercase, which §5 calls out explicitly.
 */
export const type = {
  /** Display and body share a face; the difference is tracking and weight. */
  family: "'Outfit', system-ui, -apple-system, 'Segoe UI', sans-serif",
  /**
   * The system voice used by micro labels across the site. No custom mono is
   * loaded — naming one here would be a promise the build does not keep, and
   * 57 files already render with the OS default.
   */
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",

  /** Display: wide tracking, strong geometric rhythm. */
  display: {
    weight: 800,
    tracking: "-0.03em",
    lineHeight: 1.04,
  },
  /** Body: normal casing, comfortable measure. §5 asks for 1.5–1.7. */
  body: {
    weight: 400,
    tracking: "0",
    lineHeight: 1.65,
  },
  /** Micro labels: uppercase, increased tracking, small — the system voice. */
  micro: {
    weight: 700,
    tracking: "0.2em",
    lineHeight: 1.4,
    size: "0.62rem",
    transform: "uppercase" as const,
  },
} as const;

// ── Space, radius, elevation ─────────────────────────────────────────────────

/**
 * Raw pixel values, for CSS that does not go through MUI.
 *
 * Deliberately NOT wired to `theme.spacing`: MUI's 8px multiplier already
 * governs every `py`/`gap`/`mt` on the site, and overriding it to 4px would
 * silently halve hundreds of existing values. Use MUI units in `sx`; use these
 * only in raw CSS, SVG geometry and motion distances.
 *
 * Generous negative space around major statements is a brand cue (§4, §6) —
 * `section` is the chapter rhythm those statements sit in.
 */
export const space = [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160] as const;

/** Vertical rhythm between major sections, in MUI spacing units. */
export const section = { tight: 7, normal: 11, generous: 16 } as const;

/**
 * The site is deliberately square; radius is the exception, not the default.
 *
 * NOTE: MUI multiplies a NUMERIC `borderRadius` in `sx` by `theme.shape.borderRadius`,
 * which is 0 here. These are strings for that reason — a number silently
 * resolves to 0px. This has bitten the navbar twice.
 */
export const radius = {
  none: "0",
  sm: "2px",
  md: "6px",
  lg: "12px",
  pill: "999px",
  circle: "50%",
} as const;

/** Elevation on dark is light, not shadow: glow reads as energy, shadow reads as nothing. */
export const elevation = {
  none: "none",
  raised: "0 8px 32px rgba(0, 0, 0, 0.45)",
  overlay: "0 16px 48px rgba(0, 0, 0, 0.6)",
  /** Energy glow, for an active/selected element. Colour is the caller's. */
  glow: (color: string, strength = 0.35) => `0 0 24px ${color}${Math.round(strength * 255).toString(16).padStart(2, "0")}`,
} as const;

// ── Motion (§19) ─────────────────────────────────────────────────────────────

/**
 * Four bands, named for what they mean rather than how long they are, so a
 * caller picks by intent. Nothing moves without purpose: every animation must
 * represent connection, computation, orbit, energy, assembly or transformation.
 */
export const duration = {
  /** Feedback — a control acknowledging input. §19: 120–220ms. */
  feedback: 0.16,
  /** Ordinary UI transitions. §19: 220–400ms. */
  ui: 0.3,
  /** Narrative — a section arriving, a chapter turning. §19: 400–800ms. */
  narrative: 0.6,
  /** Ambient — drift that should be almost unnoticeable. Multi-second. */
  ambient: 12,
} as const;

/**
 * Ease-out for entrances; spring only for small physical interactions (§19).
 * Bounce, elastic and arcade motion are explicitly out.
 */
export const easing = {
  /** Entrances and most transitions. */
  out: [0.22, 1, 0.36, 1] as const,
  /** Symmetrical movement, e.g. something repositioning. */
  inOut: [0.65, 0, 0.35, 1] as const,
  /** Exits. */
  in: [0.4, 0, 1, 1] as const,
  /** CSS equivalents, for transitions that are not framer-motion. */
  css: {
    out: "cubic-bezier(0.22, 1, 0.36, 1)",
    inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
    in: "cubic-bezier(0.4, 0, 1, 1)",
  },
} as const;

/** Small physical interactions only — a node nudging, a control pressing. */
export const spring = {
  gentle: { type: "spring" as const, stiffness: 220, damping: 28, mass: 0.7 },
  snappy: { type: "spring" as const, stiffness: 420, damping: 32, mass: 0.6 },
} as const;

/**
 * Travel distances, in px. Small by design: the spec asks for assembly and
 * computation, not for things flying in from off-screen.
 */
export const distance = {
  /** Heading fragments before they resolve. §9: 4–12px. */
  fragment: 8,
  /** Body copy rise. §9: 12–20px. */
  body: 16,
  /** Magnetic pull on a card or node. §12: 2–6px. */
  magnetic: 4,
  /** Pressed-state translation. §13: 1–2px. */
  press: 1,
} as const;

/** Stagger between related items. §9: 40–90ms is enough. */
export const stagger = { tight: 0.04, normal: 0.06, loose: 0.09 } as const;

/**
 * Reduced motion (§20).
 *
 * The rule is not "animate less" — it is that path drawing, orbiting, parallax,
 * fragment assembly, magnetic effects and eclipse transitions are *removed* and
 * replaced with immediate states or a short opacity change. Content must never
 * depend on an animation completing.
 *
 * Primitives read this rather than each re-deciding what reduced motion means.
 */
export const reduced = {
  /** What any entrance collapses to. */
  duration: 0.12,
  /** Distance under reduced motion is always zero — no translation at all. */
  distance: 0,
} as const;
