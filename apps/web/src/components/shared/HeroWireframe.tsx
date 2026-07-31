import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box);

type Axis = "x" | "y" | "z";
type Cubie = { id: string; x: number; y: number; z: number };
type TurnState = { axis: Axis; layer: number; dir: 1 | -1; angle: number } | null;

const SYMBOLS = [
  { s: "schema", x: "9%", y: "17%" },
  { s: "registry", x: "20%", y: "74%" },
  { s: "interop", x: "82%", y: "20%" },
  { s: "tenancy", x: "74%", y: "48%" },
  { s: "identity", x: "88%", y: "70%" },
  { s: "primitives", x: "52%", y: "12%" },
];

const BASE_CUBIES: Cubie[] = (() => {
  const cubies: Cubie[] = [];
  for (let x = -1; x <= 1; x += 1) {
    for (let y = -1; y <= 1; y += 1) {
      for (let z = -1; z <= 1; z += 1) {
        cubies.push({ id: `${x}${y}${z}`, x, y, z });
      }
    }
  }
  return cubies;
})();

function rotatePoint(cubie: Cubie, axis: Axis, dir: 1 | -1): Cubie {
  if (axis === "x") {
    return dir === 1
      ? { ...cubie, y: -cubie.z, z: cubie.y }
      : { ...cubie, y: cubie.z, z: -cubie.y };
  }
  if (axis === "y") {
    return dir === 1
      ? { ...cubie, x: cubie.z, z: -cubie.x }
      : { ...cubie, x: -cubie.z, z: cubie.x };
  }
  return dir === 1
    ? { ...cubie, x: -cubie.y, y: cubie.x }
    : { ...cubie, x: cubie.y, y: -cubie.x };
}

function CubieMesh({
  cubie,
  turn,
}: Readonly<{
  cubie: Cubie;
  turn: TurnState;
}>) {
  const size = 48;
  const gap = 4;
  const step = size + gap;
  const half = size / 2;

  const inTurningLayer = turn && cubie[turn.axis] === turn.layer;
  const axis = turn?.axis ?? "x";
  const signedAngle = ((turn?.angle ?? 0) * (turn?.dir ?? 1) * Math.PI) / 180;
  const c = Math.cos(signedAngle);
  const s = Math.sin(signedAngle);
  let rx = cubie.x;
  let ry = cubie.y;
  let rz = cubie.z;
  if (inTurningLayer && turn) {
    if (axis === "x") {
      ry = cubie.y * c - cubie.z * s;
      rz = cubie.y * s + cubie.z * c;
    } else if (axis === "y") {
      rx = cubie.x * c + cubie.z * s;
      rz = -cubie.x * s + cubie.z * c;
    } else {
      rx = cubie.x * c - cubie.y * s;
      ry = cubie.x * s + cubie.y * c;
    }
  }
  const tx = rx * step;
  const ty = ry * step;
  const tz = rz * step;
  const turnTransform = inTurningLayer && turn
    ? ` rotate${axis.toUpperCase()}(${turn.angle * turn.dir}deg)`
    : "";

  const face = {
    position: "absolute",
    inset: 0,
    border: "1px solid rgba(218, 232, 255, 0.82)",
    background: "rgba(108, 99, 255, 0.018)",
    boxShadow: "inset 0 0 10px rgba(108,99,255,0.035)",
    boxSizing: "border-box",
  } as const;

  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        transform: `translate3d(${tx}px, ${ty}px, ${tz}px)${turnTransform}`,
        transformStyle: "preserve-3d",
        boxShadow: inTurningLayer ? "0 0 22px rgba(0, 212, 170, 0.34)" : "0 0 6px rgba(108,99,255,0.08)",
      }}
    >
      <span style={{ ...face, transform: `translateZ(${half}px)` }} />
      <span style={{ ...face, transform: `rotateY(180deg) translateZ(${half}px)` }} />
      <span style={{ ...face, transform: `rotateY(90deg) translateZ(${half}px)` }} />
      <span style={{ ...face, transform: `rotateY(-90deg) translateZ(${half}px)` }} />
      <span style={{ ...face, transform: `rotateX(90deg) translateZ(${half}px)` }} />
      <span style={{ ...face, transform: `rotateX(-90deg) translateZ(${half}px)` }} />
    </div>
  );
}

