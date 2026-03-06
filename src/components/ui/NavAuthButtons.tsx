'use client';

import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { signout } from '@/app/(public)/signout/actions';

interface NavAuthButtonsProps {
  user: User | null;
}

export function NavAuthButtons({ user }: NavAuthButtonsProps) {
  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
        >
          Dashboard
        </Link>
        <form action={signout}>
          <button
            type="submit"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
          >
            Sign out
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
      >
        Sign in
      </Link>
      <Link
        href="/signup"
        className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200"
      >
        Sign up
      </Link>
    </div>
  );
}
