import { randomBytes } from "crypto";
import type { Logger } from "pino";
import type { User } from "../domain/entity/user";
import { createUser } from "../domain/entity/user";
import { CLIENT_DEFAULT_PERMISSIONS } from "../domain/entity/default-permissions.js";

// ---------------------------------------------------------------------------
// Port interfaces
// ---------------------------------------------------------------------------

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
}

export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}

export interface TokenService {
  generateAccessToken(user: User): Promise<string> | string;
  generateRefreshToken(user: User): Promise<string> | string;
  verifyRefreshToken(token: string): Promise<{ userId: string }> | { userId: string };
}

export interface EmailService {
  sendWelcome(email: string, firstName: string): Promise<void>;
  sendPasswordReset(email: string, token: string): Promise<void>;
  send(to: string, subject: string, body: string): Promise<void>;
}

export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface EventPublisher {
  publish(topic: string, payload: unknown): Promise<void>;
}

// ---------------------------------------------------------------------------
// Input / output types
// ---------------------------------------------------------------------------

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: User["role"];
  phone?: string;
  company?: string;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: User;
  tokens: AuthTokens;
}

// ---------------------------------------------------------------------------
// Custom errors
// ---------------------------------------------------------------------------

export class InvalidCredentialsError extends Error {
  constructor(message = "Invalid email or password") {
    super(message);
    this.name = "InvalidCredentialsError";
  }
}

export class UserExistsError extends Error {
  constructor(email: string) {
    super(`A user with email "${email}" already exists`);
    this.name = "UserExistsError";
  }
}

export class UserInactiveError extends Error {
  constructor(userId: string) {
    super(`User "${userId}" is inactive`);
    this.name = "UserInactiveError";
  }
}

export class InvalidTokenError extends Error {
  constructor(message = "The provided token is invalid or expired") {
    super(message);
    this.name = "InvalidTokenError";
  }
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
    private readonly cache: CacheService,
    private readonly events: EventPublisher,
    private readonly logger: Logger,
  ) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    this.logger.info({ email: input.email }, "Registering new user");

    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw new UserExistsError(input.email);
    }

    const passwordHash = await this.hasher.hash(input.password);

    const role = input.role ?? "client";
    const user = createUser({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role,
      // Self-register must not land with empty permissions (fail-closed UI).
      permissions: role === "client" ? [...CLIENT_DEFAULT_PERMISSIONS] : [],
      phone: input.phone,
      company: input.company,
    });

    const created = await this.userRepo.create(user);

    const tokens = await this.generateTokens(created);

    await this.events.publish("user.registered", {
      userId: created.id,
      email: created.email,
      role: created.role,
    });

    this.emailService
      .sendWelcome(created.email, created.firstName)
      .catch((err) =>
        this.logger.error({ err, email: created.email }, "Failed to send welcome email"),
      );

    this.logger.info({ userId: created.id }, "User registered successfully");
    return { user: created, tokens };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    this.logger.info({ email }, "Login attempt");

    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    if (!user.isActive) {
      throw new UserInactiveError(user.id);
    }

    const valid = await this.hasher.compare(password, user.passwordHash);
    if (!valid) {
      throw new InvalidCredentialsError();
    }

    const updated = await this.userRepo.update(user.id, {
      lastLoginAt: new Date(),
    });

    const tokens = await this.generateTokens(updated);

    this.logger.info({ userId: updated.id }, "User logged in");
    return { user: updated, tokens };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    this.logger.debug("Refreshing token");

    let payload: { userId: string };
    try {
      payload = await this.tokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new InvalidTokenError();
    }

    const user = await this.userRepo.findById(payload.userId);
    if (!user) {
      throw new InvalidTokenError("User associated with token not found");
    }

    if (!user.isActive) {
      throw new UserInactiveError(user.id);
    }

    return this.generateTokens(user);
  }

  async getProfile(userId: string): Promise<User | null> {
    return this.userRepo.findById(userId);
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<User | null> {
    const user = await this.userRepo.findById(userId);
    if (!user) return null;

    return this.userRepo.update(userId, input);
  }

  /**
   * Issues a one-time reset token (1h TTL). Always resolves — does not reveal
   * whether the email exists.
   */
  async requestPasswordReset(email: string): Promise<void> {
    const normalized = email.trim().toLowerCase();
    this.logger.info({ email: normalized }, "Password reset requested");

    const user = await this.userRepo.findByEmail(normalized);
    if (!user || !user.isActive) {
      return;
    }

    const token = randomBytes(32).toString("hex");
    await this.cache.set(`pwdreset:${token}`, { userId: user.id }, 60 * 60);

    try {
      await this.emailService.sendPasswordReset(user.email, token);
    } catch (err) {
      this.logger.error({ err, email: user.email }, "Failed to send password reset email");
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const cached = await this.cache.get<{ userId: string }>(`pwdreset:${token}`);
    if (!cached?.userId) {
      throw new InvalidTokenError("Password reset token is invalid or expired");
    }

    const user = await this.userRepo.findById(cached.userId);
    if (!user || !user.isActive) {
      throw new InvalidTokenError("Password reset token is invalid or expired");
    }

    const passwordHash = await this.hasher.hash(newPassword);
    await this.userRepo.update(user.id, { passwordHash });
    await this.cache.delete(`pwdreset:${token}`);

    this.logger.info({ userId: user.id }, "Password reset completed");
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private async generateTokens(user: User): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(user),
      this.tokenService.generateRefreshToken(user),
    ]);
    return { accessToken, refreshToken };
  }
}
