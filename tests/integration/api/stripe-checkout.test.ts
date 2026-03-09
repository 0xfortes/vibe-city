import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(),
}));

vi.mock('@/lib/stripe', () => ({
  createCheckoutSession: vi.fn().mockResolvedValue('https://checkout.stripe.com/session-123'),
}));

vi.mock('@/lib/stripe/client', () => ({
  getStripeServer: vi.fn().mockReturnValue({
    customers: {
      retrieve: vi.fn().mockResolvedValue({ id: 'cus_existing', deleted: false }),
    },
  }),
}));

vi.mock('@/lib/security', () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true, retryAfterSeconds: 0 }),
  RATE_LIMITS: {
    checkout: { maxRequests: 10, windowMs: 3600000 },
  },
}));

import { POST } from '@/app/api/stripe/route';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/lib/stripe';
import { checkRateLimit } from '@/lib/security';

function makeRequest(body: unknown): Request {
  return new Request('http://localhost:3000/api/stripe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function mockSupabase(overrides: { user?: unknown | null; profile?: unknown } = {}) {
  const user = 'user' in overrides ? overrides.user : { id: 'user-1', email: 'test@test.com' };
  const profile = overrides.profile ?? { stripe_customer_id: null };

  const updateMock = vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: null }),
  });

  const supabaseMock = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: profile, error: null }),
        }),
      }),
      update: updateMock,
    }),
  };

  vi.mocked(createServerSupabaseClient).mockResolvedValue(supabaseMock as never);
  return supabaseMock;
}

describe('POST /api/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: true, retryAfterSeconds: 0 });
    vi.mocked(createCheckoutSession).mockResolvedValue('https://checkout.stripe.com/session-123');
  });

  it('returns 401 when unauthenticated', async () => {
    mockSupabase({ user: null });
    const res = await POST(makeRequest({ priceId: 'price_123' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 for missing priceId', async () => {
    mockSupabase();
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('returns 400 for empty priceId', async () => {
    mockSupabase();
    const res = await POST(makeRequest({ priceId: '' }));
    expect(res.status).toBe(400);
  });

  it('returns 429 when rate limited', async () => {
    mockSupabase();
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: false, retryAfterSeconds: 45 });
    const res = await POST(makeRequest({ priceId: 'price_123' }));
    expect(res.status).toBe(429);
  });

  it('returns checkout URL on success', async () => {
    mockSupabase();
    const res = await POST(makeRequest({ priceId: 'price_123' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.url).toBe('https://checkout.stripe.com/session-123');
  });

  it('reuses existing stripe_customer_id when available', async () => {
    mockSupabase({ profile: { stripe_customer_id: 'cus_existing' } });
    await POST(makeRequest({ priceId: 'price_123' }));

    expect(createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({ stripeCustomerId: 'cus_existing' }),
    );
  });

  it('passes null stripeCustomerId for new users', async () => {
    mockSupabase({ profile: { stripe_customer_id: null } });
    await POST(makeRequest({ priceId: 'price_123' }));

    expect(createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({ stripeCustomerId: null }),
    );
  });
});
