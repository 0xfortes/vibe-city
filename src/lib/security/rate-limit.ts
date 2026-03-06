interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

function getStore(namespace: string): Map<string, RateLimitEntry> {
  let store = stores.get(namespace);
  if (!store) {
    store = new Map();
    stores.set(namespace, store);
  }
  return store;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the window resets — used for Retry-After header */
  retryAfterSeconds: number;
}

/**
 * In-memory rate limiter keyed by user ID.
 * Uses a sliding window approach with configurable limits.
 *
 * Note: This resets on server restart and is per-process.
 * Upgrade to Upstash Redis in Phase 4 for multi-instance support.
 */
export function checkRateLimit(
  namespace: string,
  userId: string,
  config: RateLimitConfig,
): RateLimitResult {
  const store = getStore(namespace);
  const now = Date.now();
  const entry = store.get(userId);

  // Clean expired entry
  if (entry && now >= entry.resetAt) {
    store.delete(userId);
  }

  const current = store.get(userId);

  if (!current) {
    store.set(userId, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= config.maxRequests) {
    const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(retryAfterSeconds, 1) };
  }

  current.count++;
  return { allowed: true, retryAfterSeconds: 0 };
}

// Rate limit presets per SECURITY.md
export const RATE_LIMITS = {
  debate: { maxRequests: 10, windowMs: 60 * 60 * 1000 },       // 10/hour
  followUp: { maxRequests: 30, windowMs: 60 * 60 * 1000 },     // 30/hour
  checkout: { maxRequests: 10, windowMs: 60 * 60 * 1000 },     // 10/hour
} as const;
