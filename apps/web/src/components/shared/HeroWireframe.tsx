import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";

type Axis = "x" | "y" | "z";
type Cubie = { id: string; x: number; y: number; z: number };
type TurnState = { axis: Axis; layer: number; dir: 1 | -1; angle: number } | null;

const SYMBOLS = [
  { s: "lambda", x: "9%", y: "17%" },
  { s: "pi", x: "22%", y: "74%" },
  { s: "Sigma", x: "84%", y: "20%" },
  { s: "sqrt", x: "76%", y: "48%" },
  { s: "delta", x: "92%", y: "70%" },
  { s: "integral", x: "56%", y: "12%" },
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
  const size = 44;
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
    border: "1px solid rgba(223, 238, 247, 0.7)",
    background: "transparent",
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
        boxShadow: inTurningLayer ? "0 0 12px rgba(170, 214, 255, 0.22)" : "none",
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
    <Box sx={{ position: "relative", width: "100%", maxWidth: 560, mx: "auto" }}>
      <Box
        sx={{
          position: "absolute",
          top: -40,
          right: -32,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "rgba(108,99,255,0.2)",
          filter: "blur(56px)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -36,
          left: -24,
          width: 170,
          height: 170,
          borderRadius: "50%",
          background: "rgba(0,212,170,0.2)",
          filter: "blur(56px)",
          pointerEvents: "none",
        }}
      />

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
          height: { xs: 360, md: 440 },
          borderRadius: "28px",
          border: "1px solid rgba(128,153,255,0.2)",
          background:
            "linear-gradient(180deg, rgba(9,14,29,0.45) 0%, rgba(8,12,25,0.3) 100%)",
          boxShadow: "0 16px 44px rgba(2, 5, 14, 0.35)",
          overflow: "hidden",
          perspective: "1200px",
          cursor: dragging ? "grabbing" : "grab",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}>
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
      </Box>
      <Typography
        sx={{
          mt: 1.2,
          textAlign: "center",
          fontSize: "0.72rem",
          color: "text.secondary",
          opacity: 0.65,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
        }}
      >
        Drag to rotate
      </Typography>
    </Box>
  );
}
