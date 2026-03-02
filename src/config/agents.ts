import type { AgentDefinition } from '@/types';

export const AGENTS: AgentDefinition[] = [
  {
    id: 'nightowl',
    name: 'The Nightowl',
    emoji: '🦉',
    domain: 'nightlife',
    basePrompt: '', // Phase 2+: full system prompt
    personalitySummary:
      'Bold, provocative, slightly elitist. Knows every door policy and secret party.',
  },
  {
    id: 'foodie',
    name: 'The Foodie',
    emoji: '🍜',
    domain: 'food',
    basePrompt: '',
    personalitySummary:
      'Obsessively passionate. Will write a paragraph about a single taco.',
  },
  {
    id: 'culture',
    name: 'The Culture Vulture',
    emoji: '🎭',
    domain: 'culture',
    basePrompt: '',
    personalitySummary:
      'Cerebral, well-read, slightly pretentious but self-aware about it.',
  },
  {
    id: 'local',
    name: 'The Local Legend',
    emoji: '🏮',
    domain: 'local',
    basePrompt: '',
    personalitySummary:
      'Been in the city 10+ years. Slightly protective, knows what tourists never find.',
  },
  {
    id: 'wanderer',
    name: 'The Wanderer',
    emoji: '🧭',
    domain: 'wander',
    basePrompt: '',
    personalitySummary:
      'Anti-plan, pro-getting-lost. Believes the city reveals itself.',
  },
];

export const AGENT_MAP = Object.fromEntries(AGENTS.map((a) => [a.id, a])) as Record<
  string,
  AgentDefinition
>;
