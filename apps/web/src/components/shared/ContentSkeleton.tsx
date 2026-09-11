import { Box, Skeleton, useMediaQuery } from "@mui/material";

export default function ContentSkeleton({
  compact = false,
  rows = 3,
  columns = 1,
}: {
  compact?: boolean;
  rows?: number;
  columns?: number;
}) {
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const animation = reduce ? false : "wave";
  if (compact)
    return (
      <Skeleton
        aria-label="Working"
        variant="rectangular"
        animation={animation}
        width={64}
        height={18}
        sx={{ display: "inline-block", bgcolor: "currentColor", opacity: 0.3 }}
      />
    );
  return (
    <Box
      role="status"
      aria-label="Loading content"
      aria-busy="true"
      sx={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: `repeat(${columns}, 1fr)` },
        borderTop: "1px solid",
        borderLeft: "1px solid",
        borderColor: "divider",
      }}
    >
      {Array.from({ length: rows }, (_, i) => (
        <Box
          aria-hidden
          key={i}
          sx={{ p: 3, borderRight: "1px solid", borderBottom: "1px solid", borderColor: "divider" }}
        >
          <Skeleton animation={animation} width="24%" height={18} />
          <Skeleton animation={animation} width="65%" height={34} sx={{ my: 1 }} />
          <Skeleton animation={animation} width="95%" height={20} />
          <Skeleton animation={animation} width="82%" height={20} />
          <Skeleton animation={animation} width="54%" height={20} />
        </Box>
      ))}
    </Box>
  );
}
