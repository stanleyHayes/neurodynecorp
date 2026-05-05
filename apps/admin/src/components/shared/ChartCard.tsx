import { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import Cell from "./AnimatedCard";

interface ChartCardProps {
  title: string;
  color?: string;
  index?: string;
  colInRow?: number;
  totalCols?: number;
  animDelay?: number;
  children: ReactNode;
  height?: number;
}

export default function ChartCard({
  title,
  color = "#6C63FF",
  index,
  colInRow,
  totalCols,
  animDelay,
  children,
  height = 300,
}: ChartCardProps) {
  return (
    <Cell color={color} index={index} colInRow={colInRow} totalCols={totalCols} animDelay={animDelay}>
      <Typography
        sx={{
          fontFamily: "monospace",
          fontSize: "0.6rem",
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          color,
          filter: `drop-shadow(0 0 4px ${color}40)`,
          mb: 2,
        }}
      >
        {title}
      </Typography>
      <Box sx={{ width: "100%", minWidth: 0, height }}>{children}</Box>
    </Cell>
  );
}
