/**
 * Simple in-memory rate limiter
 * For production, use Redis instead
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Rate limit: max 5 attempts per 15 minutes per IP
 */
export function checkRateLimit(
  ip: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(ip);

  // If entry expired or doesn't exist, reset
  if (!entry || entry.resetTime < now) {
    store.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  // Increment count
  entry.count++;

  if (entry.count > maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: maxAttempts - entry.count };
}

/**
 * Cleanup old entries every hour
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetTime < now) {
      store.delete(key);
    }
  }
}, 60 * 60 * 1000);
