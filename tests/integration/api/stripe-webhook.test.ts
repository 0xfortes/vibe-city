import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/stripe', () => ({
  constructWebhookEvent: vi.fn(),
  handleWebhookEvent: vi.fn(),
}));

import { POST } from '@/app/api/stripe/webhook/route';
import { constructWebhookEvent, handleWebhookEvent } from '@/lib/stripe';

function makeRequest(body: string, signature?: string): Request {
  const headers: Record<string, string> = { 'Content-Type': 'text/plain' };
  if (signature) headers['stripe-signature'] = signature;

  return new Request('http://localhost:3000/api/stripe/webhook', {
    method: 'POST',
    headers,
    body,
  });
}

describe('POST /api/stripe/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when stripe-signature header is missing', async () => {
    const res = await POST(makeRequest('{}'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.message).toContain('Missing stripe-signature');
  });

  it('returns 400 for invalid signature', async () => {
    vi.mocked(constructWebhookEvent).mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await POST(makeRequest('{}', 'bad-sig'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.message).toContain('Webhook verification failed');
    spy.mockRestore();
  });

  it('returns 200 when event is handled successfully', async () => {
    const mockEvent = { type: 'checkout.session.completed', data: { object: {} } };
    vi.mocked(constructWebhookEvent).mockReturnValue(mockEvent as never);
    vi.mocked(handleWebhookEvent).mockResolvedValue();

    const res = await POST(makeRequest('{}', 'valid-sig'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.received).toBe(true);
  });

  it('calls handleWebhookEvent with constructed event', async () => {
    const mockEvent = { type: 'checkout.session.completed', data: { object: {} } };
    vi.mocked(constructWebhookEvent).mockReturnValue(mockEvent as never);
    vi.mocked(handleWebhookEvent).mockResolvedValue();

    await POST(makeRequest('raw-body', 'valid-sig'));

    expect(constructWebhookEvent).toHaveBeenCalledWith('raw-body', 'valid-sig');
    expect(handleWebhookEvent).toHaveBeenCalledWith(mockEvent);
  });
});
