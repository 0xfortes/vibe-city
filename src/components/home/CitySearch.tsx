'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useCitySearch } from '@/hooks';

export function CitySearch() {
  const { query, setQuery, results, hasResults } = useCitySearch();
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const showDropdown = isFocused && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-md">
      {/* Gradient border wrapper */}
      <div
        className="rounded-2xl p-px transition-all duration-400"
        style={{
          background: isFocused
            ? 'linear-gradient(135deg, rgba(0,255,170,0.4), rgba(6,182,212,0.4), rgba(167,139,250,0.4))'
            : 'rgba(255,255,255,0.08)',
          boxShadow: isFocused ? '0 0 40px rgba(0,255,170,0.08)' : 'none',
        }}
      >
        <div className="flex items-center gap-3 rounded-[15px] bg-[--card-bg]/95 px-5 py-3.5">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isFocused ? '#00FFaa' : 'rgba(255,255,255,0.25)'}
            strokeWidth="2"
            strokeLinecap="round"
            className="shrink-0 transition-colors"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setTimeout(() => setIsFocused(false), 200);
            }}
            placeholder="Drop a city..."
            className="flex-1 bg-transparent text-base text-white placeholder-white/25 outline-none"
          />
          <div
            className={`rounded-[10px] px-5 py-2 text-[13px] font-semibold transition-all ${
              query.length > 0
                ? 'bg-gradient-to-r from-[#00FFaa] to-[#06b6d4] text-[#08080c]'
                : 'bg-white/[0.06] text-white/25'
            }`}
          >
            Vibe it
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            className="absolute top-full z-10 mt-2 w-full rounded-2xl border border-white/[0.06] bg-[--card-bg] py-1 shadow-lg"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {hasResults ? (
              results.map((city) => (
                <Link
                  key={city.id}
                  href={`/city/${city.id}`}
                  className="flex items-center justify-between px-5 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/[0.05]"
                >
                  <span className="font-medium">{city.name}</span>
                  <span className="text-xs text-white/30">{city.country}</span>
                </Link>
              ))
            ) : (
              <p className="px-5 py-3 text-sm text-white/30">No cities found</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
