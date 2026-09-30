/**
 * Fails the build when the two redirect tables disagree.
 *
 * Retiring a URL takes two edits. A `<Navigate>` route in src/App.tsx only
 * redirects a visitor who already has the JavaScript running; to a crawler the
 * old URL answers 200 with whatever shell the rewrite served, which is how a
 * retired path gets indexed as a duplicate. The entry Google actually sees is
 * the `permanent: true` redirect in vercel.json.
 *
 * Adding only the first is the silent failure — silent because everything
 * looks correct in a browser. This script is the thing that notices.
 *
 * Run: node scripts/check-redirects.mjs   (wired into `npm run build`)
 */
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const app = readFileSync(join(ROOT, "src/App.tsx"), "utf8");
const vercel = JSON.parse(readFileSync(join(ROOT, "vercel.json"), "utf8"));

// ── Resolve the string constants App.tsx builds its destinations from ────────
const consts = {};
for (const m of app.matchAll(/^const (\w+) = "([^"]+)";$/gm)) consts[m[1]] = m[2];

/** "/x" | {CONST} | {`${CONST}/x`} -> a concrete path, or null if not static. */
function resolveTo(raw) {
  const expr = raw.trim();

  const literal = expr.match(/^"([^"]*)"$/);
  if (literal) return literal[1];

  const ident = expr.match(/^\{(\w+)\}$/);
  if (ident) return consts[ident[1]] ?? null;

  const template = expr.match(/^\{`([^`]*)`\}$/);
  if (template) {
    let out = template[1];
    let unresolved = false;
    out = out.replace(/\$\{(\w+)\}/g, (_, name) => {
      // `slug` is the captured param, which Vercel spells `:slug`.
      if (name === "slug") return ":slug";
      if (consts[name] !== undefined) return consts[name];
      unresolved = true;
      return "";
    });
    return unresolved ? null : out;
  }

  return null;
}

// ── Slug-preserving redirect components ─────────────────────────────────────
// `Navigate` cannot interpolate a param, so each of these is a small component
// that rebuilds the path. Read its destination out of the component body.
const redirectComponents = {};
for (const m of app.matchAll(/function (Redirect\w+)\(\)\s*\{[\s\S]*?<Navigate to=(\{`[^`]*`\}|"[^"]*")/g)) {
  const dest = resolveTo(m[2]);
  if (dest) redirectComponents[m[1]] = dest;
}

// ── Every redirecting route in App.tsx ──────────────────────────────────────
const appRedirects = new Map();

for (const m of app.matchAll(/<Route path="([^"]+)" element=\{<Navigate to=(\{`[^`]*`\}|\{\w+\}|"[^"]*") replace \/>\} \/>/g)) {
  const dest = resolveTo(m[2]);
  if (dest) appRedirects.set("/" + m[1], dest);
}

for (const m of app.matchAll(/<Route path="([^"]+)" element=\{<(Redirect\w+) \/>\} \/>/g)) {
  const dest = redirectComponents[m[2]];
  if (dest) appRedirects.set("/" + m[1], dest);
}

if (appRedirects.size === 0) {
  console.error("check-redirects: parsed 0 redirects from src/App.tsx — the format changed.");
  process.exit(1);
}

// ── vercel.json ─────────────────────────────────────────────────────────────
const vercelRedirects = new Map();
for (const r of vercel.redirects ?? []) vercelRedirects.set(r.source, r);

// ── Compare ─────────────────────────────────────────────────────────────────
const problems = [];

for (const [source, destination] of appRedirects) {
  const v = vercelRedirects.get(source);
  if (!v) {
    problems.push(
      `  ${source} -> ${destination}\n` +
        `      redirects in App.tsx but NOT in vercel.json.\n` +
        `      A crawler gets 200 here, not a 301, and the old URL stays indexed.\n` +
        `      Add: { "source": "${source}", "destination": "${destination}", "permanent": true }`,
    );
    continue;
  }
  if (v.destination !== destination) {
    problems.push(
      `  ${source}\n` +
        `      App.tsx sends visitors to   ${destination}\n` +
        `      vercel.json sends crawlers to ${v.destination}\n` +
        `      The two must agree.`,
    );
  }
  if (v.permanent !== true) {
    problems.push(`  ${source}\n      vercel.json has permanent:false — a 302 does not consolidate the old URL.`);
  }
}

for (const source of vercelRedirects.keys()) {
  if (!appRedirects.has(source)) {
    problems.push(
      `  ${source}\n` +
        `      redirects in vercel.json but NOT in App.tsx.\n` +
        `      In-app links and local dev will 404 on it.`,
    );
  }
}

if (problems.length > 0) {
  console.error(`\ncheck-redirects: ${problems.length} mismatch(es) between src/App.tsx and vercel.json\n`);
  console.error(problems.join("\n\n"));
  console.error("\nSee AGENTS.md — 'Retiring a URL takes two edits, not one'.\n");
  process.exit(1);
}

console.log(`check-redirects: ${appRedirects.size} redirects agree across App.tsx and vercel.json`);
