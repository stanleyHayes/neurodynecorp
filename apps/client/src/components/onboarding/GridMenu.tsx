import { useState, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

const MotionBox = motion.create(Box);

const items = [
  { label: "Dashboard", icon: <DashboardOutlinedIcon />, path: "/", color: "#6C63FF", index: "01" },
  { label: "Projects", icon: <FolderOutlinedIcon />, path: "/projects", color: "#8B85FF", index: "02" },
  { label: "Documents", icon: <DescriptionOutlinedIcon />, path: "/documents", color: "#00D4AA", index: "03" },
  { label: "Messages", icon: <ChatOutlinedIcon />, path: "/messages", color: "#33DDBB", index: "04" },
  { label: "Billing", icon: <ReceiptOutlinedIcon />, path: "/billing", color: "#6C63FF", index: "05" },
  { label: "Notifications", icon: <NotificationsOutlinedIcon />, path: "/notifications", color: "#8B85FF", index: "06" },
];

const ctaItem = {
  label: "Settings",
  icon: <SettingsOutlinedIcon />,
  path: "/settings",
  color: "#00D4AA",
  index: "07",
};

const allItems = [...items, ctaItem];

function playSelectSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(2640, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.08, ctx.currentTime + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc2.start(ctx.currentTime + 0.05);
    osc2.stop(ctx.currentTime + 0.25);
  } catch {
    /* Audio not available — ignore */
  }
}

function playHoverSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    /* Audio not available — ignore */
  }
}

function Scanlines() {
  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.03 }}
      transition={{ duration: 1 }}
      sx={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(108,99,255,0.08) 2px, rgba(108,99,255,0.08) 4px)",
        pointerEvents: "none",
        zIndex: 50,
      }}
    />
  );
}

interface GridMenuProps {
  onNavigate: () => void;
}

