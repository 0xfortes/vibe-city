'use client';

import { motion } from 'framer-motion';
import type { CityInfo, VibeScore } from '@/types';
import { VibeCard } from '@/components/vibe';

interface TrendingCitiesProps {
  cities: Array<{ city: CityInfo; vibeScore: VibeScore }>;
}

export function TrendingCities({ cities }: TrendingCitiesProps) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-semibold text-white">Trending Now</h2>
        <motion.span
          className="inline-block h-2 w-2 rounded-full bg-emerald-400"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {cities.map(({ city, vibeScore }, i) => (
          <motion.div
            key={city.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.35 }}
          >
            <VibeCard city={city} vibeScore={vibeScore} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
