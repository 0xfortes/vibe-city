'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(1, 'Please enter a display name').max(50).optional(),
});

export interface AuthFormState {
  error: string | null;
  success: string | null;
}

export async function signup(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    displayName: formData.get('displayName') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, success: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.displayName,
      },
    },
  });

  if (error) {
    console.error('Signup error:', error.message, error.status);

    // Parse Supabase error codes for specific messages
    if (error.message.includes('already registered') || error.status === 422) {
      return { error: 'An account with this email already exists.', success: null };
    }
    if (error.message.includes('password') && error.message.includes('least')) {
      return { error: 'Password is too weak. Use at least 6 characters with a mix of letters and numbers.', success: null };
    }
    if (error.status === 429) {
      return { error: 'Too many signup attempts. Please wait a few minutes and try again.', success: null };
    }
    if (error.message.includes('valid email') || error.message.includes('invalid')) {
      return { error: 'Please enter a valid email address.', success: null };
    }
    return { error: 'Unable to create account. Please try again.', success: null };
  }

  // If email confirmation is required, identities will be empty
  if (data.user?.identities?.length === 0) {
    return { error: 'An account with this email already exists.', success: null };
  }
  if (data.user && !data.user.confirmed_at) {
    return {
      error: null,
      success: 'We sent a confirmation link to your email. Check your inbox (and spam folder) to activate your account.',
    };
  }

  redirect('/dashboard');
}
