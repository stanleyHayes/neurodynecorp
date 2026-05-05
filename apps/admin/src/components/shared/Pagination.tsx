import { Box, IconButton, Typography, Stack } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
}

const BORDER = "rgba(108, 99, 255, 0.12)";

export default function Pagination({ page, totalPages, onPageChange, totalItems }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        py: 2,
        px: 3,
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <IconButton
          size="small"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          sx={{ color: "text.secondary" }}
        >
          <ChevronLeftIcon />
        </IconButton>

        <Typography
          sx={{
            fontFamily: "monospace",
            fontSize: "0.7rem",
            letterSpacing: "0.15em",
            color: "text.secondary",
            opacity: 0.7,
          }}
        >
          PAGE {String(page + 1).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
          {totalItems !== undefined && (
            <Box component="span" sx={{ ml: 2, opacity: 0.5 }}>
              ({totalItems} items)
            </Box>
          )}
        </Typography>

        <IconButton
          size="small"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          sx={{ color: "text.secondary" }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Stack>
    </Box>
  );
}
