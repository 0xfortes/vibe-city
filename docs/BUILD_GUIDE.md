# BUILD_GUIDE.md — Phased Development Roadmap

## Philosophy

This guide documents every decision, every "why", and every step of building VibeCITY. It's designed so that reading this file alone teaches you how the app works and how to build something like it.

**Golden Rule: Never start a phase until the previous phase is complete and tested.**

---

## Phase 0: Foundation

### Goal
Project skeleton, documentation, development environment. No features yet — just a solid base.

### Why This Matters
Every project that fails at scale fails because the foundation was rushed. We're investing time now in:
- Clear documentation (you're reading it)
- Security architecture (before any code touches user data)
- Type safety (TypeScript strict mode catches bugs at compile time)
- Modular architecture (every piece is replaceable and testable)

### Steps
1. ⬜ Finalize all project documentation
2. ⬜ Initialize Next.js project with TypeScript (`npx create-next-app@latest`)
3. ⬜ Configure Tailwind, ESLint, Prettier
4. ⬜ Create `.env.example` with all required variables (empty values)
5. ⬜ Create full folder structure with placeholder files
6. ⬜ Initialize Git repo with proper `.gitignore` if not initialized yet
7. ⬜ Create TypeScript interfaces for all data types (CityDataService, AgentMessage, VibeScore, etc.)
8. ⬜ Verify `npm run dev` starts cleanly

### Credentials Needed: NONE
Only `NEXT_PUBLIC_APP_URL=http://localhost:3000`

### Exit Criteria
- [ ] `npm run dev` starts without errors
- [ ] `npm run lint` passes
- [ ] All folders exist with placeholder files
- [ ] `.env.example` documents all future variables
- [ ] Git repo initialized with clean first commit

---

## Phase 1: Local UI Development

### Goal
Build all UI components using mock data. The entire app should look and feel real, but use zero external services.

### Why This Order
Building UI first means:
- You can see and test the experience before wiring up expensive APIs
- Design decisions happen before you're locked into backend patterns
- Mock data forces you to define clean interfaces (which real services will implement later)
- No credentials needed = no accidental cost or security exposure

### Steps
1. ⬜ Create mock data JSON files for 3-4 cities (Tokyo, Berlin, Lisbon, NYC)
2. ⬜ Implement `MockCityDataService` matching `CityDataService` interface
3. ⬜ Build shared UI primitives (buttons, cards, layout, loading states)
4. ⬜ Build home screen (city search, trending cities, vibe cards)
5. ⬜ Build city view page (vibe score card with animated bars)
6. ⬜ Build debate UI (agent message bubbles with staggered animations)
7. ⬜ Build "Your Turn" follow-up chips
8. ⬜ Build verdict card component
9. ⬜ Build mood chip selector ("I want chaos", "Keep it chill", etc.)
10. ⬜ Test all components with mock data
11. ⬜ Build error states and loading states for all components

### Credentials Needed: NONE

### Key Concept: Mock Debate Flow
Instead of calling Claude, the mock debate service returns pre-written agent messages with realistic delays:
```typescript
// Mock returns messages one at a time with delays, simulating SSE
async function* mockDebateStream(cityId: string): AsyncGenerator<AgentMessage> {
  for (const message of MOCK_DEBATES[cityId]) {
    await delay(1500); // Simulate API latency
    yield message;
  }
}
```

### Exit Criteria
- [ ] All screens render correctly with mock data
- [ ] Animations work (staggered messages, vibe score bars)
- [ ] Loading and error states display correctly
- [ ] No TypeScript errors
- [ ] App feels like a real product (just with hardcoded data)

---

## Phase 2: External Service Integration

### Goal
Connect real services (Supabase, Claude API, Stripe) in development/test mode. This is when credentials are introduced.

### Why This Order
- Auth (Supabase) first — everything else depends on knowing "who is this user?"
- Claude API second — the core feature, but auth must exist to track usage
- Stripe last — depends on both auth (who's paying?) and the core feature (what are they paying for?)

### Steps

#### 2A: Supabase Auth
1. ⬜ Create Supabase project (free tier)
2. ⬜ Add Supabase credentials to `.env.local`
3. ⬜ Create database schema (run migrations)
4. ⬜ Implement Supabase server client (`@supabase/ssr`)
5. ⬜ Build signup/login pages
6. ⬜ Create auth middleware for protected routes
7. ⬜ Implement RLS policies on all tables
8. ⬜ Test: can sign up, log in, log out, session persists

#### 2B: Claude API
9. ⬜ Add Anthropic API key to `.env.local`
10. ⬜ Build a single test agent call (one agent, one city)
11. ⬜ Verify streaming works (SSE to frontend)
12. ⬜ Test: single agent responds with personality and city-specific data

#### 2C: Stripe (Test Mode)
13. ⬜ Create Stripe account, get TEST mode keys
14. ⬜ Create product and prices in Stripe dashboard (test mode)
15. ⬜ Add Stripe test keys to `.env.local`
16. ⬜ Build checkout flow with Stripe Checkout Sessions
17. ⬜ Set up Stripe CLI for local webhook testing
18. ⬜ Implement webhook handler (signature verification first!)
19. ⬜ Test: can complete checkout with test card `4242 4242 4242 4242`

### Credentials Needed (ALL in test/dev mode)
```bash
# .env.local — NEVER commit this file
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Exit Criteria
- [ ] User can sign up, log in, and see their session
- [ ] A single Claude agent responds correctly
- [ ] Stripe test checkout completes and webhook fires
- [ ] No credentials are in code, logs, or Git history
- [ ] RLS policies prevent users from accessing each other's data

---

## Phase 3: Core Feature Development

### Goal
Build the full Council debate system, subscription enforcement, and debate saving.

### Steps
1. ⬜ Build all 5 agent system prompts (see BEHAVIOURS.md)
2. ⬜ Build the Coordinator orchestration logic (sequential agents, context passing)
3. ⬜ Implement full SSE streaming for multi-agent debates
4. ⬜ Implement agent reaction extraction (structured output)
5. ⬜ Build verdict card generation (separate Claude call)
6. ⬜ Generate follow-up prompts from debate context
7. ⬜ Implement subscription gate (check before debate start)
8. ⬜ Build free trial logic (1 debate, fingerprint + hashed IP tracking)
9. ⬜ Save completed debates to database (subscribers only)
10. ⬜ Build debate history view
11. ⬜ Add rate limiting to all API endpoints
12. ⬜ Implement input sanitization for follow-up questions (prompt injection prevention)
13. ⬜ No exposed API keys. Never expose plaintext APIs. Always validate server side and never client side.

### Exit Criteria
- [ ] Full 5-agent debate runs with streaming
- [ ] Agents reference and disagree with each other
- [ ] Follow-up rounds work
- [ ] Subscription gate blocks free users after trial
- [ ] Debates save and load from history
- [ ] Rate limiting prevents abuse
- [ ] Check for API leaks. Validation server side and never client side

---

## Phase 4: Testing & Hardening

### Goal
Comprehensive testing, security audit, performance optimization.

### Steps
1. ⬜ Write unit tests (prompt construction, validation, vibe scores)
2. ⬜ Write integration tests (API routes, webhooks)
3. ⬜ Write E2E tests (signup → subscribe → debate → history)
4. ⬜ Run SECURITY.md checklist (every item)
5. ⬜ Test prompt injection resistance
6. ⬜ Test all subscription states (active, past_due, canceled, etc.)
7. ⬜ Performance audit (Lighthouse, bundle size)
8. ⬜ Polish all error states and edge cases

### Exit Criteria
- [ ] Test suite passes
- [ ] Security checklist complete
- [ ] No high/critical `npm audit` vulnerabilities
- [ ] Lighthouse performance score > 80

---

## Phase 5: Staging & Pre-Launch

### Steps
1. ⬜ Deploy to Vercel (preview environment)
2. ⬜ Set staging environment variables in Vercel
3. ⬜ Test full flow on staging URL
4. ⬜ Invite 3-5 testers
5. ⬜ Fix issues found in staging
6. ⬜ Prepare production Stripe products (live mode)
7. ⬜ Build Vibe Card share image generation (OG images)
8. ⬜ Add mock data for remaining 7 launch cities

## Phase 6: Production Launch

### Steps
1. ⬜ Set production environment variables in Vercel
2. ⬜ Switch Stripe to live mode
3. ⬜ Configure custom domain + HTTPS
4. ⬜ Final security audit
5. ⬜ Deploy to production
6. ⬜ Monitor logs and metrics for first 48 hours

---

## Phase 7: Real Data Migration (Post-Launch)

### Goal
Replace mock data with live APIs, one data source at a time.

See `DATA_SOURCES.md` for the complete API integration plan, including:
- Which APIs to use for each data type
- Transform functions from API responses to our interfaces
- Caching architecture and fallback chains
- Cost estimates and migration timeline
- The hybrid service for gradual per-city, per-method migration

### Steps
1. ⬜ Set up Upstash Redis for caching (if not already done for rate limiting)
2. ⬜ Implement OpenWeather integration (simplest API, lowest risk)
3. ⬜ Test weather data in debates for 2-3 cities
4. ⬜ Implement Google Places integration (venues)
5. ⬜ Test venue data quality — verify agents get useful recommendations
6. ⬜ Implement PredictHQ integration (events)
7. ⬜ Build HybridCityDataService for gradual rollout
8. ⬜ Migrate cities one at a time, testing each
9. ⬜ Monitor API costs and cache hit rates

---

## Architecture Decisions Record (ADR)

### ADR-001: Why Supabase Over Prisma + Raw Postgres
**Context**: We need a database, auth, and real-time capabilities.
**Decision**: Supabase provides all three with minimal setup. Prisma would require separate auth setup, separate real-time solution, and more infrastructure management.
**Tradeoff**: We're coupled to Supabase's client library. If we outgrow it, we can still access the underlying Postgres directly.

### ADR-002: Why Sequential Agent Calls, Not Parallel
**Context**: 5 agents need to "debate" — should they all generate at once or one at a time?
**Decision**: Sequential. Each agent must see what came before to create genuine disagreement and references.
**Tradeoff**: Slower total generation time (~15-25 seconds for a full round). Mitigated by streaming each agent's response as it generates, so the user is never staring at a blank screen.

### ADR-003: Why Subscription Over Credits
**Context**: How to monetize.
**Decision**: Monthly subscription ($6.99/mo). Simpler for users to understand, predictable revenue for us, no "running out of credits" anxiety.
**Tradeoff**: Higher initial commitment than credits. Mitigated by 1 free trial debate (no signup required).

### ADR-004: Why Mock Data First
**Context**: Should we integrate real APIs (Google Places, Eventbrite, etc.) from day one?
**Decision**: Mock data with a clean interface. Swap to real APIs later.
**Tradeoff**: App won't have real-time data initially. But the core experience (the debate) works perfectly with curated mock data, and we avoid getting blocked by API rate limits, costs, and integration complexity during the critical build phase.

### ADR-005: Why Server-Side Rendering for Security
**Context**: Where should sensitive operations happen?
**Decision**: All AI calls, payment processing, and data access happen in Next.js API routes (server-side). The client never sees API keys or raw database connections.
**Tradeoff**: Slightly more complex architecture than a pure SPA. But dramatically better security posture.

### ADR-006: Why SSE Over WebSocket
**Context**: How to stream debate messages to the client.
**Decision**: Server-Sent Events (SSE). The data flow is one-directional (server → client). WebSocket adds bidirectional complexity we don't need.
**Tradeoff**: SSE doesn't support binary data or client-to-server streaming. We don't need either — follow-up questions go via standard POST requests.

### ADR-007: Why 1 Free Trial, Not 3/Day
**Context**: How generous should the free tier be?
**Decision**: 1 free debate, lifetime, no signup required. This is a demo, not a free tier.
**Tradeoff**: Less generous than "3 per day." But each debate costs us $0.02-0.05 in API calls, and the goal is conversion, not free usage. One debate is enough to demonstrate the magic.
