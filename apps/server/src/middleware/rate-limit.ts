import type { Request, Response, NextFunction } from "express";

/**
 * Lightweight in-memory sliding-window rate limiter for public endpoints
 * (intake, document-intelligence demo, feedback, newsletter, consent).
 *
 * Intentionally dependency-free so it works without Redis. For multi-instance
 * deployments a Redis-backed limiter can be swapped in behind the same factory
 * signature without touching call sites — the ports-and-adapters way.
 */

interface RateLimitOptions {
  /** Max requests allowed within the window. */
  max: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** Optional key resolver. Defaults to client IP. */
  keyFn?: (req: Request) => string;
  /** Message returned on 429. */
  message?: string;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const stores = new Map<string, Map<string, Bucket>>();

/**
 * Prefer Express `req.ip` (honours `trust proxy` when configured).
 * Do not trust a bare spoofed X-Forwarded-For when the app is not behind a
 * trusted proxy — that lets attackers rotate keys and bypass limits.
 */
function clientIp(req: Request): string {
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}

export function rateLimit(name: string, options: RateLimitOptions) {
  const { max, windowMs, keyFn = clientIp, message = "Too many requests. Please slow down." } = options;
  if (!stores.has(name)) stores.set(name, new Map());
  const store = stores.get(name)!;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyFn(req);
    const now = Date.now();
    const bucket = store.get(key);

    if (!bucket || bucket.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", String(max - 1));
      next();
      return;
    }

    if (bucket.count >= max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      res.setHeader("X-RateLimit-Limit", String(max));
      res.setHeader("X-RateLimit-Remaining", "0");
      res.status(429).json({ error: message, retryAfter });
      return;
    }

    bucket.count += 1;
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - bucket.count)));
    next();
  };
}

/**
 * Honeypot guard. Public forms include a hidden field (default `website`) that
 * real users never fill. If a bot fills it, we accept the request (200) but
 * silently drop it, so the bot gets no signal. Returns true if the request
 * was a bot and has been handled.
 */
export function isHoneypotTriggered(req: Request, field = "website"): boolean {
  const value = (req.body ?? {})[field];
  return typeof value === "string" && value.trim().length > 0;
}

/** Periodically evict expired buckets to bound memory. */
const sweeper = setInterval(() => {
  const now = Date.now();
  for (const store of stores.values()) {
    for (const [key, bucket] of store.entries()) {
      if (bucket.resetAt <= now) store.delete(key);
    }
  }
}, 60_000);
// Don't keep the process alive solely for the sweeper.
if (typeof sweeper.unref === "function") sweeper.unref();
