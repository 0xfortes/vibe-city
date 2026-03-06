import { NextResponse } from 'next/server';
import { constructWebhookEvent, handleWebhookEvent } from '@/lib/stripe';

/**
 * POST /api/stripe/webhook — Handles Stripe webhook events.
 *
 * IMPORTANT: This route reads the raw body (not JSON) for signature verification.
 * The webhook secret must be set in STRIPE_WEBHOOK_SECRET.
 */
export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Missing stripe-signature header' } },
      { status: 400 },
    );
  }

  try {
    const body = await request.text();
    const event = constructWebhookEvent(body, signature);

    await handleWebhookEvent(event);

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Webhook verification failed' } },
      { status: 400 },
    );
  }
}
