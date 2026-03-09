'use client';

import { motion } from 'framer-motion';
import type { VerdictCard } from '@/types';

interface VerdictCardDisplayProps {
  verdict: VerdictCard;
}

export function VerdictCardDisplay({ verdict }: VerdictCardDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Gradient border wrapper */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/20 via-transparent to-emerald-500/20 p-px">
        <div className="rounded-2xl bg-zinc-950 p-6">
          <h3 className="mb-5 text-lg font-bold text-white">The Verdict</h3>

          <div className="flex flex-col gap-5">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-amber-400">&#9733;</span>
                <span className="text-base font-semibold text-amber-400">Top Pick</span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-200">{verdict.topPick}</p>
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-emerald-400">&#10047;</span>
                <span className="text-base font-semibold text-emerald-400">Wildcard</span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-200">{verdict.wildcard}</p>
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-zinc-400">&#128172;</span>
                <span className="text-base font-semibold text-zinc-400">The Debate</span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-300">{verdict.theDebate}</p>
            </div>

            {verdict.hiddenGem && (
              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-purple-400">&#128142;</span>
                  <span className="text-base font-semibold text-purple-400">Hidden Gem</span>
                </div>
                <p className="text-sm leading-relaxed text-zinc-200">{verdict.hiddenGem}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
