import { Box, Skeleton } from "@mui/material";

const BORDER = "rgba(108, 99, 255, 0.12)";

function SkeletonCard({ height = 120 }: { height?: number }) {
  return (
    <Box
      sx={{
        position: "relative",
        border: `1px solid ${BORDER}`,
        p: 2.5,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        minHeight: height,
      }}
    >
      <Skeleton variant="circular" width={28} height={28} sx={{ bgcolor: "rgba(108,99,255,0.08)" }} />
      <Skeleton variant="text" width="40%" sx={{ bgcolor: "rgba(108,99,255,0.06)", fontSize: "0.6rem" }} />
      <Skeleton variant="text" width="30%" sx={{ bgcolor: "rgba(108,99,255,0.10)", fontSize: "2rem" }} />
      <Skeleton variant="text" width="50%" sx={{ bgcolor: "rgba(108,99,255,0.05)", fontSize: "0.75rem" }} />
    </Box>
  );
}

function SkeletonRow({ height = 64 }: { height?: number }) {
  return (
    <Box
      sx={{
        border: `1px solid ${BORDER}`,
        p: 2,
        display: "flex",
        alignItems: "center",
        gap: 2,
        minHeight: height,
      }}
    >
      <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: "rgba(108,99,255,0.08)", flexShrink: 0 }} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="60%" sx={{ bgcolor: "rgba(108,99,255,0.10)" }} />
        <Skeleton variant="text" width="35%" sx={{ bgcolor: "rgba(108,99,255,0.05)", fontSize: "0.75rem" }} />
      </Box>
      <Skeleton variant="rounded" width={70} height={24} sx={{ bgcolor: "rgba(108,99,255,0.06)", borderRadius: 50 }} />
    </Box>
  );
}

interface PageSkeletonProps {
  /** Number of stat cards in the top row (default 4) */
  stats?: number;
  /** Number of list/grid rows to show (default 6) */
  rows?: number;
  /** Use grid cards instead of list rows */
  grid?: boolean;
  /** Number of grid columns (default 4) */
  cols?: number;
}

/**
 * Skeleton loading state for admin pages.
 * Mimics the PageBanner + ActionBar + stats + content layout.
 */
export default function PageSkeleton({ stats = 4, rows = 6, grid = false, cols = 4 }: PageSkeletonProps) {
  return (
    <Box>
      {/* Banner skeleton */}
      <Box sx={{ border: `1px solid ${BORDER}`, p: 3, mb: 0 }}>
        <Skeleton variant="text" width={100} sx={{ bgcolor: "rgba(108,99,255,0.06)", fontSize: "0.6rem", mb: 1 }} />
        <Skeleton variant="text" width="30%" sx={{ bgcolor: "rgba(108,99,255,0.10)", fontSize: "1.8rem" }} />
        <Skeleton variant="text" width="50%" sx={{ bgcolor: "rgba(108,99,255,0.05)", fontSize: "0.85rem", mt: 0.5 }} />
      </Box>

      {/* Action bar skeleton */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.5, px: 0.5, mb: 0 }}>
        <Skeleton variant="text" width={120} sx={{ bgcolor: "rgba(108,99,255,0.06)", fontSize: "0.6rem" }} />
        <Skeleton variant="rounded" width={130} height={36} sx={{ bgcolor: "rgba(108,99,255,0.08)", borderRadius: 1 }} />
      </Box>

      {/* Stats row */}
      {stats > 0 && (
        <>
          <Skeleton variant="text" width={100} sx={{ bgcolor: "rgba(108,99,255,0.05)", fontSize: "0.55rem", mb: 0.5, mt: 1 }} />
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: `repeat(${stats}, 1fr)` }, mb: 0 }}>
            {Array.from({ length: stats }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </Box>
        </>
      )}

      {/* Content rows */}
      <Skeleton variant="text" width={80} sx={{ bgcolor: "rgba(108,99,255,0.05)", fontSize: "0.55rem", mb: 0.5, mt: 2 }} />
      {grid ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: `repeat(${cols}, 1fr)` } }}>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonCard key={i} height={160} />
          ))}
        </Box>
      ) : (
        <Box>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </Box>
      )}
    </Box>
  );
}
