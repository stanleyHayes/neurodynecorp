import { loadConfig } from "../src/config/index.js";
import { MongoClient } from "mongodb";

async function main() {
  const config = loadConfig();
  const c = new MongoClient(config.mongodb.uri);
  await c.connect();
  const db = c.db(config.mongodb.database);

  console.log(`Connected to: ${config.mongodb.uri.replace(/\/\/[^@]+@/, "//***@")}`);
  console.log(`Database: ${config.mongodb.database}`);

  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    await db.collection(col.name).drop();
    console.log(`  Dropped: ${col.name} (${count} docs)`);
  }

  console.log("\nDatabase cleared. Restart the server to re-seed with fresh data.");
  await c.close();
}

main().catch(console.error);
