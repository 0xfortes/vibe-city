// ============================================================
// Core Type Definitions for VibeCITY
// ============================================================

// --- Agent Types ---

export type AgentId = 'nightowl' | 'foodie' | 'culture' | 'local' | 'wanderer';

export type AgentDomain = 'nightlife' | 'food' | 'culture' | 'local' | 'wander';

export type MoodType = 'chaos' | 'chill' | 'surprise' | 'culture' | 'feed-me';

export interface AgentDefinition {
  id: AgentId;
  name: string;
  emoji: string;
  domain: AgentDomain;
  basePrompt: string;
  personalitySummary: string;
}

export interface AgentMessage {
  agentId: AgentId;
  agentName: string;
  agentEmoji: string;
  content: string;
  reactions: AgentReaction[];
  venues: string[];
}

export interface AgentReaction {
  type: 'fire' | 'nah' | 'hmm' | 'cosign';
  agentId: AgentId;
}

export interface AgentContext {
  cityName: string;
  cityData: CityInfo;
  mood: MoodType | null;
  previousMessages: AgentMessage[];
  debateHistory: AgentMessage[][];
}

// --- Verdict ---

export interface VerdictCard {
  route: string;
  description: string;
  consensus: string;
  wildcard: string;
}

// --- Vibe Score ---

export interface VibeScore {
  overall: number;
  nightlife_score: number;
  food_score: number;
  culture_score: number;
  locals_score: number;
  wander_score: number;
  computed_at: Date;
}

// --- Venue & Event ---

export interface Venue {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number | null;
  priceLevel: string | null;
  domain: AgentDomain;
  types: string[];
  openingHours: string[] | null;
  phoneNumber: string | null;
  website: string | null;
  photoUrl: string | null;
}

export interface CityEvent {
  id: string;
  title: string;
  description: string;
  category: AgentDomain;
  startTime: string;
  endTime: string | null;
  venue: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  expectedAttendance: number | null;
  rank: number | null;
  labels: string[];
  isFree: boolean;
}

// --- Weather ---

export interface WeatherInfo {
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    description: string;
    icon: string;
    windSpeed: number;
    isGoodForOutdoors: boolean;
  };
  today: {
    high: number;
    low: number;
    sunrise: Date;
    sunset: Date;
    summary: string;
  };
  agentHint: string;
}

// --- Neighborhood ---

export interface Neighborhood {
  name: string;
  character: string;
  bestFor: string[];
  timeOfDay: string;
  localTip: string;
  walkability: number;
  touristDensity: 'low' | 'medium' | 'high';
  landmarks: string[];
}

// --- City ---

export interface CityInfo {
  id: string;
  name: string;
  tagline: string;
  country: string;
  flag: string;
  latitude: number;
  longitude: number;
  timezone: string;
  gradient?: string;
}

// --- Subscription ---

export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid';

// --- API Response Types ---

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    requestId?: string;
  };
}

export interface ApiSuccessResponse<T> {
  data: T;
}
