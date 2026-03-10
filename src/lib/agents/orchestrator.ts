import type { AgentMessage, MoodType, AgentId, VerdictCard } from '@/types';
import { AGENTS } from '@/config/agents';
import { MOOD_MAP } from '@/config/moods';
import { cityDataService } from '@/lib/data';
import { getAnthropicClient } from './claude-client';
import { buildSystemPrompt, buildUserMessage } from './prompt-builder';
import { extractReactions, stripCodeFences } from './reaction-extractor';
import { wrapUserInput } from '@/lib/security';

// Model to use for agent calls — Haiku for speed/cost, Sonnet for quality
const MODEL = 'claude-haiku-4-5-20251001';
const VERDICT_MODEL = 'claude-haiku-4-5-20251001';

/**
 * Determines speaking order based on mood.
 * The lead agent for the selected mood goes first.
 */
function getSpeakingOrder(mood: MoodType | null): AgentId[] {
  const defaultOrder: AgentId[] = ['nightowl', 'foodie', 'culture', 'local', 'wanderer'];

  if (!mood) return defaultOrder;

  const moodDef = MOOD_MAP[mood];
  if (!moodDef) return defaultOrder;

  const leadId = moodDef.leadAgent;
  const rest = defaultOrder.filter((id) => id !== leadId);
  return [leadId, ...rest];
}

/**
 * Runs a single agent's turn in the debate.
 * Returns the full message once streaming is complete.
 */
async function runAgentTurn(
  agentId: AgentId,
  cityId: string,
  mood: MoodType | null,
  previousMessages: AgentMessage[],
  onChunk: (chunk: string) => void,
  followUpContext?: string,
): Promise<AgentMessage> {
  const agent = AGENTS.find((a) => a.id === agentId);
  if (!agent) throw new Error(`Unknown agent: ${agentId}`);

  const [city, venues, neighborhoods, weather] = await Promise.all([
    cityDataService.getCity(cityId),
    cityDataService.getVenues(cityId),
    cityDataService.getNeighborhoods(cityId),
    cityDataService.getWeather(cityId),
  ]);

  if (!city) throw new Error(`Unknown city: ${cityId}`);

  const systemPrompt = buildSystemPrompt({
    agent,
    city,
    mood,
    previousMessages,
    venues,
    neighborhoods,
    weather,
  });

  // For follow-ups, include previous round context + the user's question
  const userMessage = followUpContext
    ? `The user has a follow-up question about ${city.name}: ${followUpContext}`
    : buildUserMessage(city, mood);

  const client = getAnthropicClient();

  let fullContent = '';

  const stream = await client.messages.stream({
    model: MODEL,
    max_tokens: 200,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      fullContent += event.delta.text;
      onChunk(event.delta.text);
    }
  }

  return {
    agentId: agent.id,
    agentName: agent.name,
    agentEmoji: agent.emoji,
    content: fullContent.trim(),
    reactions: [], // Reactions are generated after all agents speak
    venues: extractVenueNames(fullContent),
  };
}

/**
 * Generates the verdict card by asking Claude to synthesize the debate.
 */
async function generateVerdict(
  cityId: string,
  messages: AgentMessage[],
  mood: MoodType | null,
): Promise<VerdictCard> {
  const city = await cityDataService.getCity(cityId);
  if (!city) throw new Error(`Unknown city: ${cityId}`);

  const debateText = messages
    .map((m) => `${m.agentName}: "${m.content}"`)
    .join('\n\n');

  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: VERDICT_MODEL,
    max_tokens: 400,
    system: `You are the Verdict Generator for VibeCITY. You synthesize a debate between 5 city guides into a clear, actionable verdict.

RULES:
- NEVER quote or name the agents (no "The Nightowl said...", no "According to The Foodie...")
- NEVER include dialogue snippets or asterisked actions
- Write as a confident city guide giving direct recommendations
- Use specific venue/place names, times, and practical details
- The route field must be a short itinerary using → arrows, max 10 words. Use real place names.

Output EXACTLY this JSON format, no markdown, no code fences:
{"route":"<Short arrow-separated route title, max 10 words, e.g. Markthalle Neun → Klunkerkranich → Let the night decide>","description":"<2-3 sentence summary explaining the recommended plan and why>","consensus":"<One line: how many agents agreed and what they disagreed on>","wildcard":"<Alternative recommendation if conditions change, 1-2 sentences>"}`,
    messages: [
      {
        role: 'user',
        content: `The Council just debated what to do tonight in ${city.name}${mood ? ` (mood: ${mood})` : ''}.\n\n${debateText}\n\nGenerate the verdict.`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    return JSON.parse(stripCodeFences(text)) as VerdictCard;
  } catch {
    // Fallback if JSON parsing fails
    const firstWords = text.split(/\s+/).slice(0, 10).join(' ');
    return {
      route: firstWords || 'Explore the city tonight',
      description: messages[0]?.content.slice(0, 200) ?? 'The Council recommends heading out and seeing where the night takes you.',
      consensus: 'The Council had mixed opinions.',
      wildcard: messages[messages.length - 1]?.content.slice(0, 100) ?? 'Just wander and explore.',
    };
  }
}

/**
 * Generates follow-up prompts based on the debate.
 */
async function generateFollowUps(
  cityId: string,
  messages: AgentMessage[],
): Promise<string[]> {
  const city = await cityDataService.getCity(cityId);
  if (!city) return ['What if I only have 2 hours?', 'Give me the budget version', 'What about tomorrow morning?'];

  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: VERDICT_MODEL,
    max_tokens: 150,
    system: `Generate exactly 3 follow-up questions a user might ask after a city debate. Output as a JSON array of strings. No markdown, no code fences. Example: ["Question 1?","Question 2?","Question 3?"]`,
    messages: [
      {
        role: 'user',
        content: `City: ${city.name}. The Council discussed: ${messages.map((m) => m.venues.join(', ')).join('; ')}`,
      },
    ],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    return JSON.parse(stripCodeFences(text)) as string[];
  } catch {
    return [
      `What if I only have 2 hours in ${city.name}?`,
      'Give me the budget version',
      'What about tomorrow morning?',
    ];
  }
}

