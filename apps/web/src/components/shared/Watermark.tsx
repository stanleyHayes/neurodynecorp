import type { ReactElement } from "react";
import { Box, useTheme } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";

/**
 * Decorative watermarks: oversized, very faint marks placed behind content.
 * Purely decorative — `aria-hidden`, `pointer-events: none`, and inheriting
 * `color` so a single tone controls the tint in light and dark themes.
 *
 * Adapted from the RentOS/Aura watermark pattern for MUI.
 */

export type WatermarkTone = "surface" | "brand" | "accent";

function useToneColor(tone: WatermarkTone): string {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  switch (tone) {
    case "brand":
      return dark ? "rgba(139, 133, 255, 0.055)" : "rgba(91, 84, 238, 0.05)";
    case "accent":
      return dark ? "rgba(0, 212, 170, 0.05)" : "rgba(0, 168, 136, 0.045)";
    case "surface":
    default:
      return dark ? "rgba(148, 163, 184, 0.045)" : "rgba(30, 41, 59, 0.04)";
  }
}

/** A single oversized icon watermark. Position it with `sx`. */
export function IconWatermark({
  icon,
  size = 320,
  tone = "surface",
  rotate = 0,
  sx,
}: {
  icon: ReactElement;
  size?: number | Record<string, number>;
  tone?: WatermarkTone;
  rotate?: number;
  sx?: SxProps<Theme>;
}) {
  const color = useToneColor(tone);
  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        display: "flex",
        pointerEvents: "none",
        userSelect: "none",
        color,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        "& .MuiSvgIcon-root": { fontSize: size, strokeWidth: 1 },
        ...sx,
      }}
    >
      {icon}
    </Box>
  );
}

interface ConstellationItem {
  icon: ReactElement;
  /** CSS position — any subset of top/right/bottom/left, e.g. { top: "8%", left: "-4%" } */
  at?: Record<string, string | number>;
  size?: number | Record<string, number>;
  rotate?: number;
  tone?: WatermarkTone;
}

/**
 * A scattered set of watermarks covering a section. Drop inside any
 * `position: relative; overflow: hidden` container — it fills the parent.
 */
export function WatermarkConstellation({
  items,
  tone = "surface",
  opacity = 1,
}: {
  items: ConstellationItem[];
  tone?: WatermarkTone;
  opacity?: number;
}) {
  return (
    <Box aria-hidden sx={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", opacity, zIndex: 0 }}>
      {items.map((item, i) => (
        <IconWatermark
          key={i}
          icon={item.icon}
          size={item.size ?? 260}
          rotate={item.rotate ?? 0}
          tone={item.tone ?? tone}
          sx={item.at ?? { top: "10%", left: "5%" }}
        />
      ))}
    </Box>
  );
}

/**
 * A faint blueprint grid — the "engineering drawing" backdrop used behind
 * hero and section blocks. Pairs well with WatermarkConstellation.
 */
export function BlueprintGrid({ spacing = 56, opacity = 1 }: { spacing?: number; opacity?: number }) {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const line = dark ? "rgba(108, 99, 255, 0.055)" : "rgba(91, 84, 238, 0.06)";
  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity,
        zIndex: 0,
        backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
        backgroundSize: `${spacing}px ${spacing}px`,
        maskImage: "radial-gradient(ellipse 90% 70% at 50% 40%, #000 40%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 90% 70% at 50% 40%, #000 40%, transparent 100%)",
      }}
    />
  );
}

export default IconWatermark;
