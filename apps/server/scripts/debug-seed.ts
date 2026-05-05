import { users, roles } from "../src/adapter/driven/mongodb/seed-data.js";

console.log("Roles count:", roles.length);
console.log("Users count:", users.length);

if (users.length > 0) {
  const u = users[0];
  console.log("\nFirst user:");
  console.log("  email:", u.email);
  console.log("  role:", u.role);
  console.log("  roleId:", u.roleId);
  console.log("  permissions count:", u.permissions?.length);
  console.log("  isActive:", u.isActive);
} else {
  console.log("NO USERS IN SEED DATA");
}
