// ── Cache ─────────────────────────────────────────────────────────────────────

export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

// ── Events ───────────────────────────────────────────────────────────────────

export interface EventPublisher {
  publish(topic: string, payload: unknown): Promise<void>;
}

export interface EventSubscriber {
  subscribe(
    topic: string,
    handler: (payload: unknown) => Promise<void>,
  ): Promise<void>;
  close(): Promise<void>;
}

// ── File Storage ─────────────────────────────────────────────────────────────

export interface FileStorage {
  upload(
    file: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<{ url: string; publicId: string }>;
  delete(publicId: string): Promise<void>;
  getURL(publicId: string): string;
}

// ── Email ────────────────────────────────────────────────────────────────────

export interface EmailService {
  sendEmail(to: string, subject: string, html: string): Promise<void>;
  sendTemplateEmail(
    to: string,
    templateId: string,
    variables: Record<string, string>,
  ): Promise<void>;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}

export interface TokenClaims {
  userId: string;
  email: string;
  role: string;
}

export interface TokenService {
  generateAccessToken(claims: TokenClaims): string;
  generateRefreshToken(claims: TokenClaims): string;
  validateAccessToken(token: string): TokenClaims;
  validateRefreshToken(token: string): TokenClaims;
}

// ── Payments ─────────────────────────────────────────────────────────────────

export interface PaymentGateway {
  createPaymentIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, string>,
  ): Promise<{ clientSecret: string; paymentIntentId: string }>;
  confirmPayment(paymentIntentId: string): Promise<boolean>;
  getPaymentStatus(
    paymentIntentId: string,
  ): Promise<"pending" | "succeeded" | "failed" | "cancelled">;
}
