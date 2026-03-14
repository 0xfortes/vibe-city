import type {
  AgentDomain,
  CityEvent,
  CityInfo,
  Neighborhood,
  Venue,
  VibeScore,
  WeatherInfo,
} from '@/types';
import { CITY_MAP } from '@/config/cities';
import type { CityDataService } from './types';
import {
  tokyoVenues,
  tokyoEvents,
  tokyoWeather,
  tokyoNeighborhoods,
  tokyoVibeScore,
  berlinVenues,
  berlinEvents,
  berlinWeather,
  berlinNeighborhoods,
  berlinVibeScore,
  nycVenues,
  nycEvents,
  nycWeather,
  nycNeighborhoods,
  nycVibeScore,
  mexicoCityVenues,
  mexicoCityEvents,
  mexicoCityWeather,
  mexicoCityNeighborhoods,
  mexicoCityVibeScore,
  lisbonVenues,
  lisbonEvents,
  lisbonWeather,
  lisbonNeighborhoods,
  lisbonVibeScore,
  parisVenues,
  parisEvents,
  parisWeather,
  parisNeighborhoods,
  parisVibeScore,
  londonVenues,
  londonEvents,
  londonWeather,
  londonNeighborhoods,
  londonVibeScore,
  bangkokVenues,
  bangkokEvents,
  bangkokWeather,
  bangkokNeighborhoods,
  bangkokVibeScore,
  buenosAiresVenues,
  buenosAiresEvents,
  buenosAiresWeather,
  buenosAiresNeighborhoods,
  buenosAiresVibeScore,
  istanbulVenues,
  istanbulEvents,
  istanbulWeather,
  istanbulNeighborhoods,
  istanbulVibeScore,
} from './cities';

interface CityMockData {
  venues: Venue[];
  events: CityEvent[];
  weather: WeatherInfo;
  neighborhoods: Neighborhood[];
  vibeScore: VibeScore;
}

const CITY_DATA: Record<string, CityMockData> = {
  tokyo: {
    venues: tokyoVenues,
    events: tokyoEvents,
    weather: tokyoWeather,
    neighborhoods: tokyoNeighborhoods,
    vibeScore: tokyoVibeScore,
  },
  berlin: {
    venues: berlinVenues,
    events: berlinEvents,
    weather: berlinWeather,
    neighborhoods: berlinNeighborhoods,
    vibeScore: berlinVibeScore,
  },
  nyc: {
    venues: nycVenues,
    events: nycEvents,
    weather: nycWeather,
    neighborhoods: nycNeighborhoods,
    vibeScore: nycVibeScore,
  },
  'mexico-city': {
    venues: mexicoCityVenues,
    events: mexicoCityEvents,
    weather: mexicoCityWeather,
    neighborhoods: mexicoCityNeighborhoods,
    vibeScore: mexicoCityVibeScore,
  },
  lisbon: {
    venues: lisbonVenues,
    events: lisbonEvents,
    weather: lisbonWeather,
    neighborhoods: lisbonNeighborhoods,
    vibeScore: lisbonVibeScore,
  },
  paris: {
    venues: parisVenues,
    events: parisEvents,
    weather: parisWeather,
    neighborhoods: parisNeighborhoods,
    vibeScore: parisVibeScore,
  },
  london: {
    venues: londonVenues,
    events: londonEvents,
    weather: londonWeather,
    neighborhoods: londonNeighborhoods,
    vibeScore: londonVibeScore,
  },
  bangkok: {
    venues: bangkokVenues,
    events: bangkokEvents,
    weather: bangkokWeather,
    neighborhoods: bangkokNeighborhoods,
    vibeScore: bangkokVibeScore,
  },
  'buenos-aires': {
    venues: buenosAiresVenues,
    events: buenosAiresEvents,
    weather: buenosAiresWeather,
    neighborhoods: buenosAiresNeighborhoods,
    vibeScore: buenosAiresVibeScore,
  },
  istanbul: {
    venues: istanbulVenues,
    events: istanbulEvents,
    weather: istanbulWeather,
    neighborhoods: istanbulNeighborhoods,
    vibeScore: istanbulVibeScore,
  },
};

export class MockCityDataService implements CityDataService {
  async getCity(cityId: string): Promise<CityInfo | null> {
    return CITY_MAP[cityId] ?? null;
  }

  async getVenues(cityId: string, domain?: AgentDomain): Promise<Venue[]> {
    const data = CITY_DATA[cityId];
    if (!data) return [];
    if (domain) {
      return data.venues.filter((v) => v.domain === domain);
    }
    return data.venues;
  }

  async getEvents(cityId: string): Promise<CityEvent[]> {
    const data = CITY_DATA[cityId];
    return data?.events ?? [];
  }

  async getWeather(cityId: string): Promise<WeatherInfo> {
    const data = CITY_DATA[cityId];
    if (!data) {
      return {
        current: {
          temp: 20,
          feelsLike: 20,
          humidity: 50,
          description: 'Unknown',
          icon: 'unknown',
          windSpeed: 0,
          isGoodForOutdoors: true,
        },
        today: {
          high: 22,
          low: 18,
          sunrise: new Date(),
          sunset: new Date(),
          summary: 'No weather data available',
        },
        agentHint: 'No weather data — wing it',
      };
    }
    return data.weather;
  }

  async getNeighborhoods(cityId: string): Promise<Neighborhood[]> {
    const data = CITY_DATA[cityId];
    return data?.neighborhoods ?? [];
  }

  async getVibeScore(cityId: string): Promise<VibeScore> {
    const data = CITY_DATA[cityId];
    if (!data) {
      return {
        overall: 0,
        nightlife_score: 0,
        food_score: 0,
        culture_score: 0,
        locals_score: 0,
        wander_score: 0,
        computed_at: new Date(),
      };
    }
    return data.vibeScore;
  }
}
