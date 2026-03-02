# ERROR_HANDLING.md — Error Taxonomy, Logging & User Experience

## Core Principle

**Errors are a user experience, not just a technical concern.**

Every error the user sees should:
1. Tell them what happened (in plain English, not technical jargon)
2. Tell them what to do next (retry, contact support, go back)
3. Never expose internal details (stack traces, DB errors, API responses)

---

## Error Taxonomy

### Client-Facing Error Codes

Each error has a code (for the client to handle programmatically), a user message (displayed to the user), and an HTTP status.

| Code | HTTP | User Message | When |
|------|------|-------------|------|
| `AUTH_REQUIRED` | 401 | "Please sign in to continue." | No valid session |
| `AUTH_FAILED` | 401 | "Unable to sign in. Please check your credentials." | Wrong email/password |
| `AUTH_EMAIL_EXISTS` | 409 | "An account with this email already exists." | Duplicate signup |
| `SUBSCRIPTION_REQUIRED` | 403 | "Subscribe to access The Council." | No active subscription + no free trial |
| `TRIAL_EXHAUSTED` | 403 | "You've used your free debate. Subscribe for unlimited access." | Free trial already used |
| `RATE_LIMITED` | 429 | "You're moving too fast. Please wait a moment." | Rate limit exceeded |
| `CITY_NOT_FOUND` | 404 | "We don't have that city yet. Try one of our featured cities." | Invalid city ID |
| `DEBATE_FAILED` | 503 | "The Council is taking a break. Try again in a moment." | AI API failure |
| `DEBATE_TIMEOUT` | 504 | "The Council took too long. Please try again." | Agent response timeout |
| `PAYMENT_FAILED` | 402 | "Unable to process payment. Please try again or use a different card." | Stripe payment failure |
| `VALIDATION_ERROR` | 400 | "Something doesn't look right. Please check your input." | Invalid request data |
| `INTERNAL_ERROR` | 500 | "Something went wrong on our end. Please try again." | Unhandled server error |

### Response Shape

All API errors follow this shape:
```typescript
interface ApiErrorResponse {
  error: {
    code: string;      // Machine-readable code from table above
    message: string;   // Human-readable message, safe to display
    requestId?: string; // For support tickets — user can share this
  };
}
```

All successful responses follow this shape:
```typescript
interface ApiSuccessResponse<T> {
  data: T;
}
```

---

## Error Handling Layers

### Layer 1: Input Validation (Zod)
Catches malformed requests before they reach business logic.

```typescript
// Zod errors are caught and transformed to VALIDATION_ERROR
try {
  const input = schema.parse(body);
} catch (error) {
  if (error instanceof z.ZodError) {
    // Log the specific validation issues (server-side only)
    logger.warn('validation_error', { issues: error.issues, requestId });
    // Return generic message to user (don't reveal schema structure)
    return { error: { code: 'VALIDATION_ERROR', message: '...' } };
  }
}
```

### Layer 2: Business Logic Errors (AppError)
Known, expected errors thrown by our code.

```typescript
// Custom error class (see SKILLS.md for full implementation)
if (!subscription) {
  throw new AppError('SUBSCRIPTION_REQUIRED', 'Subscribe to access The Council.', 403);
}
```

### Layer 3: External Service Errors
Errors from Claude API, Stripe, Supabase.

```typescript
// External errors are caught, logged in detail, and translated to user-safe errors
try {
  const response = await anthropic.messages.create({ ... });
} catch (error) {
  // Log the full external error (API response, status code, etc.)
  logger.error('claude_api_error', {
    requestId,
    statusCode: error.status,
    errorType: error.error?.type,
    // NEVER log the request body (may contain user data or prompts)
  });
  // Return themed error to user
  throw new AppError('DEBATE_FAILED', 'The Council is taking a break.', 503);
}
```

### Layer 4: Unhandled Errors (Global Catch)
Anything unexpected — bugs, runtime errors, null references.

```typescript
// The final catch in every API route
catch (error) {
  // Log EVERYTHING for debugging
  logger.error('unhandled_error', {
    requestId,
    error: error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
    } : error,
  });
  // User sees nothing useful to an attacker
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.', requestId } },
    { status: 500 }
  );
}
```

