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
    <div className="rounded-2xl border border-white/[0.06] bg-[--card-bg] p-6">
      <h2 className="font-mono-label mb-5 text-xs font-bold text-white/35">Subscription</h2>

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
        <div className="mb-4 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3">
          <p className="text-sm text-white/60">
            Payment received. Your subscription should activate shortly — try refreshing the page.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/45">Plan</span>
          {isSubscribed ? (
            <span className="font-mono-label rounded-lg bg-[#00FFaa]/15 px-3 py-1 text-[11px] font-bold text-[#00FFaa]">
              Pro
            </span>
          ) : (
            <span className="font-mono-label rounded-lg bg-white/[0.06] border border-white/[0.08] px-3 py-1 text-[11px] font-bold text-white/40">
              Free
            </span>
          )}
        </div>

        <div>
          <p className="text-sm text-white/35">Free debates used</p>
          <p className="mt-0.5 text-xl font-bold text-white">{freeDebatesUsed} / 1</p>
        </div>

        {isSubscribed ? (
          <p className="text-sm text-white/45">
            Unlimited debates. Manage your subscription in your Stripe portal.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-white/45">
              Upgrade to <span className="font-semibold text-[#00FFaa]">Pro</span> for unlimited Council debates, saved history, and more.
            </p>
            <UpgradeButton priceId={priceId} />
          </div>
        )}
      </div>
    </div>
  );
}
