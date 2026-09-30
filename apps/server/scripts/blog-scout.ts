/**
 * Drafts blog posts from public feeds. Safe to run on a schedule.
 *
 *   pnpm --filter @neurodyne/server blog:scout            # draft up to 2
 *   pnpm --filter @neurodyne/server blog:scout --limit 4
 *   pnpm --filter @neurodyne/server blog:scout --dry-run  # read feeds, write nothing
 *
 * Needs NEURODYNE_ANTHROPIC_API_KEY. Everything else has a default.
 *
 * Posts are created as DRAFTS. They are invisible on the site until someone
 * opens the admin blog queue and publishes them. Setting
 * NEURODYNE_BLOG_AUTOPUBLISH=true removes that step, and the script says so
 * loudly when it is on, because publishing unreviewed machine-written prose
 * under a founder's byline is a decision rather than a default.
 *
 * A cron entry, twice a week:
 *   0 7 * * 1,4  cd /path/to/apps/server && pnpm blog:scout >> /var/log/scout.log 2>&1
 */
import { loadConfig } from "../src/config/index.js";
import { createLogger } from "../src/logger/index.js";
import { MongoDBClient } from "../src/adapter/driven/mongodb/client.js";
import { MongoBlogPostRepository } from "../src/adapter/driven/mongodb/content-repository.js";
import { MongoUserRepository } from "../src/adapter/driven/mongodb/user-repository.js";
import { runBlogScout, DEFAULT_FEEDS, SCOUT_AUTHOR, type ScoutFeed } from "../src/app/blog-scout.js";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

/** NEURODYNE_BLOG_FEEDS = "Name|https://…, Other|https://…" */
function feedsFromEnv(): ScoutFeed[] {
  const raw = process.env.NEURODYNE_BLOG_FEEDS;
  if (!raw) return DEFAULT_FEEDS;
  const parsed = raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .flatMap((entry) => {
      const [name, url] = entry.split("|").map((s) => s.trim());
      return name && url?.startsWith("http") ? [{ name, url }] : [];
    });
  return parsed.length ? parsed : DEFAULT_FEEDS;
}

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = createLogger(config.server.environment);

  const apiKey = process.env.NEURODYNE_ANTHROPIC_API_KEY ?? "";
  // Publishing without review is the default here, because the person who
  // would do the reviewing said they will not have time to. That makes the
  // label on every post the thing doing the work — see SCOUT_CATEGORY and the
  // notice the scout writes at the top of each body. Set
  // NEURODYNE_BLOG_AUTOPUBLISH=false to go back to a draft queue.
  const autoPublish = process.env.NEURODYNE_BLOG_AUTOPUBLISH !== "false";
  const dryRun = process.argv.includes("--dry-run");
  const limit = Number(arg("limit") ?? 2);

  if (autoPublish) {
    console.log("");
    console.log("  Auto-publish is ON. Posts go straight to the site, unreviewed,");
    console.log("  labelled 'AI Automation' and bylined to the AI desk rather than a person.");
    console.log("  Set NEURODYNE_BLOG_AUTOPUBLISH=false for a draft queue instead.");
    console.log("");
  }

  if (dryRun) {
    const { parseFeed, MAX_ITEMS_PER_FEED } = await import("../src/app/blog-scout.js");
    let total = 0;
    for (const feed of feedsFromEnv()) {
      try {
        const res = await fetch(feed.url, { signal: AbortSignal.timeout(15_000) });
        const items = parseFeed(await res.text(), feed.name).slice(0, MAX_ITEMS_PER_FEED);
        total += items.length;
        console.log(`  ${feed.name}: ${items.length} item(s)`);
        for (const i of items.slice(0, 2)) console.log(`      ${i.title.slice(0, 84)}`);
      } catch (err) {
        console.log(`  ${feed.name}: unreachable — ${err instanceof Error ? err.message : err}`);
      }
    }
    console.log(`\n  ${total} item(s) readable. Nothing written (--dry-run).\n`);
    return;
  }


  const mongoClient = new MongoDBClient({ uri: config.mongodb.uri, database: config.mongodb.database });
  await mongoClient.connect();

  const blogRepo = new MongoBlogPostRepository(mongoClient);
  const users = new MongoUserRepository(mongoClient);

  // The byline is a real account, so a draft is attributable to someone who can
  // be asked about it.
  const bylineEmail = process.env.NEURODYNE_BLOG_AUTHOR_EMAIL ?? "";
  const author = bylineEmail ? await users.findByEmail(bylineEmail) : null;
  if (bylineEmail && !author) {
    console.error(`\n  No user with email ${bylineEmail}. Set NEURODYNE_BLOG_AUTHOR_EMAIL to an existing account.\n`);
    process.exit(1);
  }

  const result = await runBlogScout(
    {
      repo: blogRepo,
      logger,
      apiKey,
      model: process.env.NEURODYNE_BLOG_MODEL ?? "claude-sonnet-5-5",
      feeds: feedsFromEnv(),
      author: author ? `${author.firstName} ${author.lastName}` : SCOUT_AUTHOR,
      authorId: author?.id ?? "",
      autoPublish,
    },
    limit,
  );

  console.log("");
  console.log(`  considered            ${result.considered}`);
  console.log(`  already covered       ${result.skippedAlreadyCovered}`);
  console.log(`  ${autoPublish ? "published" : "drafted"}               ${result.drafted}`);
  console.log(`  rejected (self-ref)   ${result.rejected}`);
  console.log(`  failed                ${result.failed}`);
  if (result.reason) console.log(`  ${result.reason}`);
  if (!autoPublish && result.drafted > 0) {
    console.log("");
    console.log("  Review them in the admin blog queue before publishing.");
  }
  console.log("");

  await mongoClient.disconnect();
}

main().catch((err) => {
  console.error("\n  blog-scout failed:", err instanceof Error ? err.message : err, "\n");
  process.exit(1);
});
