'use client';

import { UpgradeButton } from '@/components/payment';

interface SubscriptionCardProps {
  isSubscribed: boolean;
  freeDebatesUsed: number;
  priceId: string;
  checkoutPending?: boolean;
  checkoutTimedOut?: boolean;
}

export function SubscriptionCard({
  isSubscribed,
  freeDebatesUsed,
  priceId,
  checkoutPending,
  checkoutTimedOut,
}: SubscriptionCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <h2 className="mb-4 text-lg font-semibold text-zinc-200">Subscription</h2>

      {checkoutPending && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-800/50 bg-amber-900/20 px-4 py-3">
          <svg
            className="h-4 w-4 animate-spin text-amber-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-amber-300">Processing your subscription...</span>
        </div>
      )}

      {checkoutTimedOut && (
        <div className="mb-4 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3">
          <p className="text-sm text-zinc-300">
            Payment received. Your subscription should activate shortly — try refreshing the page.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-400">Plan</span>
          {isSubscribed ? (
            <span className="rounded-full bg-emerald-900/40 px-3 py-0.5 text-xs font-semibold text-emerald-400">
              Pro
            </span>
          ) : (
            <span className="rounded-full bg-zinc-800 px-3 py-0.5 text-xs font-semibold text-zinc-400">
              Free
            </span>
          )}
        </div>

        <div>
          <p className="text-sm text-zinc-400">Free debates used</p>
          <p className="mt-0.5 text-xl font-bold text-white">{freeDebatesUsed} / 1</p>
        </div>

        {isSubscribed ? (
          <p className="text-sm text-zinc-400">
            Unlimited debates. Manage your subscription in your Stripe portal.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-zinc-400">
              Upgrade to Pro for unlimited Council debates, saved history, and more.
            </p>
            <UpgradeButton priceId={priceId} />
          </div>
        )}
      </div>
    </div>
  );
}
