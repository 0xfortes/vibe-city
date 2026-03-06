# MONETIZATION.md — Payment Strategy & Architecture

## Strategy: Freemium with Hard Gate

### The Model
- **Free**: 1 Council debate (no sign-up required) — let users experience the magic
- **Paid**: $6.99/month or $59.99/year — unlimited everything

### Why This Model

**Why not fully free?**
AI API calls cost money. Each Council debate makes 5-6 Claude API calls plus a verdict call. At scale, this is expensive. The product is also inherently high-value — it's not a utility, it's an experience. People pay for entertainment.

**Why 1 free debate?**
VibeCITY is a novel product. Nobody knows what "AI agents debating about your city" means until they see it. The free debate is your demo — it converts because the experience is unlike anything else. After the first debate, the user thinks "I want to try another city" — that's the conversion moment.

**Why not credits?**
Credits create anxiety ("I only have 3 left, should I waste one?"). Subscriptions create freedom ("I can try anything"). For an entertainment/discovery product, freedom drives engagement.

**Why $6.99/month?**
- Below the psychological $10/month "do I really need this?" threshold
- Above $5/month which signals "cheap" and undervalues the product
- Annual plan ($59.99/year = $5/month effective) rewards commitment
- Comparable to: ChatGPT costs $20/month, Spotify is $11.99 — VibeCITY is a niche product priced accordingly

### Revenue Math (Napkin)
- 1,000 subscribers × $6.99/month = $6,990/month
- 10,000 subscribers × $6.99/month = $69,900/month
- Cost per debate (5 Claude calls + overhead) ≈ $0.02-0.05
- Average user runs ~15 debates/month = $0.30-0.75 in AI costs per user
- Margin per user: ~90%+ at $6.99/month

---

## User Journey

### First Visit (No Account)
```
Landing page → "Try it free" → Pick a city → Watch debate →
"That was amazing. Want more?" → Sign up → Checkout → Subscriber
```

### Implementation Details

1. **Anonymous Session**: First debate uses a temporary anonymous session. No email required.
2. **Abuse Prevention**: To prevent multiple free debates, we combine:
   - Browser fingerprint hash (via `@fingerprintjs/fingerprintjs`, stored as SHA-256 hash)
   - IP address hash (SHA-256, NEVER stored raw — see SECURITY.md)
   - Neither is perfect alone, but together they catch most abuse
3. **Conversion Gate**: After the free debate, a modal appears with the full debate in the background (blurred). The message: "The Council has more to say. Subscribe to unlock unlimited debates."
4. **Checkout**: Stripe Checkout (hosted by Stripe — we never handle card details)
5. **Post-Checkout**: Redirect back to app, subscription active, debate history starts

### Returning Subscriber
```
Open app → Authenticated automatically → Full access →
Use any feature → Debates saved → History accessible
```

### Churned User
```
Open app → Authenticated → "Your subscription has expired" banner →
Can view Vibe Scores (free) → Debates locked → Easy resubscribe button
```

---

## Stripe Integration Architecture

### Products & Prices
```
Stripe Product: "VibeCITY Pro"
├── Price: $6.99/month (monthly)
└── Price: $59.99/year (annual — highlight as "Save 29%")
```

