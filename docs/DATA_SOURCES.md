# DATA_SOURCES.md — External API Integration Plan

## Overview

VibeCITY launches with curated mock data. This document defines exactly how to replace that mock data with real APIs, method by method, without changing anything else in the app.

The key principle: **the `CityDataService` interface never changes.** The mock implementation returns data from JSON files. The real implementation calls external APIs, transforms the responses, and returns the exact same data shapes. The rest of the app — agents, UI, database — doesn't know or care which implementation is active.

```typescript
// The swap is always this one line in src/lib/data/index.ts:
// Mock:
import { MockCityDataService } from './mock';
export const cityDataService = new MockCityDataService();

// Real:
// import { RealCityDataService } from './real';
// export const cityDataService = new RealCityDataService();

// Hybrid (recommended for gradual migration):
// import { HybridCityDataService } from './hybrid';
// export const cityDataService = new HybridCityDataService();
```

---

## API Mapping: Interface Method → External Service

Each method of `CityDataService` maps to one or more external APIs:

| Interface Method | Primary API | Fallback | Cache Duration |
|-----------------|-------------|----------|----------------|
| `getCity(cityId)` | Static config (no API needed) | — | Permanent |
| `getVenues(cityId, domain)` | Google Places API | Foursquare Places | 24 hours |
| `getEvents(cityId)` | PredictHQ | Eventbrite API | 1 hour |
| `getWeather(cityId)` | OpenWeather API | WeatherAPI.com | 30 minutes |
| `getNeighborhoods(cityId)` | Curated data + Google Places | Mock data | 7 days |
| `getVibeScore(cityId)` | Computed from above signals | Cached last score | 30 minutes |

---

## API-by-API Specification

### 1. Google Places API (Venues)

**What it provides**: Restaurants, bars, clubs, cafes, museums, galleries, parks — everything agents recommend.

**Endpoint**: Places API (New) — `https://places.googleapis.com/v1/places:searchText`

**How it maps to our interface**:
```typescript
// getVenues(cityId: 'tokyo', domain: 'nightlife')
// → Google Places text search: "nightlife bars clubs tokyo"
// → Filter by type: bar, night_club, restaurant
// → Transform to our Venue type

// Domain-to-search mapping:
const DOMAIN_QUERIES: Record<AgentDomain, string[]> = {
  nightlife: ['bars', 'nightclubs', 'live music venues', 'speakeasy', 'rooftop bars'],
  food: ['restaurants', 'street food', 'food markets', 'cafes', 'bakeries'],
  culture: ['museums', 'art galleries', 'theaters', 'historical landmarks', 'cultural centers'],
  local: ['local favorites', 'neighborhood spots', 'hidden gems'],
  wander: ['parks', 'scenic viewpoints', 'walking streets', 'markets', 'waterfront'],
};
```

**Transform**: Google Places response → our `Venue` type:
```typescript
function transformGooglePlace(place: GooglePlace, domain: AgentDomain): Venue {
  return {
    id: place.id,
    name: place.displayName.text,
    address: place.formattedAddress,
    latitude: place.location.latitude,
    longitude: place.location.longitude,
    rating: place.rating,
    priceLevel: place.priceLevel,  // PRICE_LEVEL_MODERATE, etc.
    domain: domain,
    types: place.types,
    openingHours: place.currentOpeningHours?.weekdayDescriptions,
    phoneNumber: place.nationalPhoneNumber,
    website: place.websiteUri,
    photoUrl: place.photos?.[0]
      ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxWidthPx=400&key=${API_KEY}`
      : undefined,
  };
}
```

**Pricing**:
- Text Search: $0.032 per request (returns up to 20 results)
- Place Details: $0.017 per request
- Place Photos: $0.007 per request
- Estimated cost per city load: ~$0.10 (3-4 domain searches + details)
- With 24-hour caching: cost is per city per day, not per debate

**Rate Limits**: 600 requests per minute (generous, unlikely to hit)

**API Key**: `GOOGLE_PLACES_API_KEY` (server-side only)

**Fallback**: If Google Places fails, return cached data. If no cache exists, fall back to mock data for that city.

---

### 2. PredictHQ (Events)

**Why PredictHQ over Eventbrite**: PredictHQ aggregates events from multiple sources (Eventbrite, Meetup, Ticketmaster, local calendars, festivals, public holidays) into one API. Better coverage than any single source, especially internationally.

**Alternative**: Eventbrite API (free tier, but only covers Eventbrite-listed events — misses festivals, cultural events, local happenings). Use as fallback.

**Endpoint**: `https://api.predicthq.com/v1/events/`

