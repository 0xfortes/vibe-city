'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface GateModalProps {
  type: 'auth' | 'paywall';
  onClose: () => void;
}

export function GateModal({ type, onClose }: GateModalProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="relative mx-4 w-full max-w-md rounded-2xl border border-white/[0.06] bg-[--card-bg] p-8"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-white/30 transition-colors hover:text-white/60"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {type === 'auth' ? (
          <div className="flex flex-col items-center gap-6 text-center">
            <h2 className="text-xl font-bold text-white">
              Sign in to let The Council debate for you
            </h2>
            <div className="flex w-full flex-col gap-3">
              <Link
                href="/login"
                className="rounded-lg border border-white/[0.08] bg-white/5 px-6 py-3 text-center text-sm font-medium text-white/70 transition-all hover:bg-white/[0.08] hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-gradient-to-r from-[#00FFaa] to-[#06b6d4] px-6 py-3 text-center text-sm font-semibold text-[#08080c] transition-opacity hover:opacity-90"
              >
                Create account
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 text-center">
            <h2 className="text-xl font-bold text-white">
              You&apos;ve used your free debate
            </h2>
            <p className="text-sm text-white/40">
              Upgrade to VibeCITY Pro for unlimited Council debates, saved history, and more.
            </p>
            <div className="flex w-full flex-col gap-3">
              <Link
                href="/dashboard"
                className="shimmer-btn rounded-lg bg-gradient-to-r from-[#00FFaa] to-[#06b6d4] px-6 py-3 text-center text-sm font-semibold text-[#08080c] transition-opacity hover:opacity-90"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
