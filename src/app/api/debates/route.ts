import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AppError, handleApiError } from '@/lib/errors';
import { checkRateLimit, RATE_LIMITS } from '@/lib/security';

const deleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(50),
});

/**
 * DELETE /api/debates — Bulk-delete debates by ID.
 * RLS ensures users can only delete their own debates.
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new AppError('AUTH_REQUIRED');
    }

    // Rate limit delete operations
    const rateLimit = checkRateLimit('checkout', user.id, RATE_LIMITS.checkout);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: "You're moving too fast. Please wait a moment." } },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } },
      );
    }

    const body = await request.json();
    const parsed = deleteSchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError('VALIDATION_ERROR');
    }

    // RLS policy ensures user_id match — belt-and-suspenders with explicit filter
    const { error } = await supabase
      .from('debates')
      .delete()
      .in('id', parsed.data.ids)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to delete debates:', error);
      throw new AppError('INTERNAL_ERROR');
    }

    return NextResponse.json({ data: { deleted: parsed.data.ids.length } });
  } catch (error) {
    return handleApiError(error);
  }
}
