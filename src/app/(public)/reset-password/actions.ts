'use server';

import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export interface AuthFormState {
  error: string | null;
  success: string | null;
}

export async function resetPassword(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, success: null };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    console.error('Password update error:', error.message, error.status);

    if (error.message.includes('same password') || error.message.includes('different password')) {
      return { error: 'New password must be different from your current password.', success: null };
    }
    if (error.status === 422) {
      return { error: 'Password is too weak. Use at least 6 characters.', success: null };
    }

    return { error: 'Unable to update password. The reset link may have expired.', success: null };
  }

  return {
    error: null,
    success: 'Your password has been updated successfully.',
  };
}
