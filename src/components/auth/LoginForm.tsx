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
        <p className="mt-2 text-sm text-zinc-400">Sign in to access The Council</p>
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

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-zinc-300">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            minLength={6}
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-white placeholder-zinc-500 outline-none transition-colors focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
            placeholder="••••••••"
          />
          <Link
            href="/forgot-password"
            className="mt-1 self-end text-sm text-zinc-500 hover:text-zinc-300"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" disabled={isPending} className="mt-2 w-full">
          {isPending ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-white underline-offset-4 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
