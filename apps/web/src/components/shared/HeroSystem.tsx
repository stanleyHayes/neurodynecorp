import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import { aurora, AURORA_STOPS } from "@/theme/tokens";
import { PILLARS } from "@/content/company";
import { useMotionPreference } from "@/components/motion";

/**
 * The hero system — an interactive orbital model of what Neurodyne builds.
 *
 * Neurodyne at the centre, the four pillars in orbit around it. Drag to turn
 * the whole system; hover, focus or tap a body to read it; click to open that
 * pillar. It is a navigation device before it is an ornament, which is what
 * keeps it on the right side of §21's rule that nothing moves without purpose.
 * Orbit is one of the six meanings that section allows, and the identity is an
 * orbital form, so this is the brand's own geometry rather than generic
 * technology imagery (§2).
 *
 * WHY THERE IS NO 3D LIBRARY HERE. three.js is ~150 kB gzipped, and this sits
 * on the homepage — the one route deliberately kept eager because its LCP is
 * what Core Web Vitals measures. The whole first-load payload of this page is
 * 290 kB. Projecting four ellipses by hand costs nothing and keeps every colour
 * on the design tokens.
 *
 * WHY IT DOES NOT USE REACT STATE TO ANIMATE. The Rubik's cube that used to
 * occupy this slot drove `setRotation` from a requestAnimationFrame loop, which
 * reconciled ~162 nodes every frame on the busiest page of the site. Here React
 * renders the structure exactly once and the loop mutates `transform`, `r` and
 * `points` on retained refs. Nothing re-renders while it turns.
 *
 * Under reduced motion the bodies do not revolve and released drags do not
 * coast — §20 removes ambient motion rather than shortening it. Dragging still
 * works, because that movement is the reader's own.
 */

// ── Geometry ─────────────────────────────────────────────────────────────────

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

function rotX(p: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
}

function rotY(p: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
}

/** Distance from the viewer to the projection plane. Larger is flatter. */
const FOCAL = 760;

interface Projected {
  x: number;
  y: number;
  /** Perspective factor — >1 is nearer than the centre, <1 further. */
  k: number;
  z: number;
}

function project(p: Vec3, azimuth: number, elevation: number): Projected {
  const q = rotX(rotY(p, azimuth), elevation);
  const k = FOCAL / (FOCAL + q.z);
  return { x: q.x * k, y: q.y * k, k, z: q.z };
}

interface Body {
  slug: string;
  name: string;
  accent: string;
  to: string;
  /** Semi-major axis, in viewBox units. */
  a: number;
  /** How far from circular. Small — these read as orbits, not comet paths. */
  flatten: number;
  /** Orbital plane tilt, radians. */
  inclination: number;
  /** Where that tilted plane is rotated to, radians. */
  node: number;
  /** Starting angle, so they do not launch in a row. */
  phase: number;
  /** Radians per second. Outer bodies are slower, as they should be. */
  speed: number;
  /** Drawn size at the centre depth. */
  size: number;
}

/**
 * The four pillars, at four distances. Order, colour and destination all come
 * from the content model — adding a fifth pillar there puts a fifth body here.
 */
const ORBITS: Omit<Body, "slug" | "name" | "accent" | "to">[] = [
  { a: 64, flatten: 0.97, inclination: 0.20, node: 0.5, phase: 0.4, speed: 0.30, size: 6.5 },
  { a: 97, flatten: 0.94, inclination: -0.28, node: 2.0, phase: 2.6, speed: 0.20, size: 8 },
  { a: 131, flatten: 0.96, inclination: 0.15, node: 3.4, phase: 4.4, speed: 0.145, size: 7 },
  { a: 166, flatten: 0.92, inclination: -0.38, node: 5.0, phase: 1.2, speed: 0.105, size: 5.5 },
];

const BODIES: Body[] = ORBITS.flatMap((orbit, i) => {
  const pillar = PILLARS[i];
  // Fewer pillars than orbits simply means fewer bodies, rather than a hole in
  // the system.
  return pillar
    ? [{ slug: pillar.slug, name: pillar.name, accent: pillar.accent, to: pillar.to, ...orbit }]
    : [];
});

/** A point on a body's orbit at true anomaly `theta`, before the view turns. */
function orbitPoint(b: Body, theta: number): Vec3 {
  const local: Vec3 = {
    x: b.a * Math.cos(theta),
    y: 0,
    z: b.a * b.flatten * Math.sin(theta),
  };
  return rotY(rotX(local, b.inclination), b.node);
}

