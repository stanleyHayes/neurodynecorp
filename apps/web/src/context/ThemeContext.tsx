import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import { ThemeProvider as MuiThemeProvider, CssBaseline, Box } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion.create(Box);

type Mode = "dark" | "light";

interface ThemeContextValue {
  mode: Mode;
  toggleTheme: (originRect?: DOMRect) => void;
}

const ThemeContext = createContext<ThemeContextValue>({ mode: "dark", toggleTheme: () => {} });

export function useThemeMode() {
  return useContext(ThemeContext);
}

const STORAGE_KEY = "neurodyne_theme_mode";

// ── Theme definitions ──

// Body copy uses Outfit; titles/headings keep TT Squares.
const HEADING_FONT = "'TT Squares', 'Roboto', 'Helvetica', 'Arial', sans-serif";
const sharedTypography = {
  fontFamily: "'Outfit', 'Roboto', 'Helvetica', 'Arial', sans-serif",
  h1: { fontFamily: HEADING_FONT, fontSize: "3.5rem", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em" },
  h2: { fontFamily: HEADING_FONT, fontSize: "2.5rem", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.01em" },
  h3: { fontFamily: HEADING_FONT, fontSize: "2rem", fontWeight: 700, lineHeight: 1.3 },
  h4: { fontFamily: HEADING_FONT, fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.4 },
  h5: { fontFamily: HEADING_FONT, fontSize: "1.25rem", fontWeight: 600 },
  h6: { fontFamily: HEADING_FONT, fontSize: "1rem", fontWeight: 600 },
  body1: { fontSize: "1rem", lineHeight: 1.7 },
  body2: { fontSize: "0.875rem", lineHeight: 1.6 },
  button: { textTransform: "none" as const, fontWeight: 600 },
};

const sharedComponents = {
  MuiButton: {
    styleOverrides: {
      root: { borderRadius: 8, padding: "10px 24px", fontSize: "0.95rem" },
    },
  },
};

function makeTheme(mode: Mode) {
  return createTheme({
    palette: mode === "dark" ? {
      mode: "dark",
      primary: { main: "#6C63FF", light: "#8B85FF", dark: "#4B44CC" },
      secondary: { main: "#00D4AA", light: "#33DDBB", dark: "#00A888" },
      background: { default: "#0A0E1A", paper: "#111827" },
      text: { primary: "#F1F5F9", secondary: "#94A3B8" },
      error: { main: "#EF4444" },
      success: { main: "#10B981" },
      warning: { main: "#F59E0B" },
    } : {
      mode: "light",
      primary: { main: "#5B54EE", light: "#7A75FF", dark: "#3D38B8" },
      secondary: { main: "#00BF99", light: "#33DDBB", dark: "#009977" },
      background: { default: "#F8FAFC", paper: "#FFFFFF" },
      text: { primary: "#0F172A", secondary: "#475569" },
      error: { main: "#DC2626" },
      success: { main: "#059669" },
      warning: { main: "#D97706" },
    },
    typography: sharedTypography,
    shape: { borderRadius: 12 },
    components: {
      ...sharedComponents,
      MuiButton: {
        styleOverrides: {
          ...sharedComponents.MuiButton.styleOverrides,
        },
        variants: [
          {
            props: { variant: "contained", color: "primary" },
            style: mode === "dark" ? {
              background: "linear-gradient(135deg, #6C63FF 0%, #8B85FF 100%)",
              "&:hover": { background: "linear-gradient(135deg, #5B54EE 0%, #7A75FF 100%)" },
            } : {
              background: "linear-gradient(135deg, #5B54EE 0%, #7A75FF 100%)",
              "&:hover": { background: "linear-gradient(135deg, #4B44CC 0%, #6C63FF 100%)" },
            },
          },
        ],
      },
      MuiCard: {
        styleOverrides: {
          root: mode === "dark" ? {
            background: "rgba(17, 24, 39, 0.35)",
            backdropFilter: "blur(16px) saturate(1.3)",
            WebkitBackdropFilter: "blur(16px) saturate(1.3)",
            border: "1px solid rgba(108, 99, 255, 0.08)",
            boxShadow: "none",
          } : {
            background: "rgba(255, 255, 255, 0.7)",
            backdropFilter: "blur(16px) saturate(1.3)",
            WebkitBackdropFilter: "blur(16px) saturate(1.3)",
            border: "1px solid rgba(91, 84, 238, 0.08)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: mode === "dark" ? {
            background: "rgba(10, 14, 26, 0.85)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(108, 99, 255, 0.1)",
          } : {
            background: "rgba(248, 250, 252, 0.85)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(91, 84, 238, 0.1)",
          },
        },
      },
    },
  });
}

// ── Transition overlay ──

interface TransitionState {
  active: boolean;
  originX: number;
  originY: number;
  targetMode: Mode;
}

function ThemeTransitionOverlay({ transition, onComplete }: {
  transition: TransitionState;
  onComplete: () => void;
}) {
  const maxDimension =
    typeof window !== "undefined" ? Math.max(window.innerWidth, window.innerHeight) : 2000;
  const maxRadius = maxDimension * 1.6;
  // The page has already switched to the target theme. This overlay paints the
  // theme we are LEAVING and circularly collapses it into the toggle button,
  // revealing the new theme underneath — a clean circular reveal.
  const leavingBg = transition.targetMode === "dark" ? "#F8FAFC" : "#0A0E1A";
  const cx = transition.originX;
  const cy = transition.originY;

  return (
    <AnimatePresence>
      {transition.active && (
        <MotionBox
          key={`theme-reveal-${transition.targetMode}`}
          initial={{ clipPath: `circle(${maxRadius}px at ${cx}px ${cy}px)` }}
          animate={{ clipPath: `circle(0px at ${cx}px ${cy}px)` }}
          transition={{ duration: 0.6, ease: [0.83, 0, 0.17, 1] }}
          onAnimationComplete={onComplete}
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            pointerEvents: "none",
            background: leavingBg,
          }}
        />
      )}
    </AnimatePresence>
  );
}

// ── Provider ──

export default function ThemeContextProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(STORAGE_KEY) as Mode) || "dark";
    }
    return "dark";
  });

  const [transition, setTransition] = useState<TransitionState>({
    active: false,
    originX: 0,
    originY: 0,
    targetMode: "dark",
  });

  const toggleTheme = useCallback((originRect?: DOMRect) => {
    const cx = originRect ? originRect.left + originRect.width / 2 : window.innerWidth / 2;
    const cy = originRect ? originRect.top + originRect.height / 2 : 40;

    setMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);

      setTransition({
        active: true,
        originX: cx,
        originY: cy,
        targetMode: next,
      });

      return next;
    });
  }, []);

  const handleTransitionComplete = useCallback(() => {
    setTransition((prev) => {
      if (!prev.active) return prev;
      return { ...prev, active: false };
    });
  }, []);

  const theme = useMemo(() => makeTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
        <ThemeTransitionOverlay
          transition={transition}
          onComplete={handleTransitionComplete}
        />
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
