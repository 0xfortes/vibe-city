# ARCHITECTURE.md — System Design & Technical Decisions

## High-Level Architecture

```
┌────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                   │
│  Next.js App (React Server Components + Client Islands) │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐            │
│  │ Debate UI │  │ Vibe Card│  │ Payment   │            │
│  │ (SSE)     │  │ (Animated)│  │ (Stripe.js)│           │
│  └──────────┘  └──────────┘  └───────────┘            │
└───────────────────────┬────────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼────────────────────────────────┐
│                   SERVER (Next.js API Routes)            │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │ Auth       │  │ Council    │  │ Stripe Webhooks   │  │
│  │ Middleware  │  │ Orchestrator│  │ Handler           │  │
│  └─────┬──────┘  └─────┬──────┘  └────────┬─────────┘  │
│        │               │                   │             │
│  ┌─────▼──────┐  ┌─────▼──────┐  ┌────────▼─────────┐  │
│  │ Supabase   │  │ Claude API │  │ Stripe API        │  │
│  │ Auth       │  │ (Anthropic)│  │                    │  │
│  └─────┬──────┘  └────────────┘  └────────────────────┘  │
│        │                                                  │
│  ┌─────▼──────────────────────────────────────────────┐  │
│  │           Supabase PostgreSQL (with RLS)            │  │
│  │  ┌───────┐  ┌──────────┐  ┌────────┐  ┌────────┐  │  │
│  │  │profiles│  │subscriptn│  │debates │  │cities  │  │  │
│  │  └───────┘  └──────────┘  └────────┘  └────────┘  │  │
│  └─────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## Tech Stack Rationale

### Next.js 14+ (App Router)
**Why**: Server Components render pages without sending JavaScript to the client (faster, more secure). API Routes give us a backend without a separate server. App Router is the modern Next.js pattern with better data fetching and layouts.
**Alternative considered**: Separate React frontend + Express backend. Rejected because it doubles deployment complexity and introduces CORS configuration.

### TypeScript (Strict Mode)
**Why**: Catches type errors at compile time. With `strict: true`, the compiler enforces null checks, proper types, and prevents entire categories of bugs. Essential for a project handling payments.
**Cost**: Slightly more verbose code. Worth it for the safety guarantees.

### Supabase (PostgreSQL + Auth + Realtime)
**Why**: One service provides our database, authentication, and real-time capabilities. PostgreSQL is battle-tested for relational data (users, subscriptions, debates). Row Level Security means security is enforced at the database level, not just the application level.
**Alternative considered**: Prisma + Clerk + raw Postgres. Rejected — three services to manage instead of one.
**Migration path**: If we outgrow Supabase, we can connect directly to the underlying Postgres and replace the Supabase client with raw SQL or Prisma.
**Client library**: Use `@supabase/ssr` (NOT the deprecated `@supabase/auth-helpers-nextjs`) for Next.js App Router integration.

### Stripe
**Why**: Industry standard for subscription billing. Handles PCI compliance, SCA/PSD2, tax calculation, invoicing, and customer portal. We never touch credit card data.
**No alternatives considered**: Stripe is the clear choice for web subscription billing.

### Claude API (Anthropic)
**Why**: Best creative writing and personality consistency among LLM providers. Each agent needs to maintain a distinct voice across multiple interactions — Claude excels at this. Structured outputs help extract venue data from natural language.
**Model choice**: `claude-sonnet-4-5-20250929` for agent responses (best balance of quality and speed). Consider `claude-haiku-4-5-20251001` for the verdict card and follow-up generation (faster, cheaper, simpler task).
**Cost consideration**: A full debate round (5 agents + verdict) costs approximately $0.02-0.05.

### Tailwind CSS + Framer Motion
**Why**: Tailwind for rapid, consistent styling without CSS file bloat. Framer Motion for the debate animations — staggered message reveals, vibe score bar animations, and page transitions. These are critical to the "spectator sport" feel.
**Alternative considered**: CSS Modules + GSAP. Rejected — Framer Motion integrates better with React and is simpler for the animation patterns we need.

---

## Database Schema

### Core Tables

```sql
-- Users (managed by Supabase Auth, extended with profile data)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions (synced from Stripe via webhooks)
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

