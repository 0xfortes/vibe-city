'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [debateExpanded, setDebateExpanded] = useState(false);

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
      {verdict && <VerdictCardDisplay verdict={verdict} />}

      {/* Collapsible debate */}
      <div>
        <button
          type="button"
          onClick={() => setDebateExpanded((prev) => !prev)}
          className="flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
        >
          <motion.span
            animate={{ rotate: debateExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            &#9654;
          </motion.span>
          {debateExpanded ? 'Hide the full debate' : 'Show the full debate'}
        </button>

        <AnimatePresence>
          {debateExpanded && (
            <motion.div
              className="mt-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DebateStream messages={messages} isStreaming={false} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
