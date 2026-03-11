'use client';

import { useState } from 'react';
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

function AgentPill({ color, emoji, name }: { color: string; emoji: string; name: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all hover:-translate-y-0.5"
      style={{
        background: hovered ? `${color}10` : 'rgba(255,255,255,0.06)',
        border: `1px solid ${hovered ? `${color}25` : 'rgba(255,255,255,0.10)'}`,
        color: hovered ? color : 'rgba(255,255,255,0.5)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="text-base">{emoji}</span>
      {name.replace('The ', '')}
    </span>
  );
}

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
            <AgentPill key={agent.id} color={color} emoji={agent.emoji} name={agent.name} />
          );
        })}
      </motion.div>

      <motion.div variants={fadeUp} className="w-full">
        <CitySearch />
      </motion.div>
    </motion.section>
  );
}
