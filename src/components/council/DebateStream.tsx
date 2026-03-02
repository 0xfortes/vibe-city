'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { AgentMessage } from '@/types';
import { AGENTS } from '@/config/agents';
import { AgentAvatar, LoadingSpinner } from '@/components/ui';
import { AgentMessageBubble } from './AgentMessageBubble';

interface DebateStreamProps {
  messages: AgentMessage[];
  isStreaming: boolean;
}

export function DebateStream({ messages, isStreaming }: DebateStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  // Determine which agent speaks next for the thinking indicator
  const nextAgentIndex = messages.length < AGENTS.length ? messages.length : 0;
  const nextAgent = AGENTS[nextAgentIndex];

  return (
    <div ref={scrollRef} className="flex flex-col gap-6">
      <AnimatePresence mode="popLayout">
        {messages.map((message, i) => (
          <AgentMessageBubble
            key={`${message.agentId}-${i}`}
            message={message}
            index={i}
          />
        ))}
      </AnimatePresence>

      {isStreaming && messages.length > 0 && nextAgent && (
        <div className="flex items-center gap-3 text-zinc-500">
          <AgentAvatar agentId={nextAgent.id} showName={false} size="md" />
          <LoadingSpinner size="sm" />
          <span className="text-sm">{nextAgent.name} is thinking...</span>
        </div>
      )}

      {isStreaming && messages.length === 0 && (
        <div className="flex items-center justify-center gap-3 py-8 text-zinc-500">
          <LoadingSpinner size="md" />
          <span className="text-sm">The Council is assembling...</span>
        </div>
      )}
    </div>
  );
}