-- Debates (saved Council sessions)
CREATE TABLE debates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  city_id TEXT NOT NULL,
  mood TEXT,  -- Optional mood modifier used
  messages JSONB NOT NULL DEFAULT '[]',  -- Array of agent messages
  verdict JSONB,  -- The verdict card data
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Free trial tracking
-- NOTE: ip_hash stores a SHA-256 hash, NOT the raw IP address (GDPR compliance)
CREATE TABLE free_trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint_hash TEXT NOT NULL,  -- SHA-256 hash of browser fingerprint
  ip_hash TEXT NOT NULL,           -- SHA-256 hash of IP address
  debate_id UUID REFERENCES debates(id),
  used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cities (reference data)
CREATE TABLE cities (
  id TEXT PRIMARY KEY,  -- e.g., 'tokyo', 'berlin'
  name TEXT NOT NULL,
  tagline TEXT,  -- e.g., "Chaos with impeccable taste"
  country TEXT NOT NULL,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  timezone TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vibe scores (computed periodically)
CREATE TABLE vibe_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id TEXT REFERENCES cities(id) NOT NULL,
  overall_score INTEGER NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  nightlife_score INTEGER NOT NULL CHECK (nightlife_score BETWEEN 0 AND 100),
  food_score INTEGER NOT NULL CHECK (food_score BETWEEN 0 AND 100),
  culture_score INTEGER NOT NULL CHECK (culture_score BETWEEN 0 AND 100),
  locals_score INTEGER NOT NULL CHECK (locals_score BETWEEN 0 AND 100),
  wander_score INTEGER NOT NULL CHECK (wander_score BETWEEN 0 AND 100),
  computed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_debates_user_id ON debates(user_id);
CREATE INDEX idx_debates_city_id ON debates(city_id);
CREATE INDEX idx_vibe_scores_city_id ON vibe_scores(city_id);
CREATE INDEX idx_vibe_scores_computed_at ON vibe_scores(computed_at DESC);
CREATE INDEX idx_free_trials_fingerprint ON free_trials(fingerprint_hash);
CREATE INDEX idx_free_trials_ip ON free_trials(ip_hash);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
```

### Row Level Security

```sql
-- Profiles: Users read/update only their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Subscriptions: Users read only their own (writes via admin/webhook only)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Debates: Users manage only their own
ALTER TABLE debates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own debates" ON debates
  FOR ALL USING (auth.uid() = user_id);

-- Cities: Public read (no auth required)
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads cities" ON cities
  FOR SELECT USING (true);

-- Vibe scores: Public read
ALTER TABLE vibe_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads vibe scores" ON vibe_scores
  FOR SELECT USING (true);

-- Free trials: No direct access (managed by server with service role key only)
ALTER TABLE free_trials ENABLE ROW LEVEL SECURITY;
-- No policies = no direct access via anon/authenticated roles.
```

---

## Data Flow: Council Debate

```
1. User clicks "Drop a city" → selects "Tokyo"
   │
2. Client sends POST /api/council/start
   │  Body: { cityId: "tokyo", mood: "chaos" }
   │
3. Server validates:
   │  ├── Rate limit check (IP + user)
   │  ├── Auth check (get user from session)
   │  ├── Subscription check (active or free trial available?)
   │  └── Input validation (zod schema)
   │
4. Coordinator prepares:
   │  ├── Load city data (mock service)
   │  ├── Determine agent speaking order (based on city + mood)
   │  └── Build context for first agent
   │
5. Stream begins (SSE connection):
   │
   │  For each agent in order:
   │  ├── Send "agent_start" event (shows typing indicator)
   │  ├── Call Claude API with:
   │  │   ├── Agent's system prompt
   │  │   ├── City-specific data for this agent's domain
   │  │   ├── Previous agents' messages (for referencing)
   │  │   └── User's mood modifier
   │  ├── Stream tokens as "agent_token" events
   │  ├── On completion: extract structured data (venues, reactions)
   │  │   └── Run content filter on response before sending
   │  └── Send "agent_complete" event
   │
6. After all agents:
   │  ├── Generate verdict card (quick Claude call with haiku model)
   │  ├── Generate follow-up prompts
   │  ├── Send "debate_complete" event
   │  └── Save debate to database (if user is subscribed)
   │
7. Client renders:
   │  ├── Staggered message animations
   │  ├── Agent reaction indicators
   │  ├── Verdict card
   │  └── "Your Turn" follow-up chips
   │
8. User clicks follow-up → POST /api/council/followup
   │  Triggers steps 3-7 with additional context
```

---

## Data Flow: Vibe Score

```
1. Mock implementation (MVP):
   │  └── Return pre-computed scores from mock data files
   │      (Scores vary by time of day for realism)
   │
2. Future real implementation:
   │  ├── Cron job runs every 30 minutes per city
   │  ├── Aggregates signals:
   │  │   ├── Event count from Eventbrite/Dice/RA APIs
   │  │   ├── Weather conditions from OpenWeather
   │  │   ├── Social sentiment from Reddit/X
   │  │   ├── Time of day + day of week
   │  │   └── Historical patterns
   │  ├── Computes weighted sub-scores
   │  ├── Stores in vibe_scores table
   │  └── Triggers real-time update to connected clients
```

---

## Content Filter

All agent responses pass through a content filter before being sent to the client. The filter checks for and removes:

- **Explicit illegal activity recommendations** (drug purchases, trespassing instructions)
- **Slurs and hate speech** (regex-based blocklist)
- **Personally identifiable information** leaked from prompts
- **System prompt leaks** (if an agent outputs parts of its own system prompt)
- **Excessive violence or sexual content**

The filter is a simple function, not an AI call. It runs synchronously on each completed agent message. If a message fails the filter, it is replaced with a generic fallback: "[Agent] got a little too excited. Moving on..."

See `SECURITY.md` for prompt injection prevention (input side) and `BEHAVIOURS.md` for content safety rules (generation side).

---

## CORS Configuration

```typescript
// next.config.js — CORS is handled at the API route level
// Only our own domain should call our API routes

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,  // http://localhost:3000 in dev
  // Add production domain when deploying
];

