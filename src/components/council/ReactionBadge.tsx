'use client';

import type { AgentReaction } from '@/types';
import { AGENT_MAP } from '@/config/agents';
import { AGENT_COLORS } from '@/config/agent-colors';

interface ReactionBadgeProps {
  reaction: AgentReaction;
}

const REACTION_EMOJI: Record<AgentReaction['type'], string> = {
  fire: '\uD83D\uDD25',
  nah: '\uD83D\uDC4E',
  hmm: '\uD83E\uDD14',
  cosign: '\uD83E\uDD1D',
};

export function ReactionBadge({ reaction }: ReactionBadgeProps) {
  const agent = AGENT_MAP[reaction.agentId];
  const colors = AGENT_COLORS[reaction.agentId];
  if (!agent) return null;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full ${colors.bg} px-2 py-0.5 text-xs`}>
      <span>{agent.emoji}</span>
      <span>{REACTION_EMOJI[reaction.type]}</span>
    </span>
  );
}
