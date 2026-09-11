/**
 * Generates the OG image (1200x630) for social media sharing.
 * Run: node apps/web/scripts/generate-og-image.mjs
 * Requires: pnpm add -D sharp (in apps/web)
 */
import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, "..", "public", "og-image.png");

const WIDTH = 1200;
const HEIGHT = 630;

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${WIDTH}" y2="${HEIGHT}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#070A12"/>
      <stop offset="100%" stop-color="#0F1520"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6C63FF"/>
      <stop offset="100%" stop-color="#00D4AA"/>
    </linearGradient>
    <linearGradient id="accent2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8B85FF"/>
      <stop offset="100%" stop-color="#33DDBB"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>

  <!-- Subtle grid pattern -->
  <g opacity="0.04" stroke="#6C63FF" stroke-width="1">
    ${Array.from({ length: 25 }, (_, i) => `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="${HEIGHT}"/>`).join("")}
    ${Array.from({ length: 14 }, (_, i) => `<line x1="0" y1="${i * 50}" x2="${WIDTH}" y2="${i * 50}"/>`).join("")}
  </g>

  <!-- Decorative gradient orbs -->
  <circle cx="900" cy="200" r="250" fill="#6C63FF" opacity="0.06"/>
  <circle cx="350" cy="450" r="200" fill="#00D4AA" opacity="0.05"/>

  <!-- Top accent line -->
  <rect x="0" y="0" width="${WIDTH}" height="4" fill="url(#accent)"/>

  <!-- Brain icon (simplified from favicon) -->
  <g transform="translate(100, 195) scale(3.75)">
    <circle cx="32" cy="32" r="30" stroke="url(#accent)" stroke-width="2.5" fill="none" opacity="0.3"/>
    <path d="M22 20c-5 2-8 7-8 13 0 7 5 12 11 13 1 0 2-1 2-2V22c0-1.5-1-2.5-2-2.5" stroke="url(#accent2)" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M25 26c-3 0-6 2-6 5s2 4 4 4" stroke="url(#accent2)" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <path d="M25 31c-2 1-3 3-3 5" stroke="url(#accent2)" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <path d="M42 20c5 2 8 7 8 13 0 7-5 12-11 13-1 0-2-1-2-2V22c0-1.5 1-2.5 2-2.5" stroke="url(#accent)" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M39 26c3 0 6 2 6 5s-2 4-4 4" stroke="url(#accent)" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <path d="M39 31c2 1 3 3 3 5" stroke="url(#accent)" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <circle cx="20" cy="25" r="2" fill="#6C63FF"/>
    <circle cx="44" cy="25" r="2" fill="#00D4AA"/>
    <circle cx="18" cy="35" r="1.5" fill="#8B85FF"/>
    <circle cx="46" cy="35" r="1.5" fill="#33DDBB"/>
    <circle cx="32" cy="17" r="2" fill="#6C63FF"/>
    <circle cx="32" cy="44" r="2" fill="#00D4AA"/>
    <line x1="32" y1="17" x2="20" y2="25" stroke="#6C63FF" stroke-width="1" opacity="0.6"/>
    <line x1="32" y1="17" x2="44" y2="25" stroke="#00D4AA" stroke-width="1" opacity="0.6"/>
    <line x1="20" y1="25" x2="18" y2="35" stroke="#8B85FF" stroke-width="1" opacity="0.4"/>
    <line x1="44" y1="25" x2="46" y2="35" stroke="#33DDBB" stroke-width="1" opacity="0.4"/>
    <line x1="18" y1="35" x2="32" y2="44" stroke="#6C63FF" stroke-width="1" opacity="0.4"/>
    <line x1="46" y1="35" x2="32" y2="44" stroke="#00D4AA" stroke-width="1" opacity="0.4"/>
  </g>

  <!-- Company name -->
  <text x="380" y="250" font-family="system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="72" font-weight="700" fill="white" letter-spacing="-1">Neurodyne</text>

  <!-- Positioning headline -->
  <text x="380" y="312" font-family="system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="34" font-weight="600" fill="#E5E7EB" letter-spacing="-0.5">Building Africa&#8217;s Digital Infrastructure.</text>

  <!-- Brand line -->
  <text x="380" y="352" font-family="system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="22" fill="#9CA3AF" letter-spacing="0.5">Infrastructure for an Intelligent Africa.</text>

  <!-- Pillars, not services. These mirror PILLARS in src/content/company.ts. -->
  <g transform="translate(380, 386)">
    <rect x="0" y="0" width="250" height="36" rx="0" fill="#6C63FF" opacity="0.15"/>
    <text x="125" y="23" font-family="system-ui, sans-serif" font-size="14" fill="#8B85FF" text-anchor="middle">AI &amp; Developer Infrastructure</text>

    <rect x="264" y="0" width="240" height="36" rx="0" fill="#00D4AA" opacity="0.15"/>
    <text x="384" y="23" font-family="system-ui, sans-serif" font-size="14" fill="#33DDBB" text-anchor="middle">Digital Public Infrastructure</text>

    <rect x="0" y="48" width="130" height="36" rx="0" fill="#8B85FF" opacity="0.15"/>
    <text x="65" y="71" font-family="system-ui, sans-serif" font-size="14" fill="#8B85FF" text-anchor="middle">Platforms</text>

    <rect x="144" y="48" width="130" height="36" rx="0" fill="#F59E0B" opacity="0.15"/>
    <text x="209" y="71" font-family="system-ui, sans-serif" font-size="14" fill="#F59E0B" text-anchor="middle">Labs</text>
  </g>

  <!-- URL at bottom -->
  <text x="600" y="570" font-family="system-ui, sans-serif" font-size="20" fill="#4B5563" text-anchor="middle" letter-spacing="2">Built in Ghana. Built for Africa.  ·  neurodyne.dev</text>

  <!-- Bottom accent line -->
  <rect x="0" y="${HEIGHT - 4}" width="${WIDTH}" height="4" fill="url(#accent)"/>
</svg>`;

await sharp(Buffer.from(svg)).png({ quality: 95 }).toFile(outputPath);
console.log(`✓ Generated OG image: ${outputPath}`);
