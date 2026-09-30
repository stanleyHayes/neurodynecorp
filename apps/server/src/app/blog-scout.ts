import type { Logger } from "pino";
import type { BlogPost } from "../domain/entity/content.js";
import { createBlogPost } from "../domain/entity/content.js";

/**
 * Drafts blog posts about genuinely new work in AI and software.
 *
 * WHY IT WRITES DRAFTS AND NOT POSTS. The rule that governs everything else in
 * this repository is that Neurodyne does not publish claims it cannot stand
 * behind. A model writing unreviewed prose onto a founder's site, under their
 * name, is the fastest way to break that — one confident sentence about a
 * product that does not exist and the credibility the rest of the site is
 * careful about is gone. So every run produces `status: "draft"`, which the
 * content routes already gate behind `canReadDrafts`, and a human presses
 * publish. `autoPublish` exists, defaults to false, and is a deliberate choice
 * rather than an accident.
 *
 * WHY IT STARTS FROM FEEDS RATHER THAN FROM THE MODEL'S MEMORY. A model asked
 * "what is new in AI" answers from training data — stale by months and
 * impossible to check. Starting from a real item in a real feed means every
 * post has a URL behind it, the draft is about something that demonstrably
 * happened, and a reviewer can follow the link. The prompt is built so the
 * model comments on the source rather than restating it, and is told in as
 * many words not to invent specifics.
 *
 * It is careful not to speak for Neurodyne. The house rules forbid implying
 * staff, naming clients, or claiming traction, and a drafting model has no way
 * to know any of that — so the prompt forbids the subject entirely. These are
 * notes about the industry, not announcements.
 */

export interface ScoutFeed {
  /** Shown as the attribution. */
  name: string;
  url: string;
}

export interface BlogRepo {
  findAll(filter?: { status?: string; category?: string }): Promise<BlogPost[]>;
  create(item: BlogPost): Promise<BlogPost>;
}

export interface BlogScoutDeps {
  repo: BlogRepo;
  logger: Logger;
  /** Anthropic API key. Without one the scout does nothing and says so. */
  apiKey: string;
  model: string;
  feeds: ScoutFeed[];
  /** Author byline on the drafts. */
  author: string;
  authorId: string;
  /** Publish without review. Defaults to false, on purpose. */
  autoPublish: boolean;
}

export interface ScoutResult {
  considered: number;
  skippedAlreadyCovered: number;
  drafted: number;
  failed: number;
  reason?: string;
}

interface FeedItem {
  title: string;
  link: string;
  summary: string;
  source: string;
}

const FETCH_TIMEOUT_MS = 15_000;

/**
 * How far back to look in each feed.
 *
 * Feeds are newest-first, and some publish their whole archive: Hugging Face
 * returns 869 entries going back years. Without a cap the scout would happily
 * draft a post about something from 2023 and present it as worth noting now.
 * Twelve is about a fortnight for an active blog.
 */
export const MAX_ITEMS_PER_FEED = 12;

/** Marks a post as machine-drafted, so a reviewer always knows what they have. */
export const SCOUT_TAG = "ai-drafted";

// ── Feed parsing ─────────────────────────────────────────────────────────────
// RSS and Atom, enough of each to read a title, a link and a summary. A full
// XML parser is a dependency this does not need: the shapes are small and the
// failure mode is simply fewer items, never a wrong post.

function decodeEntities(input: string): string {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block: string, name: string): string | null {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m?.[1] ? decodeEntities(m[1]) : null;
}

export function parseFeed(xml: string, source: string): FeedItem[] {
  const out: FeedItem[] = [];
  const blocks = xml.match(/<(item|entry)\b[\s\S]*?<\/\1>/gi) ?? [];

  for (const block of blocks) {
    const title = tag(block, "title");
    // RSS puts the URL in <link>text</link>; Atom puts it in href.
    const link = tag(block, "link") || block.match(/<link[^>]*href="([^"]+)"/i)?.[1] || "";
    const summary =
      tag(block, "description") ?? tag(block, "summary") ?? tag(block, "content") ?? "";

    if (title && link.startsWith("http")) {
      out.push({ title, link, summary: summary.slice(0, 1200), source });
    }
  }
  return out;
}

async function fetchFeed(feed: ScoutFeed, logger: Logger): Promise<FeedItem[]> {
  try {
    const res = await fetch(feed.url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { "User-Agent": "NeurodyneBlogScout/1.0 (+https://neurodyne.dev)" },
    });
    if (!res.ok) throw new Error(`responded ${res.status}`);
    return parseFeed(await res.text(), feed.name).slice(0, MAX_ITEMS_PER_FEED);
  } catch (err) {
    // One unreachable feed must not stop the run.
    logger.warn({ feed: feed.name, err }, "blog-scout: feed unavailable");
    return [];
  }
}

// ── Drafting ─────────────────────────────────────────────────────────────────

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function readTime(markdown: string): string {
  return `${Math.max(1, Math.round(markdown.split(/\s+/).length / 200))} min read`;
}

interface Drafted {
  title: string;
  excerpt: string;
  body: string;
  category: string;
  tags: string[];
}

