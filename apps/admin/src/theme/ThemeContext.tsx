import { createContext, useContext, useState, useMemo, type ReactNode } from "react";
import { ThemeProvider as MuiThemeProvider, CssBaseline, createTheme } from "@mui/material";

type Mode = "dark" | "light";

interface ThemeContextValue {
  mode: Mode;
  toggleMode: () => void;
  setMode: (mode: Mode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "dark",
  toggleMode: () => {},
  setMode: () => {},
});

export const useThemeMode = () => useContext(ThemeContext);

const STORAGE_KEY = "neurodyne_admin_theme";

function makeTheme(mode: Mode) {
  const dark = mode === "dark";
  return createTheme({
    palette: {
      mode,
      primary: { main: "#3B82F6", light: "#8B5CF6", dark: "#4B44CC" },
      secondary: { main: "#06B6D4", light: "#10B981", dark: "#00A888" },
      background: {
        default: dark ? "#0A0F1F" : "#F5F7FA",
        paper: dark ? "#111a2e" : "#FFFFFF",
      },
      text: {
        primary: dark ? "#F1F5F9" : "#1E293B",
        secondary: dark ? "#94A3B8" : "#64748B",
      },
      error: { main: "#EF4444" },
      success: { main: "#10B981" },
      warning: { main: "#F59E0B" },
    },
    typography: {
      fontFamily: "'Outfit', 'Roboto', 'Helvetica', 'Arial', sans-serif",
      h1: { fontFamily: "'TT Squares', 'Outfit', sans-serif" },
      button: { textTransform: "none", fontWeight: 600 },
    },
    shape: { borderRadius: 4 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 4, padding: "10px 24px" },

        },
      variants: [
        {
          props: { variant: "contained", color: "primary" },
          style: {
            background: "linear-gradient(135deg, #3B82F6, #8B5CF6)",
            "&:hover": { background: "linear-gradient(135deg, #5B54EE, #7A75FF)" },
          },
        },
      ],
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            background: dark ? "rgba(17, 26, 46, 0.35)" : "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(16px) saturate(1.3)",
            WebkitBackdropFilter: "blur(16px) saturate(1.3)",
            border: `1px solid ${dark ? "rgba(59, 130, 246, 0.08)" : "rgba(59, 130, 246, 0.12)"}`,
            boxShadow: dark ? "none" : "0 1px 3px rgba(0,0,0,0.06)",
          },
        },
      },
      MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 4 } } },
      MuiAlert: { styleOverrides: { root: { borderRadius: 4 } } },
      MuiDialog: { styleOverrides: { paper: { borderRadius: 6 } } },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: dark ? "rgba(10, 15, 31, 0.85)" : "rgba(245, 247, 250, 0.85)",
            backdropFilter: "blur(20px)",
            borderBottom: `1px solid ${dark ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.12)"}`,
            color: dark ? "#F1F5F9" : "#1E293B",
          },
        },
      },
    },
  });
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(() => {
    return (localStorage.getItem(STORAGE_KEY) as Mode) || "dark";
  });

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  const applyMode = (next: Mode) => {
    localStorage.setItem(STORAGE_KEY, next);
    setMode(next);
  };

  const theme = useMemo(() => makeTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, setMode: applyMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
