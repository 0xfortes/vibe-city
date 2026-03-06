import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AgentMessage } from '@/types';

const mockMessages: AgentMessage[] = [
  {
    agentId: 'nightowl',
    agentName: 'The Nightowl',
    agentEmoji: '🦉',
    content: 'Golden Gai is the move.',
    reactions: [],
    venues: ['Golden Gai'],
  },
  {
    agentId: 'foodie',
    agentName: 'The Foodie',
    agentEmoji: '🍜',
    content: 'Forget clubs, hit Tsukiji.',
    reactions: [],
    venues: ['Tsukiji'],
  },
];

// Mock the claude client before importing
vi.mock('@/lib/agents/claude-client', () => ({
  getAnthropicClient: vi.fn(),
}));

describe('extractReactions', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns messages with reactions from Claude', async () => {
    const mockReactions = {
      nightowl: [{ type: 'nah', targetAgentId: 'foodie' }],
      foodie: [{ type: 'fire', targetAgentId: 'nightowl' }],
    };

    const { getAnthropicClient } = await import('@/lib/agents/claude-client');
    vi.mocked(getAnthropicClient).mockReturnValue({
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ type: 'text', text: JSON.stringify(mockReactions) }],
        }),
      },
    } as unknown as ReturnType<typeof getAnthropicClient>);

    const { extractReactions } = await import('@/lib/agents/reaction-extractor');
    const result = await extractReactions(mockMessages);

    expect(result[0].reactions).toEqual([{ type: 'nah', agentId: 'foodie' }]);
    expect(result[1].reactions).toEqual([{ type: 'fire', agentId: 'nightowl' }]);
  });

  it('validates reaction types (only fire, cosign, hmm, nah)', async () => {
    const mockReactions = {
      nightowl: [{ type: 'invalid_type', targetAgentId: 'foodie' }],
      foodie: [{ type: 'cosign', targetAgentId: 'nightowl' }],
    };

    const { getAnthropicClient } = await import('@/lib/agents/claude-client');
    vi.mocked(getAnthropicClient).mockReturnValue({
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ type: 'text', text: JSON.stringify(mockReactions) }],
        }),
      },
    } as unknown as ReturnType<typeof getAnthropicClient>);

    const { extractReactions } = await import('@/lib/agents/reaction-extractor');
    const result = await extractReactions(mockMessages);

    // Invalid type should be filtered out
    expect(result[0].reactions).toEqual([]);
    expect(result[1].reactions).toEqual([{ type: 'cosign', agentId: 'nightowl' }]);
  });

  it('filters out self-reactions', async () => {
    const mockReactions = {
      nightowl: [{ type: 'fire', targetAgentId: 'nightowl' }], // self-reaction
      foodie: [{ type: 'hmm', targetAgentId: 'nightowl' }],
    };

    const { getAnthropicClient } = await import('@/lib/agents/claude-client');
    vi.mocked(getAnthropicClient).mockReturnValue({
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ type: 'text', text: JSON.stringify(mockReactions) }],
        }),
      },
    } as unknown as ReturnType<typeof getAnthropicClient>);

    const { extractReactions } = await import('@/lib/agents/reaction-extractor');
    const result = await extractReactions(mockMessages);

    expect(result[0].reactions).toEqual([]);
  });

  it('returns messages unchanged on API failure', async () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { getAnthropicClient } = await import('@/lib/agents/claude-client');
    vi.mocked(getAnthropicClient).mockReturnValue({
      messages: {
        create: vi.fn().mockRejectedValue(new Error('API Error')),
      },
    } as unknown as ReturnType<typeof getAnthropicClient>);

    const { extractReactions } = await import('@/lib/agents/reaction-extractor');
    const result = await extractReactions(mockMessages);

    expect(result).toEqual(mockMessages);
    spy.mockRestore();
  });

  it('returns messages as-is when fewer than 2 messages', async () => {
    const { extractReactions } = await import('@/lib/agents/reaction-extractor');
    const result = await extractReactions([mockMessages[0]]);
    expect(result).toEqual([mockMessages[0]]);
  });
});
