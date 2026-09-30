import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { aurora, auroraOnLight, canvas, ink } from "@/theme/tokens";
import { flushSync } from "react-dom";


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


// ── Provider ──

export default function ThemeContextProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(STORAGE_KEY) as Mode) || "dark";
    }
    return "dark";
  });


  const toggleTheme = useCallback((originRect?: DOMRect) => {
    const next = mode === "dark" ? "light" : "dark";
    const apply = () => {
      localStorage.setItem(STORAGE_KEY, next);
      setMode(next);
    };

    /*
     * A circular reveal has to reveal the PAGE.
     *
     * This used to paint a flat slab of #0A0F1F or #F8FAFC across the whole
     * viewport at z-index 99999 and collapse it into the toggle. For 600ms
     * every word and image on the page was simply gone behind a blank
     * rectangle — the colour changed, then the content came back. That is not
     * a reveal, it is a curtain.
     *
     * The View Transitions API is built for exactly this: the browser
     * snapshots the real page before the change and holds it underneath while
     * the new one clips in over it. Nothing vanishes, because the old frame is
     * genuinely still there.
     *
     * Where it is unsupported, or where the reader has asked for less motion,
     * the theme simply changes. An instant swap is the correct reduced-motion
     * behaviour anyway — §20 removes the effect rather than shortening it.
     */
    const startViewTransition = (
      document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }
    ).startViewTransition;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!startViewTransition || prefersReduced) {
      apply();
      return;
    }

    const cx = originRect ? originRect.left + originRect.width / 2 : window.innerWidth / 2;
    const cy = originRect ? originRect.top + originRect.height / 2 : 40;
    const radius = Math.hypot(
      Math.max(cx, window.innerWidth - cx),
      Math.max(cy, window.innerHeight - cy),
    );

    // flushSync so the DOM carries the new theme before the browser takes its
    // "after" snapshot; without it the transition captures the old one twice.
    const transition = startViewTransition.call(document, () => {
      flushSync(apply);
    });

    void transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${cx}px ${cy}px)`,
            `circle(${radius}px at ${cx}px ${cy}px)`,
          ],
        },
        {
          duration: 600,
          easing: "cubic-bezier(0.83, 0, 0.17, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  }, [mode]);


  const theme = useMemo(() => makeTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
