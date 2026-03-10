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
      <div className="flex items-center gap-6">
        <Link
          href="/dashboard"
          className="nav-link-accent text-sm font-medium text-white/50 transition-colors hover:text-white/90"
        >
          Dashboard
        </Link>
        <form action={signout}>
          <button
            type="submit"
            className="rounded-full border border-white/[0.1] bg-transparent px-4 py-1.5 text-sm text-white/60 transition-all hover:border-white/[0.25] hover:text-white"
          >
            Sign out
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/login"
        className="nav-link-accent text-sm font-medium text-white/50 transition-colors hover:text-white/90"
      >
        Sign in
      </Link>
      <Link
        href="/signup"
        className="rounded-full bg-gradient-to-r from-[#00FFaa] to-[#06b6d4] px-4 py-1.5 text-sm font-semibold text-[#08080c] transition-opacity hover:opacity-90"
      >
        Sign up
      </Link>
    </div>
  );
}
