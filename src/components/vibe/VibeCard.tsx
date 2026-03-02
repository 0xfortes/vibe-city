'use client';

import Link from 'next/link';
import type { CityInfo, VibeScore } from '@/types';
import { Card } from '@/components/ui';

interface VibeCardProps {
  city: CityInfo;
  vibeScore: VibeScore;
}

export function VibeCard({ city, vibeScore }: VibeCardProps) {
  return (
    <Link href={`/city/${city.id}`} className="block">
      <Card hover>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{city.name}</h3>
            <p className="mt-0.5 text-sm text-zinc-400">{city.country}</p>
            <p className="mt-2 text-sm text-zinc-300">{city.tagline}</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-white">{vibeScore.overall}</span>
            <span className="text-xs text-zinc-500">vibe</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
