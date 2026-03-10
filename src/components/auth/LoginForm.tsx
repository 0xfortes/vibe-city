'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { login, type AuthFormState } from '@/app/(public)/login/actions';
import { Button } from '@/components/ui';

const initialState: AuthFormState = { error: null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-white/40">Sign in to access The Council</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        {state.error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {state.error}
          </div>
        )}

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
            autoComplete="current-password"
            minLength={6}
            className="rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-2.5 text-white placeholder-white/25 outline-none transition-all focus:border-[#00FFaa]/40 focus:ring-1 focus:ring-[#00FFaa]/30 focus:shadow-[0_0_20px_rgba(0,255,170,0.06)]"
            placeholder="••••••••"
          />
          <Link
            href="/forgot-password"
            className="mt-1 self-end text-sm text-[#00FFaa]/60 hover:text-[#00FFaa]"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" disabled={isPending} className="mt-2 w-full">
          {isPending ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-white/40">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-[#00FFaa] underline-offset-4 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
