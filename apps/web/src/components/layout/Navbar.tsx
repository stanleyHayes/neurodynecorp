import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MiscellaneousServicesOutlinedIcon from "@mui/icons-material/MiscellaneousServicesOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutlined";
import DomainOutlinedIcon from "@mui/icons-material/DomainOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation, Link } from "react-router";
import Logo from "../logo/Logo";
import { useThemeMode } from "@/context/ThemeContext";

/* ═══════════════════════════════════════════════════════════════════
   CONFIGURATION
   ═══════════════════════════════════════════════════════════════════ */

const CLIENT_PORTAL_URL =
  import.meta.env.VITE_CLIENT_PORTAL_URL ?? "https://client.neurodynecorp.com";

const NAV_ITEMS = [
  { label: "Home", path: "/", index: "01", tag: "MAIN SECTOR", icon: <HomeOutlinedIcon />, color: "#6C63FF" },
  { label: "About", path: "/about", index: "02", tag: "INTEL BRIEF", icon: <InfoOutlinedIcon />, color: "#8B85FF" },
  { label: "Solutions", path: "/solutions", index: "03", tag: "CAPABILITIES", icon: <MiscellaneousServicesOutlinedIcon />, color: "#00D4AA" },
  { label: "Industries", path: "/industries", index: "04", tag: "SECTORS", icon: <DomainOutlinedIcon />, color: "#33DDBB" },
  { label: "Standards", path: "/open-standards", index: "05", tag: "INTEROPERABILITY", icon: <AccountTreeOutlinedIcon />, color: "#00D4AA" },
  { label: "Projects", path: "/projects", index: "06", tag: "OPERATIONS LOG", icon: <WorkOutlineIcon />, color: "#8B85FF" },
];

const CTA_ITEM = {
  label: "Start a Project",
  path: "/start-project",
  index: "07",
  tag: "INITIATE SEQUENCE",
  icon: <RocketLaunchOutlinedIcon />,
  color: "#00D4AA",
};

const ALL_GRID_ITEMS = [...NAV_ITEMS, CTA_ITEM];

const BORDER = "rgba(108, 99, 255, 0.15)";
const GLOW = "rgba(108, 99, 255, 0.6)";

/* ═══════════════════════════════════════════════════════════════════
   AUDIO ENGINE  (Web Audio API — no external files)
   ═══════════════════════════════════════════════════════════════════ */

let _ctx: AudioContext | null = null;
function audio(): AudioContext {
  if (!_ctx) _ctx = new AudioContext();
  if (_ctx.state === "suspended") _ctx.resume();
  return _ctx;
}

function playHover() {
  try {
    const c = audio();
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g).connect(c.destination);
    o.type = "sine";
    o.frequency.value = 1800;
    g.gain.setValueAtTime(0.03, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.06);
    o.start();
    o.stop(c.currentTime + 0.06);
  } catch {
    /* audio unavailable */
  }
}

