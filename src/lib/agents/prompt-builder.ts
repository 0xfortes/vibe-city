import type { AgentDefinition, AgentMessage, MoodType, CityInfo, Venue, Neighborhood, WeatherInfo } from '@/types';
import { MOOD_MAP } from '@/config/moods';

interface PromptContext {
  agent: AgentDefinition;
  city: CityInfo;
  mood: MoodType | null;
  previousMessages: AgentMessage[];
  venues: Venue[];
  neighborhoods: Neighborhood[];
  weather: WeatherInfo;
}

/**
 * Builds the system prompt for a single agent turn in the debate.
 * Includes city context, mood modifiers, and what other agents have said.
 */
export function buildSystemPrompt(ctx: PromptContext): string {
  const parts: string[] = [ctx.agent.basePrompt];

  // City context
  parts.push(`\n\nCITY: ${ctx.city.name}, ${ctx.city.country}`);
  parts.push(`Tagline: "${ctx.city.tagline}"`);

  // Weather context — agents should factor this in
  parts.push(`\nWEATHER: ${ctx.weather.current.description}, ${ctx.weather.current.temp}°C (feels like ${ctx.weather.current.feelsLike}°C).`);
  parts.push(`${ctx.weather.agentHint}`);

  // Neighborhood context — gives agents local knowledge
  if (ctx.neighborhoods.length > 0) {
    const nhoodSummary = ctx.neighborhoods
      .slice(0, 4)
      .map((n) => `${n.name}: ${n.character} (best for: ${n.bestFor.join(', ')})`)
      .join('\n');
    parts.push(`\nNEIGHBORHOODS:\n${nhoodSummary}`);
  }

  // Venue context — gives agents specific places to recommend
  const domainVenues = ctx.venues.filter((v) => v.domain === ctx.agent.domain);
  const otherVenues = ctx.venues.filter((v) => v.domain !== ctx.agent.domain);
  if (domainVenues.length > 0) {
    const venueList = domainVenues
      .slice(0, 5)
      .map((v) => `${v.name} (${v.address}) — ${v.types.join(', ')}${v.rating ? `, rating: ${v.rating}` : ''}`)
      .join('\n');
    parts.push(`\nYOUR DOMAIN VENUES:\n${venueList}`);
  }
  if (otherVenues.length > 0) {
    const otherList = otherVenues
      .slice(0, 3)
      .map((v) => `${v.name} (${v.domain})`)
      .join(', ');
    parts.push(`\nOther venues you might reference: ${otherList}`);
  }

  // Mood modifier — adjusts agent behavior based on user's mood
  if (ctx.mood) {
    const moodDef = MOOD_MAP[ctx.mood];
    if (moodDef) {
      parts.push(`\nMOOD: The user selected "${moodDef.label}". ${moodDef.description}.`);
      if (moodDef.leadAgent === ctx.agent.id) {
        parts.push('YOU are the lead agent for this mood — speak with extra authority and go first in spirit.');
      }
    }
  }

  // Time-of-day context for relevance
  const hour = new Date().toLocaleString('en-US', { timeZone: ctx.city.timezone, hour: 'numeric', hour12: false });
  const hourNum = parseInt(hour, 10);
  let timeContext = 'evening';
  if (hourNum >= 5 && hourNum < 12) timeContext = 'morning';
  else if (hourNum >= 12 && hourNum < 17) timeContext = 'afternoon';
  else if (hourNum >= 17 && hourNum < 21) timeContext = 'evening';
  else timeContext = 'late night';
  parts.push(`\nTIME: It's currently ${timeContext} in ${ctx.city.name}.`);

  // Previous debate messages — agents should reference and react to these
  if (ctx.previousMessages.length > 0) {
    const debateHistory = ctx.previousMessages
      .map((m) => `${m.agentName}: "${m.content}"`)
      .join('\n\n');
    parts.push(`\nDEBATE SO FAR:\n${debateHistory}`);
    parts.push('\nRespond to what the other agents said. Agree, disagree, or build on their picks. Be specific.');
  } else {
    parts.push('\nYou are speaking FIRST in this debate. Set the tone.');
  }

  // Final grounding directive
  parts.push('\nFINAL RULE: Be concise (2-4 sentences). State your opinion clearly. Include one practical detail per pick (time, price, what to order). Never hedge or be vague.');

  return parts.join('\n');
}

/**
 * Builds the user message for a single agent call.
 */
export function buildUserMessage(city: CityInfo, mood: MoodType | null): string {
  const moodText = mood ? ` The vibe tonight is: ${MOOD_MAP[mood]?.label ?? mood}.` : '';
  return `What should I do tonight in ${city.name}?${moodText} Give me your best picks.`;
}
