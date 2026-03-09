'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { CityInfo, VibeScore } from '@/types';

interface VibeCardProps {
  city: CityInfo;
  vibeScore: VibeScore;
}

function scoreColor(score: number): string {
  if (score >= 85) return 'text-emerald-400';
  if (score >= 70) return 'text-amber-400';
  return 'text-zinc-400';
}

export function VibeCard({ city, vibeScore }: VibeCardProps) {
  const gradient = city.gradient ?? 'from-zinc-500/20 via-zinc-500/10 to-zinc-500/20';

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/city/${city.id}`} className="block">
        <div className="group relative h-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 transition-all duration-300 hover:border-zinc-600 hover:shadow-lg hover:shadow-zinc-900/50">
          {/* Gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

          <div className="relative p-6">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-bold text-white">{city.name}</h3>
                <p className="mt-0.5 text-sm text-zinc-500">{city.country}</p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300 line-clamp-2">{city.tagline}</p>
              </div>
              <div className="ml-4 flex flex-col items-center">
                <span className={`text-3xl font-bold ${scoreColor(vibeScore.overall)}`}>
                  {vibeScore.overall}
                </span>
                <span className="text-xs text-zinc-500">vibe</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
