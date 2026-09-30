import { useState, useEffect } from "react";
import { Box, IconButton } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useThemeMode } from "@/theme/ThemeContext";

export default function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode();
  const [animating, setAnimating] = useState(false);

  const isDark = mode === "dark";
  const color = isDark ? "#F59E0B" : "#3B82F6";

  const handleClick = () => {
    setAnimating(true);
    // Delay theme change to the midpoint of animation for smooth transition
    setTimeout(() => {
      toggleMode();
    }, 300);
    setTimeout(() => setAnimating(false), 600);
  };

  // Apply smooth CSS transitions to colored elements during theme toggle animation
  // This prevents the jarring flash/disappear effect when colors change
  useEffect(() => {
    if (animating) {
      const style = document.createElement("style");
      // Target only elements that would be affected by theme color changes
      style.textContent = `
        body, body *, [data-theme-aware] {
          transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease,
                      box-shadow 0.3s ease, fill 0.3s ease, stroke 0.3s ease !important;
        }
      `;
      style.id = "theme-transition-styles";
      document.head.appendChild(style);

      return () => {
        style.remove();
      };
    }
  }, [animating]);

  return (
    <Box sx={{ position: "relative" }}>
      {/* Burst ring on toggle */}
      {animating && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: `2px solid ${color}`,
            transform: "translate(-50%, -50%)",
            animation: "themeBurst 0.6s ease-out forwards",
            pointerEvents: "none",
            zIndex: 10,
            "@keyframes themeBurst": {
              "0%": { width: 20, height: 20, opacity: 1, boxShadow: `0 0 20px ${color}` },
              "100%": { width: 80, height: 80, opacity: 0, boxShadow: `0 0 0px ${color}00` },
            },
          }}
        />
      )}

      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          color,
          position: "relative",
          overflow: "visible",
          transition: "all 0.3s",
          filter: `drop-shadow(0 0 ${animating ? "12px" : "4px"} ${color}${animating ? "90" : "40"})`,
          transform: animating ? "rotate(180deg) scale(1.2)" : "rotate(0deg) scale(1)",
          "&:hover": {
            bgcolor: `${color}12`,
            filter: `drop-shadow(0 0 8px ${color}60)`,
          },
        }}
      >
        {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
      </IconButton>
    </Box>
  );
}
