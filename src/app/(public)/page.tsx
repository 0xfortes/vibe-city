import { Container } from '@/components/ui';
import { HeroSection, TrendingCities } from '@/components/home';
import { cityDataService } from '@/lib/data';
import { CITY_MAP } from '@/config/cities';

const TRENDING_IDS = ['tokyo', 'berlin', 'nyc'] as const;

export default async function HomePage() {
  const trendingCities = await Promise.all(
    TRENDING_IDS.map(async (id) => {
      const city = CITY_MAP[id];
      const vibeScore = await cityDataService.getVibeScore(id);
      return { city, vibeScore };
    }),
  );

  return (
    <Container className="pb-16">
      <HeroSection />
      <TrendingCities cities={trendingCities} />
    </Container>
  );
}