// Applied in middleware.ts to all /api/* routes
// Stripe webhooks are excluded (Stripe's servers need access)
```

---

## Deployment Architecture

### Vercel (Primary)
```
┌─────────────────────────────────────┐
│              Vercel                   │
│  ┌─────────────────────────────┐    │
│  │  Next.js (Edge + Serverless) │    │
│  │  ├── Static pages (CDN)      │    │
│  │  ├── API routes (Serverless) │    │
│  │  └── SSE streams (Serverless)│    │
│  └─────────────────────────────┘    │
└──────────┬───────────┬──────────────┘
           │           │
    ┌──────▼──┐  ┌─────▼─────┐
    │Supabase │  │  Stripe    │
    │(Managed)│  │ (External) │
    └─────────┘  └───────────┘
```

### Hetzner VPS (Future Alternative)
```
┌──────────────────────────────────────┐
│           Hetzner VPS                 │
│  ┌────────────────────────────────┐  │
│  │  Docker Compose                 │  │
│  │  ├── next-app (Next.js)        │  │
│  │  ├── postgres (self-hosted)    │  │
│  │  └── redis (rate limiting)     │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  Caddy (reverse proxy + SSL)   │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

**Migration path**: The app is written as standard Next.js with no Vercel-specific APIs (no `@vercel/kv`, no Edge Config). Moving to Hetzner requires only:
1. Dockerfile for the Next.js app
2. docker-compose.yml with Postgres and Redis
3. Caddy config for HTTPS
4. Environment variables set in docker-compose

---

## Backup & Data Recovery

**MVP**: Rely on Supabase's built-in daily backups (included on Pro plan; free tier has no backups). For the free tier during development, critical data is:
- Database schema (stored in `supabase/migrations/` — committed to Git)
- Mock data (stored in `src/lib/data/cities/` — committed to Git)
- User data is ephemeral during development

**Production**: Evaluate Supabase Pro plan ($25/month) for automated daily backups, or implement `pg_dump` via a cron job on the Hetzner VPS if self-hosting.

---

## Performance Considerations

### Debate Streaming Latency
- **Target**: First agent starts speaking within 2 seconds of debate start
- **Bottleneck**: Claude API cold start + first token latency
- **Mitigation**: Start streaming immediately; show city data and vibe score while first agent "thinks"

### Vibe Score Loading
- **Target**: Vibe scores visible on home screen within 500ms
- **Strategy**: Static generation for vibe score cards, revalidated every 5 minutes via ISR (Incremental Static Regeneration)

### Debate History
- **Target**: History page loads within 1 second
- **Strategy**: Paginate debates (20 per page), only load message previews initially

### Bundle Size
- **Target**: Initial page load under 200KB JavaScript
- **Strategy**: Server Components by default, dynamic imports for heavy components (Framer Motion animations)