**How it maps to our interface**:
```typescript
// getEvents(cityId: 'tokyo', { upcoming: true })
// → PredictHQ: events within 10km of Tokyo center, next 7 days
// → Filter by category: concerts, festivals, performing-arts, community, food-drink
// → Transform to our CityEvent type

const EVENT_CATEGORIES = [
  'concerts',
  'festivals',
  'performing-arts',
  'community',
  'food-drink',
  'exhibitions',
  'sports',        // Only major events (impacts city vibe)
  'public-holidays',
];
```

**Transform**:
```typescript
function transformPredictHQEvent(event: PredictHQEvent): CityEvent {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    category: mapToOurCategory(event.category),
    startTime: event.start,
    endTime: event.end,
    venue: event.entities?.find(e => e.type === 'venue')?.name,
    address: event.location?.join(', '),  // [lat, lng] — reverse geocode if needed
    latitude: event.location?.[0],
    longitude: event.location?.[1],
    expectedAttendance: event.phq_attendance,
    rank: event.rank,  // PredictHQ's event significance score (0-100)
    labels: event.labels,
    isFree: !event.entities?.some(e => e.type === 'ticket'),
  };
}

// Map PredictHQ categories to agent domains
function mapToOurCategory(category: string): AgentDomain {
  const mapping: Record<string, AgentDomain> = {
    'concerts': 'nightlife',
    'festivals': 'culture',
    'performing-arts': 'culture',
    'community': 'local',
    'food-drink': 'food',
    'exhibitions': 'culture',
    'sports': 'local',
  };
  return mapping[category] ?? 'local';
}
```

**Pricing**:
- Free tier: 1,000 API calls/month (enough for development)
- Starter: $200/month for 10,000 calls
- Each city refresh = 1 API call (returns up to 100 events)
- With 1-hour caching: ~720 calls/month for 10 cities = well within free tier initially

**API Key**: `PREDICTHQ_API_KEY` (server-side only)

**Fallback**: Eventbrite API → cached events → mock data

---

### 3. Eventbrite API (Events Fallback)

**Endpoint**: `https://www.eventbriteapi.com/v3/events/search/`

**Usage**: Secondary source. Use when PredictHQ doesn't have enough events for a city, or as a fallback if PredictHQ is down.

**Pricing**: Free (with private token, 1000 requests/hour)

**API Key**: `EVENTBRITE_API_KEY` (server-side only, private OAuth token)

**Note**: Eventbrite's API only returns events listed on Eventbrite. It misses independently organized events, government festivals, cultural calendar events. This is why PredictHQ is primary.

---

### 4. OpenWeather API (Weather)

**Endpoint**: `https://api.openweathermap.org/data/3.0/onecall`

**How it maps to our interface**:
```typescript
// getWeather(cityId: 'tokyo')
// → OpenWeather One Call: lat/lng of Tokyo
// → Returns current conditions + 7-day forecast
// → Transform to our WeatherInfo type

function transformOpenWeather(data: OpenWeatherResponse): WeatherInfo {
  return {
    current: {
      temp: data.current.temp,
      feelsLike: data.current.feels_like,
      humidity: data.current.humidity,
      description: data.current.weather[0].description,
      icon: data.current.weather[0].icon,
      windSpeed: data.current.wind_speed,
      isGoodForOutdoors: isOutdoorFriendly(data.current),
    },
    today: {
      high: data.daily[0].temp.max,
      low: data.daily[0].temp.min,
      sunrise: new Date(data.daily[0].sunrise * 1000),
      sunset: new Date(data.daily[0].sunset * 1000),
      summary: data.daily[0].summary,
    },
    // Agents use this to make weather-aware recommendations
    // e.g., "It's raining — skip the rooftop, hit the jazz bar instead"
    agentHint: generateWeatherHint(data.current),
  };
}

// Generate a natural language hint for agents
function generateWeatherHint(current: OpenWeatherCurrent): string {
  if (current.temp > 30) return 'Hot day — recommend shaded/indoor/water activities';
  if (current.temp < 5) return 'Cold — recommend cozy indoor spots, warm food';
  if (current.weather[0].main === 'Rain') return 'Rainy — recommend indoor activities, covered markets';
  if (current.weather[0].main === 'Clear' && isEvening()) return 'Clear evening — rooftops, outdoor dining, walks';
  return 'Pleasant weather — outdoor activities work well';
}
```

