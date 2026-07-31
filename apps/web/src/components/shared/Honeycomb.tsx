import type { ReactNode } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box);

/**
 * Honeycomb layout — interlocking hexagonal cells in offset rows.
 *
 * Hexagons are pointy-top with a 2:√3 ratio, rows overlap vertically by a
 * quarter of the cell height and alternate rows are indented by half a cell,
 * which is what produces the interlocking comb.
 *
 * Below `md` the comb collapses to a normal stack — hexagons clip too much
 * content to be readable at phone widths.
 */

export interface HoneycombItem {
  key: string;
  accent?: string;
  content: ReactNode;
}

const HEX_CLIP = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";

export default function Honeycomb({
  items,
  cell = 240,
  perRow = 3,
  gap = 0,
}: {
  items: HoneycombItem[];
  /** Hexagon width in px. Height is derived (width × 1.1547). */
  cell?: number;
  /** Cells in the wide (even) rows. Odd rows carry one fewer. */
  perRow?: number;
  gap?: number;
}) {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("md"));

  // ── Compact fallback: plain stacked cards ───────────────────────────────
  if (isCompact) {
    return (
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
        {items.map((item) => (
          <Box
            key={item.key}
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: `${item.accent ?? "#6C63FF"}08`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            {item.content}
          </Box>
        ))}
      </Box>
    );
  }

  // ── Comb: split into alternating rows of perRow / perRow-1 ──────────────
  const rows: HoneycombItem[][] = [];
  let i = 0;
  let wide = true;
  while (i < items.length) {
    const size = wide ? perRow : Math.max(1, perRow - 1);
    rows.push(items.slice(i, i + size));
    i += size;
    wide = !wide;
  }

  // Pointy-top hexagon: height = width x 2/sqrt3. Rows tessellate at exactly
  // 3/4 height with alternate rows offset by half a cell, and the default gap
  // is 0 so neighbouring cells share edges — a real comb, not floating tiles.
  const height = cell * 1.1547;
  // Rows tessellate at 3/4 height. With a horizontal gap the comb also has to
  // breathe vertically by gap×sin(60°), otherwise the offset row collides with
  // the row above instead of nesting into its notches.
  const rowStep = height * 0.75 + gap;

  // Each cell is placed at an exact (x, y). Flow layout with negative margins
  // made later rows paint over the bottom points of the row above, which
  // truncated the hexagons into house shapes.
  const pitchX = cell + gap;
  const combWidth = perRow * pitchX - gap;
  const combHeight = (rows.length - 1) * rowStep + height;

  return (
    <Box
      sx={{
        position: "relative",
        width: combWidth,
        height: combHeight,
        maxWidth: "100%",
        mx: "auto",
      }}
    >
      {rows.map((row, ri) => (
        <Box
          key={ri}
          sx={{
            position: "absolute",
            top: ri * rowStep,
            // Narrow rows are indented by half a pitch so they sit in the
            // notches of the row above; both row types stay centred overall.
            left: row.length < perRow ? pitchX / 2 : 0,
            display: "flex",
            gap: `${gap}px`,
          }}
        >
          {row.map((item, ci) => {
            const accent = item.accent ?? "#6C63FF";
            return (
              <MotionBox
                key={item.key}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: (ri * perRow + ci) * 0.05 }}
                sx={{
                  width: cell,
                  height,
                  clipPath: HEX_CLIP,
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  // Hexagons cannot carry a border (clip-path cuts it), so the
                  // edge is drawn as a slightly larger clipped layer behind.
                  bgcolor: `${accent}55`,
                  transition: "transform 0.28s ease",
                  "&:hover": { transform: "translateY(-4px)" },
                  "&:hover .comb-face": { background: `${accent}1F` },
                }}
              >
                {/* Inner face — inset by 1px so the parent reads as a hairline edge */}
                <Box
                  className="comb-face"
                  sx={{
                    position: "absolute",
                    inset: 1.5,
                    clipPath: HEX_CLIP,
                    background: theme.palette.mode === "dark"
                      ? `linear-gradient(160deg, ${accent}14, rgba(10,14,26,0.92))`
                      : `linear-gradient(160deg, ${accent}12, rgba(255,255,255,0.94))`,
                    transition: "background 0.28s ease",
                  }}
                />
                <Box
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    // A pointy-top hexagon reaches full width only at its
                    // centre band, so text is held inside the inscribed
                    // rectangle rather than bleeding past the angled edges.
                    width: cell * 0.66,
                    maxHeight: height * 0.6,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.content}
                </Box>
              </MotionBox>
            );
          })}
        </Box>
      ))}
    </Box>
  );
}
