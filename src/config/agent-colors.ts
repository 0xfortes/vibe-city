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
    border: 'border-violet-400',
    bg: 'bg-violet-400/10',
    text: 'text-violet-400',
    accent: '#a78bfa',
    ring: 'ring-violet-400/40',
  },
  foodie: {
    border: 'border-orange-500',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    accent: '#f97316',
    ring: 'ring-orange-500/40',
  },
  culture: {
    border: 'border-pink-500',
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
    accent: '#ec4899',
    ring: 'ring-pink-500/40',
  },
  local: {
    border: 'border-red-500',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    accent: '#ef4444',
    ring: 'ring-red-500/40',
  },
  wanderer: {
    border: 'border-cyan-500',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    accent: '#06b6d4',
    ring: 'ring-cyan-500/40',
  },
};
