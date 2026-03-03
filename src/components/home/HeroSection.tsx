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

export function HeroSection() {
  return (
    <motion.section
      className="flex flex-col items-center gap-6 py-16 text-center"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.h1
        className="text-5xl font-bold tracking-tight sm:text-6xl"
        variants={fadeUp}
      >
        <span className="text-white">Vibe</span>
        <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
          CITY
        </span>
      </motion.h1>

      <motion.p
        className="max-w-lg text-lg text-zinc-400"
        variants={fadeUp}
      >
        5 AI agents debate what you should do {getTimeOfDayLabel()}.
      </motion.p>

      <motion.p
        className="text-sm text-zinc-500"
        variants={fadeUp}
      >
        {AGENTS.map(a => `${a.emoji} ${a.name.replace('The ', '')}`).join(' · ')}
      </motion.p>

      <motion.div variants={fadeUp}>
        <CitySearch />
      </motion.div>
    </motion.section>
  );
}
