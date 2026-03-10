'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { CityInfo, VibeScore } from '@/types';
import { VibeScoreRing } from './VibeScoreRing';

interface VibeCardProps {
  city: CityInfo;
  vibeScore: VibeScore;
}

function liveVibeColor(score: number): string {
  if (score >= 90) return '#00FFaa';
  if (score >= 85) return '#00d4ff';
  return '#a78bfa';
}

export function VibeCard({ city, vibeScore }: VibeCardProps) {
  const color = liveVibeColor(vibeScore.overall);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <Link href={`/city/${city.id}`} className="block">
        <div className="group rounded-[20px] border border-white/[0.06] bg-[--card-bg] p-px transition-all duration-500 hover:border-transparent hover:bg-gradient-to-br hover:from-[#00FFaa]/20 hover:via-[#a78bfa]/10 hover:to-[#06b6d4]/20">
          <div className="flex min-h-[180px] flex-col gap-5 rounded-[19px] bg-[--card-bg] p-7 transition-colors duration-500 group-hover:bg-[linear-gradient(160deg,rgba(20,20,28,0.97)_0%,rgba(12,12,18,0.99)_100%)]">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-[22px] font-bold tracking-tight text-white">{city.name}</h3>
                <span className="font-mono-label mt-1 block text-[13px] text-white/35">
                  {city.country}
                </span>
              </div>
              <div className="ml-4">
                <VibeScoreRing score={vibeScore.overall} size="md" />
              </div>
            </div>
            {city.tagline && (
              <p className="border-t border-white/[0.06] pt-4 text-sm italic leading-relaxed text-white/50">
                &ldquo;{city.tagline}&rdquo;
              </p>
            )}
            <div className="mt-auto flex items-center gap-1.5">
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: color,
                  boxShadow: `0 0 8px ${color}60`,
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
              <span className="font-mono-label text-[11px] text-white/30">Live vibe</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
