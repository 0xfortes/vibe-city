'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

interface UpgradeButtonProps {
  priceId: string;
}

export function UpgradeButton({ priceId }: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message ?? 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      setLoading(false);
    }
  }

  return (
    <Button variant="shimmer" onClick={handleUpgrade} loading={loading} disabled={loading}>
      {loading ? 'Redirecting...' : 'Upgrade to Pro — $9.99/mo'}
    </Button>
  );
}
