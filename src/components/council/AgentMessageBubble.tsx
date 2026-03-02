'use client';

import { motion } from 'framer-motion';
import type { AgentMessage } from '@/types';
import { AgentAvatar } from '@/components/ui';
import { ReactionBadge } from './ReactionBadge';

interface AgentMessageBubbleProps {
  message: AgentMessage;
  index: number;
}

function highlightVenues(content: string, venues: string[]): string {
  let result = content;
  for (const venue of venues) {
    // Escape regex special chars in venue name
    const escaped = venue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escaped, 'g'), `**${venue}**`);
  }
  return result;
}

function renderContent(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="text-white">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function AgentMessageBubble({ message, index }: AgentMessageBubbleProps) {
  const highlighted = highlightVenues(message.content, message.venues);

  return (
    <motion.div
      className="flex gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <div className="shrink-0 pt-1">
        <AgentAvatar agentId={message.agentId} showName={false} size="md" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="text-sm font-medium text-zinc-300">{message.agentName}</span>
        <p className="text-sm leading-relaxed text-zinc-300">
          {renderContent(highlighted)}
        </p>
        {message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.reactions.map((reaction, i) => (
              <ReactionBadge key={`${reaction.agentId}-${i}`} reaction={reaction} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
