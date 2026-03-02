# CLAUDE.md — Claude Code Project Instructions

## Current Phase: 0 — Foundation

### Phase 0 Rules (UPDATE THIS SECTION AS YOU PROGRESS)

**DO NOT:**
- Make any external API calls (Claude, Stripe, Supabase)
- Require any environment variables beyond `NEXT_PUBLIC_APP_URL`
- Set up real database connections
- Integrate Stripe or Anthropic
- Run `npm run build` for production deployment
- Install packages for services not yet needed

**DO:**
- Use mock data for all external dependencies
- Use `npm run dev` for local development
- Ask before running any command that installs new dependencies
- Explain what each step does before executing it
- Create interfaces/types that real implementations will satisfy later

<!--
Phase progression reference:
- Phase 0: Foundation (docs, project setup, folder structure)
- Phase 1: Local UI (components with mock data, no external services)
- Phase 2: External Services (Supabase auth, Claude API, Stripe test mode)
- Phase 3: Core Features (Council orchestration, subscriptions, database)
- Phase 4: Testing & Hardening (tests, security audit, error handling)
- Phase 5: Staging (Vercel preview, staging credentials)
- Phase 6: Production (production credentials, launch)
-->

---

## Project Overview

**VibeCITY** is a living city personality engine where 5 AI agents ("The Council") debate what you should do tonight. It's a spectator sport for city discovery — not a chatbot, not a search tool.

See `PRODUCT.md` for full vision. See `BUILD_GUIDE.md` for phased roadmap.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + Framer Motion for animations
- **Database**: PostgreSQL via Supabase (auth, RLS, real-time)
- **Payments**: Stripe (subscriptions)
- **AI**: Anthropic Claude API (multi-agent orchestration)
- **Streaming**: Server-Sent Events (SSE) — NOT WebSocket
- **Deployment**: Vercel (primary), portable to Hetzner VPS + Docker

## Project Structure

```
vibecity/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (public)/           # Landing, login, signup
│   │   ├── (protected)/        # Authenticated routes
│   │   ├── api/                # API routes (server-side only)
│   │   │   ├── council/        # Agent orchestration endpoints
│   │   │   ├── stripe/         # Payment webhooks
│   │   │   ├── vibe/           # Vibe score endpoints
│   │   │   └── auth/           # Auth callbacks
│   │   └── layout.tsx
│   ├── components/
│   │   ├── council/            # Debate UI components
│   │   ├── vibe/               # Vibe score cards and animations
│   │   ├── payment/            # Subscription gates and modals
│   │   └── ui/                 # Shared UI primitives
│   ├── lib/
│   │   ├── agents/             # Agent definitions, prompts, orchestrator
│   │   ├── supabase/           # Supabase client, queries, RLS helpers
│   │   ├── stripe/             # Stripe client, webhook handlers
│   │   ├── vibe/               # Vibe score engine
│   │   ├── data/               # Mock data services (swap for real APIs later)
│   │   │   ├── types.ts        # CityDataService interface
│   │   │   ├── mock.ts         # Mock implementation
│   │   │   ├── index.ts        # Export point (swap mock ↔ real here)
│   │   │   └── cities/         # JSON mock data per city
│   │   ├── security/           # Input sanitization, rate limiting
│   │   └── errors/             # Error taxonomy and handlers
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript type definitions
│   └── config/                 # App configuration constants
├── supabase/
│   ├── migrations/             # SQL migrations (created in Phase 2+)
│   └── seed.sql                # Development seed data
├── public/                     # Static assets
├── docs/                       # All project documentation (.md files)
└── tests/                      # Test files mirroring src/ structure
```

## Key Commands

