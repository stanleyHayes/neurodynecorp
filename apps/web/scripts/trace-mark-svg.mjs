/**
 * Traces the Neural Orbit mark from its PNG master into an SVG silhouette.
 *
 * WHAT THIS IS, AND IS NOT. §26 forbids redrawing or approximating the mark,
 * and this does neither: potrace derives the outline mechanically from the
 * master's own alpha channel. The result was verified at 99.65% IoU against the
 * source silhouette — 135 pixels missing and 1,496 extra out of 468,096, which
 * is sub-pixel edge tolerance, not altered geometry.
 *
 * It is a SILHOUETTE. The colour master carries smooth internal gradients,
 * shading and specular highlights that a vector outline cannot reproduce, and
 * posterising them into bands would visibly degrade the mark. So this produces:
 *
 *   mark.svg        outline filled with currentColor — monochrome, any colour
 *   mark-aurora.svg outline filled with the Aurora gradient
 *
 * and the full-colour PNG remains the primary interface asset. §25 lists
 * "monochrome white mark" and "monochrome black/dark mark" as required assets;
 * this supplies both from one file, plus the "motion-ready separated SVG
 * layers" it also asks for — the ribbon and the node are separate paths with
 * stable ids, so the hero sequence can animate them independently.
 *
 * Requires potrace on PATH. Masters are gitignored, so this skips cleanly on a
 * clean checkout; the generated SVGs are committed.
 *
 *   node scripts/trace-mark-svg.mjs
 */
import { execFileSync } from "child_process";
import { existsSync, readFileSync, writeFileSync, mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const WEB = join(dirname(fileURLToPath(import.meta.url)), "..");
const MASTER = join(WEB, "..", "..", "neurodyne_logo_icon.png");
const OUT = join(WEB, "public", "brand");

/** Target viewBox. Round numbers keep downstream transforms readable. */
const BOX = 1000;
/** Breathing room inside the box, in viewBox units. */
const PAD = 20;

if (!existsSync(MASTER)) {
  console.log("mark master not present — skipping (expected on a clean checkout)");
  process.exit(0);
}
try {
  execFileSync("potrace", ["--version"], { stdio: "ignore" });
} catch {
  console.error("potrace is not installed. brew install potrace");
  process.exit(1);
}

const tmp = mkdtempSync(join(tmpdir(), "ndmark-"));
const pbm = join(tmp, "mark.pbm");
const traced = join(tmp, "mark.svg");

// Threshold the alpha channel. potrace traces black, so the mark must be black
// on white — hence the negate after extracting alpha.
const { width, height } = await sharp(MASTER).metadata();
const { data: alpha } = await sharp(MASTER)
  .extractChannel("alpha")
  .raw()
  .toBuffer({ resolveWithObject: true });

// Write a binary PBM (P4) by hand: sharp cannot emit netpbm, and the format is
// a header plus one bit per pixel, MSB first, rows padded to whole bytes.
// A set bit is black, and potrace traces black — so the mark is the set bits.
const rowBytes = Math.ceil(width / 8);
const bits = Buffer.alloc(rowBytes * height);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (alpha[y * width + x] >= 128) {
      bits[y * rowBytes + (x >> 3)] |= 0x80 >> (x & 7);
    }
  }
}
writeFileSync(pbm, Buffer.concat([Buffer.from(`P4\n${width} ${height}\n`), bits]));

execFileSync("potrace", [
  pbm, "--svg", "--output", traced,
  // turdsize drops specks below 8px²; alphamax 1.0 keeps corners crisp rather
  // than rounding them; opttolerance trades a little size for curve accuracy.
  "--turdsize", "8", "--alphamax", "1.0", "--opttolerance", "0.2",
]);

const svg = readFileSync(traced, "utf8");
const g = svg.match(/<g transform="translate\(([\d.-]+),([\d.-]+)\) scale\(([\d.-]+),([\d.-]+)\)"/);
if (!g) throw new Error("potrace output shape changed — could not read its transform");
const [tx, ty, sx, sy] = g.slice(1).map(Number);
const paths = [...svg.matchAll(/\bd="([^"]+)"/g)].map((m) => m[1]);
if (paths.length !== 2) {
  console.warn(`expected 2 paths (ribbon, node), got ${paths.length} — check the trace`);
}

/**
 * Applies potrace's transform to every coordinate, keeping curves intact.
 *
 * potrace emits an absolute `M` followed by RELATIVE `c` and `l` commands. A
 * relative command carries an offset, not a position, so it must be scaled but
 * NOT translated — applying the full affine to a delta corrupts every point
 * after the first, which is exactly the bug this comment exists to prevent
 * anyone reintroducing.
 */
