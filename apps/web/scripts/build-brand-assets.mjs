/**
 * Derives web-ready brand assets from the supplied masters.
 *
 * The masters are 0.66-1.94 MB PNGs at 1254-2092px. Shipping them as-is would
 * put ~9 MB of logo on the wire and break the performance rules the brand spec
 * itself sets out (§21). This script produces the small, correctly-formatted
 * derivatives the site actually loads.
 *
 * Nothing here redraws or reshapes the mark — §26 forbids that. Every output is
 * a resize, a format conversion, or a composite of a supplied master onto the
 * brand canvas colour. Geometry, proportion and node placement are untouched.
 *
 * MASTERS live at the repository root and are NOT committed: they are large,
 * and this repository is public. The script skips cleanly when they are absent,
 * so a normal build never depends on them — only regenerating assets does.
 *
 *   node scripts/build-brand-assets.mjs
 */
import sharp from "sharp";
import { existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WEB = join(__dirname, "..");
const REPO = join(WEB, "..", "..");
const OUT = join(WEB, "public", "brand");
const PUBLIC = join(WEB, "public");

/** Deep Navy — the brand canvas (§4). Used where a surface must be opaque. */
const CANVAS = { r: 10, g: 15, b: 31, alpha: 1 };

const MASTERS = {
  /** Neural Orbit mark. The only master with a real transparent background, so
   *  the only one that can sit on an arbitrary surface. */
  mark: join(REPO, "neurodyne_logo_icon.png"),
  /** Mark + wordmark + tagline, with atmospheric glow baked in. Dark surfaces only. */
  lockupDark: join(REPO, "neurodyne_dark_horizontal.png"),
  /** Stacked lockup on white. Light surfaces only. */
  lockupLight: join(REPO, "neurodyne_light_logo.png"),
  /** Hero artwork. */
  hero: join(REPO, "neurodyne_hero.png"),
};

function requireMasters() {
  const missing = Object.entries(MASTERS).filter(([, p]) => !existsSync(p));
  if (missing.length === Object.keys(MASTERS).length) {
    console.log("brand masters not present — skipping (this is expected on a clean checkout)");
    return false;
  }
  if (missing.length) {
    console.warn(`missing masters: ${missing.map(([k]) => k).join(", ")}`);
  }
  return true;
}

const made = [];
async function emit(pipeline, file) {
  const path = join(file.startsWith("favicon") || file.startsWith("apple") || file.startsWith("icon") || file.startsWith("og-image") ? PUBLIC : OUT, file);
  const info = await pipeline.toFile(path);
  made.push(`${file.padEnd(28)} ${String(info.width).padStart(5)}x${String(info.height).padEnd(5)} ${(info.size / 1024).toFixed(1).padStart(7)} KB`);
}

async function build() {
  if (!requireMasters()) return;
  mkdirSync(OUT, { recursive: true });

  // ── The mark, transparent, at the sizes the interface actually uses ───────
  // 32/40px in the navbar, so 128 covers 3x; 512 is the PWA/source size.
  if (existsSync(MASTERS.mark)) {
    for (const size of [64, 128, 192, 256, 512]) {
      await emit(
        sharp(MASTERS.mark).resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png({ compressionLevel: 9, palette: true }),
        `mark-${size}.png`,
      );
    }
    await emit(
        sharp(MASTERS.mark).resize(512, 512).webp({ quality: 90 }), "mark-512.webp");

    // ── Favicons ──────────────────────────────────────────────────────────
    // Alpha is kept for browser tabs so the mark sits on the browser's own
    // chrome. Apple and PWA icons are composited onto Deep Navy instead: iOS
    // flattens transparency onto black and Android may crop, and a mark that
    // reads as floating on the brand canvas is better than one on whatever
    // the OS picks.
    for (const size of [16, 32, 48]) {
      await emit(
        sharp(MASTERS.mark).resize(size, size).png({ compressionLevel: 9 }), `favicon-${size}.png`);
    }
    for (const [file, size, pad] of [
      ["apple-touch-icon.png", 180, 20],
      ["icon-192.png", 192, 16],
      ["icon-512.png", 512, 44],
    ]) {
      const inner = await sharp(MASTERS.mark).resize(size - pad * 2, size - pad * 2, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
      await emit(
        sharp({ create: { width: size, height: size, channels: 4, background: CANVAS } })
          .composite([{ input: inner, top: pad, left: pad }])
          .png({ compressionLevel: 9, palette: true, quality: 90 }),
        file,
      );
    }
  }

  // ── Lockups ──────────────────────────────────────────────────────────────
  if (existsSync(MASTERS.lockupDark)) {
    await emit(
        sharp(MASTERS.lockupDark).resize(1200).webp({ quality: 88 }), "lockup-dark.webp");
    // JPEG, not PNG, for the fallback: these are photographic gradients with no
    // alpha, and PNG stores them losslessly at roughly six times the size.
    await emit(
        sharp(MASTERS.lockupDark).flatten({ background: CANVAS }).resize(1200).jpeg({ quality: 88, mozjpeg: true }), "lockup-dark.jpg");

    // Open Graph: 1200x630, opaque because social cards composite onto
    // unpredictable backgrounds. The lockup runs full width rather than being
    // inset — its own baked background is a slightly different navy from the
    // canvas, so any visible vertical edge reads as a seam. Full-bleed leaves
    // only the top and bottom bands, where the lockup is near-black anyway.
    const lockup = await sharp(MASTERS.lockupDark)
      .flatten({ background: CANVAS })
      .resize(1200)
      .toBuffer();
    const meta = await sharp(lockup).metadata();
    await emit(
      sharp({ create: { width: 1200, height: 630, channels: 4, background: CANVAS } })
        .composite([{ input: lockup, top: Math.round((630 - meta.height) / 2), left: 0 }])
        .jpeg({ quality: 90, mozjpeg: true }),
      "og-image.jpg",
    );
  }

  if (existsSync(MASTERS.lockupLight)) {
    await emit(
        sharp(MASTERS.lockupLight).resize(1200).webp({ quality: 88 }), "lockup-light.webp");
    await emit(
        sharp(MASTERS.lockupLight).flatten({ background: "#ffffff" }).resize(1200).jpeg({ quality: 88, mozjpeg: true }), "lockup-light.jpg");
  }

  if (existsSync(MASTERS.hero)) {
    for (const w of [800, 1600]) {
      await emit(
        sharp(MASTERS.hero).resize(w).webp({ quality: 82 }), `hero-${w}.webp`);
    }
  }

  console.log(made.join("\n"));
  console.log(`\n${made.length} assets written to public/brand/ and public/`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
