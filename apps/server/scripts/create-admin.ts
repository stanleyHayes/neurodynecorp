/**
 * Creates or updates a single admin user on whichever database is configured.
 *
 * This is the counterpart to seed.ts, and the distinction matters:
 *
 *   seed.ts         drops every collection, fills it with demo data, and
 *                   refuses to run anywhere but localhost.
 *   create-admin.ts touches exactly one user, destroys nothing, and is safe
 *                   against production — which is the only way to get a real
 *                   account onto a deployed database.
 *
 * The password is never read from a file in this repository. It comes from the
 * environment or an interactive prompt, is hashed with the same hasher the
 * application uses, and is never printed back.
 *
 *   NEURODYNE_ADMIN_EMAIL=you@example.com \
 *   NEURODYNE_ADMIN_PASSWORD='...' \
 *   pnpm --filter @neurodyne/server exec tsx scripts/create-admin.ts
 *
 * Or pass --email and be prompted for the password, which keeps it out of your
 * shell history:
 *
 *   tsx scripts/create-admin.ts --email you@example.com
 *
 * Re-running with the same email resets that account's password and re-grants
 * the admin role. It never creates a duplicate.
 */
import { createInterface } from "readline";
import { loadConfig } from "../src/config/index.js";
import { MongoDBClient } from "../src/adapter/driven/mongodb/client.js";
import { MongoUserRepository } from "../src/adapter/driven/mongodb/user-repository.js";
import { MongoRoleRepository } from "../src/adapter/driven/mongodb/role-repository.js";
import { BcryptPasswordHasher } from "../src/adapter/driven/auth/password.js";
import type { User } from "../src/domain/entity/user.js";
import { ObjectId } from "mongodb";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

/** Reads a line without echoing it, so the password never reaches the terminal. */
function promptHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const stdout = process.stdout as NodeJS.WriteStream & { _writeToOutput?: (s: string) => void };
    const original = (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput;
    (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = function (s: string) {
      if (s.includes(question)) original.call(rl, s);
    };
    void stdout;
    rl.question(question, (answer) => {
      (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = original;
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

/**
 * The bar is deliberately low and mechanical — length and variety only. A
 * script is the wrong place to opine on password quality, but silently
 * accepting "admin" would be worse.
 */
function rejectIfObviouslyWeak(password: string): string | null {
  if (password.length < 12) return "must be at least 12 characters";
  if (!/[a-z]/.test(password)) return "needs a lowercase letter";
  if (!/[A-Z]/.test(password)) return "needs an uppercase letter";
  if (!/[0-9]/.test(password)) return "needs a digit";
  return null;
}

async function main(): Promise<void> {
  const email = (arg("email") ?? process.env.NEURODYNE_ADMIN_EMAIL ?? "").trim().toLowerCase();
  const firstName = arg("first-name") ?? process.env.NEURODYNE_ADMIN_FIRST_NAME ?? "Admin";
  const lastName = arg("last-name") ?? process.env.NEURODYNE_ADMIN_LAST_NAME ?? "User";

  if (!email || !email.includes("@")) {
    console.error("\n  --email (or NEURODYNE_ADMIN_EMAIL) is required.\n");
    process.exit(1);
  }

  let password = process.env.NEURODYNE_ADMIN_PASSWORD ?? "";
  if (!password) {
    password = await promptHidden(`  Password for ${email}: `);
  }

  const weak = rejectIfObviouslyWeak(password);
  if (weak) {
    console.error(`\n  Refusing: the password ${weak}.\n`);
    process.exit(1);
  }

  const config = loadConfig();
  const mongoClient = new MongoDBClient({
    uri: config.mongodb.uri,
    database: config.mongodb.database,
  });
  await mongoClient.connect();

  const users = new MongoUserRepository(mongoClient);
  const roles = new MongoRoleRepository(mongoClient);
  const hasher = new BcryptPasswordHasher();

  // Permissions come from the admin role rather than a list in this file, so a
  // bootstrapped admin has exactly what the application grants an admin — not a
  // second definition that drifts from it.
  const adminRole = await roles.findByName("admin");
  if (!adminRole) {
    console.error(
      "\n  No 'admin' role exists in this database yet.\n" +
        "  Roles are created by seeding. On an empty production database, seed a\n" +
        "  local copy first and restore it, or insert the role before running this.\n",
    );
    process.exit(1);
  }

  const passwordHash = await hasher.hash(password);
  const existing = await users.findByEmail(email);
  const now = new Date();

  if (existing) {
    await users.update({
      ...existing,
      passwordHash,
      role: "admin",
      roleId: adminRole.id,
      permissions: adminRole.permissions,
      isActive: true,
      updatedAt: now,
    });
    console.log(`\n  Updated ${email}: password reset, admin role re-granted.\n`);
  } else {
    const user: User = {
      id: new ObjectId().toHexString(),
      email,
      passwordHash,
      firstName,
      lastName,
      role: "admin",
      roleId: adminRole.id,
      permissions: adminRole.permissions,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    await users.create(user);
    console.log(`\n  Created ${email} as an admin.\n`);
  }

  await mongoClient.close();
}

main().catch((err) => {
  console.error("\n  Failed:", err instanceof Error ? err.message : err, "\n");
  process.exit(1);
});