const ORBIT_SAMPLES = 96;

/** Deterministic backdrop. No Math.random, so the field never flickers. */
const STARFIELD = (() => {
  let seed = 20260930;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  return Array.from({ length: 54 }, () => ({
    x: (next() - 0.5) * 372,
    y: (next() - 0.5) * 372,
    r: 0.4 + next() * 0.9,
    o: 0.12 + next() * 0.34,
  }));
})();

const VIEW = 190;

// ── Component ────────────────────────────────────────────────────────────────

export default function HeroSystem() {
  const pref = useMotionPreference();
  const navigate = useNavigate();
  const uid = useId().replace(/:/g, "");

  const svgRef = useRef<SVGSVGElement | null>(null);
  const orbitRefs = useRef<(SVGPolygonElement | null)[]>([]);
  const bodyRefs = useRef<(SVGGElement | null)[]>([]);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);

  /** Live view state. Deliberately a ref: the loop must not re-render. */
  const view = useRef({ azimuth: -0.5, elevation: -0.42, vAz: 0, vEl: 0 });
  const drag = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);

  // `active` drives only the caption, which changes on hover/focus — not per
  // frame — so it is ordinary state.
  const [active, setActive] = useState<number | null>(null);

  const revolve = pref.allowDecorative;

  /** Writes one frame straight to the DOM. */
  const paint = useCallback(
    (elapsed: number) => {
      const { azimuth, elevation } = view.current;

      BODIES.forEach((body, i) => {
        const orbit = orbitRefs.current[i];
        if (orbit) {
          let points = "";
          for (let s = 0; s < ORBIT_SAMPLES; s++) {
            const p = project(orbitPoint(body, (s / ORBIT_SAMPLES) * Math.PI * 2), azimuth, elevation);
            points += `${p.x.toFixed(1)},${p.y.toFixed(1)} `;
          }
          orbit.setAttribute("points", points.trim());
        }

        const theta = body.phase + (revolve ? elapsed * body.speed : 0);
        const p = project(orbitPoint(body, theta), azimuth, elevation);

        const g = bodyRefs.current[i];
        if (g) {
          g.setAttribute("transform", `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`);
          // Depth reads as size and haze rather than as occlusion, which keeps
          // the DOM order stable — reordering nodes mid-frame would drop focus.
          g.setAttribute("opacity", (0.45 + 0.55 * Math.min(1, Math.max(0, p.k))).toFixed(3));
        }
        const dot = dotRefs.current[i];
        if (dot) dot.setAttribute("r", (body.size * p.k).toFixed(2));
      });
    },
    [revolve],
  );

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let elapsed = 0;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += dt;

      // Coast after a release, then settle. Skipped entirely under reduced
      // motion: a flick that keeps moving is exactly the ambient movement §20
      // asks to remove.
      if (!drag.current && pref.allowDecorative) {
        const v = view.current;
        if (Math.abs(v.vAz) > 1e-4 || Math.abs(v.vEl) > 1e-4) {
          v.azimuth += v.vAz * dt;
          v.elevation = clampElevation(v.elevation + v.vEl * dt);
          v.vAz *= 0.94;
          v.vEl *= 0.94;
        }
      }

      paint(elapsed);
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [paint, pref.allowDecorative]);

  // ── Pointer ────────────────────────────────────────────────────────────────

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
    view.current.vAz = 0;
    view.current.vEl = 0;
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;

    const v = view.current;
    v.azimuth += dx * 0.007;
    v.elevation = clampElevation(v.elevation + dy * 0.005);
    v.vAz = dx * 0.12;
    v.vEl = dy * 0.09;
    d.x = e.clientX;
    d.y = e.clientY;
  };

  const endDrag = (e: React.PointerEvent<SVGSVGElement>) => {
    if (drag.current?.id !== e.pointerId) return;
    drag.current = null;
  };

  // ── Keyboard ───────────────────────────────────────────────────────────────
  // Arrow keys turn the model. The bodies themselves are links and reachable by
  // Tab, so the system is fully operable without a pointer.
  const onKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    const step = 0.16;
    const v = view.current;
    if (e.key === "ArrowLeft") v.azimuth -= step;
    else if (e.key === "ArrowRight") v.azimuth += step;
    else if (e.key === "ArrowUp") v.elevation = clampElevation(v.elevation - step);
    else if (e.key === "ArrowDown") v.elevation = clampElevation(v.elevation + step);
    else return;
    e.preventDefault();
  };

  const caption = active === null ? null : BODIES[active];

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Box
        component="svg"
        ref={svgRef}
        viewBox={`${-VIEW} ${-VIEW} ${VIEW * 2} ${VIEW * 2}`}
        role="group"
        aria-label="Neurodyne and its four pillars, as an orbital model. Drag or use the arrow keys to turn it."
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        sx={{
          width: "100%",
          maxWidth: { xs: 320, sm: 400, md: 460 },
          aspectRatio: "1 / 1",
          touchAction: "none",
          cursor: "grab",
          "&:active": { cursor: "grabbing" },
          outline: "none",
          "&:focus-visible": { outline: `2px solid ${aurora.teal}`, outlineOffset: 4, borderRadius: "12px" },
          overflow: "visible",
        }}
      >
        <defs>
          <radialGradient id={`${uid}-core`}>
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="45%" stopColor={aurora.teal} stopOpacity="0.85" />
            <stop offset="100%" stopColor={aurora.blue} stopOpacity="0.15" />
          </radialGradient>
          <radialGradient id={`${uid}-corona`}>
            <stop offset="0%" stopColor={aurora.teal} stopOpacity="0.30" />
            <stop offset="100%" stopColor={aurora.violet} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${uid}-ring`} x1="0" y1="0" x2="1" y2="1">
            {AURORA_STOPS.map((s) => (
              <stop key={s.offset} offset={s.offset} stopColor={s.color} stopOpacity="0.55" />
            ))}
          </linearGradient>
        </defs>

        {/* Backdrop */}
        <g aria-hidden="true">
          {STARFIELD.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFFFFF" opacity={s.o} />
          ))}
        </g>

        {/* Orbits */}
        <g aria-hidden="true" fill="none">
          {BODIES.map((b, i) => (
            <polygon
              key={b.slug}
              ref={(el) => {
                orbitRefs.current[i] = el;
              }}
              points=""
              stroke={active === i ? b.accent : `url(#${uid}-ring)`}
              strokeWidth={active === i ? 1.4 : 0.9}
              strokeOpacity={active === i ? 0.95 : 0.42}
            />
          ))}
        </g>

        {/* The core */}
        <g aria-hidden="true">
          <circle r="74" fill={`url(#${uid}-corona)`} />
          <circle r="17" fill={`url(#${uid}-core)`} />
          <circle r="17" fill="none" stroke={aurora.teal} strokeOpacity="0.5" strokeWidth="0.8" />
        </g>

        {/* The pillars */}
        {BODIES.map((b, i) => (
          <g
            key={b.slug}
            ref={(el) => {
              bodyRefs.current[i] = el;
            }}
          >
            <Box
              component="a"
              href={b.to}
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                // A drag that ends on a body is a drag, not a click.
                if (drag.current?.moved) return;
                navigate(b.to);
              }}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive((cur) => (cur === i ? null : cur))}
              onFocus={() => setActive(i)}
              onBlur={() => setActive((cur) => (cur === i ? null : cur))}
              sx={{
                cursor: "pointer",
                outline: "none",
                "&:focus-visible circle": { stroke: "#FFFFFF", strokeWidth: 2 },
              }}
            >
              <title>{b.name}</title>
              {/* A generous invisible target: the drawn body is small, and 6px
                  is not a tap target. */}
              <circle r="20" fill="transparent" />
              <circle
                ref={(el) => {
                  dotRefs.current[i] = el;
                }}
                r={b.size}
                fill={b.accent}
                stroke={b.accent}
                strokeOpacity="0.35"
                strokeWidth="6"
              />
            </Box>
          </g>
        ))}
      </Box>

      {/*
        The caption is the accessible half of the interaction: it names what is
        highlighted in words rather than leaving the meaning to colour alone
        (§20). It holds its height so nothing below it moves.
      */}
      <Box sx={{ mt: 1.5, minHeight: 44, textAlign: "center", px: 2 }}>
        {caption ? (
          <>
            <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: caption.accent }}>
              {caption.name}
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
              Open this pillar
            </Typography>
          </>
        ) : (
          <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", opacity: 0.75 }}>
            Drag to turn · four pillars in orbit
          </Typography>
        )}
      </Box>
    </Box>
  );
}

/** Stops the model flipping through its own poles. */
function clampElevation(value: number): number {
  return Math.max(-1.25, Math.min(1.25, value));
}
