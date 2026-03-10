'use client';

import { useState } from 'react';
import Link from 'next/link';

interface QuickStartProps {
  cities: { id: string; name: string; country: string }[];
}

export function QuickStart({ cities }: QuickStartProps) {
  const [search, setSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const filtered = cities.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.country.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="rounded-2xl border border-white/[0.04] bg-[--card-bg-glass] p-6 backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="h-2 w-2 rounded-full bg-[#00FFaa]"
            style={{
              boxShadow: '0 0 10px rgba(0,255,170,0.4)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          <h2 className="font-mono-label text-xs font-bold text-white/40">Quick Start</h2>
        </div>
        <span className="font-mono text-[11px] text-white/20">{filtered.length} cities</span>
      </div>

      {/* Search with gradient border */}
      <div
        className="mb-2 rounded-[14px] p-px transition-all duration-400"
        style={{
          background: isFocused
            ? 'linear-gradient(135deg, rgba(0,255,170,0.3), rgba(6,182,212,0.3))'
            : 'rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-3 rounded-[13px] bg-[#08080c]/95 px-4 py-3">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isFocused ? '#00FFaa' : 'rgba(255,255,255,0.2)'}
            strokeWidth="2"
            strokeLinecap="round"
            className="shrink-0 transition-colors"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search cities..."
            className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.08] text-xs text-white/40 hover:bg-white/[0.12]"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <ul className="flex max-h-[420px] flex-col gap-0.5 overflow-y-auto">
        {filtered.map((city) => (
          <li key={city.id}>
            <Link
              href={`/city/${city.id}`}
              className="flex items-center justify-between rounded-[14px] px-4 py-3 text-sm transition-all hover:translate-x-1 hover:bg-white/[0.04]"
            >
              <span className="font-semibold text-white">{city.name}</span>
              <span className="font-mono text-xs text-white/25">{city.country}</span>
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="px-3 py-8 text-center text-sm text-white/20">
            No cities match your search.
          </li>
        )}
      </ul>
    </div>
  );
}
