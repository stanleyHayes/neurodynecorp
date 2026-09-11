/**
 * Generates sitemap.xml and per-route static HTML shells.
 *
 * Why this exists: the site is a client-rendered Vite SPA. Every URL used to
 * serve the same index.html, whose <title> and <meta description> described the
 * homepage — so every page looked like a duplicate of every other page to a
 * crawler, and any crawler that did not execute JavaScript saw nothing else.
 *
 * This script writes a real HTML file per route with that route's own title,
 * description, canonical and Open Graph tags baked into the markup. Vercel
 * serves a matching static file before it applies the SPA rewrite, so crawlers
 * and link unfurlers get correct metadata with zero JS, while the React app
 * still hydrates and takes over navigation as usual.
 *
 * Run: node scripts/generate-seo.mjs        (after `vite build`)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const SITE = "https://neurodyne.dev";

// ── Route table ──────────────────────────────────────────────────────────────
// Titles and descriptions are the SEO surface. Keep them unique: two routes
// sharing a description is the single most common reason pages get dropped
// from an index as duplicates.

const STATIC_ROUTES = [
  {
    path: "/",
    title: "Neurodyne — Building Africa's Digital Infrastructure",
    description:
      "Neurodyne is building the digital infrastructure layer for Africa — AI-native platforms, developer tools and open standards for African businesses, communities and institutions.",
    priority: "1.0",
    changefreq: "weekly",
  },
  {
    path: "/products",
    title: "Products",
    description:
      "Neurodyne's platforms — RentOS, Ujimora, AuraEDU and Bak2Me — plus experiments and engineering work delivered for other organisations. Every item carries the stage it is actually at.",
    priority: "0.9",
    changefreq: "weekly",
  },
  {
    path: "/infrastructure",
    title: "Infrastructure",
    description:
      "The four pillars of Neurodyne's infrastructure work: AI and developer infrastructure, digital public infrastructure, platforms, and Labs — and the African conditions they are designed around.",
    priority: "0.9",
    changefreq: "monthly",
  },
  {
    path: "/developers",
    title: "Developers — Build for Africa with Neurodyne",
    description:
      "SDKs, AI agent skills, MCP servers and an African API registry. Making African digital services reachable by software and AI agents, not only by people using apps.",
    priority: "0.9",
    changefreq: "weekly",
  },
  {
    path: "/open-source",
    title: "Open Source",
    description:
      "Open-source libraries, reference implementations and field guides from Neurodyne. Publication links appear only when a repository is genuinely live.",
    priority: "0.8",
    changefreq: "weekly",
  },
  {
    path: "/research",
    title: "Research",
    description:
      "Technical research on African AI infrastructure, interoperability, digital identity, verification, payments and data standards.",
    priority: "0.8",
    changefreq: "monthly",
  },
  {
    path: "/labs",
    title: "Neurodyne Labs",
    description:
      "Experiments, prototypes and infrastructure concepts that may become products, standards or open-source projects. Early work, labelled as early work.",
    priority: "0.7",
    changefreq: "monthly",
  },
  {
    path: "/vision",
    title: "Vision — A Ten-Year Infrastructure Strategy",
    description:
      "Neurodyne's four-phase strategy: products, then extracted infrastructure, then an open ecosystem, then digital infrastructure African institutions rely on.",
    priority: "0.8",
    changefreq: "monthly",
  },
  {
    path: "/about",
    title: "About Neurodyne",
    description:
      "A Ghanaian technology company building AI-native platforms, developer infrastructure and digital systems for African businesses, communities and institutions.",
    priority: "0.8",
    changefreq: "monthly",
  },
  {
    path: "/partners",
    title: "Partner With Neurodyne",
    description:
      "Engagement pathways for governments and institutions, companies, developers, and startups and investors. Technical diligence welcome.",
    priority: "0.9",
    changefreq: "monthly",
  },
  {
    path: "/blog",
    title: "Blog",
    description: "Writing on engineering, AI and digital infrastructure for African markets.",
    priority: "0.7",
    changefreq: "weekly",
  },
  {
    path: "/contact",
    title: "Contact",
    description:
      "Get in touch with Neurodyne about infrastructure work, partnerships, open source, research or investment.",
    priority: "0.7",
    changefreq: "monthly",
  },
  {
    path: "/company/engineering-services",
    title: "Engineering Services",
    description:
      "Platform engineering, AI systems, cloud architecture and technical advisory for organisations building on African payment, identity and connectivity realities.",
    priority: "0.6",
    changefreq: "monthly",
  },
  {
    path: "/changelog",
    title: "Changelog",
    description: "What has shipped across Neurodyne's platforms and infrastructure work.",
    priority: "0.5",
    changefreq: "weekly",
  },
  {
    path: "/trust",
    title: "Trust & Security",
    description:
      "How Neurodyne approaches security, privacy and data protection — the practices followed, stated without certification claims.",
    priority: "0.5",
    changefreq: "monthly",
  },
  {
    path: "/glossary",
    title: "Glossary",
    description: "Plain-language definitions of the infrastructure, AI and engineering terms used across this site.",
    priority: "0.4",
    changefreq: "monthly",
  },
  {
    path: "/faq",
    title: "FAQ",
    description: "Common questions about how Neurodyne works, what it builds, and how to engage.",
    priority: "0.5",
    changefreq: "monthly",
  },
  {
    path: "/help",
    title: "Help",
    description: "Support articles and guidance for Neurodyne products and services.",
    priority: "0.4",
    changefreq: "monthly",
  },
  { path: "/privacy", title: "Privacy Policy", description: "How Neurodyne collects, uses and protects personal data.", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", title: "Terms of Service", description: "The terms governing use of Neurodyne's website and services.", priority: "0.3", changefreq: "yearly" },
  { path: "/company/engineering-services/work", title: "Engineering Work", description: "Systems engineered for other organisations. Clients are anonymised unless permission to name them is on file.", priority: "0.5", changefreq: "monthly" },
  { path: "/company/engineering-services/brief", title: "Start a Brief", description: "Describe a project: the problem, users, operating context, constraints and what success looks like.", priority: "0.5", changefreq: "monthly" },
  { path: "/company/engineering-services/diagnostic", title: "Engagement Readiness Diagnostic", description: "A short branching diagnostic that routes a brief to the right engagement path and returns a one-page readiness summary.", priority: "0.4", changefreq: "monthly" },
  { path: "/company/engineering-services/estimator", title: "Scope Estimator", description: "Configure a scope and see the shape of the engineering work it implies.", priority: "0.4", changefreq: "monthly" },
  { path: "/company/engineering-services/rfp", title: "Submit an RFP", description: "Submit a request for proposal for infrastructure or platform engineering work.", priority: "0.4", changefreq: "monthly" },
  { path: "/company/engineering-services/spec-library", title: "Specification Library", description: "Illustrative specification templates showing how Neurodyne structures a technical specification.", priority: "0.4", changefreq: "monthly" },
  { path: "/book", title: "Book a Call", description: "Request a conversation about infrastructure work, partnership or collaboration.", priority: "0.5", changefreq: "monthly" },
  { path: "/status", title: "System Status", description: "Current operational status of Neurodyne services and any recent incidents.", priority: "0.4", changefreq: "daily" },
  { path: "/legal/security", title: "Security", description: "How Neurodyne approaches application, infrastructure and operational security.", priority: "0.3", changefreq: "yearly" },
  { path: "/legal/accessibility", title: "Accessibility", description: "Neurodyne's accessibility commitments and how to report a barrier.", priority: "0.3", changefreq: "yearly" },
  { path: "/legal/cookies", title: "Cookie Policy", description: "What cookies this site sets and how to control them.", priority: "0.3", changefreq: "yearly" },
  { path: "/legal/acceptable-use", title: "Acceptable Use Policy", description: "The acceptable use terms for Neurodyne products and services.", priority: "0.3", changefreq: "yearly" },
  { path: "/legal/dpa", title: "Data Processing Addendum", description: "The data processing terms that apply when Neurodyne processes personal data on a client's behalf.", priority: "0.3", changefreq: "yearly" },
  { path: "/legal/subprocessors", title: "Sub-processors", description: "The third-party services Neurodyne relies on to deliver its products.", priority: "0.3", changefreq: "yearly" },
  { path: "/account-deletion", title: "Delete Your Account", description: "How to request deletion of a Neurodyne account and the data associated with it.", priority: "0.3", changefreq: "yearly" },
];

// ── Product routes, derived from the content model ───────────────────────────
// Parsed rather than hand-listed so a new product cannot silently miss the
// sitemap. If the shape of projects.ts changes, this throws and the build fails
// loudly instead of quietly shipping an incomplete sitemap.

function readProjects() {
  const src = readFileSync(join(ROOT, "src/content/projects.ts"), "utf8");
  const re =
    /slug:\s*"([^"]+)",\s*\n\s*name:\s*"([^"]+)",\s*\n\s*tagline:\s*"([^"]+)",[\s\S]{0,400}?tier:\s*"([^"]+)",/g;
  const out = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    out.push({ slug: m[1], name: m[2], tagline: m[3], tier: m[4] });
  }
  if (out.length === 0) {
    throw new Error("generate-seo: parsed 0 projects from src/content/projects.ts — the format changed.");
  }
  return out;
}

const TIER_BASE = { platform: "/products", labs: "/labs", "client-work": "/work" };

function productRoutes() {
  return readProjects().map((p) => ({
    path: `${TIER_BASE[p.tier] ?? "/products"}/${p.slug}`,
    title: p.name,
    description: p.tagline,
    priority: p.tier === "platform" ? "0.8" : "0.6",
    changefreq: "monthly",
  }));
}

// ── Sitemap ──────────────────────────────────────────────────────────────────

function buildSitemap(routes, lastmod) {
  const urls = routes
    .map(
      (r) =>
        `  <url>\n    <loc>${SITE}${r.path === "/" ? "/" : r.path}</loc>\n` +
        `    <lastmod>${lastmod}</lastmod>\n` +
        `    <changefreq>${r.changefreq}</changefreq>\n` +
        `    <priority>${r.priority}</priority>\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

// ── Per-route HTML shells ────────────────────────────────────────────────────

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function shellFor(template, route) {
  const url = `${SITE}${route.path === "/" ? "" : route.path}`;
  const title = route.path === "/" ? route.title : `${route.title} | Neurodyne`;
  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = html.replace(
    /<meta name="description"[^>]*>/,
    `<meta name="description" content="${esc(route.description)}" />`,
  );
  html = html.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(title)}" />`);
  html = html.replace(
    /<meta property="og:description"[^>]*>/,
    `<meta property="og:description" content="${esc(route.description)}" />`,
  );
  html = html.replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${esc(url)}" />`);
  html = html.replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(title)}" />`);
  html = html.replace(
    /<meta name="twitter:description"[^>]*>/,
    `<meta name="twitter:description" content="${esc(route.description)}" />`,
  );

  // Canonical: replace if the template already has one, otherwise insert.
  const canonical = `<link rel="canonical" href="${esc(url)}" />`;
  html = /<link rel="canonical"[^>]*>/.test(html)
    ? html.replace(/<link rel="canonical"[^>]*>/, canonical)
    : html.replace("</head>", `    ${canonical}\n  </head>`);

  return html;
}

// ── Run ──────────────────────────────────────────────────────────────────────

// /newsletter/confirm is deliberately absent: it is a transactional landing
// page reached from an email link, and it carries noIndex.
const lastmod = new Date().toISOString().slice(0, 10);
const routes = [...STATIC_ROUTES, ...productRoutes()];

writeFileSync(join(ROOT, "public/sitemap.xml"), buildSitemap(routes, lastmod));
console.log(`sitemap.xml: ${routes.length} routes`);

if (existsSync(DIST)) {
  // Keep dist/sitemap.xml in step with the one just written to public/ —
  // vite build has already copied the previous version across.
  writeFileSync(join(DIST, "sitemap.xml"), buildSitemap(routes, lastmod));

  const template = readFileSync(join(DIST, "index.html"), "utf8");
  let written = 0;
  for (const route of routes) {
    if (route.path === "/") {
      writeFileSync(join(DIST, "index.html"), shellFor(template, route));
    } else {
      const dir = join(DIST, route.path.replace(/^\//, ""));
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "index.html"), shellFor(template, route));
    }
    written++;
  }
  console.log(`prerendered head for ${written} routes into dist/`);
} else {
  console.log("dist/ not found — sitemap written, skipping HTML shells (run after `vite build`).");
}
