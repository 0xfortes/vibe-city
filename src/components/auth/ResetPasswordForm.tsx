'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { resetPassword, type AuthFormState } from '@/app/(public)/reset-password/actions';
import { Button } from '@/components/ui';

const initialState: AuthFormState = { error: null, success: null };

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(resetPassword, initialState);

  // Success state — show confirmation and link to login
  if (state.success) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-8 text-center">
          <div className="mb-4 text-4xl">✅</div>
          <h2 className="text-xl font-bold text-white">Password updated</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">
            {state.success}
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">Set new password</h1>
        <p className="mt-2 text-sm text-zinc-400">Enter your new password below</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        {state.error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {state.error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-zinc-300">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={6}
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-white placeholder-zinc-500 outline-none transition-colors focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
            placeholder="At least 6 characters"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-300">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            minLength={6}
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-white placeholder-zinc-500 outline-none transition-colors focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
            placeholder="Repeat your password"
          />
        </div>

        <Button type="submit" disabled={isPending} className="mt-2 w-full">
          {isPending ? 'Updating password...' : 'Update password'}
        </Button>
      </form>
    </div>
  );
}
