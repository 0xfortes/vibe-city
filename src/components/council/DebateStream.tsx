'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { AgentMessage } from '@/types';
import { AGENTS } from '@/config/agents';
import { AGENT_COLORS } from '@/config/agent-colors';
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
  const nextColors = nextAgent ? AGENT_COLORS[nextAgent.id] : null;

  return (
    <div className="relative">
      {/* Top fade gradient */}
      <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-4 bg-gradient-to-b from-zinc-950 to-transparent" />

      <div
        ref={scrollRef}
        className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto py-4"
      >
        <AnimatePresence mode="popLayout">
          {messages.map((message, i) => (
            <AgentMessageBubble
              key={`${message.agentId}-${i}`}
              message={message}
              index={i}
            />
          ))}
        </AnimatePresence>

        {isStreaming && messages.length > 0 && nextAgent && nextColors && (
          <div className={`flex items-center gap-3 ${nextColors.text}`}>
            <AgentAvatar agentId={nextAgent.id} showName={false} size="sm" />
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

      {/* Bottom fade gradient */}
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-4 bg-gradient-to-t from-zinc-950 to-transparent" />
    </div>
  );
}