```bash
# Development (Phase 0-1)
npm run dev                     # Start dev server (port 3000)
npm run lint                    # ESLint + type checking
npm run test                    # Run test suite

# Build check (NOT production deploy — just validates build)
npm run build                   # Run occasionally to catch build errors

# Database (Phase 2+ only)
npx supabase start              # Local Supabase
npx supabase db push            # Push migrations
npx supabase gen types          # Generate TypeScript types from schema

# Stripe (Phase 2+ only)
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Environment Variables

All secrets live in `.env.local` (never committed). See `.env.example` for required variables.

**CRITICAL**: Never hardcode API keys, database URLs, or any secrets. Always use `process.env.VARIABLE_NAME` server-side. Never expose server-side env vars to the client (no `NEXT_PUBLIC_` prefix for secrets).

### Variable Introduction by Phase

| Phase | Variables Needed |
|-------|-----------------|
| 0-1 | `NEXT_PUBLIC_APP_URL=http://localhost:3000` only |
| 2 | Add Supabase keys, Anthropic key, Stripe test keys |
| 5-6 | Production values set in Vercel dashboard |

## Code Conventions

### TypeScript
- Strict mode enabled. No `any` types unless absolutely unavoidable (and commented why).
- All function parameters and return types explicitly typed.
- Use `zod` for runtime validation of all external inputs (API requests, webhooks, user input).

### Naming
- Files: `kebab-case.ts` for utilities, `PascalCase.tsx` for components
- Functions: `camelCase`
- Types/Interfaces: `PascalCase` with descriptive names (e.g., `AgentDebateMessage`, not `Message`)
- Constants: `SCREAMING_SNAKE_CASE`
- Database columns: `snake_case`

### Components
- Server Components by default. Use `'use client'` only when needed (interactivity, hooks).
- Keep components focused — one responsibility per component.
- Extract business logic into hooks or utility functions.

### API Routes
- All API routes validate input with `zod` before processing.
- All API routes check authentication before any data access.
- All API routes return consistent error shapes (see ERROR_HANDLING.md).
- Never trust client-side data for authorization decisions.

### Comments
- Comment the "why", not the "what" (the code shows what, comments explain why).
- All agent system prompts must have inline comments explaining personality choices.
- Security-critical code gets explicit comments about what it guards against.

## Security Rules (Non-Negotiable)

1. **No secrets in code.** Ever. Not even in comments or examples.
2. **Server-side validation.** All security checks happen server-side. Client validation is UX only.
3. **Sanitize inputs.** All user inputs pass through sanitization before DB queries or AI prompts.
4. **Rate limit everything.** Especially AI endpoints (expensive) and auth endpoints (brute force).
5. **RLS on every table.** Supabase Row Level Security policies on all tables, no exceptions.
6. **Stripe webhooks verified.** Always verify webhook signatures. Never trust unverified payment events.
7. **Error messages are opaque.** Users see friendly messages. Internal details go to server logs only.
8. **Principle of least privilege.** Each component only accesses what it needs.

See `SECURITY.md` for full security architecture.

## AI Agent Architecture

Each Council agent is a separate Claude API call with:
- A unique system prompt defining personality, domain, and debate style
- City-specific context from the data service
- Conversation history (what other agents have said)
- Structured output requirements for extracting venues/places

The **Coordinator** is a lightweight orchestration layer (not an AI call) that:
- Determines speaking order (varies per debate for freshness)
- Feeds each agent the previous agents' messages
- Manages streaming to the client via SSE
- Extracts structured data from responses

See `BEHAVIOURS.md` for full agent specifications.
See `SKILLS.md` for implementation patterns.

## Mock Data Strategy

During development, all external data comes from curated mock datasets:
- Each of the 10 launch cities has a mock data file in `src/lib/data/cities/`
- `CityDataService` interface is identical whether mock or real
- Swap implementations by changing the export in `lib/data/index.ts`
- Mock data includes: venues, events, weather, neighborhood info

**Start with 2-3 cities for initial development. Add the remaining 7 when the UI is stable.**

## Testing Philosophy

- Unit tests for: agent prompt construction, input validation, vibe score calculation
- Integration tests for: API routes, Stripe webhook handling, auth flows
- E2E tests for: critical user paths (sign up → subscribe → run debate)
- No tests for: simple UI components, static content

See `TESTING.md` for full testing strategy.

## Git Conventions

- Conventional commits: `feat:`, `fix:`, `sec:`, `docs:`, `refactor:`
- Branch naming: `feature/council-debate`, `fix/stripe-webhook`, `sec/rate-limiting`
- Never commit `.env.local`, `node_modules`, or any file containing secrets
- Feature branches merge to `main` (solo developer) or `develop` → `main` (team)
