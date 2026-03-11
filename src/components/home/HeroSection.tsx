'use client';

import { motion } from 'framer-motion';
import { AGENTS } from '@/config/agents';
import { getTimeOfDayLabel } from '@/lib/time-of-day';
import { CitySearch } from './CitySearch';

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const AGENT_PILL_COLORS: Record<string, string> = {
  nightowl: '#a78bfa',
  foodie: '#f97316',
  culture: '#ec4899',
  local: '#ef4444',
  wanderer: '#06b6d4',
};

export function HeroSection() {
  return (
    <motion.section
      className="relative z-[1] flex flex-col items-center gap-6 py-20 text-center"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.h1
        className="text-5xl font-bold tracking-tight sm:text-7xl"
        variants={fadeUp}
        style={{ letterSpacing: '-0.03em' }}
      >
        <span className="text-white/85">Vibe</span>
        <span
          className="gradient-text"
          style={{ animation: 'glowPulse 4s ease-in-out infinite' }}
        >
          CITY
        </span>
      </motion.h1>

      <motion.p
        className="max-w-lg text-lg text-white/40"
        variants={fadeUp}
      >
        5 AI agents debate what you should do {getTimeOfDayLabel()}.
      </motion.p>

      <motion.div
        className="flex flex-wrap justify-center gap-2.5"
        variants={fadeUp}
      >
        {AGENTS.map((agent) => {
          const color = AGENT_PILL_COLORS[agent.id] ?? '#ffffff';
          return (
            <span
              key={agent.id}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all hover:-translate-y-0.5"
              style={{
                background: `${color}10`,
                border: `1px solid ${color}25`,
                color: color,
              }}
            >
              <span className="text-base">{agent.emoji}</span>
              {agent.name.replace('The ', '')}
            </span>
          );
        })}
      </motion.div>

      <motion.div variants={fadeUp} className="w-full">
        <CitySearch />
      </motion.div>
    </motion.section>
  );
}
