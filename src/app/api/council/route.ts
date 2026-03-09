import { z } from 'zod';
import { runDebate } from '@/lib/agents';
import { CITY_MAP } from '@/config/cities';
import { AppError, handleApiError } from '@/lib/errors';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { checkRateLimit, RATE_LIMITS, sanitizeInput } from '@/lib/security';
import type { MoodType, AgentMessage } from '@/types';

const debateRequestSchema = z.object({
  cityId: z.string().min(1),
  mood: z.enum(['chaos', 'chill', 'surprise', 'culture', 'feed-me']).nullable().optional(),
  followUp: z.string().max(500).optional(),
  previousMessages: z
    .array(
      z.object({
        agentId: z.string(),
        agentName: z.string(),
        agentEmoji: z.string(),
        content: z.string(),
        reactions: z.array(z.object({ type: z.string(), agentId: z.string() })),
        venues: z.array(z.string()),
      }),
    )
    .optional(),
});

/**
 * POST /api/council — Starts a Council debate and streams results via SSE.
 *
 * Auth + subscription checks are enforced.
 * Supports follow-up questions with previousMessages context.
 */
export async function POST(request: Request) {
  try {
    // --- Auth check ---
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new AppError('AUTH_REQUIRED');
    }

    const body = await request.json();
    const parsed = debateRequestSchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError('VALIDATION_ERROR');
    }

    const { cityId, mood, followUp, previousMessages } = parsed.data;
    const isFollowUp = !!followUp && !!previousMessages;

    // --- Fetch profile first so we know subscription status for rate limiting ---
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, free_debates_used')
      .eq('id', user.id)
      .single<{ subscription_status: string | null; free_debates_used: number }>();

    const subscriptionStatus = profile?.subscription_status;
    const freeDebatesUsed = profile?.free_debates_used ?? 0;
    const isSubscribed = subscriptionStatus === 'active' || subscriptionStatus === 'trialing';

    // --- Subscription-aware rate limiting ---
    const rateLimitKey = isFollowUp
      ? (isSubscribed ? 'followUpPro' : 'followUp')
      : (isSubscribed ? 'debatePro' : 'debate');
    const rateLimit = checkRateLimit(rateLimitKey, user.id, RATE_LIMITS[rateLimitKey]);
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'RATE_LIMITED',
            message: "You're moving too fast. Please wait a moment.",
          },
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    // Skip subscription gate for follow-ups — they're part of the original debate
    if (!isFollowUp && !isSubscribed && freeDebatesUsed >= 1) {
      throw new AppError('TRIAL_EXHAUSTED');
    }

    // Validate city exists
    if (!CITY_MAP[cityId]) {
      throw new AppError('CITY_NOT_FOUND');
    }

    // Sanitize follow-up input
    const sanitizedFollowUp = followUp ? sanitizeInput(followUp) : undefined;

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const debate = runDebate({
            cityId,
            mood: (mood as MoodType) ?? null,
            followUp: sanitizedFollowUp,
            previousRound: previousMessages as AgentMessage[] | undefined,
          });

          // Collect messages and verdict for saving
          const collectedMessages: AgentMessage[] = [];
          let collectedVerdict = null;

          for await (const event of debate) {
            const data = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(data));

            // Track completed messages (use the last agent_done per agent for reactions)
            if (event.type === 'agent_done' && event.message) {
              const idx = collectedMessages.findIndex((m) => m.agentId === event.message!.agentId);
              if (idx >= 0) {
                collectedMessages[idx] = event.message;
              } else {
                collectedMessages.push(event.message);
              }
            }
            if (event.type === 'verdict' && event.verdict) {
              collectedVerdict = event.verdict;
            }
          }

          // --- Save debate to database (only for initial debates, not follow-ups) ---
          if (!isFollowUp && collectedMessages.length > 0) {
            try {
              const { data: savedDebate } = await supabase
                .from('debates')
                .insert({
                  user_id: user.id,
                  city_id: cityId,
                  mood: mood ?? null,
                  messages: collectedMessages as unknown as string,
                  verdict: collectedVerdict as unknown as string | null,
                })
                .select('id')
                .single<{ id: string }>();

              if (savedDebate) {
                const savedEvent = `data: ${JSON.stringify({
                  type: 'debate_saved',
                  debateId: savedDebate.id,
                })}\n\n`;
                controller.enqueue(encoder.encode(savedEvent));
              }

              // Increment free_debates_used for non-subscribed users
              if (!isSubscribed) {
                await supabase
                  .from('profiles')
                  .update({ free_debates_used: freeDebatesUsed + 1 })
                  .eq('id', user.id);
              }
            } catch (saveErr) {
              // Non-critical — debate still succeeded even if save fails
              console.error('Failed to save debate:', saveErr);
            }
          }
        } catch (err) {
          // Never leak raw error messages to client — use AppError.userMessage or generic fallback
          const userMessage = err instanceof AppError
            ? err.userMessage
            : 'The Council is taking a break. Try again in a moment.';
          console.error('Debate stream error:', err);
          const errorEvent = `data: ${JSON.stringify({
            type: 'error',
            error: userMessage,
          })}\n\n`;
          controller.enqueue(encoder.encode(errorEvent));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
