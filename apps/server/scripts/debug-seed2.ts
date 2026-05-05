import { MongoClient } from "mongodb";
import { users } from "../src/adapter/driven/mongodb/seed-data.js";

async function main() {
  const c = new MongoClient("mongodb://localhost:27017");
  await c.connect();
  const db = c.db("neurodyne");

  console.log("Users to insert:", users.length);

  // Try inserting each user manually to see which fails
  for (const user of users) {
    try {
      const doc = {
        _id: user.id, // This might be the issue - should be ObjectId
        email: user.email,
        password_hash: user.passwordHash,
        first_name: user.firstName,
        last_name: user.lastName,
        role: user.role,
        role_id: user.roleId,
        permissions: user.permissions,
        avatar: user.avatar,
        phone: user.phone,
        company: user.company,
        is_active: user.isActive,
        last_login_at: user.lastLoginAt,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
      };
      await db.collection("users").insertOne(doc as any);
      console.log(`  OK: ${user.email}`);
    } catch (err: any) {
      console.log(`  FAIL: ${user.email} - ${err.message} (code: ${err.code})`);
    }
  }

  const count = await db.collection("users").countDocuments();
  console.log("\nTotal users in DB:", count);
  await c.close();
}

main().catch(console.error);
