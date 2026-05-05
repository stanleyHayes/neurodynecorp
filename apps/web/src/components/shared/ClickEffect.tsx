import { useState, useCallback, useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion.create(Box);

interface Ripple {
  id: number;
  x: number;
  y: number;
}

// ── Audio engine (shared context) ──

let _ctx: AudioContext | null = null;
function audio(): AudioContext {
  if (!_ctx) _ctx = new AudioContext();
  if (_ctx.state === "suspended") _ctx.resume();
  return _ctx;
}

function playClickSound() {
  try {
    const c = audio();
    const t = c.currentTime;

    const o1 = c.createOscillator();
    const g1 = c.createGain();
    o1.connect(g1).connect(c.destination);
    o1.type = "sine";
    o1.frequency.setValueAtTime(1200, t);
    o1.frequency.exponentialRampToValueAtTime(2400, t + 0.04);
    g1.gain.setValueAtTime(0.06, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    o1.start(t);
    o1.stop(t + 0.1);

    const o2 = c.createOscillator();
    const g2 = c.createGain();
    o2.connect(g2).connect(c.destination);
    o2.type = "triangle";
    o2.frequency.value = 1800;
    g2.gain.setValueAtTime(0, t + 0.03);
    g2.gain.linearRampToValueAtTime(0.04, t + 0.06);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o2.start(t + 0.03);
    o2.stop(t + 0.15);
  } catch {}
}

function playHoverSound() {
  try {
    const c = audio();
    const t = c.currentTime;

    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g).connect(c.destination);
    o.type = "sine";
    o.frequency.setValueAtTime(1400, t);
    o.frequency.exponentialRampToValueAtTime(1600, t + 0.04);
    g.gain.setValueAtTime(0.02, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    o.start(t);
    o.stop(t + 0.06);
  } catch {}
}

// ── Selectors for interactive elements ──

const INTERACTIVE_SELECTOR = [
  "a[href]",
  "button",
  "[role='button']",
  "[role='tab']",
  "[role='link']",
  "[role='menuitem']",
  "[data-clickable]",
  ".MuiButtonBase-root",
  ".MuiIconButton-root",
  ".MuiChip-root",
  ".MuiListItemButton-root",
  ".MuiTab-root",
  ".MuiToggleButton-root",
  ".MuiMenuItem-root",
].join(", ");

// ── Ripple visual ──

const PARTICLE_COUNT = 6;

function RippleEffect({ ripple, onDone }: { ripple: Ripple; onDone: (id: number) => void }) {
  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      angle: (360 / PARTICLE_COUNT) * i + Math.random() * 30,
      dist: 20 + Math.random() * 30,
      size: 2 + Math.random() * 3,
    })),
  ).current;

  return (
    <>
      {/* Ring */}
      <MotionBox
        initial={{ scale: 0, opacity: 0.7 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        onAnimationComplete={() => onDone(ripple.id)}
        sx={{
          position: "fixed",
          left: ripple.x - 16,
          top: ripple.y - 16,
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "1.5px solid rgba(108, 99, 255, 0.5)",
          pointerEvents: "none",
          zIndex: 100000,
        }}
      />

      {/* Flash */}
      <MotionBox
        initial={{ scale: 0, opacity: 0.5 }}
        animate={{ scale: 1.5, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        sx={{
          position: "fixed",
          left: ripple.x - 10,
          top: ripple.y - 10,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(108,99,255,0.4), transparent)",
          pointerEvents: "none",
          zIndex: 100000,
        }}
      />

      {/* Particles */}
      {particles.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180;
        return (
          <MotionBox
            key={i}
            initial={{ x: ripple.x, y: ripple.y, scale: 1, opacity: 0.8 }}
            animate={{
              x: ripple.x + Math.cos(rad) * p.dist,
              y: ripple.y + Math.sin(rad) * p.dist,
              scale: 0,
              opacity: 0,
            }}
            transition={{ duration: 0.35, ease: "easeOut", delay: i * 0.015 }}
            sx={{
              position: "fixed",
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: i % 2 === 0 ? "#6C63FF" : "#00D4AA",
              boxShadow: `0 0 4px ${i % 2 === 0 ? "rgba(108,99,255,0.6)" : "rgba(0,212,170,0.6)"}`,
              pointerEvents: "none",
              zIndex: 100000,
            }}
          />
        );
      })}
    </>
  );
}

// ── Main component ──

export default function ClickEffect() {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const idRef = useRef(0);
  const lastHoverRef = useRef<EventTarget | null>(null);

  // Click handler
  const handleClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const interactive = target.closest(INTERACTIVE_SELECTOR);
    if (!interactive) return;

    playClickSound();

    const id = ++idRef.current;
    setRipples((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
  }, []);

  // Hover handler
  const handleMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const interactive = target.closest(INTERACTIVE_SELECTOR);
    if (!interactive) return;

    // Don't re-trigger on the same element
    if (interactive === lastHoverRef.current) return;
    lastHoverRef.current = interactive;

    playHoverSound();
  }, []);

  const handleMouseOut = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const interactive = target.closest(INTERACTIVE_SELECTOR);
    if (interactive === lastHoverRef.current) {
      lastHoverRef.current = null;
    }
  }, []);

  const removeRipple = useCallback((id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleClick, true);
    document.addEventListener("mouseover", handleMouseOver, true);
    document.addEventListener("mouseout", handleMouseOut, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("mouseover", handleMouseOver, true);
      document.removeEventListener("mouseout", handleMouseOut, true);
    };
  }, [handleClick, handleMouseOver, handleMouseOut]);

  return (
    <AnimatePresence>
      {ripples.map((ripple) => (
        <RippleEffect key={ripple.id} ripple={ripple} onDone={removeRipple} />
      ))}
    </AnimatePresence>
  );
}
