'use client';

import { motion } from 'framer-motion';
import type { VerdictCard } from '@/types';
import { Card } from '@/components/ui';

interface VerdictCardDisplayProps {
  verdict: VerdictCard;
}

export function VerdictCardDisplay({ verdict }: VerdictCardDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <Card header="The Verdict">
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="text-amber-400">&#9733;</span>
              <span className="text-sm font-semibold text-amber-400">Top Pick</span>
            </div>
            <p className="text-sm text-zinc-200">{verdict.topPick}</p>
          </div>

          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="text-emerald-400">&#10047;</span>
              <span className="text-sm font-semibold text-emerald-400">Wildcard</span>
            </div>
            <p className="text-sm text-zinc-200">{verdict.wildcard}</p>
          </div>

          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="text-zinc-400">&#128172;</span>
              <span className="text-sm font-semibold text-zinc-400">The Debate</span>
            </div>
            <p className="text-sm text-zinc-300">{verdict.theDebate}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
