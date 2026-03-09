'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { forgotPassword, type AuthFormState } from '@/app/(public)/forgot-password/actions';
import { Button } from '@/components/ui';

const initialState: AuthFormState = { error: null, success: null };

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(forgotPassword, initialState);

  // Success state — show confirmation message instead of form
  if (state.success) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-8 text-center">
          <div className="mb-4 text-4xl">✉️</div>
          <h2 className="text-xl font-bold text-white">Check your inbox</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">
            {state.success}
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">Reset your password</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        {state.error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {state.error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-zinc-300">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-white placeholder-zinc-500 outline-none transition-colors focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
            placeholder="you@example.com"
          />
        </div>

        <Button type="submit" disabled={isPending} className="mt-2 w-full">
          {isPending ? 'Sending reset link...' : 'Send reset link'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        Remember your password?{' '}
        <Link href="/login" className="font-medium text-white underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
