import Redis from "ioredis";
import type { CacheService } from "../../../domain/port/index.js";

export interface RedisCacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

export class RedisCacheService implements CacheService {
  private readonly redis: Redis;

  constructor(config: RedisCacheConfig) {
    this.redis = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db ?? 0,
      retryStrategy(times) {
        return Math.min(times * 50, 2000);
      },
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key);
    if (raw === null) {
      return null;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized =
      typeof value === "string" ? value : JSON.stringify(value);

    if (ttlSeconds !== undefined && ttlSeconds > 0) {
      await this.redis.set(key, serialized, "EX", ttlSeconds);
    } else {
      await this.redis.set(key, serialized);
    }
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }

  /** Gracefully close the Redis connection. */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}
