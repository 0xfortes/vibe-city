'use client';

import type { AgentId } from '@/types';
import { AGENT_MAP } from '@/config/agents';

interface AgentAvatarProps {
  agentId: AgentId;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
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
  if (!agent) return null;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className={SIZE_CLASSES[size]} role="img" aria-label={agent.name}>
        {agent.emoji}
      </span>
      {showName && (
        <span className={`font-medium text-zinc-200 ${NAME_SIZE_CLASSES[size]}`}>
          {agent.name}
        </span>
      )}
    </div>
  );
}
