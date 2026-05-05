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

const sharedTypography = {
  fontFamily: "'TT Squares', 'Roboto', 'Helvetica', 'Arial', sans-serif",
  h1: { fontSize: "3.5rem", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em" },
  h2: { fontSize: "2.5rem", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.01em" },
  h3: { fontSize: "2rem", fontWeight: 700, lineHeight: 1.3 },
  h4: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.4 },
  h5: { fontSize: "1.25rem", fontWeight: 600 },
  h6: { fontSize: "1rem", fontWeight: 600 },
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
          containedPrimary: mode === "dark" ? {
            background: "linear-gradient(135deg, #6C63FF 0%, #8B85FF 100%)",
            "&:hover": { background: "linear-gradient(135deg, #5B54EE 0%, #7A75FF 100%)" },
          } : {
            background: "linear-gradient(135deg, #5B54EE 0%, #7A75FF 100%)",
            "&:hover": { background: "linear-gradient(135deg, #4B44CC 0%, #6C63FF 100%)" },
          },
        },
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

function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (360 / count) * i + Math.random() * 20,
    distance: 80 + Math.random() * 200,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 0.3,
    duration: 0.6 + Math.random() * 0.4,
  }));
}

const sparkParticles = generateParticles(24);

function ThemeTransitionOverlay({ transition, onComplete }: {
  transition: TransitionState;
  onComplete: () => void;
}) {
  const isDark = transition.targetMode === "dark";
  const maxDimension = typeof window !== "undefined" ? Math.max(window.innerWidth, window.innerHeight) : 2000;
  const maxRadius = maxDimension * 1.5;

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {transition.active && (
        <MotionBox
          key={`theme-overlay-${transition.targetMode}`}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onAnimationComplete={() => {
            setTimeout(onComplete, 800);
          }}
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          {/* Expanding circle wipe */}
          <MotionBox
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            sx={{
              position: "absolute",
              left: transition.originX - maxRadius,
              top: transition.originY - maxRadius,
              width: maxRadius * 2,
              height: maxRadius * 2,
              borderRadius: "50%",
              background: isDark
                ? "radial-gradient(circle, #0A0E1A 60%, #111827 100%)"
                : "radial-gradient(circle, #F8FAFC 60%, #E2E8F0 100%)",
            }}
          />

          {/* Central icon flash */}
          <MotionBox
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: [0, 1.5, 0], opacity: [1, 1, 0] }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            sx={{
              position: "absolute",
              left: transition.originX - 30,
              top: transition.originY - 30,
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: isDark
                ? "radial-gradient(circle, rgba(108,99,255,0.6), rgba(108,99,255,0))"
                : "radial-gradient(circle, rgba(245,158,11,0.6), rgba(245,158,11,0))",
            }}
          />

          {/* Expanding ring */}
          <MotionBox
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 8, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            sx={{
              position: "absolute",
              left: transition.originX - 40,
              top: transition.originY - 40,
              width: 80,
              height: 80,
              borderRadius: "50%",
              border: `2px solid ${isDark ? "#6C63FF" : "#F59E0B"}`,
              pointerEvents: "none",
            }}
          />

          {/* Second ring delayed */}
          <MotionBox
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 6, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            sx={{
              position: "absolute",
              left: transition.originX - 30,
              top: transition.originY - 30,
              width: 60,
              height: 60,
              borderRadius: "50%",
              border: `1px solid ${isDark ? "#00D4AA" : "#FCD34D"}`,
              pointerEvents: "none",
            }}
          />

          {/* Spark particles radiating outward */}
          {sparkParticles.map((p) => {
            const rad = (p.angle * Math.PI) / 180;
            return (
              <MotionBox
                key={p.id}
                initial={{
                  x: transition.originX,
                  y: transition.originY,
                  scale: 0,
                  opacity: 1,
                }}
                animate={{
                  x: transition.originX + Math.cos(rad) * p.distance,
                  y: transition.originY + Math.sin(rad) * p.distance,
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: "easeOut",
                }}
                sx={{
                  position: "absolute",
                  width: p.size,
                  height: p.size,
                  borderRadius: "50%",
                  background: isDark
                    ? p.id % 3 === 0 ? "#6C63FF" : p.id % 3 === 1 ? "#8B85FF" : "#00D4AA"
                    : p.id % 3 === 0 ? "#F59E0B" : p.id % 3 === 1 ? "#FCD34D" : "#FB923C",
                  boxShadow: `0 0 ${p.size * 2}px ${isDark ? "rgba(108,99,255,0.6)" : "rgba(245,158,11,0.6)"}`,
                  pointerEvents: "none",
                }}
              />
            );
          })}

          {/* Stars (dark mode) or rays (light mode) */}
          {isDark ? (
            // Twinkling stars appearing
            <>
              {Array.from({ length: 12 }, (_, i) => (
                <MotionBox
                  key={`star-${i}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0.6, 1], scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                  sx={{
                    position: "absolute",
                    left: `${10 + Math.random() * 80}%`,
                    top: `${10 + Math.random() * 80}%`,
                    width: 3,
                    height: 3,
                    borderRadius: "50%",
                    background: "#fff",
                    boxShadow: "0 0 6px rgba(255,255,255,0.8), 0 0 12px rgba(108,99,255,0.4)",
                    pointerEvents: "none",
                  }}
                />
              ))}
            </>
          ) : (
            // Sun rays expanding
            <>
              {Array.from({ length: 8 }, (_, i) => {
                const angle = (360 / 8) * i;
                return (
                  <MotionBox
                    key={`ray-${i}`}
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: [0, 0.6, 0] }}
                    transition={{ delay: 0.2 + i * 0.04, duration: 0.6 }}
                    sx={{
                      position: "absolute",
                      left: transition.originX - 1,
                      top: transition.originY,
                      width: 2,
                      height: 120,
                      borderRadius: 1,
                      background: "linear-gradient(180deg, rgba(245,158,11,0.5), transparent)",
                      transformOrigin: "top center",
                      transform: `rotate(${angle}deg)`,
                      pointerEvents: "none",
                    }}
                  />
                );
              })}
            </>
          )}
        </MotionBox>
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