/**
 * Simple venue name extraction — pulls quoted names and known patterns.
 */
function extractVenueNames(text: string): string[] {
  // Match text that looks like venue names: capitalized words, possibly with &, ', or -
  const patterns = [
    /(?:at|to|visit|try|hit|check out|go to)\s+([A-Z][A-Za-z\s&'''\-]+?)(?:\s*[—–-]|\s*\.|\s*,|\s+for|\s+in|\s+on|\s+is|\s+has)/g,
  ];

  const venues = new Set<string>();
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const venue = match[1].trim();
      if (venue.length > 2 && venue.length < 50) {
        venues.add(venue);
      }
    }
  }

  return [...venues].slice(0, 5);
}

export interface DebateSSEEvent {
  type: 'agent_start' | 'agent_chunk' | 'agent_done' | 'verdict' | 'follow_ups' | 'debate_saved' | 'done' | 'error';
  agentId?: AgentId;
  agentName?: string;
  agentEmoji?: string;
  chunk?: string;
  message?: AgentMessage;
  verdict?: VerdictCard;
  followUps?: string[];
  debateId?: string;
  error?: string;
}

export interface DebateResult {
  messages: AgentMessage[];
  verdict: VerdictCard;
  followUps: string[];
}

export interface RunDebateOptions {
  cityId: string;
  mood: MoodType | null;
  /** Sanitized follow-up question from the user */
  followUp?: string;
  /** Messages from the previous debate round (for follow-up context) */
  previousRound?: AgentMessage[];
}

/**
 * Runs the full Council debate and yields SSE events.
 * Each agent speaks in order, streaming their response in chunks.
 *
 * Returns the final DebateResult via the last `done` event for saving.
 */
export async function* runDebate(
  options: RunDebateOptions,
): AsyncGenerator<DebateSSEEvent> {
  const { cityId, mood, followUp, previousRound } = options;
  const speakingOrder = getSpeakingOrder(mood);
  const messages: AgentMessage[] = [];

  // Build follow-up context if this is a follow-up round
  const followUpContext = followUp && previousRound
    ? buildFollowUpContext(previousRound, followUp)
    : undefined;

  for (const agentId of speakingOrder) {
    const agent = AGENTS.find((a) => a.id === agentId);
    if (!agent) continue;

    // Signal that this agent is starting
    yield {
      type: 'agent_start',
      agentId: agent.id,
      agentName: agent.name,
      agentEmoji: agent.emoji,
    };

    // Collect chunks to yield as SSE events
    const chunks: string[] = [];
    const message = await runAgentTurn(
      agentId,
      cityId,
      mood,
      // For follow-ups, include previous round messages as context
      previousRound ? [...previousRound, ...messages] : messages,
      (chunk) => {
        chunks.push(chunk);
      },
      followUpContext,
    );

    // Yield all accumulated chunks
    for (const chunk of chunks) {
      yield {
        type: 'agent_chunk',
        agentId: agent.id,
        chunk,
      };
    }

    messages.push(message);

    yield {
      type: 'agent_done',
      agentId: agent.id,
      message,
    };
  }

  // Extract reactions between agents, then generate verdict + follow-ups
  const [messagesWithReactions, verdict, followUps] = await Promise.all([
    extractReactions(messages),
    generateVerdict(cityId, messages, mood),
    generateFollowUps(cityId, messages),
  ]);

  // Re-emit agent_done events with reactions attached so the client can update
  for (const msg of messagesWithReactions) {
    if (msg.reactions.length > 0) {
      yield { type: 'agent_done', agentId: msg.agentId, message: msg };
    }
  }

  yield { type: 'verdict', verdict };
  yield { type: 'follow_ups', followUps };
  yield { type: 'done' };
}

/**
 * Builds context string for follow-up rounds, including previous debate
 * messages and the sanitized user question.
 */
function buildFollowUpContext(previousRound: AgentMessage[], followUp: string): string {
  const debateSummary = previousRound
    .map((m) => `${m.agentName}: "${m.content}"`)
    .join('\n');

  return `Previous debate:\n${debateSummary}\n\nUser follow-up: ${wrapUserInput(followUp)}`;
}
