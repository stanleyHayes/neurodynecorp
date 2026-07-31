/**
 * Align an existing database with the deterministic seed ids.
 *
 * Seed rows used to get a fresh `new ObjectId()` on every run, so re-seeding
 * inserted a second copy of nearly everything instead of colliding and
 * skipping. Ids are now derived from a stable counter, which fixes future runs
 * — but a database seeded before that change still holds the old random ids,
 * and users/roles keep theirs because their unique index makes the seed skip
 * them. That leaves the graph split: projects reference client ids that no
 * longer match any user, and client portals come back empty.
 *
 * This script reconciles such a database:
 *
 *   1. re-keys roles and users onto their deterministic ids
 *   2. re-keys the four anchored portfolio projects
 *   3. removes the retired placeholder client projects
 *   4. collapses duplicate rows left behind by earlier double-seeding
 *   5. refreshes admin permissions from the current resource list
 *
 * It is idempotent: running it on an already-aligned database changes nothing.
 * A freshly seeded database never needs it.
 *
 *   pnpm --filter @neurodyne/server seed:align
 */

import { MongoClient, ObjectId, type Db } from "mongodb";
import { loadConfig } from "../src/config/index.js";
import { RESOURCES, ACTIONS } from "../src/domain/entity/permission.js";
import { IDS, users as seedUsers, roles as seedRoles } from "../src/adapter/driven/mongodb/seed-data.js";
import { portfolioProjects } from "../src/adapter/driven/mongodb/seed-portfolio.js";

const DRY_RUN = process.argv.includes("--dry-run");

/** Placeholder client projects that were removed from the seed. */
const RETIRED_PROJECTS = [
  "Acme Logistics Platform",
  "Acme Inventory Management",
  "Nordic SaaS AI Chatbot",
  "GreenLeaf Sustainability Tracker",
];

/**
 * Natural keys used to spot duplicates. Every key here is verified to exist on
 * the stored document before it is used — grouping on a field the documents do
 * not have collapses the whole collection into one bucket.
 */
const DEDUPE_KEYS: Array<[string, string[]]> = [
  ["projects", ["name"]],
  ["testimonials", ["name"]],
  ["services", ["title"]],
  ["case_studies", ["title"]],
  ["contact_submissions", ["email", "name"]],
  ["tasks", ["title", "project_id"]],
  ["invoices", ["invoice_number"]],
  ["threads", ["title", "project_id"]],
  ["messages", ["content", "thread_id"]],
  ["notifications", ["title", "user_id"]],
  ["specifications", ["project_id", "version"]],
];

function log(step: string, detail: string) {
  console.log(`  ${step.padEnd(26)} ${detail}`);
}

/**
 * `_id` is immutable, so re-keying is delete-then-insert. The delete has to go
 * first because a unique index would reject the copy; the original document is
 * held in memory and restored if the insert fails.
 */
async function rekey(db: Db, coll: string, rows: Array<{ id: string; key: string; value: unknown }>) {
  let moved = 0;
  for (const row of rows) {
    const doc = await db.collection(coll).findOne({ [row.key]: row.value } as never);
    if (!doc || doc._id.toHexString() === row.id) continue;
    if (DRY_RUN) { moved++; continue; }

    await db.collection(coll).deleteOne({ _id: doc._id });
    try {
      await db.collection(coll).insertOne({ ...doc, _id: new ObjectId(row.id) } as never);
      moved++;
    } catch (err) {
      await db.collection(coll).insertOne(doc as never);
      console.error(`  !! ${coll}/${String(row.value)} restored: ${(err as Error).message}`);
    }
  }
  log(`re-key ${coll}`, `${moved} moved`);
}

async function main() {
  const cfg = loadConfig();
  const client = new MongoClient(cfg.mongodb.uri);
  await client.connect();
  const db = client.db(cfg.mongodb.database);
  console.log(`\naligning "${cfg.mongodb.database}"${DRY_RUN ? " (dry run)" : ""}\n`);

  // 1 + 2 — identities first: everything else references them.
  await rekey(db, "roles", (seedRoles as Array<Record<string, string>>).map((r) => ({ id: r["id"]!, key: "name", value: r["name"] })));
  await rekey(db, "users", (seedUsers as Array<Record<string, string>>).map((u) => ({ id: u["id"]!, key: "email", value: u["email"] })));

  if (!DRY_RUN) {
    for (const u of seedUsers as Array<Record<string, string>>) {
      if (!u["roleId"]) continue;
      await db.collection("users").updateOne(
        { email: u["email"] },
        { $set: { role_id: u["roleId"], roleId: u["roleId"] } },
      );
    }
  }

  const anchored = portfolioProjects.filter((p) =>
    [IDS.proj1, IDS.proj2, IDS.proj3, IDS.proj4].includes(p.id));
  await rekey(db, "projects", anchored.map((p) => ({ id: p.id, key: "name", value: p.name })));

  // 3 — retired placeholders
  const removed = DRY_RUN
    ? await db.collection("projects").countDocuments({ name: { $in: RETIRED_PROJECTS } })
    : (await db.collection("projects").deleteMany({ name: { $in: RETIRED_PROJECTS } })).deletedCount;
  log("retired placeholders", `${removed} removed`);

  // 4 — duplicates from earlier double-seeding. Prefer the row carrying a
  // known seed id so later seeds collide with it and skip.
  const seedIds = new Set<string>([
    ...portfolioProjects.map((p) => p.id),
    ...(seedUsers as Array<Record<string, string>>).map((u) => u["id"]!),
  ]);
  for (const [coll, keys] of DEDUPE_KEYS) {
    const probe = await db.collection(coll).findOne({});
    if (!probe) continue;
    const usable = keys.filter((k) => k in probe);
    if (!usable.length) { log(`dedupe ${coll}`, "skipped — no usable key on stored docs"); continue; }

    const groupId: Record<string, string> = {};
    for (const k of usable) groupId[k] = `$${k}`;
    const groups = await db.collection(coll).aggregate([
      { $group: { _id: groupId, ids: { $push: "$_id" }, n: { $sum: 1 } } },
      { $match: { n: { $gt: 1 } } },
    ]).toArray();

    let dropped = 0;
    for (const g of groups) {
      const ids = (g["ids"] as ObjectId[]).map((x) => x.toHexString());
      const keep = ids.find((i) => seedIds.has(i)) ?? ids.slice().sort()[0]!;
      const drop = ids.filter((i) => i !== keep).map((i) => new ObjectId(i));
      if (!drop.length) continue;
      dropped += DRY_RUN ? drop.length : (await db.collection(coll).deleteMany({ _id: { $in: drop } })).deletedCount;
    }
    if (dropped) log(`dedupe ${coll}`, `${dropped} duplicates removed`);
  }

  // 5 — permissions are denormalised onto each user, so users seeded before a
  // resource existed can never be granted it without this refresh.
  const full = RESOURCES.flatMap((r) => ACTIONS.map((a) => `${r}:${a}`));
  if (!DRY_RUN) {
    await db.collection("roles").updateOne({ name: "admin" }, { $set: { permissions: full, updatedAt: new Date() } });
    await db.collection("users").updateMany({ role: "admin" }, { $set: { permissions: full, updatedAt: new Date() } });
  }
  log("admin permissions", `${full.length} (${RESOURCES.length} resources x ${ACTIONS.length} actions)`);

  console.log(`\ndone${DRY_RUN ? " (nothing written)" : ""}\n`);
  await client.close();
}

main().catch((err) => {
  console.error("alignment failed:", err);
  process.exit(1);
});