---

## Client-Side Error Handling

### Error Boundary
A global React error boundary catches rendering errors:
- Shows a themed fallback UI, not a white screen
- Includes a "Try Again" button that reloads the page
- Reports the error to our logging service (if configured)

### SSE Stream Errors
The debate stream can fail mid-debate:

| Scenario | Client Behavior |
|----------|----------------|
| Agent fails mid-stream | Show partial message + "lost connection" indicator. Continue with next agent. |
| Stream disconnects | Auto-reconnect once. If fails again, show error with retry button. |
| All agents fail | Show full-screen themed error: "The Council is having a heated argument behind closed doors. Try again?" |
| Network loss | Detect offline state, pause UI, show reconnection indicator. |

### Payment Errors
| Scenario | Client Behavior |
|----------|----------------|
| Card declined | Show Stripe's error message (they handle localization). Offer to try another card. |
| Checkout abandoned | Return to previous page. No error shown. |
| Webhook delayed | Polling: check subscription status every 2 seconds for up to 30 seconds after checkout. If still not active, show "Processing your subscription..." |

---

## Logging Strategy

### Log Levels

| Level | Use For | Example |
|-------|---------|---------|
| `debug` | Development-only verbose output | Agent prompt contents, full API responses |
| `info` | Normal operations worth tracking | Debate started, subscription created, user signed up |
| `warn` | Expected problems | Rate limit hit, validation error, auth failure |
| `error` | Unexpected problems requiring investigation | API failure, unhandled exception, webhook verification failure |

### Structured Log Format

```typescript
// Every log entry includes:
{
  level: 'info',
  event: 'debate_started',     // Machine-readable event name
  requestId: 'req_abc123',     // Trace across logs
  userId: 'usr_def456',        // Who (ID only, never email)
  timestamp: '2026-01-15T...',
  // Event-specific fields:
  cityId: 'tokyo',
  mood: 'chaos',
  agentOrder: ['foodie', 'nightowl', 'culture', 'local', 'wanderer'],
  durationMs: 12340,
}
```

### What Gets Logged

| Event | Level | Fields |
|-------|-------|--------|
| `auth_signup` | info | userId |
| `auth_login` | info | userId |
| `auth_failed` | warn | ip (hashed), reason (generic) |
| `subscription_created` | info | userId, priceId |
| `subscription_canceled` | info | userId |
| `debate_started` | info | userId, cityId, mood |
| `debate_completed` | info | userId, cityId, durationMs, agentCount |
| `debate_failed` | error | userId, cityId, agentId, errorType |
| `agent_timeout` | warn | userId, cityId, agentId, timeoutMs |
| `rate_limited` | warn | ip (hashed), userId, endpoint |
| `stripe_webhook` | info | eventType, eventId |
| `stripe_webhook_invalid` | warn | ip (hashed), reason |
| `free_trial_used` | info | fingerprint (hashed), ip (hashed) |
| `free_trial_blocked` | warn | fingerprint (hashed), ip (hashed) |
| `validation_error` | warn | requestId, path |
| `unhandled_error` | error | requestId, error details |

### Sensitive Data in Logs

**NEVER log**:
- Passwords, tokens, API keys (even partially masked)
- Email addresses (use user ID)
- Raw IP addresses in production (always hash)
- Credit card info (we never have this — Stripe handles it)
- Raw user messages (may contain personal info) — log length and sanitized version
- Full AI prompts (contain system prompt content)
- Full Stripe webhook payloads (log event type and ID only)

---

## Retry Strategy

### API Calls to Claude
- 1 automatic retry with exponential backoff (2 second delay)
- On second failure: skip that agent, continue debate
- If 3+ agents fail: abort debate, return DEBATE_FAILED

### Stripe Webhook Processing
- If our handler fails, Stripe automatically retries (up to 3 days)
- Our handler MUST be idempotent — processing the same event twice should not cause issues
- Use `event.id` for idempotency checks

### Database Operations
- No automatic retries for reads (fail fast)
- 1 retry for writes (transient connection issues)
- Never retry after a constraint violation (indicates a logic error)
