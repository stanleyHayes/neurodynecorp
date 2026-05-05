import type { Logger } from "pino";
import type { UserRepository, EmailService } from "./auth-service";
import { createUser } from "../domain/entity/user";
import type { User } from "../domain/entity/user";

// ---------------------------------------------------------------------------
// Port interfaces
// ---------------------------------------------------------------------------

export interface TokenService {
  generateSetupToken(email: string, projectId: string): Promise<string>;
  verifySetupToken(token: string): Promise<{ email: string; projectId: string }>;
}

export interface PasswordHasher {
  hash(plain: string): Promise<string>;
}

// ---------------------------------------------------------------------------
// Custom errors
// ---------------------------------------------------------------------------

export class InvalidSetupTokenError extends Error {
  constructor(message = "The setup token is invalid or expired") {
    super(message);
    this.name = "InvalidSetupTokenError";
  }
}

export class UserAlreadySetupError extends Error {
  constructor(email: string) {
    super(`User "${email}" has already completed setup`);
    this.name = "UserAlreadySetupError";
  }
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class OnboardingService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly hasher: PasswordHasher,
    private readonly logger: Logger,
  ) {}

  async sendInvitation(email: string, projectId: string): Promise<void> {
    this.logger.info({ email, projectId }, "Sending client invitation");

    const setupToken = await this.tokenService.generateSetupToken(email, projectId);

    await this.emailService.send(
      email,
      "You've been invited to NeuroDyne Corp",
      `You have been invited to collaborate on a project. Use this link to set up your account: ${setupToken}`,
    );

    this.logger.info({ email, projectId }, "Invitation sent");
  }

  async completeSetup(
    token: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<User> {
    this.logger.info("Processing account setup");

    let payload: { email: string; projectId: string };
    try {
      payload = await this.tokenService.verifySetupToken(token);
    } catch {
      throw new InvalidSetupTokenError();
    }

    const existing = await this.userRepo.findByEmail(payload.email);
    if (existing) {
      throw new UserAlreadySetupError(payload.email);
    }

    const passwordHash = await this.hasher.hash(password);

    const user = createUser({
      email: payload.email,
      passwordHash,
      firstName,
      lastName,
      role: "client",
    });

    const created = await this.userRepo.create(user);

    this.emailService
      .sendWelcome(created.email, created.firstName)
      .catch((err) =>
        this.logger.error({ err, email: created.email }, "Failed to send welcome email"),
      );

    this.logger.info({ userId: created.id, email: created.email }, "Account setup completed");
    return created;
  }
}
