import { describe, it } from "node:test";
import assert from "node:assert";
import { AuthService } from "./auth-service.js";
import { createUser } from "../domain/entity/user.js";

describe("AuthService", () => {
  const mockUserRepo = {
    findById: async () => null,
    findByEmail: async () => null,
    create: async (u: any) => ({ ...u, id: "u1" }),
    update: async (u: any) => u,
  };

  const mockHasher = {
    hash: async (pwd: string) => `hashed_${pwd}`,
    compare: async (pwd: string, hash: string) => hash === `hashed_${pwd}`,
  };

  const mockTokenService = {
    generateAccessToken: () => "access-token",
    generateRefreshToken: () => "refresh-token",
    validateAccessToken: () => ({ userId: "u1", role: "client" }),
    validateRefreshToken: () => ({ userId: "u1", role: "client" }),
  };

  const mockEmail = {
    sendWelcome: async () => {},
    sendPasswordReset: async () => {},
    sendEmail: async () => {},
  };

  const mockCache = { get: async () => null, set: async () => {}, del: async () => {} };
  const mockEvents = { publish: async () => {}, connect: async () => {}, close: async () => {} };
  const mockLogger = { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} };

  const auth = new AuthService(
    mockUserRepo as any,
    mockHasher as any,
    mockTokenService as any,
    mockEmail as any,
    mockCache as any,
    mockEvents as any,
    mockLogger as any,
  );

  it("registers a new user and returns tokens", async () => {
    mockUserRepo.findByEmail = async () => null;
    mockUserRepo.create = async (u: any) => ({ ...u, id: "u1" });

    const result = (await auth.register({
      email: "test@example.com",
      password: "Password123!",
      firstName: "Test",
      lastName: "User",
    })) as any;

    assert.strictEqual(result.tokens.accessToken, "access-token");
    assert.strictEqual(result.tokens.refreshToken, "refresh-token");
  });

  it("throws on duplicate registration", async () => {
    const existing = createUser({ email: "dup@example.com", passwordHash: "x", firstName: "Dup", lastName: "User" });
    mockUserRepo.findByEmail = async () => existing;

    await assert.rejects(
      async () =>
        auth.register({ email: "dup@example.com", password: "Pass123!", firstName: "Dup", lastName: "User" }),
      /already exists/,
    );
  });
});
