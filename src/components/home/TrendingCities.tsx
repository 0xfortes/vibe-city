import type { CityInfo, VibeScore } from '@/types';
import { VibeCard } from '@/components/vibe';

interface TrendingCitiesProps {
  cities: Array<{ city: CityInfo; vibeScore: VibeScore }>;
}

export function TrendingCities({ cities }: TrendingCitiesProps) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold text-white">Trending Tonight</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {cities.map(({ city, vibeScore }) => (
          <VibeCard key={city.id} city={city} vibeScore={vibeScore} />
        ))}
      </div>
    </section>
  );
}
