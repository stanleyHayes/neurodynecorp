import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Box, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { playSound } from "@/hooks/useSound";

const MotionBox = motion.create(Box);

const ROUTES: Record<string, { path: string; label: string }> = {
  h: { path: "/", label: "Home" },
  a: { path: "/about", label: "About" },
  s: { path: "/services", label: "Services" },
  p: { path: "/portfolio", label: "Portfolio" },
  b: { path: "/blog", label: "Blog" },
  c: { path: "/contact", label: "Contact" },
  n: { path: "/start-project", label: "Start a Project" },
  l: { path: "/philosophy", label: "Philosophy" },
  o: { path: "/open-standards", label: "Open Standards" },
  x: { path: "/spec-library", label: "Spec Library" },
};

export default function KeyboardNav() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [hint, setHint] = useState("");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const reset = () => {
      setPending(false);
      setHint("");
      if (timer) clearTimeout(timer);
    };

    const onKey = (e: KeyboardEvent) => {
      // ignore typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
      // ignore if any modifier (cmd-k handled elsewhere)
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();

      if (!pending) {
        if (key === "g") {
          e.preventDefault();
          setPending(true);
          setHint("g");
          timer = setTimeout(reset, 1200);
        } else if (key === "?") {
          e.preventDefault();
          // show shortcuts via Cmd+K
          window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
        }
      } else {
        e.preventDefault();
        const dest = ROUTES[key];
        if (dest) {
          playSound("click");
          navigate(dest.path);
          setHint(`g ${key} → ${dest.label}`);
          if (timer) clearTimeout(timer);
          timer = setTimeout(reset, 800);
        } else {
          reset();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (timer) clearTimeout(timer);
    };
  }, [navigate, pending]);

  return (
    <AnimatePresence>
      {hint && (
        <MotionBox
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.18 }}
          sx={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9996,
            px: 2.5,
            py: 1.25,
            borderRadius: 99,
            bgcolor: "rgba(10, 14, 26, 0.9)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(108, 99, 255, 0.3)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4), 0 0 24px rgba(108,99,255,0.15)",
            display: "flex",
            alignItems: "center",
            gap: 1,
            pointerEvents: "none",
          }}
        >
          <Typography sx={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#6C63FF", letterSpacing: "0.1em", fontWeight: 600 }}>
            {hint}
          </Typography>
          {hint === "g" && (
            <Typography sx={{ fontFamily: "monospace", fontSize: "0.65rem", color: "text.secondary", opacity: 0.5 }}>
              · h home · b blog · s services · p portfolio · c contact · n new · l log · o oss · x specs
            </Typography>
          )}
        </MotionBox>
      )}
    </AnimatePresence>
  );
}
