import type { AgentMessage, AgentReaction, AgentId } from '@/types';
import { getAnthropicClient } from './claude-client';

/** Strip markdown code fences (```json ... ```) that models sometimes add despite instructions. */
export function stripCodeFences(text: string): string {
  // Try matching with closing fence first
  const closed = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
  if (closed) return closed[1].trim();
  // Handle truncated output where closing fence is missing
  const open = text.match(/```(?:json)?\s*([\s\S]+)/);
  if (open) return open[1].trim();
  return text.trim();
}

const MODEL = 'claude-haiku-4-5-20251001';

interface RawReactions {
  [agentId: string]: Array<{ type: string; targetAgentId: string }>;
}

/**
 * Extracts inter-agent reactions after all 5 agents have spoken.
 * Uses a single Haiku call to analyze the debate and assign reactions.
 *
 * Each agent can react to other agents with:
 * - fire: strong agreement / hype
 * - cosign: mild agreement
 * - hmm: interesting but skeptical
 * - nah: disagreement
 */
export async function extractReactions(messages: AgentMessage[]): Promise<AgentMessage[]> {
  if (messages.length < 2) return messages;

  const debateText = messages
    .map((m) => `${m.agentId} (${m.agentName}): "${m.content}"`)
    .join('\n\n');

  const client = getAnthropicClient();

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: `You analyze debates between city guide agents and extract their implicit reactions to each other.

Output EXACTLY a JSON object mapping each agentId to an array of reactions. Each reaction has "type" (one of: "fire", "cosign", "hmm", "nah") and "targetAgentId".

Rules:
- Each agent should have 1-2 reactions to OTHER agents (never self)
- "fire" = strong agreement/hype, "cosign" = mild agreement, "hmm" = intrigued but skeptical, "nah" = disagreement
- Base reactions on actual content: if an agent references another's pick positively, that's a cosign or fire
- No markdown, no code fences, just the JSON object`,
      messages: [
        {
          role: 'user',
          content: `Extract reactions from this debate:\n\n${debateText}`,
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const raw = JSON.parse(stripCodeFences(text)) as RawReactions;

    const validTypes = new Set(['fire', 'nah', 'hmm', 'cosign']);
    const validAgentIds = new Set(messages.map((m) => m.agentId));

    // Merge reactions into messages
    return messages.map((msg) => {
      const agentReactions = raw[msg.agentId];
      if (!Array.isArray(agentReactions)) return msg;

      const validReactions: AgentReaction[] = agentReactions
        .filter(
          (r) =>
            validTypes.has(r.type) &&
            validAgentIds.has(r.targetAgentId as AgentId) &&
            r.targetAgentId !== msg.agentId,
        )
        .map((r) => ({
          type: r.type as AgentReaction['type'],
          agentId: r.targetAgentId as AgentId,
        }));

      return { ...msg, reactions: validReactions };
    });
  } catch (err) {
    // Non-critical — return messages without reactions rather than failing the debate
    console.warn('Reaction extraction failed:', err);
    return messages;
  }
}
