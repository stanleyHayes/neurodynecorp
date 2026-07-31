/**
 * Canonical user serialization for the HTTP surface.
 *
 * The rest of the API (projects, tasks, invoices) serializes to snake_case,
 * but the User entity used to pass straight through in camelCase. Both the
 * client portal and the admin console were written against snake_case, so
 * `user.first_name` came back `undefined` — names rendered blank and team
 * lists showed "undefined undefined".
 *
 * We emit BOTH casings: snake_case for consistency with the rest of the API,
 * camelCase retained so any existing consumer keeps working. The password
 * hash is never included.
 */

export function toApiUser(user: Record<string, unknown>): Record<string, unknown> {
  const { passwordHash: _passwordHash, ...safe } = user as Record<string, unknown>;

  return {
    ...safe,
    // snake_case aliases (what the client portal and admin console read)
    first_name: safe["firstName"],
    last_name: safe["lastName"],
    role_id: safe["roleId"],
    is_active: safe["isActive"],
    last_login_at: safe["lastLoginAt"],
    created_at: safe["createdAt"],
    updated_at: safe["updatedAt"],
  };
}
