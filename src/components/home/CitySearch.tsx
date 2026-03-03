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
    <div ref={containerRef} className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          // Delay to allow click on dropdown links
          setTimeout(() => setIsFocused(false), 200);
        }}
        placeholder="Drop a city..."
        className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-zinc-500"
      />

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            className="absolute top-full z-10 mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 py-1 shadow-lg"
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
                  className="flex items-center justify-between px-4 py-2.5 text-sm text-zinc-200 transition-colors hover:bg-zinc-800"
                >
                  <span className="font-medium">{city.name}</span>
                  <span className="text-xs text-zinc-500">{city.country}</span>
                </Link>
              ))
            ) : (
              <p className="px-4 py-3 text-sm text-zinc-500">No cities found</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
