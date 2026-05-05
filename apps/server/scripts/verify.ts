import { loadConfig } from "../src/config/index.js";
import { MongoClient } from "mongodb";

async function main() {
  const config = loadConfig();
  const c = new MongoClient(config.mongodb.uri);
  await c.connect();
  const db = c.db(config.mongodb.database);

  const cols = await db.listCollections().toArray();
  for (const col of cols) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`${col.name}: ${count}`);
  }

  const user = await db.collection("users").findOne();
  if (user) {
    console.log("\nSample user:");
    console.log("  email:", user.email);
    console.log("  role:", user.role);
    console.log("  role_id:", user.role_id ?? "NONE");
    console.log("  permissions:", user.permissions?.length ?? "NONE");
  }

  await c.close();
}

main().catch(console.error);
