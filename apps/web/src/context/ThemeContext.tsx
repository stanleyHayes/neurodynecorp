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
import { aurora, auroraOnLight, canvas, ink } from "@/theme/tokens";
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
  MuiIconButton: { styleOverrides: { root: { borderRadius: 0 } } },
  MuiButton: {
    styleOverrides: {
      root: { borderRadius: 0, padding: "10px 24px", fontSize: "0.95rem" },
    },
  },
};

function makeTheme(mode: Mode) {
  return createTheme({
    // Aurora (§4). Teal is "core brand energy — interactive accents", so it is
    // primary; violet is "energy culmination — selected emphasis", so it is
    // secondary.
    //
    // Light mode uses the darkened Aurora variants, NOT the same hexes. Measured
    // on white, Emerald is 2.54:1 and Teal 2.43:1 — nowhere near AA. Reusing the
    // dark-mode values here is exactly the "simply invert every color" mistake
    // §24 warns against, and it would fail the AA requirement in §4.
    palette: mode === "dark" ? {
      mode: "dark",
      primary: { main: aurora.teal, light: "#38D3EB", dark: "#0490AA" },
      secondary: { main: aurora.violet, light: "#A78BFA", dark: "#6D3EE0" },
      background: { default: canvas.deep, paper: canvas.raised },
      text: { primary: ink.onDark.primary, secondary: ink.onDark.secondary },
      error: { main: "#EF4444" },
      success: { main: aurora.emerald },
      info: { main: aurora.blue },
      warning: { main: "#F59E0B" },
      divider: "rgba(255,255,255,0.10)",
    } : {
      mode: "light",
      primary: { main: auroraOnLight.teal, light: aurora.teal, dark: "#036276" },
      secondary: { main: auroraOnLight.violet, light: aurora.violet, dark: "#6D3EE0" },
      background: { default: canvas.lightRaised, paper: canvas.light },
      text: { primary: ink.onLight.primary, secondary: ink.onLight.secondary },
      error: { main: "#DC2626" },
      success: { main: auroraOnLight.emerald },
      info: { main: auroraOnLight.blue },
      warning: { main: "#B45309" },
      divider: "rgba(10,15,31,0.12)",
    },
    typography: sharedTypography,
    shape: { borderRadius: 0 },
    components: {
      ...sharedComponents,
      MuiButton: {
        styleOverrides: {
          ...sharedComponents.MuiButton.styleOverrides,
        },
        variants: [
          {
            props: { variant: "contained", color: "primary" },
            // Two adjacent Aurora stops, not all four: §13 forbids filling a
            // button with the full spectrum.
            style: mode === "dark" ? {
              background: `linear-gradient(135deg, ${aurora.teal} 0%, ${aurora.blue} 100%)`,
              color: "#04121A",
              "&:hover": { background: `linear-gradient(135deg, #38D3EB 0%, #5A96F8 100%)` },
            } : {
              background: `linear-gradient(135deg, ${auroraOnLight.teal} 0%, ${auroraOnLight.blue} 100%)`,
              color: "#FFFFFF",
              "&:hover": { background: `linear-gradient(135deg, #036276 0%, #1560DB 100%)` },
            },
          },
        ],
      },
      MuiCard: {
        styleOverrides: {
          root: mode === "dark" ? {
            background: canvas.raised,
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "none",
          } : {
            background: canvas.light,
            border: "1px solid rgba(10,15,31,0.10)",
            boxShadow: "none",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: mode === "dark" ? {
            background: "rgba(10, 15, 31, 0.85)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.10)",
          } : {
            background: "rgba(248, 250, 252, 0.85)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(37, 99, 235, 0.1)",
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
  const leavingBg = transition.targetMode === "dark" ? "#F8FAFC" : "#0A0F1F";
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
