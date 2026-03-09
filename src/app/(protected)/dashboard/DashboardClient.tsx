'use client';

import { useEffect, useState, useTransition, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { QuickStart, DebateHistory, SubscriptionCard } from '@/components/dashboard';
import { deleteDebates, checkSubscriptionStatus } from './actions';

interface DashboardClientProps {
  cities: { id: string; name: string; country: string }[];
  debates: {
    id: string;
    city_id: string;
    cityName: string;
    mood: string | null;
    verdict: { topPick: string } | null;
    created_at: string;
  }[];
  isSubscribed: boolean;
  freeDebatesUsed: number;
  priceId: string;
}

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 15000;

export function DashboardClient({
  cities,
  debates,
  isSubscribed,
  freeDebatesUsed,
  priceId,
}: DashboardClientProps) {
  const [, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const router = useRouter();

  const isCheckoutRedirect = searchParams.get('checkout') === 'success';
  const [checkoutPending, setCheckoutPending] = useState(
    isCheckoutRedirect && !isSubscribed
  );
  const [checkoutTimedOut, setCheckoutTimedOut] = useState(false);

  const pollSubscription = useCallback(async () => {
    const { status } = await checkSubscriptionStatus();
    if (status === 'active' || status === 'trialing') {
      setCheckoutPending(false);
      router.replace('/dashboard');
      router.refresh();
      return true;
    }
    return false;
  }, [router]);

  useEffect(() => {
    if (!checkoutPending) return;

    let stopped = false;

    // Poll immediately on mount, then every POLL_INTERVAL_MS
    const poll = async () => {
      if (stopped) return;
      const resolved = await pollSubscription();
      if (resolved) {
        stopped = true;
        clearInterval(interval);
      }
    };

    poll();

    const interval = setInterval(poll, POLL_INTERVAL_MS);

    const timeout = setTimeout(() => {
      stopped = true;
      clearInterval(interval);
      setCheckoutPending(false);
      setCheckoutTimedOut(true);
      // Strip ?checkout=success so refresh doesn't restart polling
      router.replace('/dashboard');
    }, POLL_TIMEOUT_MS);

    return () => {
      stopped = true;
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [checkoutPending, pollSubscription, router]);

  function handleDeleteDebates(ids: string[]) {
    startTransition(async () => {
      const result = await deleteDebates(ids);
      if (result.error) {
        console.error('Delete failed:', result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Top row: QuickStart + SubscriptionCard side by side */}
      <div className="grid gap-6 lg:grid-cols-2">
        <QuickStart cities={cities} />
        <SubscriptionCard
          isSubscribed={isSubscribed}
          freeDebatesUsed={freeDebatesUsed}
          priceId={priceId}
          checkoutPending={checkoutPending}
          checkoutTimedOut={checkoutTimedOut}
        />
      </div>

      {/* Full width debate history */}
      <DebateHistory debates={debates} onDelete={handleDeleteDebates} />
    </div>
  );
}
