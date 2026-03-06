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
}

export async function signup(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    displayName: formData.get('displayName') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
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
    if (error.message.includes('already registered')) {
      return { error: 'An account with this email already exists.' };
    }
    return { error: 'Unable to create account. Please try again.' };
  }

  // If email confirmation is required, identities will be empty
  if (data.user?.identities?.length === 0) {
    return { error: 'An account with this email already exists.' };
  }
  if (data.user && !data.user.confirmed_at) {
    return { error: 'Check your email to confirm your account before signing in.' };
  }

  redirect('/dashboard');
}
