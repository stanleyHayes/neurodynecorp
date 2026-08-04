import "dotenv/config";

export interface ServerConfig {
  port: number;
  host: string;
  environment: "development" | "staging" | "production";
  corsOrigins: string[];
}

export interface MongoDBConfig {
  uri: string;
  database: string;
}

export interface RedisConfig {
  url?: string;
  host: string;
  port: number;
  password?: string;
}

export interface KafkaConfig {
  brokers: string[];
  clientId: string;
  groupId: string;
}

export interface JWTConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
}

export interface CloudConfig {
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
}

export interface EmailConfig {
  resendApiKey: string;
  fromAddress: string;
}

export interface MetricsConfig {
  enabled: boolean;
  port: number;
}

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
}

export interface PaystackConfig {
  secretKey: string;
  webhookSecret: string;
}

export type PaymentProvider = "stripe" | "paystack";

export interface PaymentConfig {
  provider: PaymentProvider;
  stripe: StripeConfig;
  paystack: PaystackConfig;
}

export interface AppConfig {
  server: ServerConfig;
  mongodb: MongoDBConfig;
  redis: RedisConfig;
  kafka: KafkaConfig;
  jwt: JWTConfig;
  cloud: CloudConfig;
  email: EmailConfig;
  metrics: MetricsConfig;
  payment: PaymentConfig;
}

function env(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function envInt(key: string, fallback: number): number {
  const raw = process.env[key];
  return raw ? parseInt(raw, 10) : fallback;
}

function envBool(key: string, fallback: boolean): boolean {
  const raw = process.env[key];
  if (!raw) return fallback;
  return raw === "true" || raw === "1";
}

export function loadConfig(): AppConfig {
  return {
    server: {
      // Render and other PaaS providers assign the public HTTP port through
      // PORT. Keep NEURODYNE_PORT as the local/container fallback.
      port: envInt("PORT", envInt("NEURODYNE_PORT", 4000)),
      host: env("NEURODYNE_HOST", "0.0.0.0"),
      environment: env("NEURODYNE_ENV", "development") as ServerConfig["environment"],
      corsOrigins: env(
        "NEURODYNE_CORS_ORIGINS",
        // Dev defaults: allow all common Vite ports + any localhost variant
        "http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:5173,http://localhost:5174,http://localhost:5175"
      )
        .split(",")
        .map((s) => s.trim()),
    },
    mongodb: {
      uri: env("NEURODYNE_MONGODB_URI", "mongodb://localhost:27017"),
      database: env("NEURODYNE_MONGODB_DATABASE", "neurodyne"),
    },
    redis: {
      url: process.env["NEURODYNE_REDIS_URL"],
      host: env("NEURODYNE_REDIS_HOST", "localhost"),
      port: envInt("NEURODYNE_REDIS_PORT", 6379),
      password: process.env["NEURODYNE_REDIS_PASSWORD"],
    },
    kafka: {
      brokers: env("NEURODYNE_KAFKA_BROKERS", "localhost:9092")
        .split(",")
        .map((s) => s.trim()),
      clientId: env("NEURODYNE_KAFKA_CLIENT_ID", "neurodyne-server"),
      groupId: env("NEURODYNE_KAFKA_GROUP_ID", "neurodyne-group"),
    },
    jwt: {
      accessSecret: env("NEURODYNE_JWT_ACCESS_SECRET", "dev-access-secret-change-me"),
      refreshSecret: env("NEURODYNE_JWT_REFRESH_SECRET", "dev-refresh-secret-change-me"),
      accessExpiresIn: env("NEURODYNE_JWT_ACCESS_EXPIRES", "15m"),
      refreshExpiresIn: env("NEURODYNE_JWT_REFRESH_EXPIRES", "7d"),
    },
    cloud: {
      cloudinaryCloudName: env("NEURODYNE_CLOUDINARY_CLOUD_NAME", ""),
      cloudinaryApiKey: env("NEURODYNE_CLOUDINARY_API_KEY", ""),
      cloudinaryApiSecret: env("NEURODYNE_CLOUDINARY_API_SECRET", ""),
    },
    email: {
      resendApiKey: env("NEURODYNE_RESEND_API_KEY", ""),
      fromAddress: env("NEURODYNE_EMAIL_FROM", "noreply@neurodynecorp.com"),
    },
    metrics: {
      enabled: envBool("NEURODYNE_METRICS_ENABLED", true),
      port: envInt("NEURODYNE_METRICS_PORT", 9090),
    },
    payment: {
      provider: env("NEURODYNE_PAYMENT_PROVIDER", "paystack") as PaymentProvider,
      stripe: {
        secretKey: env("NEURODYNE_STRIPE_SECRET_KEY", ""),
        webhookSecret: env("NEURODYNE_STRIPE_WEBHOOK_SECRET", ""),
      },
      paystack: {
        secretKey: env("NEURODYNE_PAYSTACK_SECRET_KEY", ""),
        webhookSecret: env("NEURODYNE_PAYSTACK_WEBHOOK_SECRET", ""),
      },
    },
  };
}
