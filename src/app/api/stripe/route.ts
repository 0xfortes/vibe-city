import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/lib/stripe';
import { getStripeServer } from '@/lib/stripe/client';
import { AppError, handleApiError } from '@/lib/errors';
import { checkRateLimit, RATE_LIMITS } from '@/lib/security';

const checkoutSchema = z.object({
  priceId: z.string().min(1),
});

/**
 * POST /api/stripe — Creates a Stripe Checkout session for subscription.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new AppError('AUTH_REQUIRED');
    }

    // Rate limit checkout attempts
    const rateLimit = checkRateLimit('checkout', user.id, RATE_LIMITS.checkout);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: "You're moving too fast. Please wait a moment." } },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } },
      );
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError('VALIDATION_ERROR');
    }

    // Get user's stripe customer ID if they have one
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    let stripeCustomerId = (profile as { stripe_customer_id: string | null } | null)?.stripe_customer_id ?? null;

    // Validate stored Stripe customer still exists (handles re-subscription after cancellation)
    if (stripeCustomerId) {
      try {
        const customer = await getStripeServer().customers.retrieve(stripeCustomerId);
        if (customer.deleted) {
          stripeCustomerId = null;
        }
      } catch {
        // Customer doesn't exist in Stripe — clear it so checkout creates a new one
        stripeCustomerId = null;
      }

      if (!stripeCustomerId) {
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: null })
          .eq('id', user.id);
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const checkoutUrl = await createCheckoutSession({
      userId: user.id,
      email: user.email!,
      stripeCustomerId,
      priceId: parsed.data.priceId,
      successUrl: `${appUrl}/dashboard?checkout=success`,
      cancelUrl: `${appUrl}/dashboard?checkout=canceled`,
    });

    return NextResponse.json({ data: { url: checkoutUrl } });
  } catch (error) {
    return handleApiError(error);
  }
}
