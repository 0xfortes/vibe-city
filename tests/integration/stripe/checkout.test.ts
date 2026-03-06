import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/stripe/client', () => ({
  getStripeServer: vi.fn(),
}));

import { createCheckoutSession } from '@/lib/stripe/checkout';
import { getStripeServer } from '@/lib/stripe/client';

describe('createCheckoutSession', () => {
  const mockCreate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getStripeServer).mockReturnValue({
      checkout: {
        sessions: {
          create: mockCreate,
        },
      },
    } as never);
  });

  it('creates session with correct params', async () => {
    mockCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/s/123' });

    const url = await createCheckoutSession({
      userId: 'user-1',
      email: 'test@test.com',
      priceId: 'price_abc',
      successUrl: 'http://localhost:3000/dashboard?checkout=success',
      cancelUrl: 'http://localhost:3000/dashboard?checkout=canceled',
    });

    expect(url).toBe('https://checkout.stripe.com/s/123');
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'subscription',
        line_items: [{ price: 'price_abc', quantity: 1 }],
        success_url: 'http://localhost:3000/dashboard?checkout=success',
        cancel_url: 'http://localhost:3000/dashboard?checkout=canceled',
        metadata: { userId: 'user-1' },
      }),
    );
  });

  it('uses existing customer when stripeCustomerId provided', async () => {
    mockCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/s/123' });

    await createCheckoutSession({
      userId: 'user-1',
      email: 'test@test.com',
      stripeCustomerId: 'cus_existing',
      priceId: 'price_abc',
      successUrl: 'http://localhost:3000/success',
      cancelUrl: 'http://localhost:3000/cancel',
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ customer: 'cus_existing' }),
    );
    // Should not set customer_email when customer is set
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.customer_email).toBeUndefined();
  });

  it('uses customer_email when no existing customer', async () => {
    mockCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/s/123' });

    await createCheckoutSession({
      userId: 'user-1',
      email: 'test@test.com',
      priceId: 'price_abc',
      successUrl: 'http://localhost:3000/success',
      cancelUrl: 'http://localhost:3000/cancel',
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ customer_email: 'test@test.com' }),
    );
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.customer).toBeUndefined();
  });

  it('throws when session.url is null', async () => {
    mockCreate.mockResolvedValue({ url: null });

    await expect(
      createCheckoutSession({
        userId: 'user-1',
        email: 'test@test.com',
        priceId: 'price_abc',
        successUrl: 'http://localhost:3000/success',
        cancelUrl: 'http://localhost:3000/cancel',
      }),
    ).rejects.toThrow('Failed to create checkout session');
  });
});