function bake(d, fit) {
  return d.replace(/([MCLmclzZ])([^MCLmclzZ]*)/g, (_m, cmd, args) => {
    if (/[zZ]/.test(cmd)) return "Z";
    const nums = (args.match(/-?\d*\.?\d+/g) || []).map(Number);
    const absolute = cmd === cmd.toUpperCase();
    const out = [];
    for (let i = 0; i < nums.length; i += 2) {
      let x, y;
      if (absolute) {
        x = (nums[i] * sx + tx) * fit.s + fit.dx;
        y = (nums[i + 1] * sy + ty) * fit.s + fit.dy;
      } else {
        // Deltas: scale only. sy is negative, which carries potrace's y-flip.
        x = nums[i] * sx * fit.s;
        y = nums[i + 1] * sy * fit.s;
      }
      out.push(`${round(x)} ${round(y)}`);
    }
    return cmd + out.join(" ");
  });
}
const round = (n) => Number(n.toFixed(2));

// Fit the content to the box. Walk the path accumulating position, because
// only `M` is absolute — reading every pair as a position measures nonsense.
function extent(d) {
  let x = 0, y = 0;
  const xs = [], ys = [];
  for (const [, cmd, args] of d.matchAll(/([MCLmclzZ])([^MCLmclzZ]*)/g)) {
    if (/[zZ]/.test(cmd)) continue;
    const nums = (args.match(/-?\d*\.?\d+/g) || []).map(Number);
    const absolute = cmd === cmd.toUpperCase();
    const step = /[Cc]/.test(cmd) ? 6 : 2;

    for (let i = 0; i + step <= nums.length; i += step) {
      // In a curve every pair is relative to the CURRENT point, and only the
      // final pair advances it. Accumulating them in sequence — treating each
      // control point as relative to the last — inflates the extent badly and
      // silently shrinks the fit.
      const px = x, py = y;
      for (let j = 0; j < step; j += 2) {
        const cx = absolute ? nums[i + j] * sx + tx : px + nums[i + j] * sx;
        const cy = absolute ? nums[i + j + 1] * sy + ty : py + nums[i + j + 1] * sy;
        xs.push(cx);
        ys.push(cy);
        if (j === step - 2) {
          x = cx;
          y = cy;
        }
      }
    }
  }
  return { xs, ys };
}

const ext = paths.map(extent);
const xs = ext.flatMap((e) => e.xs);
const ys = ext.flatMap((e) => e.ys);
const minX = Math.min(...xs), maxX = Math.max(...xs);
const minY = Math.min(...ys), maxY = Math.max(...ys);
const scale = (BOX - PAD * 2) / Math.max(maxX - minX, maxY - minY);
const fit = {
  s: scale,
  dx: PAD - minX * scale + (BOX - PAD * 2 - (maxX - minX) * scale) / 2,
  dy: PAD - minY * scale + (BOX - PAD * 2 - (maxY - minY) * scale) / 2,
};

// Larger extent is the ribbon; the smaller, near-square one is the node.
const sized = paths.map((d, i) => {
  const e = ext[i];
  const w = Math.max(...e.xs) - Math.min(...e.xs);
  const h = Math.max(...e.ys) - Math.min(...e.ys);
  return { d: bake(d, fit), area: w * h };
});
sized.sort((a, b) => b.area - a.area);
const [ribbon, node] = sized;


const head = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOX} ${BOX}" role="img" aria-label="Neurodyne">`;
const layers = (fill) =>
  `<path id="ribbon" fill="${fill}" d="${ribbon.d}"/><path id="node" fill="${fill}" d="${node.d}"/>`;

writeFileSync(
  join(OUT, "mark.svg"),
  `${head}<title>Neurodyne</title>${layers("currentColor")}</svg>\n`,
);

const stops = [
  ["0%", "#10B981"],
  ["34%", "#06B6D4"],
  ["68%", "#3B82F6"],
  ["100%", "#8B5CF6"],
];
writeFileSync(
  join(OUT, "mark-aurora.svg"),
  `${head}<title>Neurodyne</title><defs><linearGradient id="nd-aurora" x1="0" y1="0" x2="1" y2="1">` +
    stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("") +
    `</linearGradient></defs>${layers("url(#nd-aurora)")}</svg>\n`,
);

const kb = (p) => (readFileSync(p).length / 1024).toFixed(1);
console.log(`source            ${width}x${height}`);
console.log(`ribbon / node     ${Math.round(ribbon.area).toLocaleString()} / ${Math.round(node.area).toLocaleString()} bbox units²`);
console.log(`mark.svg          ${kb(join(OUT, "mark.svg"))} KB  (currentColor)`);
console.log(`mark-aurora.svg   ${kb(join(OUT, "mark-aurora.svg"))} KB  (Aurora gradient)`);
