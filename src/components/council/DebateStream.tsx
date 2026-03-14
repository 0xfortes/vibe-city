'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { AgentMessage } from '@/types';
import { AGENTS } from '@/config/agents';
import { AGENT_COLORS } from '@/config/agent-colors';
import { AgentAvatar } from '@/components/ui';
import { AgentMessageBubble } from './AgentMessageBubble';

interface DebateStreamProps {
  messages: AgentMessage[];
  isStreaming: boolean;
  revealedCount: number;
  expandedAgent: number | null;
  onToggleAgent: (index: number) => void;
}

/** Bouncing dots CSS animation for typing indicator */
function BouncingDots({ color }: { color: string }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor: color,
            animation: 'bounce-dot 1.2s infinite',
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </span>
  );
}

export function DebateStream({
  messages,
  isStreaming,
  revealedCount,
  expandedAgent,
  onToggleAgent,
}: DebateStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [revealedCount]);

  const visibleMessages = messages.slice(0, revealedCount);
  const isRevealing = revealedCount < messages.length || isStreaming;

  // Determine next agent for typing indicator
  const nextMessageIndex = revealedCount;
  const nextMessage = messages[nextMessageIndex];
  const nextAgent = nextMessage
    ? AGENTS.find((a) => a.id === nextMessage.agentId)
    : isStreaming && messages.length === revealedCount
      ? AGENTS[messages.length < AGENTS.length ? messages.length : 0]
      : null;
  const nextColors = nextAgent ? AGENT_COLORS[nextAgent.id] : null;

  const totalAgents = AGENTS.length;
  const progressPercent = totalAgents > 0 ? (revealedCount / totalAgents) * 100 : 0;

  return (
    <div className="relative flex flex-col gap-3">
      {/* Progress bar */}
      {isRevealing && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#00FFaa] to-[#06b6d4] transition-all duration-700 ease-out"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      )}

      {/* Agent cards */}
      <div
        ref={scrollRef}
        className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto py-2"
      >
        {/* Initial assembling state */}
        {isStreaming && messages.length === 0 && (
          <div className="flex items-center justify-center gap-3 py-8 text-zinc-500">
            <span className="text-sm">The Council is assembling...</span>
            <BouncingDots color="#71717a" />
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {visibleMessages.map((message, i) => (
            <AgentMessageBubble
              key={`${message.agentId}-${i}`}
              message={message}
              index={i}
              isExpanded={expandedAgent === i}
              onToggle={() => onToggleAgent(i)}
            />
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isRevealing && nextAgent && nextColors && visibleMessages.length > 0 && (
          <div className={`flex items-center gap-3 px-3 py-2 ${nextColors.text}`}>
            <AgentAvatar agentId={nextAgent.id} showName={false} size="sm" />
            <span className="text-sm">{nextAgent.name} is thinking</span>
            <BouncingDots color={nextColors.accent} />
          </div>
        )}
      </div>

    </div>
  );
}
