import type { AgentId, MoodType } from '@/types';

export interface MoodDefinition {
  id: MoodType;
  label: string;
  emoji: string;
  description: string;
  leadAgent: AgentId;
}

export const MOODS: MoodDefinition[] = [
  {
    id: 'chaos',
    label: 'I want chaos',
    emoji: '⚡',
    description: 'Nightowl leads, all agents skew adventurous',
    leadAgent: 'nightowl',
  },
  {
    id: 'chill',
    label: 'Keep it chill',
    emoji: '🌊',
    description: 'Culture Vulture leads, Nightowl tones down, Foodie focuses on cafes',
    leadAgent: 'culture',
  },
  {
    id: 'surprise',
    label: 'Surprise me',
    emoji: '✨',
    description: 'Wanderer leads, all agents prioritize off-beat picks',
    leadAgent: 'wanderer',
  },
  {
    id: 'culture',
    label: 'Culture deep-dive',
    emoji: '🎨',
    description: 'Culture Vulture leads, Foodie focuses on food culture/history',
    leadAgent: 'culture',
  },
  {
    id: 'feed-me',
    label: 'Feed me',
    emoji: '🍴',
    description: 'Foodie leads, all agents include a food recommendation',
    leadAgent: 'foodie',
  },
];

export const MOOD_MAP = Object.fromEntries(MOODS.map((m) => [m.id, m])) as Record<
  MoodType,
  MoodDefinition
>;
