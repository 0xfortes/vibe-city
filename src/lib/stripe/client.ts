import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

/**
 * Server-side Stripe client singleton.
 * Only use in API routes and server actions — never on the client.
 */
export function getStripeServer(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    stripeInstance = new Stripe(key, {
      typescript: true,
    });
  }
  return stripeInstance;
}
