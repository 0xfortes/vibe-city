'use client';

import { useState } from 'react';
import Link from 'next/link';

interface QuickStartProps {
  cities: { id: string; name: string; country: string }[];
}

export function QuickStart({ cities }: QuickStartProps) {
  const [search, setSearch] = useState('');

  const filtered = cities.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.country.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <h2 className="mb-4 text-lg font-semibold text-zinc-200">Quick start</h2>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search cities..."
        className="mb-3 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none transition-colors focus:border-zinc-600"
      />
      <ul className="flex flex-col gap-1">
        {filtered.map((city) => (
          <li key={city.id}>
            <Link
              href={`/city/${city.id}`}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
            >
              <span className="font-medium">{city.name}</span>
              <span className="text-xs text-zinc-500">{city.country}</span>
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="px-3 py-2 text-sm text-zinc-500">No cities match your search.</li>
        )}
      </ul>
    </div>
  );
}
