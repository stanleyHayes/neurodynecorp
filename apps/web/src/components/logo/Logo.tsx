import { Box, type SxProps, type Theme } from "@mui/material";

/**
 * The Neural Orbit mark.
 *
 * This renders the supplied brand asset. It previously hand-drew an
 * approximation of the mark in SVG using the old palette, which the brand
 * specification forbids outright (§26: never redraw or approximate the supplied
 * logo, never alter its geometry, proportions or node placement). Anything that
 * needs the mark should use this component rather than reconstructing it.
 *
 * The master is transparent, so the same file works on dark and light surfaces
 * without a per-theme variant.
 *
 * No SVG master was supplied. PNG is therefore the interface format, and the
 * sizes below exist so a 32px navbar mark does not download a 512px image —
 * `sizes` lets the browser pick, and 3x of the largest interface use is covered.
 * Replace this with an <svg> import if an SVG master is ever provided.
 */

interface LogoProps {
  size?: number;
  /**
   * Accessible name. Defaults to empty: the mark is almost always inside a link
   * or heading that already carries the name, and a second announcement of
   * "Neurodyne" is noise. Pass a label only where the mark stands alone.
   */
  alt?: string;
  sx?: SxProps<Theme>;
}

export default function Logo({ size = 64, alt = "", sx }: LogoProps) {
  return (
    <Box
      component="img"
      src="/brand/mark-128.png"
      srcSet="/brand/mark-64.png 64w, /brand/mark-128.png 128w, /brand/mark-256.png 256w, /brand/mark-512.png 512w"
      sizes={`${size}px`}
      width={size}
      height={size}
      alt={alt}
      aria-hidden={alt === "" ? true : undefined}
      // Decorative in every current placement and never below the fold in a way
      // that benefits from lazy loading — the navbar mark is the first thing a
      // visitor sees, so it must not be deferred.
      decoding="async"
      sx={{ width: size, height: size, display: "block", flexShrink: 0, ...sx }}
    />
  );
}
