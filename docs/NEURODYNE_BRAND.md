# Neurodyne Brand & Motion

How the visual and motion system works, and the rules that keep it coherent.
Read this before changing colour, type, or anything that moves.

Source of record: `Neurodyne_Brand_Experience_and_Motion_Specification.docx`.
Like the positioning documents, it is **not committed** — this repository is
public and it is an internal document. Section references below (§N) point into
it. This file is the durable summary.

---

## The idea

**Intelligence in motion.** Neurodyne is a system that creates, connects and
powers systems. The visual anchor is the **Neural Orbit**: a fluid orbital form
containing an implied N and a distinct floating node.

The experience should read as controlled intelligence moving through darkness —
futuristic without being science fiction, premium without being sterile.

**Explicitly avoid** (§2): robot heads, literal brains, circuit-board imagery,
cyberpunk styling, random neon, gratuitous glassmorphism, decorative motion.

---

## Colour

Tokens live in [`apps/web/src/theme/tokens.ts`](../apps/web/src/theme/tokens.ts)
and are bound into MUI by `makeTheme()` in `ThemeContext.tsx`. **`theme.ts` does
not exist** — it was a second, dead theme file and was deleted.

| Token | Hex | Role |
|---|---|---|
| Deep Navy | `#0A0F1F` | Primary canvas |
| Emerald | `#10B981` | Energy start |
| Teal | `#06B6D4` | Core brand energy — interactive accents |
| Electric Blue | `#3B82F6` | Technology / transition |
| Violet | `#8B5CF6` | Energy culmination |
| White | `#FFFFFF` | Primary contrast |

Aurora gradient order is **Emerald → Teal → Electric Blue → Violet**, always.
Use `auroraGradient()` rather than hand-rolling a `linear-gradient`, which is
how the spectrum drifts out of order.

### The contrast rule that is easy to get wrong

Aurora colours clear AA on Deep Navy. **None of them clear AA on white:**

| | on `#0A0F1F` | on `#FFFFFF` |
|---|---|---|
| Emerald | 7.52 | **2.54** |
| Teal | 7.86 | **2.43** |
| Blue | 5.19 | 3.68 |
| Violet | 4.50 | 4.23 |

So `aurora` is for dark surfaces and for non-text roles anywhere — nodes,
paths, borders, gradient stops. For accent **text** in light mode use
`auroraOnLight`, which is hue-matched and darkened until it clears 4.5:1.

Reusing the dark values in light mode is the "simply invert every colour"
mistake §24 warns against, and it fails the AA requirement in §4.

### State colours are not brand colours

Amber, red and the success green signal state. They stay outside the Aurora
ramp, and §20 requires state never to be carried by colour alone — always pair
with an icon or a word.

---

## Motion

Timing tokens are named for **intent**, not duration, so callers pick by what
the movement means:

| Token | Band | For |
|---|---|---|
| `duration.feedback` | 120–220ms | A control acknowledging input |
| `duration.ui` | 220–400ms | Ordinary transitions |
| `duration.narrative` | 400–800ms | A section arriving |
| `duration.ambient` | multi-second | Drift that should be barely noticeable |

Ease-out for entrances. Spring **only** for small physical interactions. No
bounce, no elastic, no arcade motion.

> Nothing moves without purpose. Every animation must represent connection,
> computation, orbit, energy, assembly or transformation.

### The primitives

In [`apps/web/src/components/motion/`](../apps/web/src/components/motion/).
Import from the barrel, not the files.

| Primitive | §  | What it does |
|---|---|---|
| `RevealText` | 9 | Three vocabularies: `heading` assembles word by word, `label` contracts its tracking, `body` rises calmly |
| `MotionSection` | 10 | Section entrance, fired before the content reaches viewport centre |
| `EnergyButton` | 13 | Aurora streak across one border edge on hover **and focus** |
| `EnergyCard` | 12 | Pointer-proximity illumination, 2–6px magnetism |
| `OrbitNode` / `Orbit` | 11 | Ecosystem satellites; becomes a vertical sequence below `md` |
| `ScrollPath` | 10 | The signature line, drawn against scroll position |

**A universal fade-up is not the default.** §9 rejects it explicitly. Pick the
vocabulary that matches what the text is.

### Library choice

**framer-motion only.** §22 suggests GSAP + ScrollTrigger for the scroll-linked
path, but that advice assumes Next.js, and the same section says not to mix
animation libraries for the same responsibility. `useScroll` covers
scroll-linked drawing, so GSAP would add a second library and ~50 KB for
capability already present.

### Reduced motion

Two layers, because neither alone is enough:

1. `<MotionConfig reducedMotion="user">` in `App.tsx` governs framer-motion.
2. A global CSS guard in `index.html` catches `@keyframes`, which MotionConfig
   **cannot reach**. 16 infinite CSS animations were running regardless of the
   preference before it was added.

§20 is specific: path drawing, orbiting, parallax, fragment assembly, magnetic
effects and eclipse transitions are **removed**, not shortened. Primitives read
this from `useMotionPreference()` rather than each re-deciding.

Content must never depend on an animation completing.

---

## Brand assets

Generated by
[`scripts/build-brand-assets.mjs`](../apps/web/scripts/build-brand-assets.mjs)
into `public/brand/`. Masters live at the repository root and are **gitignored** —
they total ~9 MB and this repository is public. The script skips cleanly when
they are absent, so only regenerating needs them.

**Never redraw or approximate the mark** (§26). Never alter its geometry,
proportions or node placement. `Logo.tsx` previously hand-drew an approximation
in SVG; that is the exact thing the specification forbids.

Only `neurodyne_logo_icon.png` has a genuinely transparent background, so it is
the only master usable as an interface mark. The horizontal lockup is RGBA but
carries a baked-in dark glow — it is dark-surface-only.

**No SVG master exists yet.** PNG is the interface format until one is supplied.
Ask for it: an SVG mark would be smaller, sharper, and animatable in layers,
which §25 anticipates.

---

## Before changing anything visual

```bash
cd apps/web
npx tsc --noEmit
npm run build
```

If you add a colour, add it to `tokens.ts` — do not write a literal. The site
once carried 1,071 colour literals across 69 files while `theme.palette` was
read five times, which made the brand impossible to change from one place. That
was migrated by `scripts/migrate-palette.mjs`; do not recreate the problem.
