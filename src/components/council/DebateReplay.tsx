'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import type { AgentMessage, VerdictCard } from '@/types';
import { DebateStream } from './DebateStream';
import { VerdictCardDisplay } from './VerdictCardDisplay';

interface DebateReplayProps {
  cityName: string;
  mood: string | null;
  messages: AgentMessage[];
  verdict: VerdictCard | null;
  createdAt: string;
}

export function DebateReplay({ cityName, mood, messages, verdict, createdAt }: DebateReplayProps) {
  const [expandedAgent, setExpandedAgent] = useState<number | null>(null);

  const handleToggleAgent = useCallback((index: number) => {
    setExpandedAgent((prev) => (prev === index ? null : index));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard"
            className="mb-2 inline-block text-sm text-zinc-500 transition-colors hover:text-zinc-300"
          >
            &larr; Back to dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white">{cityName}</h1>
          <div className="mt-1 flex items-center gap-3">
            {mood && (
              <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">
                {mood}
              </span>
            )}
            <span className="text-xs text-zinc-500">
              {new Date(createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Verdict */}
      {verdict && (
        <VerdictCardDisplay
          verdict={verdict}
          agentEmojis={messages.map((m) => m.agentEmoji)}
        />
      )}

      {/* Debate — all revealed, all collapsed */}
      {messages.length > 0 && (
        <DebateStream
          messages={messages}
          isStreaming={false}
          revealedCount={messages.length}
          expandedAgent={expandedAgent}
          onToggleAgent={handleToggleAgent}
          onSkipToVerdict={() => {}}
        />
      )}
    </div>
  );
}
