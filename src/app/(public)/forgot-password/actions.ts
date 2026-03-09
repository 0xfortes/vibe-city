'use server';

import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export interface AuthFormState {
  error: string | null;
  success: string | null;
}

export async function forgotPassword(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get('email'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, success: null };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  if (error) {
    console.error('Password reset error:', error.message, error.status);

    if (error.status === 429) {
      return { error: 'Too many requests. Please wait a few minutes and try again.', success: null };
    }

    return { error: 'Unable to send reset email. Please try again.', success: null };
  }

  // Always show success to prevent email enumeration
  return {
    error: null,
    success:
      'If an account exists with that email, we sent a password reset link. Check your inbox (and spam folder).',
  };
}
