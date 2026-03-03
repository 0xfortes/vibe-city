'use client';

import { motion } from 'framer-motion';
import type { VibeScore } from '@/types';
import { AGENTS } from '@/config/agents';
import { AGENT_COLORS } from '@/config/agent-colors';
import { Card, ScoreBar } from '@/components/ui';

interface VibeScoreCardProps {
  vibeScore: VibeScore;
  cityName: string;
}

const SCORE_FIELDS: Array<{ key: keyof VibeScore; agentIndex: number }> = [
  { key: 'nightlife_score', agentIndex: 0 },
  { key: 'food_score', agentIndex: 1 },
  { key: 'culture_score', agentIndex: 2 },
  { key: 'locals_score', agentIndex: 3 },
  { key: 'wander_score', agentIndex: 4 },
];

export function VibeScoreCard({ vibeScore, cityName }: VibeScoreCardProps) {
  return (
    <Card header={`${cityName} Vibe Score`}>
      <div className="flex flex-col gap-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <span className="text-5xl font-bold text-white">{vibeScore.overall}</span>
          <p className="mt-1 text-sm text-zinc-400">Overall Vibe</p>
        </motion.div>

        <div className="flex flex-col gap-3">
          {SCORE_FIELDS.map(({ key, agentIndex }, i) => {
            const agent = AGENTS[agentIndex];
            const colors = AGENT_COLORS[agent.id];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.15, duration: 0.4 }}
              >
                <ScoreBar
                  label={`${agent.emoji} ${agent.domain.charAt(0).toUpperCase() + agent.domain.slice(1)}`}
                  value={vibeScore[key] as number}
                  color={colors.accent}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
