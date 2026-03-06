import { describe, it, expect, beforeEach, vi } from 'vitest';

// Reset module state between tests to clear the in-memory stores
beforeEach(async () => {
  vi.resetModules();
});

// Helper to get a fresh checkRateLimit for isolated tests
async function getFreshRateLimit() {
  const mod = await import('@/lib/security/rate-limit');
  return mod.checkRateLimit;
}

const config = { maxRequests: 3, windowMs: 60_000 };

describe('checkRateLimit', () => {
  it('allows first request', async () => {
    const rl = await getFreshRateLimit();
    const result = rl('test', 'user1', config);
    expect(result.allowed).toBe(true);
    expect(result.retryAfterSeconds).toBe(0);
  });

  it('allows requests up to maxRequests', async () => {
    const rl = await getFreshRateLimit();
    rl('test', 'user1', config);
    rl('test', 'user1', config);
    const result = rl('test', 'user1', config);
    expect(result.allowed).toBe(true);
  });

  it('blocks request at maxRequests + 1', async () => {
    const rl = await getFreshRateLimit();
    rl('test', 'user1', config);
    rl('test', 'user1', config);
    rl('test', 'user1', config);
    const result = rl('test', 'user1', config);
    expect(result.allowed).toBe(false);
  });

  it('returns retryAfterSeconds when blocked', async () => {
    const rl = await getFreshRateLimit();
    rl('test', 'user1', config);
    rl('test', 'user1', config);
    rl('test', 'user1', config);
    const result = rl('test', 'user1', config);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
    expect(result.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it('resets counter after window expires', async () => {
    const rl = await getFreshRateLimit();
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);

    rl('test', 'user1', config);
    rl('test', 'user1', config);
    rl('test', 'user1', config);

    // Move time past the window
    vi.spyOn(Date, 'now').mockReturnValue(now + 61_000);
    const result = rl('test', 'user1', config);
    expect(result.allowed).toBe(true);

    vi.restoreAllMocks();
  });

  it('isolates different namespaces', async () => {
    const rl = await getFreshRateLimit();
    rl('namespace-a', 'user1', config);
    rl('namespace-a', 'user1', config);
    rl('namespace-a', 'user1', config);

    // Same user, different namespace — should be allowed
    const result = rl('namespace-b', 'user1', config);
    expect(result.allowed).toBe(true);
  });

  it('isolates different userIds', async () => {
    const rl = await getFreshRateLimit();
    rl('test', 'user1', config);
    rl('test', 'user1', config);
    rl('test', 'user1', config);

    // Different user — should be allowed
    const result = rl('test', 'user2', config);
    expect(result.allowed).toBe(true);
  });
});
