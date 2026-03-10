'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signup, type AuthFormState } from '@/app/(public)/signup/actions';
import { Button } from '@/components/ui';

const initialState: AuthFormState = { error: null, success: null };

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signup, initialState);

  // Success state — show confirmation message instead of form
  if (state.success) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-[#00FFaa]/20 bg-[#00FFaa]/10 p-8 text-center">
          <div className="mb-4 text-4xl">✉️</div>
          <h2 className="text-xl font-bold text-white">Check your inbox</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            {state.success}
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-gradient-to-r from-[#00FFaa] to-[#06b6d4] px-6 py-2.5 text-sm font-semibold text-[#08080c] transition-opacity hover:opacity-90"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="mt-2 text-sm text-white/40">Get your first Council debate free</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        {state.error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {state.error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="displayName" className="text-sm font-medium text-white/50">
            Display name
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            autoComplete="name"
            className="rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-2.5 text-white placeholder-white/25 outline-none transition-all focus:border-[#00FFaa]/40 focus:ring-1 focus:ring-[#00FFaa]/30 focus:shadow-[0_0_20px_rgba(0,255,170,0.06)]"
            placeholder="Your name"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-white/50">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-2.5 text-white placeholder-white/25 outline-none transition-all focus:border-[#00FFaa]/40 focus:ring-1 focus:ring-[#00FFaa]/30 focus:shadow-[0_0_20px_rgba(0,255,170,0.06)]"
            placeholder="you@example.com"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-white/50">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={6}
            className="rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-2.5 text-white placeholder-white/25 outline-none transition-all focus:border-[#00FFaa]/40 focus:ring-1 focus:ring-[#00FFaa]/30 focus:shadow-[0_0_20px_rgba(0,255,170,0.06)]"
            placeholder="At least 6 characters"
          />
        </div>

        <Button type="submit" disabled={isPending} className="mt-2 w-full">
          {isPending ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-white/40">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-[#00FFaa] underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
