import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, buildUserMessage } from '@/lib/agents/prompt-builder';
import { AGENT_MAP } from '@/config/agents';
import type { AgentMessage, Venue, Neighborhood, WeatherInfo, CityInfo } from '@/types';

const mockCity: CityInfo = {
  id: 'tokyo',
  name: 'Tokyo',
  tagline: 'Chaos with impeccable taste',
  country: 'Japan',
  latitude: 35.6762,
  longitude: 139.6503,
  timezone: 'Asia/Tokyo',
};

const mockWeather: WeatherInfo = {
  current: {
    temp: 22,
    feelsLike: 24,
    humidity: 60,
    description: 'Clear sky',
    icon: '01d',
    windSpeed: 5,
    isGoodForOutdoors: true,
  },
  today: {
    high: 28,
    low: 18,
    sunrise: new Date('2024-01-01T06:00:00'),
    sunset: new Date('2024-01-01T18:00:00'),
    summary: 'Warm and clear',
  },
  agentHint: 'Great night for outdoor activities.',
};

const mockVenues: Venue[] = [
  {
    id: 'v1',
    name: 'Golden Gai Bar',
    address: 'Shinjuku, Tokyo',
    latitude: 35.6938,
    longitude: 139.7034,
    rating: 4.5,
    priceLevel: '$$',
    domain: 'nightlife',
    types: ['bar', 'speakeasy'],
    openingHours: null,
    phoneNumber: null,
    website: null,
    photoUrl: null,
  },
  {
    id: 'v2',
    name: 'Tsukiji Outer Market',
    address: 'Tsukiji, Tokyo',
    latitude: 35.6654,
    longitude: 139.7707,
    rating: 4.8,
    priceLevel: '$',
    domain: 'food',
    types: ['market', 'street food'],
    openingHours: null,
    phoneNumber: null,
    website: null,
    photoUrl: null,
  },
  {
    id: 'v3',
    name: 'Ramen Alley',
    address: 'Shinjuku, Tokyo',
    latitude: 35.6938,
    longitude: 139.7034,
    rating: 4.3,
    priceLevel: '$',
    domain: 'food',
    types: ['ramen', 'noodles'],
    openingHours: null,
    phoneNumber: null,
    website: null,
    photoUrl: null,
  },
];

const mockNeighborhoods: Neighborhood[] = [
  {
    name: 'Shinjuku',
    character: 'Neon-lit entertainment district',
    bestFor: ['nightlife', 'food'],
    timeOfDay: 'evening',
    localTip: 'Visit Golden Gai for tiny themed bars',
    walkability: 9,
    touristDensity: 'high',
    landmarks: ['Kabukicho', 'Golden Gai'],
  },
  {
    name: 'Shibuya',
    character: 'Youth culture and shopping',
    bestFor: ['shopping', 'nightlife'],
    timeOfDay: 'evening',
    localTip: 'Head to Nonbei Yokocho for local bars',
    walkability: 8,
    touristDensity: 'high',
    landmarks: ['Shibuya Crossing', 'Hachiko'],
  },
];

const nightowl = AGENT_MAP['nightowl'];
const foodie = AGENT_MAP['foodie'];

