'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { CityInfo, VibeScore } from '@/types';
import { Card } from '@/components/ui';

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
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link href={`/city/${city.id}`} className="block">
        <Card hover className="h-full">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">{city.name}</h3>
              <p className="mt-0.5 text-sm text-zinc-400">{city.country}</p>
              <p className="mt-2 text-sm text-zinc-300 line-clamp-1">{city.tagline}</p>
            </div>
            <div className="flex flex-col items-center">
              <span className={`text-3xl font-bold ${scoreColor(vibeScore.overall)}`}>
                {vibeScore.overall}
              </span>
              <span className="text-xs text-zinc-500">vibe</span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
