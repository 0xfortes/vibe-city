import type { AgentId } from '@/types';

export interface AgentColorSet {
  border: string;
  bg: string;
  text: string;
  accent: string;
  ring: string;
}

export const AGENT_COLORS: Record<AgentId, AgentColorSet> = {
  nightowl: {
    border: 'border-purple-500',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    accent: '#a855f7',
    ring: 'ring-purple-500/40',
  },
  foodie: {
    border: 'border-orange-500',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    accent: '#f97316',
    ring: 'ring-orange-500/40',
  },
  culture: {
    border: 'border-blue-500',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    accent: '#3b82f6',
    ring: 'ring-blue-500/40',
  },
  local: {
    border: 'border-amber-500',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    accent: '#f59e0b',
    ring: 'ring-amber-500/40',
  },
  wanderer: {
    border: 'border-emerald-500',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    accent: '#10b981',
    ring: 'ring-emerald-500/40',
  },
};
