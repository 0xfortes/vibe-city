import type { AgentDomain, CityEvent, CityInfo, Neighborhood, Venue, VibeScore, WeatherInfo } from '@/types';

export interface CityDataService {
  getCity(cityId: string): Promise<CityInfo | null>;
  getVenues(cityId: string, domain: AgentDomain): Promise<Venue[]>;
  getEvents(cityId: string): Promise<CityEvent[]>;
  getWeather(cityId: string): Promise<WeatherInfo>;
  getNeighborhoods(cityId: string): Promise<Neighborhood[]>;
  getVibeScore(cityId: string): Promise<VibeScore>;
}