describe('buildSystemPrompt', () => {
  it('includes agent basePrompt', () => {
    const prompt = buildSystemPrompt({
      agent: nightowl,
      city: mockCity,
      mood: null,
      previousMessages: [],
      venues: [],
      neighborhoods: [],
      weather: mockWeather,
    });
    expect(prompt).toContain('You are The Nightowl');
  });

  it('includes city name and country', () => {
    const prompt = buildSystemPrompt({
      agent: nightowl,
      city: mockCity,
      mood: null,
      previousMessages: [],
      venues: [],
      neighborhoods: [],
      weather: mockWeather,
    });
    expect(prompt).toContain('CITY: Tokyo, Japan');
  });

  it('includes weather context', () => {
    const prompt = buildSystemPrompt({
      agent: nightowl,
      city: mockCity,
      mood: null,
      previousMessages: [],
      venues: [],
      neighborhoods: [],
      weather: mockWeather,
    });
    expect(prompt).toContain('WEATHER: Clear sky, 22°C');
    expect(prompt).toContain('feels like 24°C');
    expect(prompt).toContain('Great night for outdoor activities.');
  });

  it('includes neighborhoods (max 4)', () => {
    const fiveNeighborhoods = [
      ...mockNeighborhoods,
      { ...mockNeighborhoods[0], name: 'Asakusa' },
      { ...mockNeighborhoods[0], name: 'Roppongi' },
      { ...mockNeighborhoods[0], name: 'Akihabara' },
    ];
    const prompt = buildSystemPrompt({
      agent: nightowl,
      city: mockCity,
      mood: null,
      previousMessages: [],
      venues: [],
      neighborhoods: fiveNeighborhoods,
      weather: mockWeather,
    });
    expect(prompt).toContain('NEIGHBORHOODS:');
    expect(prompt).toContain('Shinjuku');
    expect(prompt).toContain('Shibuya');
    expect(prompt).toContain('Asakusa');
    expect(prompt).toContain('Roppongi');
    expect(prompt).not.toContain('Akihabara'); // 5th should be excluded
  });

  it('includes domain-specific venues (max 5) for the agent', () => {
    const prompt = buildSystemPrompt({
      agent: nightowl,
      city: mockCity,
      mood: null,
      previousMessages: [],
      venues: mockVenues,
      neighborhoods: [],
      weather: mockWeather,
    });
    expect(prompt).toContain('YOUR DOMAIN VENUES:');
    expect(prompt).toContain('Golden Gai Bar');
    // Nightowl domain is nightlife — food venues are "other"
    expect(prompt).not.toContain('YOUR DOMAIN VENUES:\nTsukiji');
  });

  it('includes other venues (max 3) for cross-reference', () => {
    const prompt = buildSystemPrompt({
      agent: nightowl,
      city: mockCity,
      mood: null,
      previousMessages: [],
      venues: mockVenues,
      neighborhoods: [],
      weather: mockWeather,
    });
    expect(prompt).toContain('Other venues you might reference:');
    expect(prompt).toContain('Tsukiji Outer Market (food)');
  });

  it('applies mood modifier when provided', () => {
    const prompt = buildSystemPrompt({
      agent: nightowl,
      city: mockCity,
      mood: 'chaos',
      previousMessages: [],
      venues: [],
      neighborhoods: [],
      weather: mockWeather,
    });
    expect(prompt).toContain('MOOD:');
    expect(prompt).toContain('I want chaos');
  });

  it('marks lead agent for mood', () => {
    // chaos mood has nightowl as lead
    const prompt = buildSystemPrompt({
      agent: nightowl,
      city: mockCity,
      mood: 'chaos',
      previousMessages: [],
      venues: [],
      neighborhoods: [],
      weather: mockWeather,
    });
    expect(prompt).toContain('YOU are the lead agent');
  });

  it('does not mark non-lead agent', () => {
    // chaos mood has nightowl as lead, not foodie
    const prompt = buildSystemPrompt({
      agent: foodie,
      city: mockCity,
      mood: 'chaos',
      previousMessages: [],
      venues: [],
      neighborhoods: [],
      weather: mockWeather,
    });
    expect(prompt).not.toContain('YOU are the lead agent');
  });

  it('includes debate history when previousMessages present', () => {
    const previousMessages: AgentMessage[] = [
      {
        agentId: 'nightowl',
        agentName: 'The Nightowl',
        agentEmoji: '🦉',
        content: 'Golden Gai is the move tonight.',
        reactions: [],
        venues: ['Golden Gai'],
      },
    ];
    const prompt = buildSystemPrompt({
      agent: foodie,
      city: mockCity,
      mood: null,
      previousMessages,
      venues: [],
      neighborhoods: [],
      weather: mockWeather,
    });
    expect(prompt).toContain('DEBATE SO FAR:');
    expect(prompt).toContain('The Nightowl: "Golden Gai is the move tonight."');
    expect(prompt).toContain('Respond to what the other agents said');
  });

  it('says "Speaking FIRST" when no previous messages', () => {
    const prompt = buildSystemPrompt({
      agent: nightowl,
      city: mockCity,
      mood: null,
      previousMessages: [],
      venues: [],
      neighborhoods: [],
      weather: mockWeather,
    });
    expect(prompt).toContain('speaking FIRST');
  });
});

describe('buildUserMessage', () => {
  it('includes city name', () => {
    const msg = buildUserMessage(mockCity, null);
    expect(msg).toContain('Tokyo');
  });

  it('includes mood label when provided', () => {
    const msg = buildUserMessage(mockCity, 'chaos');
    expect(msg).toContain('I want chaos');
  });

  it('omits mood text when null', () => {
    const msg = buildUserMessage(mockCity, null);
    expect(msg).not.toContain('vibe tonight');
  });
});
