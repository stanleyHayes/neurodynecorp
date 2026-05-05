import { useEffect, useState } from "react";
import { Box } from "@mui/material";

interface ReadingProgressProps {
  color?: string;
}

export default function ReadingProgress({ color = "#6C63FF" }: ReadingProgressProps) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) {
        setPct(0);
        return;
      }
      setPct(Math.min(100, Math.max(0, (scrolled / total) * 100)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 9998,
        pointerEvents: "none",
      }}
    >
      <Box
        sx={{
          height: "100%",
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}, #00D4AA)`,
          boxShadow: `0 0 12px ${color}90, 0 0 4px ${color}`,
          transition: "width 0.08s linear",
        }}
      />
    </Box>
  );
}