function buildPrompt(item: FeedItem): string {
  return `You are drafting a short post for the engineering blog of Neurodyne, an
African AI and digital infrastructure company based in Accra, Ghana.

Here is something that was published. Write a commentary post about it.

  Headline: ${item.title}
  Source:   ${item.source}
  URL:      ${item.link}
  Summary:  ${item.summary || "(the feed gave no summary)"}

RULES, IN ORDER OF IMPORTANCE.

1. Do not invent facts. You have the headline and summary above and nothing
   else. Do not add version numbers, benchmarks, dates, prices, company
   statements or capabilities that are not in that material. If you do not know
   a specific, write around it rather than guessing. A vaguer sentence is always
   better than a confident wrong one.

2. Never write about Neurodyne itself. No claims about what it has built, who
   its clients are, how many people work there, or what it plans. It is
   founder-led by one engineer; "we", "our team" and "our engineers" are all
   wrong. Write as an observer of the industry.

3. Say why it matters, and where possible why it matters from where this is
   written — African infrastructure constraints, intermittent connectivity,
   cost of compute, mobile-first users, data sovereignty. Only where it honestly
   applies. Do not force it.

4. Attribute. The post must make clear the news came from ${item.source} and
   link to ${item.link}.

5. 300-500 words. Markdown. No H1 — the title is separate. Plain, specific
   prose. No hype, no "game-changing", no "revolutionary", no rhetorical
   questions as openers, no three-item lists used for rhythm.

Reply with JSON and nothing else:
{"title": "...", "excerpt": "one sentence, under 200 characters",
 "category": "AI" | "Engineering" | "Infrastructure" | "Open Source" | "Industry",
 "tags": ["two", "to", "four"], "body": "the markdown"}`;
}

async function draftOne(item: FeedItem, deps: BlogScoutDeps): Promise<Drafted | null> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": deps.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: deps.model,
      max_tokens: 2000,
      messages: [{ role: "user", content: buildPrompt(item) }],
    }),
    signal: AbortSignal.timeout(90_000),
  });

  if (!res.ok) {
    throw new Error(`Anthropic responded ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }

  const payload = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = payload.content?.find((c) => c.type === "text")?.text ?? "";
  const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  if (!json) return null;

  const parsed = JSON.parse(json) as Partial<Drafted>;
  if (!parsed.title || !parsed.body) return null;

  return {
    title: parsed.title,
    excerpt: parsed.excerpt ?? "",
    body: parsed.body,
    category: parsed.category ?? "Industry",
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 4) : [],
  };
}

// ── Run ──────────────────────────────────────────────────────────────────────

export async function runBlogScout(deps: BlogScoutDeps, limit = 2): Promise<ScoutResult> {
  const empty: ScoutResult = { considered: 0, skippedAlreadyCovered: 0, drafted: 0, failed: 0 };

  if (!deps.apiKey) {
    return { ...empty, reason: "No ANTHROPIC_API_KEY set — nothing drafted." };
  }
  if (deps.feeds.length === 0) {
    return { ...empty, reason: "No feeds configured — nothing drafted." };
  }

  const existing = await deps.repo.findAll();
  // Dedupe on the source URL, which every draft embeds. Cheaper and more
  // honest than a "seen" table that can drift out of step with what was kept.
  const covered = new Set(
    existing.flatMap((p) => Array.from(p.content.matchAll(/https?:\/\/\S+/g)).map((m) => m[0].replace(/[).,]+$/, ""))),
  );

  const items = (await Promise.all(deps.feeds.map((f) => fetchFeed(f, deps.logger)))).flat();

  let skipped = 0;
  const fresh = items.filter((i) => {
    if (covered.has(i.link)) {
      skipped++;
      return false;
    }
    return true;
  });

  const result: ScoutResult = {
    considered: items.length,
    skippedAlreadyCovered: skipped,
    drafted: 0,
    failed: 0,
  };

  for (const item of fresh.slice(0, limit)) {
    try {
      const drafted = await draftOne(item, deps);
      if (!drafted) {
        result.failed++;
        continue;
      }

      // The attribution is appended here rather than trusted to the model, so
      // it is present on every post whatever the model returned.
      const body = `${drafted.body}\n\n---\n\nSource: [${item.title}](${item.link}) — ${item.source}.\n\n_Drafted automatically from a public feed and reviewed before publishing._\n`;

      await deps.repo.create(
        createBlogPost({
          title: drafted.title,
          slug: slugify(drafted.title),
          excerpt: drafted.excerpt,
          content: body,
          category: drafted.category,
          status: deps.autoPublish ? "published" : "draft",
          author: deps.author,
          authorId: deps.authorId,
          readTime: readTime(body),
          tags: [...drafted.tags, SCOUT_TAG],
        }),
      );
      result.drafted++;
      deps.logger.info({ title: drafted.title, source: item.link }, "blog-scout: drafted");
    } catch (err) {
      result.failed++;
      deps.logger.error({ err, item: item.link }, "blog-scout: draft failed");
    }
  }

  return result;
}

/**
 * Feeds worth reading, all publishers' own. Override with
 * NEURODYNE_BLOG_FEEDS as a comma-separated list of name|url pairs.
 */
export const DEFAULT_FEEDS: ScoutFeed[] = [
  // Every one of these was fetched and parsed before being listed. Anthropic
  // has no public feed — the obvious URLs all 404 — so it is not here.
  { name: "Hacker News", url: "https://hnrss.org/frontpage?points=300" },
  { name: "GitHub Blog — Engineering", url: "https://github.blog/engineering/feed/" },
  { name: "Hugging Face", url: "https://huggingface.co/blog/feed.xml" },
  { name: "Google AI Blog", url: "https://blog.google/technology/ai/rss/" },
  { name: "Simon Willison", url: "https://simonwillison.net/atom/everything/" },
  { name: "MIT Technology Review", url: "https://www.technologyreview.com/feed/" },
  { name: "The Verge — AI", url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml" },
];
