import { Box } from "@mui/material";

const BRACKET = "rgba(108, 99, 255, 0.30)";

/**
 * Four L-shaped corner brackets — the NeuroDyne HUD/grid frame used on the
 * landing grid menu. Drop inside a `position: relative` container to give a
 * card the sharp, terminal-style look (pair with `borderRadius: 0`).
 */
export default function HudCorners({
  color = BRACKET,
  size = 16,
  inset = 0,
}: {
  color?: string;
  size?: number;
  inset?: number;
}) {
  type Corner = { top?: number; bottom?: number; left?: number; right?: number; bT?: boolean; bB?: boolean; bL?: boolean; bR?: boolean };
  const corners: Corner[] = [
    { top: inset, left: inset, bT: true, bL: true },
    { top: inset, right: inset, bT: true, bR: true },
    { bottom: inset, left: inset, bB: true, bL: true },
    { bottom: inset, right: inset, bB: true, bR: true },
  ];
  return (
    <>
      {corners.map((pos, i) => (
        <Box
          key={i}
          aria-hidden
          sx={{
            position: "absolute",
            ...(pos.top !== undefined && { top: pos.top }),
            ...(pos.bottom !== undefined && { bottom: pos.bottom }),
            ...(pos.left !== undefined && { left: pos.left }),
            ...(pos.right !== undefined && { right: pos.right }),
            width: size,
            height: size,
            borderTop: pos.bT ? `2px solid ${color}` : "none",
            borderBottom: pos.bB ? `2px solid ${color}` : "none",
            borderLeft: pos.bL ? `2px solid ${color}` : "none",
            borderRight: pos.bR ? `2px solid ${color}` : "none",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />
      ))}
    </>
  );
}