**Pricing**:
- One Call API 3.0: First 1,000 calls/day free, then $0.0015/call
- With 30-minute caching for 10 cities: 480 calls/day = well within free tier

**API Key**: `OPENWEATHER_API_KEY` (server-side only)

**Fallback**: WeatherAPI.com (free tier, 1M calls/month) → cached weather → generic "check local weather" message

---

### 5. Neighborhood Data (Hybrid Approach)

**Why not fully API-driven**: No single API captures "neighborhood character." Google Places can tell you what's *in* a neighborhood, but not what it *feels like*. This is the one data source that benefits from curation.

**Approach**: Curated base data (like mock data, but richer) enhanced with live signals:

```typescript
// src/lib/data/neighborhoods/
// Each city has a curated JSON file with:
{
  "shimokitazawa": {
    "name": "Shimokitazawa",
    "character": "Bohemian, vintage-loving, indie music scene",
    "bestFor": ["wandering", "vintage shopping", "live music", "coffee"],
    "timeOfDay": "afternoon to late evening",
    "localTip": "The south side has the vintage shops, north side has the music venues",
    "walkability": 95,
    "touristDensity": "low",
    // These are curated and rarely change:
    "landmarks": ["Honda Theater", "Shimokita Cage"],
  }
}

// Enhanced at runtime with:
// - Venue count from Google Places (how many open places right now?)
// - Event count from PredictHQ (anything happening here today?)
// - Weather suitability (is it walkable weather?)
```

**Cache duration**: Base data is static (update manually when expanding cities). Live enhancement data cached for 1 hour.

**No API key needed** for base data. Uses Google Places and PredictHQ keys for live enhancement.

---

### 6. Vibe Score Computation (Aggregated)

**Not an external API** — computed from all the above signals.

```typescript
// getVibeScore(cityId: 'tokyo')
// Aggregates multiple signals into the 0-100 score

interface VibeScoreInputs {
  events: CityEvent[];        // From PredictHQ
  weather: WeatherInfo;       // From OpenWeather
  venues: Venue[];            // From Google Places
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: number;          // 0=Sunday, 6=Saturday
}

function computeVibeScore(inputs: VibeScoreInputs): VibeScore {
  // Sub-score calculation:
  const nightlife = computeNightlifeScore(inputs);   // Event count (concerts, clubs) + time of day weight
  const food = computeFoodScore(inputs);              // Restaurant density + food event count + time
  const culture = computeCultureScore(inputs);        // Exhibition/museum count + performing arts events
  const locals = computeLocalsScore(inputs);          // Non-tourist venue ratio + community events
  const wander = computeWanderScore(inputs);          // Weather suitability + park count + walkability

  // Time-of-day weighting:
  // Evening/night: nightlife weight increases, culture weight decreases
  // Morning: wander weight increases, nightlife weight drops
  const weights = TIME_WEIGHTS[inputs.timeOfDay];

  const overall = Math.round(
    nightlife * weights.nightlife +
    food * weights.food +
    culture * weights.culture +
    locals * weights.locals +
    wander * weights.wander
  );

  return {
    overall: clamp(overall, 0, 100),
    nightlife_score: clamp(nightlife, 0, 100),
    food_score: clamp(food, 0, 100),
    culture_score: clamp(culture, 0, 100),
    locals_score: clamp(locals, 0, 100),
    wander_score: clamp(wander, 0, 100),
    computed_at: new Date(),
  };
}

const TIME_WEIGHTS = {
  morning:   { nightlife: 0.05, food: 0.25, culture: 0.20, locals: 0.20, wander: 0.30 },
  afternoon: { nightlife: 0.10, food: 0.25, culture: 0.25, locals: 0.20, wander: 0.20 },
  evening:   { nightlife: 0.30, food: 0.25, culture: 0.20, locals: 0.15, wander: 0.10 },
  night:     { nightlife: 0.45, food: 0.20, culture: 0.10, locals: 0.15, wander: 0.10 },
};
```

