'use client';

import { useState, useMemo } from 'react';
import type { CityInfo } from '@/types';
import { LAUNCH_CITIES } from '@/config/cities';

interface UseCitySearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: CityInfo[];
  hasResults: boolean;
}

export function useCitySearch(): UseCitySearchReturn {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return LAUNCH_CITIES;

    const lower = query.toLowerCase();
    return LAUNCH_CITIES.filter(
      (city) =>
        city.name.toLowerCase().includes(lower) ||
        city.country.toLowerCase().includes(lower) ||
        city.tagline.toLowerCase().includes(lower),
    );
  }, [query]);

  return {
    query,
    setQuery,
    results,
    hasResults: results.length > 0,
  };
}
