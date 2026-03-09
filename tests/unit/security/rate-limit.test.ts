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

  it('11-request boundary test: allows exactly maxRequests then blocks', async () => {
    const rl = await getFreshRateLimit();
    const highConfig = { maxRequests: 10, windowMs: 60_000 };

    // Requests 1-10 should all be allowed
    for (let i = 0; i < 10; i++) {
      const result = rl('boundary', 'user1', highConfig);
      expect(result.allowed, `request ${i + 1} should be allowed`).toBe(true);
    }

    // Request 11 should be blocked
    const blocked = rl('boundary', 'user1', highConfig);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('retryAfterSeconds decreases as time passes', async () => {
    const rl = await getFreshRateLimit();
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);

    rl('test', 'user1', config);
    rl('test', 'user1', config);
    rl('test', 'user1', config);

    const result1 = rl('test', 'user1', config);
    expect(result1.allowed).toBe(false);

    // Move 30 seconds forward — retryAfter should decrease
    vi.spyOn(Date, 'now').mockReturnValue(now + 30_000);
    const result2 = rl('test', 'user1', config);
    expect(result2.allowed).toBe(false);
    expect(result2.retryAfterSeconds).toBeLessThanOrEqual(31);
    expect(result2.retryAfterSeconds).toBeGreaterThan(0);

    vi.restoreAllMocks();
  });
});

describe('RATE_LIMITS presets', () => {
  it('has pro presets with higher limits than free', async () => {
    const mod = await import('@/lib/security/rate-limit');
    const limits = mod.RATE_LIMITS;

    expect(limits.debatePro.maxRequests).toBeGreaterThan(limits.debate.maxRequests);
    expect(limits.followUpPro.maxRequests).toBeGreaterThan(limits.followUp.maxRequests);
  });

  it('pro debate allows 100/hour', async () => {
    const mod = await import('@/lib/security/rate-limit');
    expect(mod.RATE_LIMITS.debatePro.maxRequests).toBe(100);
    expect(mod.RATE_LIMITS.debatePro.windowMs).toBe(60 * 60 * 1000);
  });

  it('pro follow-up allows 200/hour', async () => {
    const mod = await import('@/lib/security/rate-limit');
    expect(mod.RATE_LIMITS.followUpPro.maxRequests).toBe(200);
    expect(mod.RATE_LIMITS.followUpPro.windowMs).toBe(60 * 60 * 1000);
  });
});
