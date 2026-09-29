/**
 * Codemod: retired palette -> Aurora (§4). Takes one or more source roots.
 *
 * The site is painted with colour literals, not theme colours: ~1,070 of them
 * across 69 files, while `theme.palette` is read five times in the whole app.
 * Rebinding the MUI palette therefore changes almost nothing on its own — the
 * literals have to move too, or the brand change is invisible.
 *
 * MAPPING RATIONALE. The old palette was two brand colours (a violet-blue and a
 * green-teal) plus tints. Aurora is four, ordered Emerald -> Teal -> Blue ->
 * Violet. Each old colour maps to its nearest Aurora hue, so existing gradients
 * keep their visual direction and land on an Aurora segment rather than being
 * re-invented:
 *
 *   #6C63FF violet-blue  -> #3B82F6 Electric Blue   4.46 -> 5.19 on canvas
 *   #00D4AA green-teal   -> #06B6D4 Teal           10.08 -> 7.86
 *   #8B85FF light violet -> #8B5CF6 Violet          6.32 -> 4.50
 *   #33DDBB light teal   -> #10B981 Emerald        11.19 -> 7.52
 *
 * The first row is the one that matters beyond aesthetics: #6C63FF measured
 * 4.46:1 on the canvas, below the 4.5:1 AA floor, at every text call site. This
 * migration fixes an existing accessibility failure as a side effect.
 *
 * State colours (amber #F59E0B, red #EF4444, emerald #10B981) are deliberately
 * NOT remapped. They signal state, not brand, and §20 requires state to stay
 * distinguishable from brand emphasis.
 *
 *   node scripts/migrate-palette.mjs apps/admin/src apps/client/src [--dry]
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (!args.length) {
  console.error("usage: node scripts/migrate-palette.mjs <src-dir> [<src-dir>...] [--dry]");
  process.exit(1);
}
const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const TARGETS = args.map((a) => (a.startsWith("/") ? a : join(REPO, a)));
const DRY = process.argv.includes("--dry");

/** hex -> hex. Written uppercase; matching is case-insensitive. */
const HEX = {
  "#6C63FF": "#3B82F6",
  "#00D4AA": "#06B6D4",
  "#8B85FF": "#8B5CF6",
  "#33DDBB": "#10B981",
  "#5A52E0": "#2563EB", // pressed/hover darker of the old primary
  "#38BDF8": "#38D3EB", // stray sky blue -> Aurora teal light
  "#0A0E1A": "#0A0F1F", // canvas -> Deep Navy
  "#111827": "#111A2E", // raised surface
  "#0F172A": "#0A0F1F", // light-mode ink -> Deep Navy
};

/**
 * rgb triplets, matched regardless of spacing and of rgb vs rgba, so the alpha
 * is preserved. Keys are "r,g,b".
 */
const RGB = {
  "108,99,255": "59,130,246",
  "0,212,170": "6,182,212",
  "139,133,255": "139,92,246",
  "51,221,187": "16,185,129",
  "91,84,238": "37,99,235",
  "10,14,26": "10,15,31",
  "12,22,46": "10,15,31",
};

/** Walk the tree in Node rather than shelling out — no shell, no quoting bugs. */
function sources(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name);
    if (e.isDirectory()) return sources(full);
    return /\.tsx?$/.test(e.name) ? [full] : [];
  });
}

const files = TARGETS.flatMap(sources);

const tally = {};
let changedFiles = 0;

for (const file of files) {
  const before = readFileSync(file, "utf8");
  let after = before;

  for (const [from, to] of Object.entries(HEX)) {
    const re = new RegExp(from.replace("#", "#"), "gi");
    after = after.replace(re, (m) => {
      tally[from] = (tally[from] ?? 0) + 1;
      // Preserve the author's casing convention.
      return m === m.toLowerCase() ? to.toLowerCase() : to;
    });
  }

  for (const [from, to] of Object.entries(RGB)) {
    const [r, g, b] = from.split(",");
    // \s* between components so "108, 99, 255" and "108,99,255" both match, and
    // the lookahead keeps us inside an rgb()/rgba() rather than matching any
    // three numbers that happen to sit together.
    const re = new RegExp(`(rgba?\\(\\s*)${r}(\\s*,\\s*)${g}(\\s*,\\s*)${b}`, "g");
    after = after.replace(re, (_m, open, s1, s2) => {
      tally[`rgb(${from})`] = (tally[`rgb(${from})`] ?? 0) + 1;
      const [nr, ng, nb] = to.split(",");
      return `${open}${nr}${s1}${ng}${s2}${nb}`;
    });
  }

  if (after !== before) {
    changedFiles++;
    if (!DRY) writeFileSync(file, after);
  }
}

const rows = Object.entries(tally).sort((a, b) => b[1] - a[1]);
const total = rows.reduce((n, [, c]) => n + c, 0);
for (const [from, count] of rows) {
  const to = HEX[from] ?? `rgb(${RGB[from.slice(4, -1)]})`;
  console.log(`  ${String(count).padStart(4)}  ${from.padEnd(18)} -> ${to}`);
}
console.log(`\n${total} replacements across ${changedFiles} files${DRY ? " (dry run — nothing written)" : ""}`);