### Checkout Flow
```typescript
// 1. Client clicks "Subscribe" → hits our API
// 2. API creates Stripe Checkout Session
const session = await stripe.checkout.sessions.create({
  customer_email: user.email,  // Lock to authenticated user
  line_items: [{ price: priceId, quantity: 1 }],
  mode: 'subscription',
  success_url: `${APP_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${APP_URL}/subscribe/cancel`,
  metadata: { userId: user.id },  // Link Stripe customer to our user
  subscription_data: {
    metadata: { userId: user.id },
  },
});

// 3. Redirect user to Stripe-hosted checkout page
// 4. After payment: Stripe sends webhook → we update DB
// 5. User redirected to success_url → app checks subscription → access granted
```

### Webhook Events We Handle

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Create/update subscription record, link Stripe customer to user |
| `customer.subscription.created` | Set subscription status to active |
| `customer.subscription.updated` | Update status (handles upgrades, downgrades, renewals) |
| `customer.subscription.deleted` | Set status to canceled, log churn event |
| `invoice.payment_succeeded` | Update `current_period_end`, reset any past_due flags |
| `invoice.payment_failed` | Set status to `past_due`, trigger email (via Stripe) |

### Webhook Idempotency
Stripe may send the same event multiple times. Our webhook handler MUST be idempotent:
- Use `event.id` to check if we've already processed this event
- Processing the same event twice should not create duplicate records or corrupt state
- Stripe retries for up to 3 days on failed deliveries

### Database Schema

```sql
-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'incomplete',
  -- status: 'active', 'past_due', 'canceled', 'trialing',
  --         'incomplete', 'incomplete_expired', 'unpaid'
  price_id TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- RLS: Users can only read their own subscription
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Free trial tracking
-- IMPORTANT: Store HASHED values only, never raw IPs (GDPR compliance)
CREATE TABLE free_trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint_hash TEXT NOT NULL,  -- SHA-256 of browser fingerprint
  ip_hash TEXT NOT NULL,           -- SHA-256 of IP address
  debate_id UUID REFERENCES debates(id),
  used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_free_trials_fingerprint ON free_trials(fingerprint_hash);
CREATE INDEX idx_free_trials_ip ON free_trials(ip_hash);
```

### Subscription Status Access Map

| Status | Can Debate? | Can View Vibe Scores? | Can View History? | UI Treatment |
|--------|------------|----------------------|-------------------|-------------|
| `active` | ✅ | ✅ | ✅ | Full access |
| `trialing` | ✅ | ✅ | ✅ | Trial badge |
| `past_due` | ❌ | ✅ | ❌ | Resubscribe / update payment prompt |
| `canceled` | ❌ | ✅ | ✅ (read-only) | Resubscribe prompt |
| `incomplete` | ❌ | ✅ | ❌ | Complete payment prompt |
| `unpaid` | ❌ | ✅ | ❌ | Payment required |
| No subscription | ❌ (1 free trial) | ✅ | ❌ | Subscribe CTA |

---

## Billing Portal

For subscription management (cancel, update payment, view invoices), use Stripe's hosted Customer Portal:

```typescript
const portalSession = await stripe.billingPortal.sessions.create({
  customer: stripeCustomerId,
  return_url: `${APP_URL}/settings`,
});
// Redirect user to portalSession.url
```

This means we never build our own cancellation flow, payment update form, or invoice viewer. Stripe handles it all, including PSD2/SCA compliance.

---

## Future Monetization Layers

These are not for MVP but worth designing the architecture to support:

1. **City Partnerships**: Tourism boards pay for featured content. Implementation: a `sponsored` flag on city data that triggers a "Featured by [Board]" badge. Requires clear disclosure.

2. **Affiliate Links**: When agents recommend restaurants or experiences, include booking links. Implementation: venue data includes optional `affiliateUrl`. Revenue tracked via UTM parameters.

3. **VibeCITY Business (B2B)**: Sell aggregated vibe analytics to hospitality, real estate, and tourism companies. Implementation: analytics pipeline that aggregates anonymized debate data and vibe scores into city trend reports. Entirely separate product — doesn't affect consumer app.

4. **Premium Tiers**: If demand supports it, introduce a higher tier ($14.99/month) with features like custom agent personas, priority response times, and exclusive city data.

---

## Metrics to Track

| Metric | Why | How |
|--------|-----|-----|
| Free-to-paid conversion rate | Core business health | `subscribers / free_trial_users` |
| Monthly churn rate | Revenue retention | `canceled_this_month / active_start_of_month` |
| Average debates per user per month | Engagement & cost | `total_debates / active_subscribers` |
| Cost per debate | Margin tracking | `total_claude_api_cost / total_debates` |
| Trial-to-checkout dropoff | Conversion funnel | `checkout_started / free_debate_completed` |
| Annual vs monthly split | Revenue predictability | `annual_subs / total_subs` |

---

## Anti-Fraud Measures

1. **Free trial abuse**: Fingerprint hash + IP hash combination. If either matches an existing trial, deny.
2. **Subscription sharing**: Sessions tied to one device at a time (stretch goal — complex to implement).
3. **Refund abuse**: Stripe handles disputes. We log all usage for evidence.
4. **Bot signups**: Rate limit signup endpoint (5 per IP per hour). Consider CAPTCHA if abuse is detected.
