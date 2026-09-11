import { useState, useEffect, useCallback, useRef } from "react";
import { Box, Typography, useMediaQuery, useTheme, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation, Link } from "react-router";
import Logo from "../logo/Logo";
import { useThemeMode } from "@/context/ThemeContext";

/* ═══════════════════════════════════════════════════════════════════
   CONFIGURATION
   ═══════════════════════════════════════════════════════════════════ */

import { ALL_GRID_ITEMS, NAV_GROUPS, type NavItem } from "@/content/navigation";
import { Button, Drawer, Modal } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [display, setDisplay] = useState(() =>
    text
      .split("")
      .map((ch) => (ch === " " ? " " : CHARS[Math.floor(Math.random() * CHARS.length)]))
      .join(""),
  );

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(text);
      return;
    }
    // Slow shuffle while waiting
    const shuffleId = setInterval(
      () =>
        setDisplay(
          text
            .split("")
            .map((ch) => (ch === " " ? " " : CHARS[Math.floor(Math.random() * CHARS.length)]))
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
              return i < resolved ? text[i] : CHARS[Math.floor(Math.random() * CHARS.length)];
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
  }, [text, delay, reducedMotion]);

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
      {(Object.keys(BRACKET_POSITIONS) as Array<keyof typeof BRACKET_POSITIONS>).map((pos) => (
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
}: {
  item: (typeof ALL_GRID_ITEMS)[number];
  index: number;
  isSelected: boolean;
  phase: Phase;
  onSelect: (path: string) => void;
  isCta: boolean;
}) {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  const scrambledLabel = useScramble(item.label, index * 100 + 400);
  const scrambledTag = useScramble(item.tag, index * 100 + 700);

  return (
    // A div with an onClick is invisible to keyboards and screen readers. This
    // grid is the first thing a visitor lands on, so it is given a real button
    // role, a tab stop, an accessible name and Enter/Space activation.
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`${item.label} — ${item.tag}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(item.path);
        }
      }}
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
        outlineOffset: "-3px",
        borderRight: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
        background: hovered ? theme.palette.background.paper : theme.palette.background.default,
        backgroundImage: "radial-gradient(rgba(108, 99, 255, 0.05) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        ...(isCta ? { gridColumn: "1 / -1" } : {}),
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

      <Box aria-hidden sx={{ color: item.color, mb: 1, "& svg": { fontSize: { xs: 26, md: 36 } } }}>
        {item.icon}
      </Box>
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          right: -15,
          bottom: -25,
          opacity: 0.07,
          "& svg": { fontSize: { xs: 110, md: 180 } },
        }}
      >
        {item.icon}
      </Box>
      {/* ── Tag ── */}
      <Typography
        sx={{
          fontSize: "0.6rem",
          fontFamily: "monospace",
          color: "text.secondary",
          opacity: 0.8,
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
          fontFamily: "Outfit, sans-serif",
          fontSize: isCta ? { xs: "1.3rem", md: "1.8rem" } : { xs: "1rem", md: "1.8rem" },
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

      <Typography
        sx={{
          mt: 1,
          px: 2,
          maxWidth: 320,
          textAlign: "center",
          color: "text.secondary",
          fontSize: { xs: ".72rem", md: ".85rem" },
          lineHeight: 1.5,
        }}
      >
        {item.description}
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
          background: "linear-gradient(90deg, transparent, #6C63FF, #00D4AA, transparent)",
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
        // Icon-only control: its only child is an SvgIcon, which contributes no
        // accessible name, so it announced as an unlabelled button.
        aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
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

function Destination({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const external = item.path.startsWith("http");
  return (
    <Box
      component={external ? "a" : Link}
      {...(external ? { href: item.path } : { to: item.path })}
      onClick={onNavigate}
      sx={{
        fontFamily: "Outfit, sans-serif",
        "& .MuiTypography-root": { fontFamily: "Outfit, sans-serif" },
        position: "relative",
        overflow: "hidden",
        display: "flex",
        gap: 1.5,
        p: 1.75,
        color: "text.primary",
        textDecoration: "none",
        borderRadius: 1,
        "&:hover, &:focus-visible": {
          bgcolor: "action.hover",
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: -2,
        },
      }}
    >
      <Box aria-hidden sx={{ color: "primary.main", pt: 0.25 }}>
        {item.icon}
      </Box>
      <Box sx={{ position: "relative", zIndex: 1, pr: 2 }}>
        <Typography sx={{ fontWeight: 700, fontSize: ".9rem" }}>{item.label}</Typography>
        <Typography sx={{ color: "text.secondary", fontSize: ".77rem", lineHeight: 1.5, mt: 0.4 }}>
          {item.description}
        </Typography>
      </Box>
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          right: -10,
          bottom: -18,
          opacity: 0.07,
          transform: "rotate(-12deg)",
          "& svg": { fontSize: 90 },
        }}
      >
        {item.icon}
      </Box>
    </Box>
  );
}

function PillNav({ isActive }: { isActive: (path: string) => boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobile = useMediaQuery("(max-width: 1199px)");
  const location = useLocation();
  useEffect(() => {
    setOpen(null);
    setDrawerOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 48);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <>
      <Box
        component="header"
        data-header-state={scrolled ? "floating" : "settled"}
        sx={{
          fontFamily: "Outfit, sans-serif",
          "& .MuiTypography-root, & .MuiButton-root": { fontFamily: "Outfit, sans-serif" },
          position: "fixed",
          top: scrolled ? 10 : 0,
          left: scrolled ? 12 : 0,
          right: scrolled ? 12 : 0,
          zIndex: 1300,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: scrolled ? 8 : 0,
          borderRadius: scrolled ? 4 : 0,
        }}
      >
        <Box
          sx={{
            maxWidth: 1440,
            mx: "auto",
            px: { xs: 2, md: 3 },
            py: 1.25,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            component={Link}
            to="/"
            aria-label="Neurodyne home"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              textDecoration: "none",
              color: "text.primary",
              mr: "auto",
            }}
          >
            <Logo size={32} />
            <Typography sx={{ fontWeight: 800 }}>Neurodyne</Typography>
          </Box>
          {!mobile && (
            <Box
              component="nav"
              aria-label="Main navigation"
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              onMouseLeave={() => setOpen(null)}
            >
              {NAV_GROUPS.map((item) => (
                <Box
                  key={item.path}
                  sx={{ position: "relative" }}
                  onMouseEnter={() => setOpen(item.children ? item.path : null)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) setOpen(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setOpen(null);
                      (e.currentTarget.querySelector("button") as HTMLButtonElement)?.focus();
                    }
                  }}
                >
                  {item.children ? (
                    <Button
                      aria-expanded={open === item.path}
                      aria-controls={open === item.path ? `nav-${item.label}` : undefined}
                      onClick={() => setOpen(item.path)}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          setOpen(item.path);
                          requestAnimationFrame(() =>
                            document
                              .querySelector<HTMLAnchorElement>(`#nav-${item.label} a`)
                              ?.focus(),
                          );
                        }
                      }}
                      endIcon={
                        <ExpandMoreIcon
                          sx={{ transform: open === item.path ? "rotate(180deg)" : "none" }}
                        />
                      }
                      sx={{
                        color: item.children.some((c) => isActive(c.path))
                          ? "primary.main"
                          : "text.primary",
                        px: 1.5,
                      }}
                    >
                      {item.label}
                    </Button>
                  ) : (
                    <Button
                      component={Link}
                      to={item.path}
                      aria-current={isActive(item.path) ? "page" : undefined}
                      sx={{ color: isActive(item.path) ? "primary.main" : "text.primary", px: 1.5 }}
                    >
                      {item.label}
                    </Button>
                  )}
                  {item.children && open === item.path && (
                    <Box
                      id={`nav-${item.label}`}
                      sx={{
                        position: "absolute",
                        top: "100%",
                        right: 0,
                        width: item.children.length > 3 ? 590 : 340,
                        pt: 1,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          display: "grid",
                          gridTemplateColumns: item.children.length > 3 ? "1fr 1fr" : "1fr",
                          bgcolor: "background.paper",
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 2,
                          boxShadow: 12,
                        }}
                      >
                        {item.children.map((child) => (
                          <Destination
                            key={child.path}
                            item={child}
                            onNavigate={() => setOpen(null)}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              ))}
              <Button
                component={Link}
                to="/partners"
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                sx={{ ml: 1 }}
              >
                Partner with us
              </Button>
            </Box>
          )}
          <ThemeToggle />
          {mobile && (
            <IconButton aria-label="Open navigation menu" onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
        </Box>
      </Box>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{ paper: { sx: { width: "min(100%, 460px)" } } }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2 }}>
          <Typography sx={{ fontWeight: 800 }}>Explore Neurodyne</Typography>
          <IconButton aria-label="Close navigation menu" onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box
          component="nav"
          aria-label="Mobile navigation"
          sx={{ px: 1, pb: 3, fontFamily: "Outfit, sans-serif" }}
        >
          <Destination item={ALL_GRID_ITEMS[0]!} onNavigate={() => setDrawerOpen(false)} />
          {NAV_GROUPS.map((item) => (
            <Box key={item.path}>
              {item.children ? (
                <Box
                  component="details"
                  sx={{
                    borderTop: "1px solid",
                    borderColor: "divider",
                    "& summary": { cursor: "pointer", p: 2, fontWeight: 700 },
                  }}
                >
                  <Box component="summary">{item.label}</Box>
                  {item.children.map((child) => (
                    <Destination
                      key={child.path}
                      item={child}
                      onNavigate={() => setDrawerOpen(false)}
                    />
                  ))}
                </Box>
              ) : (
                <Destination item={item} onNavigate={() => setDrawerOpen(false)} />
              )}
            </Box>
          ))}
          <Destination
            item={ALL_GRID_ITEMS[ALL_GRID_ITEMS.length - 1]!}
            onNavigate={() => setDrawerOpen(false)}
          />
        </Box>
      </Drawer>
      <Box sx={{ height: 72 }} />
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
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const isActive = useCallback(
    (path: string) =>
      path === "/" ? location.pathname === "/" : location.pathname.startsWith(path),
    [location.pathname],
  );

  const handleSelect = useCallback(
    (path: string) => {
      if (phase !== "grid") return;

      if (reducedMotion) {
        navigate(path);
        setPhase("pill");
        sessionStorage.setItem("ndl-nav", "1");
        return;
      }
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
    [phase, navigate, reducedMotion],
  );

  return (
    <>
      {/* ── Full-screen grid overlay ── */}
      <AnimatePresence>
        {(phase === "grid" || phase === "selecting" || phase === "collapsing") && (
          <Modal open aria-label="Choose a destination" sx={{ zIndex: 1400 }}>
            <motion.div
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label="Explore Neurodyne"
              key="nav-grid"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 1400,
                display: "grid",
                gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
                gridTemplateRows: isMobile
                  ? "repeat(4, minmax(130px, 1fr)) minmax(100px, .6fr)"
                  : "1fr 1fr .45fr",
                overflowY: "auto",
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
                />
              ))}
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Floating pill nav ── */}
      <AnimatePresence>{phase === "pill" && <PillNav isActive={isActive} />}</AnimatePresence>
    </>
  );
}
