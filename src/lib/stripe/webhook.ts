import type Stripe from 'stripe';
import { getStripeServer } from './client';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * Verifies and constructs a Stripe webhook event from the raw body.
 * Throws if the signature is invalid.
 */
export function constructWebhookEvent(
  body: string,
  signature: string,
): Stripe.Event {
  const stripe = getStripeServer();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }

  return stripe.webhooks.constructEvent(body, signature, secret);
}

/**
 * Handles relevant Stripe webhook events.
 * Updates the user's subscription status in the database.
 */
export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionChange(subscription);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailed(invoice);
      break;
    }
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('Checkout session missing userId metadata');
    return;
  }

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  // Get subscription details
  const stripe = getStripeServer();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const supabase = await createAdminClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      stripe_customer_id: customerId,
      subscription_status: subscription.status,
      subscription_tier: 'pro',
    })
    .eq('id', userId);

  if (error) {
    console.error('Failed to update profile after checkout:', error);
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription): Promise<void> {
  const customerId = subscription.customer as string;

  const supabase = await createAdminClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: subscription.status,
      subscription_tier: subscription.status === 'active' ? 'pro' : null,
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Failed to update subscription status:', error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer as string;

  const supabase = await createAdminClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'past_due',
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('Failed to update payment status:', error);
  }
}
