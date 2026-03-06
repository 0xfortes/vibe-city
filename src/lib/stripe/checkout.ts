import Stripe from 'stripe';
import { getStripeServer } from './client';

interface CreateCheckoutParams {
  userId: string;
  email: string;
  stripeCustomerId?: string | null;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

/**
 * Creates a Stripe Checkout session for a subscription.
 * If the user already has a Stripe customer ID, reuse it.
 */
export async function createCheckoutSession(params: CreateCheckoutParams): Promise<string> {
  const stripe = getStripeServer();

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      userId: params.userId,
    },
  };

  // Reuse existing customer or create from email
  if (params.stripeCustomerId) {
    sessionParams.customer = params.stripeCustomerId;
  } else {
    sessionParams.customer_email = params.email;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  if (!session.url) {
    throw new Error('Failed to create checkout session');
  }

  return session.url;
}