export default function HeroWireframe() {
  const [rotation, setRotation] = useState({ x: -22, y: 28 });
  const [dragging, setDragging] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [cubies, setCubies] = useState<Cubie[]>(BASE_CUBIES);
  const [turn, setTurn] = useState<TurnState>(null);

  const dragPoint = useRef<{ x: number; y: number } | null>(null);
  const rotateFrame = useRef<number | null>(null);
  const turnFrame = useRef<number | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (dragging || reduceMotion) return;
    const loop = () => {
      setRotation((prev) => ({ x: prev.x, y: prev.y + 0.13 }));
      rotateFrame.current = window.requestAnimationFrame(loop);
    };
    rotateFrame.current = window.requestAnimationFrame(loop);
    return () => {
      if (rotateFrame.current !== null) window.cancelAnimationFrame(rotateFrame.current);
    };
  }, [dragging, reduceMotion]);

  useEffect(() => {
    if (reduceMotion || dragging) return;
    let cancelled = false;
    let timer: number | null = null;

    const queueNextTurn = (delay: number) => {
      timer = window.setTimeout(() => {
        if (cancelled) return;
        const axes: Axis[] = ["x", "y", "z"];
        const axis = axes[Math.floor(Math.random() * axes.length)]!;
        const layer = [-1, 0, 1][Math.floor(Math.random() * 3)]!;
        const dir: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
        const start = performance.now();
        const duration = 620;
        setTurn({ axis, layer, dir, angle: 0 });

        const animate = (time: number) => {
          if (cancelled) return;
          const progress = Math.min(1, (time - start) / duration);
          const eased = 1 - (1 - progress) * (1 - progress);
          setTurn((current) => (current ? { ...current, angle: 90 * eased } : current));
          if (progress < 1) {
            turnFrame.current = window.requestAnimationFrame(animate);
            return;
          }

          setCubies((currentCubies) =>
            currentCubies.map((cubie) =>
              cubie[axis] === layer ? rotatePoint(cubie, axis, dir) : cubie,
            ),
          );
          setTurn(null);
          queueNextTurn(200 + Math.random() * 260);
        };
        turnFrame.current = window.requestAnimationFrame(animate);
      }, delay);
    };

    queueNextTurn(280);

    return () => {
      cancelled = true;
      if (timer !== null) window.clearTimeout(timer);
      if (turnFrame.current !== null) window.cancelAnimationFrame(turnFrame.current);
    };
  }, [dragging, reduceMotion]);

  const transform = useMemo(
    () => `translate(-50%, -50%) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
    [rotation.x, rotation.y],
  );

  return (
    <Box sx={{ position: "relative", width: "100%", maxWidth: 560, mx: "auto", p: { xs: 1, md: 1.5 } }}>
      {SYMBOLS.map((glyph) => (
        <Box
          key={glyph.s}
          sx={{
            position: "absolute",
            left: glyph.x,
            top: glyph.y,
            color: "rgba(227, 235, 255, 0.22)",
            fontFamily: "monospace",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.04em",
            pointerEvents: "none",
            userSelect: "none",
          }}
          aria-hidden
        >
          {glyph.s}
        </Box>
      ))}

      <Box
        onPointerDown={(event) => {
          setDragging(true);
          dragPoint.current = { x: event.clientX, y: event.clientY };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!dragging || !dragPoint.current) return;
          const dx = event.clientX - dragPoint.current.x;
          const dy = event.clientY - dragPoint.current.y;
          dragPoint.current = { x: event.clientX, y: event.clientY };
          setRotation((prev) => ({
            x: Math.max(-52, Math.min(34, prev.x - dy * 0.18)),
            y: prev.y + dx * 0.18,
          }));
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
          dragPoint.current = null;
          setDragging(false);
        }}
        onPointerCancel={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
          dragPoint.current = null;
          setDragging(false);
        }}
        onPointerLeave={() => {
          dragPoint.current = null;
          setDragging(false);
        }}
        role="img"
        aria-label="Interactive wireframe Rubik's cube"
        sx={{
          position: "relative",
          height: { xs: 380, md: 480 },
          background: "transparent",
          overflow: "hidden",
          // Shorter focal length = stronger foreshortening, so the cube reads as
          // an object standing in a space rather than a flat badge.
          perspective: "820px",
          perspectiveOrigin: "50% 42%",
          cursor: dragging ? "grabbing" : "grab",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        {/* Deep-space star field */}
        <Box
          aria-hidden
          sx={{
            position: "absolute", inset: 0, zIndex: 0, opacity: 0.72, pointerEvents: "none",
            backgroundImage: [
              "radial-gradient(circle at 12% 21%, rgba(255,255,255,.8) 0 1px, transparent 1.5px)",
              "radial-gradient(circle at 74% 18%, rgba(0,212,170,.75) 0 1px, transparent 1.6px)",
              "radial-gradient(circle at 88% 61%, rgba(139,133,255,.85) 0 1px, transparent 1.5px)",
              "radial-gradient(circle at 31% 69%, rgba(255,255,255,.55) 0 1px, transparent 1.4px)",
            ].join(","),
            backgroundSize: "190px 170px, 260px 210px, 230px 250px, 310px 190px",
          }}
        />


        {/* Orbital projection rings */}
        {[0, 1, 2].map((ring) => (
          <MotionBox
            key={ring}
            aria-hidden
            animate={reduceMotion ? undefined : { rotate: ring % 2 ? [0, -360] : [0, 360] }}
            transition={{ duration: 22 + ring * 9, repeat: Infinity, ease: "linear" }}
            sx={{
              position: "absolute", zIndex: 1, left: "50%", top: "53%",
              width: 235 + ring * 44, height: 92 + ring * 22,
              ml: `${-(235 + ring * 44) / 2}px`, mt: `${-(92 + ring * 22) / 2}px`,
              border: `1px solid ${ring === 1 ? "rgba(0,212,170,.16)" : "rgba(139,133,255,.2)"}`,
              borderRadius: "50%", transform: `rotate(${ring * 38}deg)`, pointerEvents: "none",
            }}
          />
        ))}

        <Box sx={{ position: "absolute", zIndex: 3, top: 20, left: 22, right: 22, display: "flex", justifyContent: "space-between", alignItems: "center", pointerEvents: "none" }}>
          <Box>
            <Typography sx={{ fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: "0.16em", color: "primary.main", mb: 0.35 }}>
              NDC / SYSTEM MODEL
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: "rgba(226,232,255,.72)" }}>Composable infrastructure</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, px: 1.1, py: 0.55, border: "1px solid rgba(148,163,184,.25)", bgcolor: "rgba(5,9,20,.58)", backdropFilter: "blur(12px)" }}>
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#00D4AA", boxShadow: "0 0 10px rgba(0,212,170,0.75)" }} />
            <Typography sx={{ fontFamily: "monospace", fontSize: "0.52rem", letterSpacing: "0.12em", color: "rgba(226,232,255,.72)" }}>LIVE</Typography>
          </Box>
        </Box>
        <div style={{ position: "absolute", inset: 0, zIndex: 2, transformStyle: "preserve-3d" }}>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform,
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
            {cubies.map((cubie) => (
              <CubieMesh key={cubie.id} cubie={cubie} turn={turn} />
            ))}
          </div>
        </div>
        <Typography
          sx={{
            position: "absolute", zIndex: 3, bottom: 18, left: "50%", transform: "translateX(-50%)",
            width: "max-content", px: 1.5, py: 0.7, border: "1px solid", borderColor: "divider",
            bgcolor: "rgba(5,9,20,0.72)",
            backdropFilter: "blur(10px)", fontFamily: "monospace", fontSize: "0.55rem",
            color: "rgba(203,213,235,.72)", letterSpacing: "0.12em", textTransform: "uppercase", pointerEvents: "none",
          }}
        >
          {dragging ? "Rotating model" : "Drag to explore"}
        </Typography>
      </Box>
    </Box>
  );
}
