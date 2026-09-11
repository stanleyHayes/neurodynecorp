import { Box, Tooltip } from "@mui/material";
import { MATURITY, type Maturity } from "@/content/maturity";

/**
 * The status stamp that appears on every product, lab and repository card.
 *
 * It carries the label's meaning in a tooltip rather than only the word,
 * because "PRIVATE BETA" and "IN DEVELOPMENT" mean very different things to a
 * visitor deciding whether they can use something today — and an unexplained
 * badge invites the reader to assume the most flattering reading.
 */
export default function MaturityBadge({
  maturity,
  size = "medium",
  decorative = false,
}: {
  maturity: Maturity;
  size?: "small" | "medium";
  /** Set where the meaning is already printed as adjacent text (the legend). */
  decorative?: boolean;
}) {
  const meta = MATURITY[maturity];
  const small = size === "small";

  return (
    <Tooltip title={meta.meaning} arrow enterTouchDelay={0}>
      <Box
        component="span"
        // The meaning must not live only in a hover tooltip: keyboard and screen
        // reader users never trigger one. tabIndex makes it reachable, and the
        // aria-label carries the full sentence rather than just the stamp.
        tabIndex={decorative ? -1 : 0}
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : `Status: ${meta.label}. ${meta.meaning}`}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          px: small ? 0.9 : 1.15,
          py: small ? 0.3 : 0.45,
          border: "1px solid",
          borderColor: `${meta.color}59`,
          background: `${meta.color}14`,
          color: meta.color,
          fontFamily: "monospace",
          fontSize: small ? "0.56rem" : "0.62rem",
          letterSpacing: "0.16em",
          fontWeight: 700,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          cursor: "help",
          "&:focus-visible": {
            outline: `2px solid ${meta.color}`,
            outlineOffset: 2,
          },
        }}
      >
        <Box
          component="span"
          aria-hidden
          sx={{ width: 5, height: 5, borderRadius: "50%", background: meta.color, flexShrink: 0 }}
        />
        {meta.label}
      </Box>
    </Tooltip>
  );
}

/**
 * Legend for index pages. Without it a grid of six different badges reads as
 * decoration rather than as a claim about what is actually usable today.
 */
export function MaturityLegend({ labels }: { labels: Maturity[] }) {
  const shown = labels.filter((l, i) => labels.indexOf(l) === i);
  if (shown.length === 0) return null;

  return (
    <Box
      component="dl"
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: { xs: 1.5, md: 3 },
        m: 0,
        p: 0,
      }}
    >
      {shown.map((label) => (
        <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
          <Box component="dt" sx={{ m: 0 }}>
            <MaturityBadge maturity={label} size="small" decorative />
          </Box>
          <Box
            component="dd"
            sx={{ m: 0, fontSize: "0.78rem", color: "text.secondary", lineHeight: 1.5 }}
          >
            {MATURITY[label].meaning}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
