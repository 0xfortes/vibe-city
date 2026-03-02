'use client';

import type { AgentDomain } from '@/types';

type BadgeVariant = 'default' | 'domain' | 'category';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  domain?: AgentDomain;
  className?: string;
}

const DOMAIN_COLORS: Record<AgentDomain, string> = {
  nightlife: 'bg-purple-900/60 text-purple-300 border-purple-700/50',
  food: 'bg-orange-900/60 text-orange-300 border-orange-700/50',
  culture: 'bg-blue-900/60 text-blue-300 border-blue-700/50',
  local: 'bg-amber-900/60 text-amber-300 border-amber-700/50',
  wander: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50',
};

export function Badge({
  label,
  variant = 'default',
  domain,
  className = '',
}: BadgeProps) {
  const colorClass =
    variant === 'domain' && domain
      ? DOMAIN_COLORS[domain]
      : 'bg-zinc-800 text-zinc-300 border-zinc-700';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
}
