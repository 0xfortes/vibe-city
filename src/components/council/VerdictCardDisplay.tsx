'use client';

import { motion } from 'framer-motion';
import type { VerdictCard } from '@/types';

interface VerdictCardDisplayProps {
  verdict: VerdictCard;
  agentEmojis?: string[];
  onNewDebate?: () => void;
}

export function VerdictCardDisplay({ verdict, agentEmojis = [], onNewDebate }: VerdictCardDisplayProps) {
  // Handle legacy verdict format from saved debates
  const normalizedVerdict: VerdictCard = 'topPick' in (verdict as unknown as Record<string, unknown>)
    ? {
        route: ((verdict as unknown as Record<string, unknown>).topPick as string).split(/\s+/).slice(0, 10).join(' '),
        description: (verdict as unknown as Record<string, unknown>).topPick as string,
        consensus: ((verdict as unknown as Record<string, unknown>).theDebate as string) ?? 'The Council debated.',
        wildcard: ((verdict as unknown as Record<string, unknown>).wildcard as string) ?? '',
      }
    : verdict;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Gradient border wrapper — 2px */}
      <div className="rounded-2xl bg-gradient-to-br from-[#00FFaa] via-[#06b6d4] to-[#a78bfa] p-[2px]">
        <div className="rounded-2xl bg-zinc-950 p-6 sm:p-8">
          {/* Divider label */}
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs font-semibold uppercase tracking-widest text-white/30">
              The Council has spoken
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Top Pick — route headline */}
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-lg text-[#00FFaa]">&#9733;</span>
              <span className="text-xs font-bold uppercase tracking-wide text-[#00FFaa]">
                Top Pick
              </span>
            </div>
            <p className="text-[26px] font-bold leading-snug text-white">{normalizedVerdict.route}</p>
          </div>

          {/* Description */}
          <p className="mb-6 text-sm leading-relaxed text-white/60">{normalizedVerdict.description}</p>

          {/* Agent consensus */}
          {(agentEmojis.length > 0 || normalizedVerdict.consensus) && (
            <div className="mb-6 flex items-center gap-3">
              {agentEmojis.length > 0 && (
                <div className="flex -space-x-1">
                  {agentEmojis.map((emoji, i) => (
                    <span key={i} className="text-lg">{emoji}</span>
                  ))}
                </div>
              )}
              <p className="text-sm leading-relaxed text-white/50">{normalizedVerdict.consensus}</p>
            </div>
          )}

          {/* Wildcard sub-card */}
          <div className="mb-6 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.08] p-4">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-[#06b6d4]">🎲</span>
              <span className="text-xs font-bold uppercase tracking-wide text-[#06b6d4]">
                Wildcard
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/60">{normalizedVerdict.wildcard}</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-white/50 transition-colors hover:border-white/20 hover:text-white/70"
            >
              Share
            </button>
            {onNewDebate && (
              <button
                type="button"
                onClick={onNewDebate}
                className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-medium text-white/50 transition-colors hover:border-white/20 hover:text-white/70"
              >
                New debate
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
