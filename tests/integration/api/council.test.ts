import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock all external deps before importing route
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
import { checkRateLimit, sanitizeInput } from '@/lib/security';

function makeRequest(body: unknown): Request {
  return new Request('http://localhost:3000/api/council', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function mockSupabase(overrides: { user?: unknown | null; profile?: unknown } = {}) {
  const user = 'user' in overrides ? overrides.user : { id: 'user-1', email: 'test@test.com' };
  const profile = overrides.profile ?? { subscription_status: 'active', free_debates_used: 0 };

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
  return supabaseMock;
}

async function* mockDebateGenerator() {
  yield { type: 'agent_start', agentId: 'nightowl', agentName: 'The Nightowl' };
  yield {
    type: 'agent_done',
    agentId: 'nightowl',
    message: {
      agentId: 'nightowl',
      agentName: 'The Nightowl',
      agentEmoji: '🦉',
      content: 'Golden Gai is the move.',
      reactions: [],
      venues: [],
    },
  };
  yield { type: 'complete' };
}

describe('POST /api/council', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: true, retryAfterSeconds: 0 });
    vi.mocked(runDebate).mockReturnValue(mockDebateGenerator());
  });

  it('returns 401 when unauthenticated', async () => {
    mockSupabase({ user: null });
    const res = await POST(makeRequest({ cityId: 'tokyo', mood: 'chaos' }));
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid body (missing cityId)', async () => {
    mockSupabase();
    const res = await POST(makeRequest({ mood: 'chaos' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid mood', async () => {
    mockSupabase();
    const res = await POST(makeRequest({ cityId: 'tokyo', mood: 'invalid-mood' }));
    expect(res.status).toBe(400);
  });

  it('returns 404 for unknown city', async () => {
    mockSupabase();
    const res = await POST(makeRequest({ cityId: 'atlantis', mood: 'chaos' }));
    expect(res.status).toBe(404);
  });

  it('returns 403 (TRIAL_EXHAUSTED) when free user has used 1 debate', async () => {
    mockSupabase({
      profile: { subscription_status: null, free_debates_used: 1 },
    });
    const res = await POST(makeRequest({ cityId: 'tokyo', mood: 'chaos' }));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe('TRIAL_EXHAUSTED');
  });

  it('returns 429 when rate limited', async () => {
    mockSupabase();
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: false, retryAfterSeconds: 30 });
    const res = await POST(makeRequest({ cityId: 'tokyo', mood: 'chaos' }));
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('30');
  });

  it('returns SSE stream with correct Content-Type', async () => {
    mockSupabase();
    const res = await POST(makeRequest({ cityId: 'tokyo', mood: 'chaos' }));
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/event-stream');
    expect(res.headers.get('Cache-Control')).toBe('no-cache');
  });

  it('follow-up questions skip subscription gate', async () => {
    mockSupabase({
      profile: { subscription_status: null, free_debates_used: 1 },
    });
    const res = await POST(
      makeRequest({
        cityId: 'tokyo',
        mood: 'chaos',
        followUp: 'Tell me more about Golden Gai',
        previousMessages: [
          {
            agentId: 'nightowl',
            agentName: 'The Nightowl',
            agentEmoji: '🦉',
            content: 'Golden Gai is the move.',
            reactions: [],
            venues: [],
          },
        ],
      }),
    );
    // Should succeed (200 SSE stream), not 403
    expect(res.status).toBe(200);
  });

  it('sanitizes followUp input', async () => {
    mockSupabase();
    await POST(
      makeRequest({
        cityId: 'tokyo',
        mood: 'chaos',
        followUp: '<script>alert(1)</script>real question',
        previousMessages: [
          {
            agentId: 'nightowl',
            agentName: 'The Nightowl',
            agentEmoji: '🦉',
            content: 'test',
            reactions: [],
            venues: [],
          },
        ],
      }),
    );
    expect(sanitizeInput).toHaveBeenCalled();
  });
});
