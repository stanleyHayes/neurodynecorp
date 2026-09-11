import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";

export default function EditorialGrid({
  items,
  columns = 3,
}: {
  items: { title: string; description: string; icon: ReactNode }[];
  columns?: number;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: `repeat(${columns}, 1fr)` },
        borderTop: "1px solid",
        borderLeft: "1px solid",
        borderColor: "divider",
      }}
    >
      {items.map((item, i) => (
        <Box
          component="article"
          key={item.title}
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRight: "1px solid",
            borderBottom: "1px solid",
            borderColor: "divider",
            p: { xs: 2.5, md: 3 },
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              bottom: -20,
              right: -15,
              opacity: 0.06,
              color: "text.secondary",
              "& svg": { fontSize: 140 },
            }}
          >
            {item.icon}
          </Box>
          <Box sx={{ position: "relative" }}>
            <Box
              aria-hidden
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "primary.main",
                mb: 2.5,
                "& svg": { fontSize: 30 },
              }}
            >
              {item.icon}
              <Typography
                sx={{ fontFamily: "monospace", fontSize: ".65rem", color: "text.secondary" }}
              >
                {String(i + 1).padStart(2, "0")}
              </Typography>
            </Box>
            <Typography component="h3" sx={{ fontWeight: 700, fontSize: "1.1rem", mb: 1.25 }}>
              {item.title}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: ".9rem", lineHeight: 1.75 }}>
              {item.description}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