function playSelect() {
  try {
    const c = audio();
    const t = c.currentTime;

    // ── Rising sweep
    const o1 = c.createOscillator();
    const g1 = c.createGain();
    o1.connect(g1).connect(c.destination);
    o1.type = "sine";
    o1.frequency.setValueAtTime(280, t);
    o1.frequency.exponentialRampToValueAtTime(1100, t + 0.15);
    g1.gain.setValueAtTime(0.15, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o1.start(t);
    o1.stop(t + 0.3);

    // ── Harmonic layer
    const o2 = c.createOscillator();
    const g2 = c.createGain();
    o2.connect(g2).connect(c.destination);
    o2.type = "triangle";
    o2.frequency.setValueAtTime(560, t + 0.06);
    o2.frequency.exponentialRampToValueAtTime(1800, t + 0.18);
    g2.gain.setValueAtTime(0.06, t + 0.06);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    o2.start(t + 0.06);
    o2.stop(t + 0.3);

    // ── Confirmation ping
    const o3 = c.createOscillator();
    const g3 = c.createGain();
    o3.connect(g3).connect(c.destination);
    o3.type = "sine";
    o3.frequency.value = 880;
    g3.gain.setValueAtTime(0, t + 0.15);
    g3.gain.linearRampToValueAtTime(0.1, t + 0.22);
    g3.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    o3.start(t + 0.15);
    o3.stop(t + 0.5);
  } catch {
    /* audio unavailable */
  }
}

/* ═══════════════════════════════════════════════════════════════════
   TEXT SCRAMBLE HOOK
   Characters randomise then decode left-to-right into the real label.
   ═══════════════════════════════════════════════════════════════════ */

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#%&";

function useScramble(text: string, delay: number) {
  const [display, setDisplay] = useState(() =>
    text
      .split("")
      .map((ch) =>
        ch === " " ? " " : CHARS[Math.floor(Math.random() * CHARS.length)],
      )
      .join(""),
  );

  useEffect(() => {
    // Slow shuffle while waiting
    const shuffleId = setInterval(
      () =>
        setDisplay(
          text
            .split("")
            .map((ch) =>
              ch === " "
                ? " "
                : CHARS[Math.floor(Math.random() * CHARS.length)],
            )
            .join(""),
        ),
      120,
    );

    // After delay → resolve character-by-character
    let resolveId: ReturnType<typeof setInterval> | undefined;
    const timeoutId = setTimeout(() => {
      clearInterval(shuffleId);
      let frame = 0;
      const total = text.length + 3;
      resolveId = setInterval(() => {
        frame++;
        if (frame >= total) {
          setDisplay(text);
          clearInterval(resolveId);
          return;
        }
        const resolved = Math.min(frame, text.length);
        setDisplay(
          text
            .split("")
            .map((ch, i) => {
              if (ch === " ") return " ";
              return i < resolved
                ? text[i]
                : CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join(""),
        );
      }, 30);
    }, delay);

    return () => {
      clearInterval(shuffleId);
      clearTimeout(timeoutId);
      if (resolveId) clearInterval(resolveId);
    };
  }, [text, delay]);

  return display;
}

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */

type Phase = "grid" | "selecting" | "collapsing" | "pill";

/* ═══════════════════════════════════════════════════════════════════
   CORNER BRACKETS  — L-shaped decorations at each cell corner
   ═══════════════════════════════════════════════════════════════════ */

const BRACKET_POSITIONS = {
  tl: {
    top: 12,
    left: 12,
    borderTop: "2px solid",
    borderLeft: "2px solid",
  },
  tr: {
    top: 12,
    right: 12,
    borderTop: "2px solid",
    borderRight: "2px solid",
  },
  bl: {
    bottom: 12,
    left: 12,
    borderBottom: "2px solid",
    borderLeft: "2px solid",
  },
  br: {
    bottom: 12,
    right: 12,
    borderBottom: "2px solid",
    borderRight: "2px solid",
  },
} as const;

function Brackets({ glow }: { glow: boolean }) {
  const color = glow ? GLOW : BORDER;
  return (
    <>
      {(
        Object.keys(BRACKET_POSITIONS) as Array<
          keyof typeof BRACKET_POSITIONS
        >
      ).map((pos) => (
        <Box
          key={pos}
          sx={{
            position: "absolute",
            width: 20,
            height: 20,
            ...BRACKET_POSITIONS[pos],
            borderColor: color,
            transition: "border-color 0.3s ease",
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   GRID CELL
   ═══════════════════════════════════════════════════════════════════ */

function GridCell({
  item,
  index,
  isSelected,
  phase,
  onSelect,
  isCta,
  isMobile,
}: {
  item: (typeof ALL_GRID_ITEMS)[number];
  index: number;
  isSelected: boolean;
  phase: Phase;
  onSelect: (path: string) => void;
  isCta: boolean;
  isMobile: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const scrambledLabel = useScramble(item.label, index * 100 + 400);
  const scrambledTag = useScramble(item.tag, index * 100 + 700);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={
        phase === "collapsing"
          ? {
              opacity: 0,
              scale: 0.85,
              filter: "blur(8px)",
              transition: {
                delay: isSelected ? 0.25 : index * 0.04,
                duration: 0.4,
              },
            }
          : {
              opacity: 1,
              scale: 1,
              filter: "blur(0px)",
              transition: { delay: index * 0.07, duration: 0.5 },
            }
      }
      style={{
        position: "relative",
        cursor: "pointer",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRight: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
        background: hovered ? "rgba(108, 99, 255, 0.03)" : "#0A0E1A",
        backgroundImage:
          "radial-gradient(rgba(108, 99, 255, 0.05) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        ...(isCta && !isMobile ? { gridColumn: "1 / -1" } : {}),
      }}
      onMouseEnter={() => {
        setHovered(true);
        playHover();
      }}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(item.path)}
    >
      {/* ── Scanline ── */}
      <motion.div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${
            hovered ? "rgba(108,99,255,0.5)" : "rgba(108,99,255,0.12)"
          }, transparent)`,
          pointerEvents: "none",
        }}
        animate={{ top: ["-5%", "105%"] }}
        transition={{
          duration: 3 + index * 0.4,
          repeat: Infinity,
          ease: "linear",
          delay: index * 0.5,
        }}
      />

      {/* ── Corner brackets ── */}
      <Brackets glow={hovered || isSelected} />

      {/* ── Index ── */}
      <Typography
        sx={{
          position: "absolute",
          top: 16,
          left: 44,
          fontSize: "0.65rem",
          fontFamily: "monospace",
          color: hovered ? "primary.main" : "text.secondary",
          opacity: 0.5,
          letterSpacing: "0.15em",
          transition: "color 0.3s",
        }}
      >
        {item.index}
      </Typography>

      {/* ── Tag ── */}
      <Typography
        sx={{
          fontSize: "0.55rem",
          fontFamily: "monospace",
          color: "text.secondary",
          opacity: 0.35,
          letterSpacing: "0.3em",
          mb: 1,
          userSelect: "none",
        }}
      >
        {scrambledTag}
      </Typography>

      {/* ── Label ── */}
      <Typography
        sx={{
          fontSize: isCta
            ? { xs: "1.3rem", md: "1.8rem" }
            : { xs: "1.5rem", md: "2.4rem" },
          fontWeight: 800,
          color: hovered ? "text.primary" : "text.secondary",
          letterSpacing: "-0.02em",
          transition: "color 0.3s",
          textTransform: "uppercase",
          userSelect: "none",
          ...(isCta && {
            background: "linear-gradient(135deg, #6C63FF, #00D4AA)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }),
        }}
      >
        {scrambledLabel}
      </Typography>

      {/* ── Hover glow bar ── */}
      <motion.div
        style={{
          position: "absolute",
          bottom: 0,
          left: "10%",
          right: "10%",
          height: 2,
          borderRadius: 1,
          background:
            "linear-gradient(90deg, transparent, #6C63FF, #00D4AA, transparent)",
          pointerEvents: "none",
        }}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: hovered ? 0.8 : 0, scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* ── Selection flash ── */}
      <AnimatePresence>
        {isSelected && phase === "selecting" && (
          <motion.div
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle, rgba(108,99,255,0.35), rgba(0,212,170,0.15), transparent 70%)",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Selected glow border ── */}
      {isSelected && (phase === "selecting" || phase === "collapsing") && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: "absolute",
            inset: 0,
            border: "1px solid rgba(108,99,255,0.5)",
            boxShadow: "inset 0 0 60px rgba(108,99,255,0.12)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FLOATING PILL NAV
   ═══════════════════════════════════════════════════════════════════ */

const MotionIconButton = motion.create(IconButton);

function ThemeToggle() {
  const { mode, toggleTheme } = useThemeMode();
  const isDark = mode === "dark";
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    const rect = btnRef.current?.getBoundingClientRect();
    toggleTheme(rect ?? undefined);
  };

  return (
    <Box sx={{ position: "relative", flexShrink: 0 }}>
      <MotionIconButton
        ref={btnRef}
        size="small"
        onClick={handleClick}
        whileTap={{ scale: 0.88, rotate: isDark ? 180 : -180 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        sx={{
          width: 40,
          height: 40,
          borderRadius: 50,
          border: `1px solid ${isDark ? "rgba(255,255,255,0.25)" : "rgba(12,22,46,0.16)"}`,
          background: isDark ? "rgba(255,255,255,0.05)" : "rgba(12,22,46,0.03)",
          color: isDark ? "rgba(247,250,255,0.9)" : "rgba(6,18,39,0.78)",
          transition: "border-color 0.3s, background 0.3s, color 0.3s",
          "&:hover": {
            borderColor: isDark ? "rgba(255,255,255,0.42)" : "rgba(12,22,46,0.28)",
            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(12,22,46,0.06)",
          },
        }}
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ y: 20, opacity: 0, rotate: -90 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: -20, opacity: 0, rotate: 90 }}
              transition={{ duration: 0.25 }}
              style={{ display: "flex" }}
            >
              <DarkModeOutlinedIcon sx={{ fontSize: 18 }} />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ y: 20, opacity: 0, rotate: 90 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: -20, opacity: 0, rotate: -90 }}
              transition={{ duration: 0.25 }}
              style={{ display: "flex" }}
            >
              <LightModeOutlinedIcon sx={{ fontSize: 18 }} />
            </motion.div>
          )}
        </AnimatePresence>
      </MotionIconButton>
    </Box>
  );
}

function PillNav({ isActive }: { isActive: (path: string) => boolean }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const activeMobileItem = NAV_ITEMS.find((item) => isActive(item.path));

  // Kedland-style header: at the top of a page the bar SETTLES into the layout
  // as a full-width edge-to-edge bar; once the reader moves down it contracts
  // into an inset FLOATING capsule, and expands back on return to the top.
  // Scroll reads are rAF-throttled, and the initial read covers a browser
  // restoring scroll position on back-navigation.
  useEffect(() => {
    let frame: number | null = null;

    const update = () => {
      frame = null;
      setScrolled(window.scrollY > 48);
    };

    const onScroll = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Matches kedland's easing/duration, and collapses to an instant swap when
  // the reader has asked for reduced motion.
  const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
  const shellTransition = prefersReducedMotion
    ? "none"
    : `top 0.9s ${EASE}, padding 0.9s ${EASE}`;
  const barTransition = prefersReducedMotion
    ? "background 0.3s, border-color 0.3s"
    : `max-width 0.9s ${EASE}, border-radius 0.9s ${EASE}, padding 0.9s ${EASE}, background 0.7s ease, border-color 0.7s ease, box-shadow 0.7s ease`;

  return (
    <>
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 26, delay: 0.05 }}
        style={{
          position: "fixed",
          top: scrolled ? 12 : 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          zIndex: 1300,
          pointerEvents: "none",
          paddingLeft: scrolled ? 12 : 0,
          paddingRight: scrolled ? 12 : 0,
          transition: shellTransition,
        }}
      >
        <Box
          data-header-state={scrolled ? "floating" : "settled"}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, md: 1.2 },
            px: scrolled ? { xs: 2, md: 2.2 } : { xs: 2, md: 3 },
            py: scrolled ? 0.85 : 1.15,
            width: "100%",
            borderRadius: scrolled ? 50 : 0,
            background: isDark
              ? scrolled ? "rgba(7, 20, 35, 0.84)" : "rgba(7, 20, 35, 0.72)"
              : scrolled ? "rgba(248, 250, 255, 0.94)" : "rgba(248, 250, 255, 0.84)",
            backdropFilter: "blur(20px) saturate(1.4)",
            WebkitBackdropFilter: "blur(20px) saturate(1.4)",
            border: `1px solid ${isDark
              ? "rgba(255,255,255,0.16)"
              : "rgba(12,22,46,0.12)"}`,
            boxShadow: isDark
              ? scrolled
                ? "0 12px 36px rgba(0,0,0,0.34)"
                : "0 8px 24px rgba(0,0,0,0.26)"
              : scrolled
                ? "0 10px 28px rgba(4,12,27,0.15)"
                : "0 8px 20px rgba(4,12,27,0.12)",
            pointerEvents: "auto",
            transition: barTransition,
            maxWidth: scrolled ? "min(1180px, calc(100vw - 24px))" : "none",
            mx: "auto",
            borderBottom: scrolled ? undefined : `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "rgba(12,22,46,0.10)"}`,
          }}
        >
          {/* Logo */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              mr: { xs: 0, md: 1 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: isMobile ? 34 : 38,
                height: isMobile ? 34 : 38,
                borderRadius: "50%",
                flexShrink: 0,
                bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(12,22,46,0.04)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(12,22,46,0.10)"}`,
              }}
            >
              <Logo size={isMobile ? 20 : 22} />
            </Box>
            {!isMobile && (
              <Box sx={{ ml: 1.15, lineHeight: 1 }}>
                <Typography
                  sx={{
                    fontSize: "0.95rem",
                    fontWeight: 800,
                    letterSpacing: "-0.01em",
                    color: isDark ? "rgba(245,248,255,0.96)" : "rgba(8,18,40,0.94)",
                  }}
                >
                  NeuroDyne
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.6rem",
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                    color: isDark ? "rgba(226,234,255,0.52)" : "rgba(8,18,40,0.5)",
                  }}
                >
                  Engineering the systems.
                </Typography>
              </Box>
            )}
          </Box>

          {/* Desktop nav links */}
          {!isMobile && (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.15,
                  // Settled (full-width) bar: centre the nav and let the action
                  // group fall to the right edge, as kedland does. In the
                  // floating capsule everything stays compact together.
                  mx: "auto",
                }}
                onMouseLeave={() => setHoveredPath(null)}
              >
                {NAV_ITEMS.map((item) => {
                  const active = isActive(item.path);
                  const hovered = hoveredPath === item.path;
                  return (
                    <Box key={item.path} sx={{ position: "relative", flexShrink: 0 }}>
                      <Typography
                        component={Link}
                        to={item.path}
                        onMouseEnter={() => {
                          if (hoveredPath !== item.path) playHover();
                          setHoveredPath(item.path);
                        }}
                        onFocus={() => setHoveredPath(item.path)}
                        onBlur={() => setHoveredPath((current) => (current === item.path ? null : current))}
                        sx={{
                          display: "block",
                          px: 1.45,
                          py: 0.8,
                          fontSize: "0.83rem",
                          fontWeight: active ? 650 : 500,
                          color: active || hovered
                            ? (isDark ? "rgba(255,255,255,0.97)" : "rgba(8,22,46,0.95)")
                            : (isDark ? "rgba(242,246,255,0.68)" : "rgba(8,22,46,0.62)"),
                          textDecoration: "none",
                          borderRadius: 0,
                          whiteSpace: "nowrap",
                          transition: "color 0.2s, background-color 0.2s",
                          position: "relative",
                          zIndex: 2,
                        }}
                      >
                        {item.label}
                      </Typography>
                      {hovered && (
                        <motion.div
                          layoutId="pill-hover"
                          style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: 999,
                            background: isDark ? "rgba(255, 255, 255, 0.16)" : "rgba(8, 22, 46, 0.14)",
                            border: isDark ? "1px solid rgba(255, 255, 255, 0.24)" : "1px solid rgba(8, 22, 46, 0.16)",
                            zIndex: 1,
                          }}
                          transition={{ type: "spring", stiffness: 430, damping: 34, mass: 0.8 }}
                        />
                      )}
                      {!hoveredPath && active && (
                        <motion.div
                          layoutId="pill-active"
                          style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: 999,
                            background: isDark ? "rgba(255, 255, 255, 0.13)" : "rgba(8, 22, 46, 0.12)",
                            border: isDark ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid rgba(8, 22, 46, 0.15)",
                            zIndex: 0,
                          }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </Box>
                  );
                })}
              </Box>

              {/* Client portal is a separate app, so this is an external link
                  rather than a router route. It used to point at /contact. */}
              <Typography
                component="a"
                href={CLIENT_PORTAL_URL}
                sx={{
                  display: "block",
                  px: 1.35,
                  py: 0.8,
                  fontSize: "0.83rem",
                  fontWeight: 500,
                  color: isDark ? "rgba(242,246,255,0.68)" : "rgba(8,22,46,0.62)",
                  textDecoration: "none",
                  borderRadius: 999,
                  whiteSpace: "nowrap",
                  transition: "color 0.2s, background-color 0.2s",
                  "&:hover": {
                    color: isDark ? "rgba(255,255,255,0.96)" : "rgba(8,22,46,0.9)",
                    backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(8,22,46,0.06)",
                  },
                }}
              >
                Client login
              </Typography>

              <ThemeToggle />

              {/* CTA */}
              <Typography
                component={Link}
                to="/start-project"
                sx={{
                  ml: 1,
                  pl: 2.6,
                  pr: 0.6,
                  py: 0.55,
                  fontSize: "0.83rem",
                  fontWeight: 700,
                  letterSpacing: "0.01em",
                  color: "#FFFFFF",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.1,
                  // Reference #3: the CTA is a panel whose leading edge sweeps
                  // into the bar rather than a detached pill.
                  borderRadius: "999px",
                  background: "linear-gradient(120deg, #6C63FF, #00D4AA)",
                  boxShadow: "0 4px 14px rgba(108,99,255,0.28)",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    filter: "brightness(1.06)",
                    boxShadow: "0 6px 18px rgba(108,99,255,0.38)",
                  },
                }}
              >
                Start a project
                <Box
                  aria-hidden
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.92)",
                    color: "#1B1F3B",
                    flexShrink: 0,
                  }}
                >
                  <ArrowForwardIcon sx={{ fontSize: 16 }} />
                </Box>
              </Typography>
            </>
          )}

          {/* Mobile: theme toggle + hamburger */}
          {isMobile && (
            <>
              <Box
                component={Link}
                to="/"
                sx={{
                  flex: 1,
                  minWidth: 0,
                  ml: 0.25,
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.86rem",
                    fontWeight: 750,
                    lineHeight: 1.1,
                    letterSpacing: "0.01em",
                    color: "text.primary",
                  }}
                >
                  NeuroDyne
                </Typography>
                <Typography
                  sx={{
                    mt: 0.45,
                    fontFamily: "monospace",
                    fontSize: "0.5rem",
                    lineHeight: 1,
                    letterSpacing: "0.14em",
                    color: "text.secondary",
                    opacity: 0.68,
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {activeMobileItem?.label ?? "Systems engineering"}
                </Typography>
              </Box>
              <ThemeToggle />
              <IconButton
                onClick={() => setDrawerOpen(true)}
                aria-label="Open navigation menu"
                size="small"
                sx={{
                  color: "text.primary",
                  border: isDark ? "1px solid rgba(108,99,255,0.2)" : "1px solid rgba(91,84,238,0.15)",
                  borderRadius: 50,
                  width: 40,
                  height: 40,
                }}
              >
                <MenuIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </>
          )}
        </Box>
      </motion.div>

      {/* Full-screen mobile menu */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key="mobile-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9000,
              background: isDark ? "#060911" : "#F1F5F9",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Scanlines */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${isDark ? "rgba(108,99,255,0.04)" : "rgba(91,84,238,0.03)"} 2px, ${isDark ? "rgba(108,99,255,0.04)" : "rgba(91,84,238,0.03)"} 4px)`,
                pointerEvents: "none",
                zIndex: 1,
              }}
            />

            {/* Header bar */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, py: 2, position: "relative", zIndex: 10, borderBottom: `1px solid ${isDark ? BORDER : "rgba(91,84,238,0.1)"}` }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Logo size={28} />
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 700, background: "linear-gradient(135deg, #6C63FF, #00D4AA)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                >
                  NeuroDyne
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <ThemeToggle />
                <IconButton
                  onClick={() => setDrawerOpen(false)}
                  size="small"
                  sx={{ color: "text.primary", border: `1px solid ${isDark ? "rgba(108,99,255,0.2)" : "rgba(91,84,238,0.15)"}`, borderRadius: 50, width: 34, height: 34 }}
                >
                  <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>

            {/* Grid cells */}
            <Box sx={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gridTemplateRows: "repeat(3, 1fr) 0.7fr", position: "relative", zIndex: 2 }}>
              {NAV_ITEMS.map((item, i) => {
                const active = isActive(item.path);
                const col = i % 2;

                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 + i * 0.05, duration: 0.3 }}
                    onClick={() => { setDrawerOpen(false); }}
                    style={{ display: "flex", position: "relative", overflow: "hidden", cursor: "pointer" }}
                  >
                    <Box
                      component={Link}
                      to={item.path}
                      sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        textDecoration: "none",
                        color: "inherit",
                        borderRight: col < 1 ? `1px solid ${isDark ? BORDER : "rgba(91,84,238,0.1)"}` : "none",
                        borderBottom: `1px solid ${isDark ? BORDER : "rgba(91,84,238,0.1)"}`,
                        background: active ? `${item.color}08` : "transparent",
                        position: "relative",
                      }}
                    >
                      {/* Corner brackets */}
                      {[
                        { top: 8, left: 8, bT: true, bL: true },
                        { top: 8, right: 8, bT: true, bR: true },
                        { bottom: 8, left: 8, bB: true, bL: true },
                        { bottom: 8, right: 8, bB: true, bR: true },
                      ].map((pos, ci) => (
                        <Box
                          key={ci}
                          sx={{
                            position: "absolute",
                            ...(pos.top !== undefined && { top: pos.top }),
                            ...(pos.bottom !== undefined && { bottom: pos.bottom }),
                            ...(pos.left !== undefined && { left: pos.left }),
                            ...(pos.right !== undefined && { right: pos.right }),
                            width: 12,
                            height: 12,
                            borderTop: pos.bT ? `2px solid ${item.color}${active ? "70" : "30"}` : "none",
                            borderBottom: pos.bB ? `2px solid ${item.color}${active ? "70" : "30"}` : "none",
                            borderLeft: pos.bL ? `2px solid ${item.color}${active ? "70" : "30"}` : "none",
                            borderRight: pos.bR ? `2px solid ${item.color}${active ? "70" : "30"}` : "none",
                            filter: active ? `drop-shadow(0 0 4px ${item.color}40)` : "none",
                            pointerEvents: "none",
                            zIndex: 2,
                          }}
                        />
                      ))}

                      {/* Index */}
                      <Typography sx={{ position: "absolute", top: 10, left: 26, fontSize: "0.55rem", fontFamily: "monospace", color: item.color, opacity: 0.4, letterSpacing: "0.15em", zIndex: 2 }}>
                        {item.index}
                      </Typography>

                      {/* Icon */}
                      <Box
                        sx={{
                          color: item.color,
                          "& .MuiSvgIcon-root": { fontSize: 32 },
                          filter: active
                            ? `drop-shadow(0 0 10px ${item.color}90) drop-shadow(0 0 24px ${item.color}50)`
                            : `drop-shadow(0 0 4px ${item.color}40)`,
                        }}
                      >
                        {item.icon}
                      </Box>

                      {/* Label */}
                      <Typography
                        sx={{
                          fontSize: "0.85rem",
                          fontWeight: active ? 800 : 600,
                          color: active ? "text.primary" : "text.secondary",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                        }}
                      >
                        {item.label}
                      </Typography>

                      {/* Active accent */}
                      {active && (
                        <Box sx={{ position: "absolute", bottom: 0, left: "15%", right: "15%", height: 2, background: `linear-gradient(90deg, transparent, ${item.color}, transparent)`, opacity: 0.6 }} />
                      )}
                    </Box>
                  </motion.div>
                );
              })}

              {/* CTA — full width bottom row */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35, duration: 0.3 }}
                onClick={() => setDrawerOpen(false)}
                style={{ gridColumn: "1 / -1", display: "flex", position: "relative", overflow: "hidden", cursor: "pointer" }}
              >
                <Box
                  component={Link}
                  to={CTA_ITEM.path}
                  sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    textDecoration: "none",
                    color: "inherit",
                    position: "relative",
                  }}
                >
                  {/* Corner brackets */}
                  {[
                    { top: 8, left: 8, bT: true, bL: true },
                    { top: 8, right: 8, bT: true, bR: true },
                    { bottom: 8, left: 8, bB: true, bL: true },
                    { bottom: 8, right: 8, bB: true, bR: true },
                  ].map((pos, ci) => (
                    <Box
                      key={ci}
                      sx={{
                        position: "absolute",
                        ...(pos.top !== undefined && { top: pos.top }),
                        ...(pos.bottom !== undefined && { bottom: pos.bottom }),
                        ...(pos.left !== undefined && { left: pos.left }),
                        ...(pos.right !== undefined && { right: pos.right }),
                        width: 12,
                        height: 12,
                        borderTop: pos.bT ? `2px solid ${CTA_ITEM.color}30` : "none",
                        borderBottom: pos.bB ? `2px solid ${CTA_ITEM.color}30` : "none",
                        borderLeft: pos.bL ? `2px solid ${CTA_ITEM.color}30` : "none",
                        borderRight: pos.bR ? `2px solid ${CTA_ITEM.color}30` : "none",
                        pointerEvents: "none",
                        zIndex: 2,
                      }}
                    />
                  ))}

                  <Typography sx={{ position: "absolute", top: 10, left: 26, fontSize: "0.55rem", fontFamily: "monospace", color: CTA_ITEM.color, opacity: 0.4, letterSpacing: "0.15em", zIndex: 2 }}>
                    {CTA_ITEM.index}
                  </Typography>

                  <Box
                    sx={{
                      color: CTA_ITEM.color,
                      "& .MuiSvgIcon-root": { fontSize: 36 },
                      filter: `drop-shadow(0 0 8px ${CTA_ITEM.color}60) drop-shadow(0 0 20px ${CTA_ITEM.color}30)`,
                    }}
                  >
                    {CTA_ITEM.icon}
                  </Box>

                  <Typography
                    sx={{
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color: "text.secondary",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {CTA_ITEM.label}
                  </Typography>
                </Box>
              </motion.div>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer — transparent, just pushes content below the fixed nav */}
      <Box sx={{ height: 68, background: "transparent" }} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   NAVBAR — orchestrates grid → selecting → collapsing → pill
   ═══════════════════════════════════════════════════════════════════ */

export default function Navbar() {
  const [phase, setPhase] = useState<Phase>(() => {
    // `?nosplash=1` (screenshot/E2E tooling) skips the intro grid and lands
    // straight on the pill nav, same as a returning visitor.
    if (new URLSearchParams(window.location.search).has("nosplash")) return "pill";
    return sessionStorage.getItem("ndl-nav") === "1" ? "pill" : "grid";
  });
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const isActive = useCallback(
    (path: string) =>
      path === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(path),
    [location.pathname],
  );

  const handleSelect = useCallback(
    (path: string) => {
      if (phase !== "grid") return;

      setSelectedPath(path);
      setPhase("selecting");
      playSelect();

      // selecting → collapsing (flash visible for 400 ms)
      setTimeout(() => {
        setPhase("collapsing");
        navigate(path); // navigate during collapse so content is ready

        // collapsing → pill (cells finish animating in ~800 ms)
        setTimeout(() => {
          setPhase("pill");
          sessionStorage.setItem("ndl-nav", "1");
        }, 800);
      }, 400);
    },
    [phase, navigate],
  );

  return (
    <>
      {/* ── Full-screen grid overlay ── */}
      <AnimatePresence>
        {(phase === "grid" ||
          phase === "selecting" ||
          phase === "collapsing") && (
          <motion.div
            key="nav-grid"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1400,
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gridTemplateRows: isMobile
                ? "repeat(6, 1fr) 0.6fr"
                : "1fr 1fr 0.35fr",
              background: "#0A0E1A",
            }}
          >
            {ALL_GRID_ITEMS.map((item, i) => (
              <GridCell
                key={item.path}
                item={item}
                index={i}
                isSelected={selectedPath === item.path}
                phase={phase}
                onSelect={handleSelect}
                isCta={i === ALL_GRID_ITEMS.length - 1}
                isMobile={isMobile}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating pill nav ── */}
      <AnimatePresence>
        {phase === "pill" && <PillNav isActive={isActive} />}
      </AnimatePresence>
    </>
  );
}
