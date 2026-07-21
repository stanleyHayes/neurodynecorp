import { createContext, useContext, useState, useMemo, type ReactNode } from "react";
import { ThemeProvider as MuiThemeProvider, CssBaseline, createTheme } from "@mui/material";

type Mode = "dark" | "light";

interface ThemeContextValue {
  mode: Mode;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({ mode: "dark", toggleMode: () => {} });

export const useThemeMode = () => useContext(ThemeContext);

const STORAGE_KEY = "neurodyne_client_theme";

function makeTheme(mode: Mode) {
  const dark = mode === "dark";
  return createTheme({
    palette: {
      mode,
      primary: { main: "#6C63FF", light: "#8B85FF", dark: "#4B44CC" },
      secondary: { main: "#00D4AA", light: "#33DDBB", dark: "#00A888" },
      background: {
        default: dark ? "#0A0E1A" : "#F5F7FA",
        paper: dark ? "rgba(17, 24, 39, 0.35)" : "rgba(255, 255, 255, 0.8)",
      },
      text: {
        primary: dark ? "#F1F5F9" : "#1E293B",
        secondary: dark ? "#94A3B8" : "#64748B",
      },
    },
    typography: {
      fontFamily: "'TT Squares', 'Roboto', sans-serif",
      button: { textTransform: "none", fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 8, padding: "10px 24px" },

        },
      variants: [
        {
          props: { variant: "contained", color: "primary" },
          style: {
            background: "linear-gradient(135deg, #6C63FF, #8B85FF)",
            "&:hover": { background: "linear-gradient(135deg, #5B54EE, #7A75FF)" },
          },
        },
      ],
      },
      MuiCard: {
        styleOverrides: {
          root: {
            background: dark ? "rgba(17, 24, 39, 0.35)" : "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: `1px solid ${dark ? "rgba(108, 99, 255, 0.1)" : "rgba(108, 99, 255, 0.12)"}`,
            boxShadow: dark ? "0 8px 32px rgba(0, 0, 0, 0.2)" : "0 1px 3px rgba(0,0,0,0.06)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: dark ? "rgba(10, 14, 26, 0.85)" : "rgba(245, 247, 250, 0.85)",
            backdropFilter: "blur(20px)",
            borderBottom: `1px solid ${dark ? "rgba(108, 99, 255, 0.1)" : "rgba(108, 99, 255, 0.12)"}`,
            color: dark ? "#F1F5F9" : "#1E293B",
          },
        },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: "none" } },
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

  const theme = useMemo(() => makeTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
