import "server-only";
// Lightweight in-memory rate limiter — protects login + future plugin
// public ingest endpoints from trivial brute-force.
//
// Process-local: resets on cold starts and isn't shared across serverless
// instances. Good enough to slow simple attacks; production-grade
// distributed rate limiting will switch to a KV/Redis-backed counter
// when the storage layer adds the kv backend.

interface Bucket { count: number; resetAt: number }

const buckets = new Map<string, Bucket>();

function gc(now: number) {
  if (buckets.size < 1000) return;
  for (const [k, b] of buckets) {
    if (b.resetAt < now) buckets.delete(k);
  }
}

export interface RateLimitOpts { key: string; max: number; windowMs: number }

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSec: number;
}

export function rateLimit({ key, max, windowMs }: RateLimitOpts): RateLimitResult {
  const now = Date.now();
  gc(now);
  const existing = buckets.get(key);
  if (!existing || existing.resetAt < now) {
    const next: Bucket = { count: 1, resetAt: now + windowMs };
    buckets.set(key, next);
    return { allowed: true, remaining: max - 1, resetAt: next.resetAt, retryAfterSec: 0 };
  }
  if (existing.count >= max) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  existing.count += 1;
  return { allowed: true, remaining: max - existing.count, resetAt: existing.resetAt, retryAfterSec: 0 };
}

export function clientIpFromHeaders(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  return "anonymous";
}
