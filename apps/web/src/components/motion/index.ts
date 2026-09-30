/**
 * Motion primitives (§22).
 *
 * The six the specification names, each reading its timing, distance and
 * reduced-motion behaviour from `@/theme/tokens` rather than deciding for
 * itself. Import from here rather than reaching into the files.
 */
export { default as RevealText } from "./RevealText";
export { default as MotionSection } from "./MotionSection";
export { default as EnergyButton } from "./EnergyButton";
export { default as EnergyCard } from "./EnergyCard";
export { default as ScrollPath } from "./ScrollPath";
export { useMotionPreference, VIEWPORT } from "./useMotionPreference";