**Cache duration**: 30 minutes (recomputed from cached sub-data, not fresh API calls)

---

## Caching Architecture

### Why Cache
- External APIs cost money per call
- Venue data doesn't change minute-to-minute
- Weather doesn't change every second
- Rate limits exist on every API
- Debate latency matters — cache hits are instant

### Cache Layers

```
Layer 1: In-Memory (fastest, lost on server restart)
├── Used for: Vibe scores, weather (changes frequently, small data)
├── TTL: 30 minutes
└── Implementation: Simple Map<string, { data, expiresAt }>

Layer 2: Redis / Upstash (persistent, shared across server instances)
├── Used for: Venue data, events, neighborhood data
├── TTL: Varies (see API mapping table above)
└── Implementation: @upstash/redis (same service used for rate limiting)

Layer 3: Database (permanent storage)
├── Used for: Historical vibe scores (for trends), neighborhood base data
├── TTL: Permanent
└── Implementation: Supabase PostgreSQL
```

### Cache Key Format
```typescript
// Consistent key format across all cache layers
const cacheKey = `${service}:${cityId}:${qualifier}`;

// Examples:
'google-places:tokyo:nightlife'    // Venues for Tokyo nightlife domain
'predicthq:tokyo:upcoming'         // Upcoming events in Tokyo
'openweather:tokyo:current'        // Current Tokyo weather
'vibe-score:tokyo:evening'         // Tokyo vibe score for evening
```

### Cache Invalidation
- **Time-based**: Each entry has a TTL (see table above). After expiry, next request fetches fresh data.
- **No manual invalidation needed**: City data is inherently temporal. Stale-by-30-minutes venue data is perfectly fine.
- **Force refresh**: Admin endpoint to bust cache for a specific city (useful if you know data is wrong).

---

## Fallback Strategy

Every external call has a fallback chain:

```
Real API → Cache (stale is OK) → Mock Data → Graceful Error
```

```typescript
async getVenues(cityId: string, domain: AgentDomain): Promise<Venue[]> {
  // Try real API
  try {
    const venues = await this.fetchFromGooglePlaces(cityId, domain);
    await this.cache.set(`google-places:${cityId}:${domain}`, venues, TTL_24H);
    return venues;
  } catch (error) {
    logger.warn('google_places_failed', { cityId, domain, error: error.message });
  }

  // Try cache (even if expired — stale data is better than no data)
  const cached = await this.cache.get(`google-places:${cityId}:${domain}`, { allowStale: true });
  if (cached) {
    logger.info('using_stale_cache', { cityId, domain });
    return cached;
  }

  // Fall back to mock data
  logger.warn('falling_back_to_mock', { cityId, domain });
  return this.mockService.getVenues(cityId, domain);
}
```

**Important**: The agents don't know whether they're getting real or cached or mock data. The `Venue` type is the same regardless. This means a partial API outage degrades gracefully — the debate still works, just with slightly stale or curated data.

---

## The Hybrid Implementation

For gradual migration, use a hybrid service that mixes real and mock data:

```typescript
// src/lib/data/hybrid.ts
export class HybridCityDataService implements CityDataService {
  private real: RealCityDataService;
  private mock: MockCityDataService;

  // Configure which methods use real data per city
  private readonly realEnabled: Record<string, Set<string>> = {
    'tokyo': new Set(['getVenues', 'getWeather', 'getEvents']),
    'berlin': new Set(['getWeather']),  // Only weather is live for Berlin so far
    // Cities not listed here use 100% mock data
  };

  async getVenues(cityId: string, domain: AgentDomain): Promise<Venue[]> {
    if (this.realEnabled[cityId]?.has('getVenues')) {
      return this.real.getVenues(cityId, domain);
    }
    return this.mock.getVenues(cityId, domain);
  }

  // ... same pattern for each method
}
```

This lets you migrate one city at a time, one data type at a time, testing as you go.

---

## Adding a New City

### With Mock Data (Current — Phase 1-4)
1. Create `src/lib/data/cities/cairo.json` with curated venue/event/neighborhood data
2. Add city to `cities` table (or mock city list)
3. Done — agents can debate Cairo immediately