export default function GridMenu({ onNavigate }: GridMenuProps) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState<"grid" | "selected" | "morphing" | "done">("grid");
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  const handleSelect = useCallback(
    (path: string) => {
      if (phase !== "grid") return;
      playSelectSound();
      setSelected(path);
      setPhase("selected");
      setTimeout(() => setPhase("morphing"), 600);
      setTimeout(() => {
        setPhase("done");
        navigate(path);
        onNavigate();
      }, 1400);
    },
    [phase, navigate, onNavigate],
  );

  const handleHover = useCallback(
    (path: string) => {
      if (phase !== "grid") return;
      setHoveredPath(path);
      playHoverSound();
    },
    [phase],
  );

  const borderColor = "rgba(108, 99, 255, 0.12)";
  const selectedItem = allItems.find((m) => m.path === selected);

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        bgcolor: "#060911",
        overflow: "hidden",
      }}
    >
      <Scanlines />

      {/* Corner accents */}
      <Box sx={{ position: "absolute", top: 16, left: 16, width: 40, height: 40, borderTop: "2px solid rgba(108,99,255,0.3)", borderLeft: "2px solid rgba(108,99,255,0.3)", zIndex: 60, pointerEvents: "none" }} />
      <Box sx={{ position: "absolute", top: 16, right: 16, width: 40, height: 40, borderTop: "2px solid rgba(0,212,170,0.3)", borderRight: "2px solid rgba(0,212,170,0.3)", zIndex: 60, pointerEvents: "none" }} />
      <Box sx={{ position: "absolute", bottom: 16, left: 16, width: 40, height: 40, borderBottom: "2px solid rgba(0,212,170,0.3)", borderLeft: "2px solid rgba(0,212,170,0.3)", zIndex: 60, pointerEvents: "none" }} />
      <Box sx={{ position: "absolute", bottom: 16, right: 16, width: 40, height: 40, borderBottom: "2px solid rgba(108,99,255,0.3)", borderRight: "2px solid rgba(108,99,255,0.3)", zIndex: 60, pointerEvents: "none" }} />

      {/* Grid phase */}
      <AnimatePresence>
        {(phase === "grid" || phase === "selected") && (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.5, ease: "easeIn" } }}
            sx={{
              position: "absolute",
              inset: 0,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gridTemplateRows: "1fr 1fr 0.55fr",
            }}
          >
            {items.map((item, i) => {
              const isHovered = hoveredPath === item.path;
              const isSelected = selected === item.path;
              const col = i % 3;

              return (
                <MotionBox
                  key={item.path}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    background: isSelected ? `${item.color}18` : isHovered ? `${item.color}08` : "transparent",
                  }}
                  transition={{ opacity: { duration: 0.3, delay: i * 0.05 }, background: { duration: 0.2 } }}
                  onHoverStart={() => handleHover(item.path)}
                  onHoverEnd={() => setHoveredPath(null)}
                  onClick={() => handleSelect(item.path)}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1.5,
                    cursor: phase === "grid" ? "pointer" : "default",
                    position: "relative",
                    borderRight: col < 2 ? `1px solid ${borderColor}` : "none",
                    borderBottom: `1px solid ${borderColor}`,
                    overflow: "hidden",
                    userSelect: "none",
                  }}
                >
                  {/* Corner brackets with glow */}
                  {[
                    { top: 10, left: 10, bT: true, bL: true },
                    { top: 10, right: 10, bT: true, bR: true },
                    { bottom: 10, left: 10, bB: true, bL: true },
                    { bottom: 10, right: 10, bB: true, bR: true },
                  ].map((pos, ci) => (
                    <Box
                      key={ci}
                      sx={{
                        position: "absolute",
                        ...( pos.top !== undefined && { top: pos.top }),
                        ...( pos.bottom !== undefined && { bottom: pos.bottom }),
                        ...( pos.left !== undefined && { left: pos.left }),
                        ...( pos.right !== undefined && { right: pos.right }),
                        width: 20,
                        height: 20,
                        borderTop: pos.bT ? `2px solid ${item.color}40` : "none",
                        borderBottom: pos.bB ? `2px solid ${item.color}40` : "none",
                        borderLeft: pos.bL ? `2px solid ${item.color}40` : "none",
                        borderRight: pos.bR ? `2px solid ${item.color}40` : "none",
                        filter: `drop-shadow(0 0 4px ${item.color}30)`,
                        pointerEvents: "none",
                        zIndex: 3,
                        transition: "filter 0.3s, border-color 0.3s",
                        ...(isHovered || isSelected) && {
                          borderTopColor: pos.bT ? `${item.color}90` : undefined,
                          borderBottomColor: pos.bB ? `${item.color}90` : undefined,
                          borderLeftColor: pos.bL ? `${item.color}90` : undefined,
                          borderRightColor: pos.bR ? `${item.color}90` : undefined,
                          filter: `drop-shadow(0 0 8px ${item.color}60)`,
                        },
                      }}
                    />
                  ))}

                  <Typography sx={{ position: "absolute", top: 12, left: 16, fontSize: "0.7rem", fontWeight: 600, color: `${item.color}60`, letterSpacing: "0.15em", fontFamily: "monospace" }}>
                    {item.index}
                  </Typography>

                  {isSelected && (
                    <MotionBox
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 4, opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      sx={{ position: "absolute", width: 80, height: 80, borderRadius: "50%", border: `2px solid ${item.color}`, pointerEvents: "none" }}
                    />
                  )}

                  <AnimatePresence>
                    {(isHovered || isSelected) && (
                      <MotionBox
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        sx={{ position: "absolute", width: "70%", height: "70%", borderRadius: "50%", background: `radial-gradient(circle, ${item.color}${isSelected ? "25" : "10"} 0%, transparent 70%)`, filter: "blur(50px)", pointerEvents: "none" }}
                      />
                    )}
                  </AnimatePresence>

                  <MotionBox
                    animate={{ scale: isSelected ? 1.3 : isHovered ? 1.1 : 1, color: isSelected || isHovered ? item.color : `${item.color}90` }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    sx={{
                      position: "relative",
                      zIndex: 2,
                      "& .MuiSvgIcon-root": { fontSize: { xs: 40, md: 56 } },
                      filter: isSelected
                        ? `drop-shadow(0 0 16px ${item.color}) drop-shadow(0 0 40px ${item.color}80)`
                        : isHovered
                          ? `drop-shadow(0 0 10px ${item.color}90) drop-shadow(0 0 24px ${item.color}50)`
                          : `drop-shadow(0 0 4px ${item.color}40)`,
                      transition: "filter 0.3s",
                    }}
                  >
                    {item.icon}
                  </MotionBox>

                  <MotionBox
                    animate={{ y: isHovered || isSelected ? 0 : 4, opacity: isHovered || isSelected ? 1 : 0.5 }}
                    transition={{ duration: 0.2 }}
                    sx={{ position: "relative", zIndex: 2 }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700, color: isSelected || isHovered ? "text.primary" : "text.secondary", letterSpacing: "0.08em", textTransform: "uppercase", fontSize: { xs: "0.85rem", md: "1.1rem" } }}>
                      {item.label}
                    </Typography>
                  </MotionBox>

                  <AnimatePresence>
                    {(isHovered || isSelected) && (
                      <MotionBox
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        exit={{ scaleX: 0 }}
                        transition={{ duration: 0.3 }}
                        sx={{ position: "absolute", bottom: 0, left: "20%", right: "20%", height: 2, background: `linear-gradient(90deg, transparent, ${item.color}, transparent)`, transformOrigin: "center" }}
                      />
                    )}
                  </AnimatePresence>
                </MotionBox>
              );
            })}

            {/* Bottom row */}
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                background: selected === ctaItem.path ? `${ctaItem.color}18` : hoveredPath === ctaItem.path ? `${ctaItem.color}06` : "transparent",
              }}
              transition={{ opacity: { duration: 0.3, delay: 0.35 }, background: { duration: 0.2 } }}
              onHoverStart={() => handleHover(ctaItem.path)}
              onHoverEnd={() => setHoveredPath(null)}
              onClick={() => handleSelect(ctaItem.path)}
              sx={{
                gridColumn: "1 / -1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                cursor: phase === "grid" ? "pointer" : "default",
                position: "relative",
                overflow: "hidden",
                userSelect: "none",
              }}
            >
              {/* Corner brackets with glow */}
              {[
                { top: 10, left: 10, bT: true, bL: true },
                { top: 10, right: 10, bT: true, bR: true },
                { bottom: 10, left: 10, bB: true, bL: true },
                { bottom: 10, right: 10, bB: true, bR: true },
              ].map((pos, ci) => (
                <Box
                  key={ci}
                  sx={{
                    position: "absolute",
                    ...( pos.top !== undefined && { top: pos.top }),
                    ...( pos.bottom !== undefined && { bottom: pos.bottom }),
                    ...( pos.left !== undefined && { left: pos.left }),
                    ...( pos.right !== undefined && { right: pos.right }),
                    width: 20,
                    height: 20,
                    borderTop: pos.bT ? `2px solid ${ctaItem.color}40` : "none",
                    borderBottom: pos.bB ? `2px solid ${ctaItem.color}40` : "none",
                    borderLeft: pos.bL ? `2px solid ${ctaItem.color}40` : "none",
                    borderRight: pos.bR ? `2px solid ${ctaItem.color}40` : "none",
                    filter: `drop-shadow(0 0 4px ${ctaItem.color}30)`,
                    pointerEvents: "none",
                    zIndex: 3,
                    transition: "filter 0.3s, border-color 0.3s",
                    ...(hoveredPath === ctaItem.path || selected === ctaItem.path) && {
                      borderTopColor: pos.bT ? `${ctaItem.color}90` : undefined,
                      borderBottomColor: pos.bB ? `${ctaItem.color}90` : undefined,
                      borderLeftColor: pos.bL ? `${ctaItem.color}90` : undefined,
                      borderRightColor: pos.bR ? `${ctaItem.color}90` : undefined,
                      filter: `drop-shadow(0 0 8px ${ctaItem.color}60)`,
                    },
                  }}
                />
              ))}

              <Typography sx={{ position: "absolute", top: 12, left: 16, fontSize: "0.7rem", fontWeight: 600, color: `${ctaItem.color}60`, letterSpacing: "0.15em", fontFamily: "monospace" }}>
                {ctaItem.index}
              </Typography>

              {selected === ctaItem.path && (
                <MotionBox
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 6, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  sx={{ position: "absolute", width: 80, height: 80, borderRadius: "50%", border: `2px solid ${ctaItem.color}`, pointerEvents: "none" }}
                />
              )}

              <AnimatePresence>
                {(hoveredPath === ctaItem.path || selected === ctaItem.path) && (
                  <MotionBox
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    sx={{ position: "absolute", width: 400, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${ctaItem.color}12 0%, transparent 70%)`, filter: "blur(60px)", pointerEvents: "none" }}
                  />
                )}
              </AnimatePresence>

              <MotionBox
                animate={{ scale: selected === ctaItem.path ? 1.3 : hoveredPath === ctaItem.path ? 1.1 : 1, color: selected === ctaItem.path || hoveredPath === ctaItem.path ? ctaItem.color : `${ctaItem.color}90` }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                sx={{
                  position: "relative",
                  zIndex: 2,
                  "& .MuiSvgIcon-root": { fontSize: { xs: 44, md: 60 } },
                  filter: selected === ctaItem.path
                    ? `drop-shadow(0 0 16px ${ctaItem.color}) drop-shadow(0 0 40px ${ctaItem.color}80)`
                    : hoveredPath === ctaItem.path
                      ? `drop-shadow(0 0 10px ${ctaItem.color}90) drop-shadow(0 0 24px ${ctaItem.color}50)`
                      : `drop-shadow(0 0 4px ${ctaItem.color}40)`,
                  transition: "filter 0.3s",
                }}
              >
                {ctaItem.icon}
              </MotionBox>

              <MotionBox animate={{ opacity: hoveredPath === ctaItem.path || selected === ctaItem.path ? 1 : 0.5 }} sx={{ position: "relative", zIndex: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: selected === ctaItem.path || hoveredPath === ctaItem.path ? "text.primary" : "text.secondary", letterSpacing: "0.1em", textTransform: "uppercase", fontSize: { xs: "1.2rem", md: "1.8rem" } }}>
                  {ctaItem.label}
                </Typography>
              </MotionBox>

              <AnimatePresence>
                {(hoveredPath === ctaItem.path || selected === ctaItem.path) && (
                  <MotionBox
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    exit={{ scaleX: 0 }}
                    sx={{ position: "absolute", bottom: 0, left: "30%", right: "30%", height: 2, background: `linear-gradient(90deg, transparent, ${ctaItem.color}, transparent)`, transformOrigin: "center" }}
                  />
                )}
              </AnimatePresence>
            </MotionBox>
          </MotionBox>
        )}
      </AnimatePresence>

      {/* Morphing phase — grid collapses into floating pill nav */}
      <AnimatePresence>
        {phase === "morphing" && (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", pt: 3, zIndex: 100 }}
          >
            <MotionBox
              initial={{ y: 100, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                px: 2,
                py: 1,
                borderRadius: 50,
                background: "rgba(10, 14, 26, 0.85)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(108, 99, 255, 0.15)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              {allItems.map((item, i) => {
                const isActive = item.path === selected;
                return (
                  <MotionBox
                    key={item.path}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.06, type: "spring", stiffness: 500, damping: 30 }}
                    sx={{
                      px: 2,
                      py: 1,
                      borderRadius: 50,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      background: isActive ? `${item.color}20` : "transparent",
                      border: isActive ? `1px solid ${item.color}40` : "1px solid transparent",
                    }}
                  >
                    <Box sx={{ color: isActive ? item.color : "text.secondary", "& .MuiSvgIcon-root": { fontSize: 18 } }}>
                      {item.icon}
                    </Box>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: isActive ? 700 : 500, color: isActive ? "text.primary" : "text.secondary", letterSpacing: "0.03em", whiteSpace: "nowrap" }}>
                      {item.label}
                    </Typography>
                  </MotionBox>
                );
              })}
            </MotionBox>

            <MotionBox
              initial={{ y: "100vh", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
              sx={{
                flex: 1,
                width: "100%",
                mt: 2,
                borderRadius: "24px 24px 0 0",
                background: "linear-gradient(180deg, #111827 0%, #0A0E1A 100%)",
                border: "1px solid rgba(108,99,255,0.1)",
                borderBottom: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {selectedItem && (
                <MotionBox
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                  sx={{ textAlign: "center" }}
                >
                  <Box sx={{ color: selectedItem.color, mb: 2, "& .MuiSvgIcon-root": { fontSize: 64 } }}>
                    {selectedItem.icon}
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: selectedItem.color, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    {selectedItem.label}
                  </Typography>
                </MotionBox>
              )}
            </MotionBox>
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  );
}
