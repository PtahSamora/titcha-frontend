/**
 * In-memory rate limiter using token bucket algorithm
 * For production, use Redis or a dedicated rate limiting service
 */

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, TokenBucket>();

/**
 * Check if request is within rate limit
 * @param key - Unique identifier (e.g., userId, IP)
 * @param limit - Maximum number of requests
 * @param windowMs - Time window in milliseconds
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket) {
    // Create new bucket
    bucket = {
      tokens: limit - 1,
      lastRefill: now,
    };
    buckets.set(key, bucket);
    return true;
  }

  // Calculate how many tokens to refill
  const timePassed = now - bucket.lastRefill;
  const refillRate = limit / windowMs;
  const tokensToAdd = Math.floor(timePassed * refillRate);

  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(limit, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  // Check if we have tokens available
  if (bucket.tokens > 0) {
    bucket.tokens--;
    return true;
  }

  return false;
}

/**
 * Get remaining tokens for a key
 */
export function getRemainingTokens(key: string, limit: number): number {
  const bucket = buckets.get(key);
  if (!bucket) return limit;
  return Math.max(0, bucket.tokens);
}

/**
 * Reset rate limit for a key
 */
export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

/**
 * Clear all rate limit data (useful for testing)
 */
export function clearAllRateLimits(): void {
  buckets.clear();
}

/**
 * Clean up old buckets periodically to prevent memory leaks
 * Run this in a background interval
 */
export function cleanupOldBuckets(maxAgeMs: number = 3600000): void {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.lastRefill > maxAgeMs) {
      buckets.delete(key);
    }
  }
}

// Cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(() => cleanupOldBuckets(), 3600000);
}
