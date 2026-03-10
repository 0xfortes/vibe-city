import { notFound } from 'next/navigation';
import { Container } from '@/components/ui';
import { CityViewClient } from '@/components/city';
import { cityDataService } from '@/lib/data';
import { CITY_MAP } from '@/config/cities';

interface CityPageProps {
  params: Promise<{ cityId: string }>;
}

export default async function CityPage({ params }: CityPageProps) {
  const { cityId } = await params;
  const city = CITY_MAP[cityId];

  if (!city) {
    notFound();
  }

  const [vibeScore, weather] = await Promise.all([
    cityDataService.getVibeScore(cityId),
    cityDataService.getWeather(cityId),
  ]);

  return (
    <Container>
      <CityViewClient city={city} vibeScore={vibeScore} weather={weather} />
    </Container>
  );
}
