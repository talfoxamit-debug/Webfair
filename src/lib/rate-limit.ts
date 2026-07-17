/**
 * Best-effort in-memory rate limiter for public API routes. Fixed window per
 * key (usually per client IP). This is per serverless instance, not global, so
 * it throttles bursts on a warm instance rather than enforcing a hard cluster
 * wide cap; a durable store (for example Upstash Redis) would be needed for
 * strict global limits. It is still enough to blunt scripted abuse and cost
 * amplification on the unauthenticated endpoints.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for") || "";
  const first = xff.split(",")[0].trim();
  return first || req.headers.get("x-real-ip") || "unknown";
}

/** Returns true if the request is allowed, false if the limit is exceeded. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  // Cheap opportunistic cleanup so the map cannot grow unbounded.
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (now > b.resetAt) buckets.delete(k);
  }
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count += 1;
  return true;
}
