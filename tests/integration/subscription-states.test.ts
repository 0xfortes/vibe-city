import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(),
}));

vi.mock('@/lib/agents', () => ({
  runDebate: vi.fn(),
}));

vi.mock('@/lib/security', () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true, retryAfterSeconds: 0 }),
  sanitizeInput: vi.fn((s: string) => s),
  RATE_LIMITS: {
    debate: { maxRequests: 10, windowMs: 3600000 },
    followUp: { maxRequests: 30, windowMs: 3600000 },
  },
}));

import { POST } from '@/app/api/council/route';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { runDebate } from '@/lib/agents';

function makeRequest(): Request {
  return new Request('http://localhost:3000/api/council', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cityId: 'tokyo', mood: 'chaos' }),
  });
}

function mockSupabase(subscriptionStatus: string | null, freeDebatesUsed: number) {
  const supabaseMock = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@test.com' } },
        error: null,
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              subscription_status: subscriptionStatus,
              free_debates_used: freeDebatesUsed,
            },
            error: null,
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'debate-1' }, error: null }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
  };

  vi.mocked(createServerSupabaseClient).mockResolvedValue(supabaseMock as never);
}

async function* mockDebateGenerator() {
  yield { type: 'complete' };
}

describe('Subscription State Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(runDebate).mockReturnValue(mockDebateGenerator());
  });

  it('active subscription — full access', async () => {
    mockSupabase('active', 5);
    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
  });

  it('trialing subscription — full access', async () => {
    mockSupabase('trialing', 5);
    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
  });

  it('past_due — blocked (no grace period)', async () => {
    mockSupabase('past_due', 1);
    const res = await POST(makeRequest());
    expect(res.status).toBe(403);
  });

  it('canceled — blocked', async () => {
    mockSupabase('canceled', 1);
    const res = await POST(makeRequest());
    expect(res.status).toBe(403);
  });

  it('incomplete — blocked', async () => {
    mockSupabase('incomplete', 1);
    const res = await POST(makeRequest());
    expect(res.status).toBe(403);
  });

  it('incomplete_expired — blocked', async () => {
    mockSupabase('incomplete_expired', 1);
    const res = await POST(makeRequest());
    expect(res.status).toBe(403);
  });

  it('unpaid — blocked', async () => {
    mockSupabase('unpaid', 1);
    const res = await POST(makeRequest());
    expect(res.status).toBe(403);
  });

  it('null (no subscription) with 0 debates — 1 free debate allowed', async () => {
    mockSupabase(null, 0);
    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
  });

  it('null (no subscription) with 1 debate used — blocked', async () => {
    mockSupabase(null, 1);
    const res = await POST(makeRequest());
    expect(res.status).toBe(403);
  });
});