### With Real APIs (Post-Launch)
1. Add city to `cities` table with lat/lng and timezone
2. Add curated neighborhood data in `src/lib/data/neighborhoods/cairo.json`
3. That's it — Google Places, PredictHQ, and OpenWeather all work from lat/lng
4. Run a test debate to verify data quality
5. Adjust domain search queries if needed (some cities need locale-specific terms)

### Scaling Beyond 10 Cities
The mock-to-real transition is what unlocks scaling. With mock data, every new city requires manual curation (hours of work). With real APIs, a new city requires only:
- A database row (name, lat/lng, timezone)
- A neighborhood file (the only curated piece — 30 minutes of research)
- Everything else is automatic

---

## Environment Variables for Data Sources

These are NOT needed until you begin the real API migration (well after launch):

```bash
# Google Places (venues)
GOOGLE_PLACES_API_KEY=           # Server-side only

# PredictHQ (events)
PREDICTHQ_API_KEY=               # Server-side only

# Eventbrite (events fallback)
EVENTBRITE_API_KEY=              # Server-side only (private OAuth token)

# OpenWeather (weather)
OPENWEATHER_API_KEY=             # Server-side only

# Cache (uses same Redis as rate limiting)
UPSTASH_REDIS_URL=               # Already configured if rate limiting is set up
UPSTASH_REDIS_TOKEN=             # Already configured if rate limiting is set up
```

Add these to `.env.example` with empty values. Only populate in `.env.local` when you're ready to implement the real data service.

---

## Cost Estimates

### Per City Per Day (with caching)

| API | Calls/Day | Cost/Day |
|-----|-----------|----------|
| Google Places (venue refresh) | 5 (one per domain) | $0.16 |
| PredictHQ (event refresh) | 24 (hourly) | Free tier |
| OpenWeather (weather refresh) | 48 (every 30 min) | Free tier |
| **Total per city** | | **~$0.16/day** |

### For 10 Cities
- ~$1.60/day = ~$48/month in API costs
- Plus Redis/Upstash for caching: ~$10/month (Pro plan)
- **Total: ~$58/month** for real-time data across 10 cities

### For 50 Cities
- ~$8/day = ~$240/month in API costs
- Redis: ~$10/month
- **Total: ~$250/month**

This is well within the revenue margins outlined in MONETIZATION.md (even 1,000 subscribers at $6.99/month = $6,990/month revenue).

---

## Migration Timeline

| When | What | Risk |
|------|------|------|
| Launch (Phase 6) | 100% mock data | Zero — mock data is curated and reliable |
| Post-launch +2 weeks | Add OpenWeather (weather only) | Low — weather is simple, one API |
| Post-launch +1 month | Add Google Places (venues) | Medium — need to verify data quality per city |
| Post-launch +2 months | Add PredictHQ (events) | Medium — event data varies wildly by city |
| Post-launch +3 months | Full hybrid for all 10 cities | Low — by now each API is proven individually |
| Post-launch +6 months | Retire mock data for covered cities | Low — mock remains as fallback |

**Mock data is never fully deleted.** It always exists as the last fallback in the chain.

---

## Testing the Real Implementation

```typescript
describe('RealCityDataService', () => {
  // These tests call real APIs — run manually, not in CI
  // Tag them so they're excluded from automated runs

  it('fetches real venues for Tokyo nightlife', async () => {
    const service = new RealCityDataService();
    const venues = await service.getVenues('tokyo', 'nightlife');

    expect(venues.length).toBeGreaterThan(0);
    expect(venues[0]).toHaveProperty('name');
    expect(venues[0]).toHaveProperty('latitude');
    expect(venues[0]).toHaveProperty('domain', 'nightlife');
  });

  it('falls back to cache when API fails', async () => {
    // Seed cache with known data
    await cache.set('google-places:tokyo:nightlife', mockVenues);

    // Force API failure
    mockGooglePlacesTo503();

    const service = new RealCityDataService();
    const venues = await service.getVenues('tokyo', 'nightlife');

    // Should return cached data, not throw
    expect(venues).toEqual(mockVenues);
  });

  it('falls back to mock when cache is also empty', async () => {
    mockGooglePlacesTo503();
    await cache.clear();

    const service = new RealCityDataService();
    const venues = await service.getVenues('tokyo', 'nightlife');

    // Should return mock data as last resort
    expect(venues.length).toBeGreaterThan(0);
  });
});
```
