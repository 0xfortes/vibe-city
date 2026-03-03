'use client';

import type { AgentId } from '@/types';
import { AGENT_MAP } from '@/config/agents';
import { AGENT_COLORS } from '@/config/agent-colors';

interface AgentAvatarProps {
  agentId: AgentId;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CIRCLE_SIZE_CLASSES = {
  sm: 'h-7 w-7 text-sm',
  md: 'h-9 w-9 text-lg',
  lg: 'h-12 w-12 text-2xl',
};

const NAME_SIZE_CLASSES = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function AgentAvatar({
  agentId,
  showName = true,
  size = 'md',
  className = '',
}: AgentAvatarProps) {
  const agent = AGENT_MAP[agentId];
  const colors = AGENT_COLORS[agentId];
  if (!agent) return null;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`inline-flex items-center justify-center rounded-full ${colors.bg} ${CIRCLE_SIZE_CLASSES[size]}`}
        role="img"
        aria-label={agent.name}
      >
        {agent.emoji}
      </span>
      {showName && (
        <span className={`font-medium ${colors.text} ${NAME_SIZE_CLASSES[size]}`}>
          {agent.name}
        </span>
      )}
    </div>
  );
}
