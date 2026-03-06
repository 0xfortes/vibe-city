'use client';

import { useState, useCallback, useRef } from 'react';
import type { AgentMessage, VerdictCard, MoodType } from '@/types';
import type { DebateSSEEvent } from '@/lib/agents';

interface UseDebateReturn {
  messages: AgentMessage[];
  verdict: VerdictCard | null;
  followUpPrompts: string[];
  debateId: string | null;
  isStreaming: boolean;
  isComplete: boolean;
  error: Error | null;
  startDebate: (cityId: string, mood?: MoodType) => void;
  askFollowUp: (cityId: string, question: string, mood?: MoodType) => void;
  reset: () => void;
}

/**
 * Hook that connects to the /api/council SSE endpoint and streams debate results.
 * Supports follow-up questions that reference the previous debate round.
 */
export function useDebate(): UseDebateReturn {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [verdict, setVerdict] = useState<VerdictCard | null>(null);
  const [followUpPrompts, setFollowUpPrompts] = useState<string[]>([]);
  const [debateId, setDebateId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Store messages from the last completed round for follow-up context
  const lastRoundMessages = useRef<AgentMessage[]>([]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setVerdict(null);
    setFollowUpPrompts([]);
    setDebateId(null);
    setIsStreaming(false);
    setIsComplete(false);
    setError(null);
    lastRoundMessages.current = [];
  }, []);

  const streamDebate = useCallback(
    (body: Record<string, unknown>) => {
      // Abort any existing stream
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // Reset state for new round
      setMessages([]);
      setVerdict(null);
      setFollowUpPrompts([]);
      setIsStreaming(true);
      setIsComplete(false);
      setError(null);

      (async () => {
        try {
          const response = await fetch('/api/council', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message ?? 'Debate failed');
          }

          const reader = response.body?.getReader();
          if (!reader) throw new Error('No response body');

          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (controller.signal.aborted) break;

            buffer += decoder.decode(value, { stream: true });

            // Process complete SSE events from the buffer
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? ''; // Keep incomplete line in buffer

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;

              try {
                const event: DebateSSEEvent = JSON.parse(line.slice(6));

                switch (event.type) {
                  case 'agent_start':
                    break;

                  case 'agent_chunk':
                    break;

                  case 'agent_done':
                    // Agent finished — add or update message (reactions come as updates)
                    if (event.message) {
                      setMessages((prev) => {
                        const idx = prev.findIndex((m) => m.agentId === event.message!.agentId);
                        if (idx >= 0) {
                          const updated = [...prev];
                          updated[idx] = event.message!;
                          return updated;
                        }
                        return [...prev, event.message!];
                      });
                    }
                    break;

                  case 'verdict':
                    if (event.verdict) {
                      setVerdict(event.verdict);
                    }
                    break;

                  case 'follow_ups':
                    if (event.followUps) {
                      setFollowUpPrompts(event.followUps);
                    }
                    break;

                  case 'debate_saved':
                    if (event.debateId) {
                      setDebateId(event.debateId);
                    }
                    break;

                  case 'done':
                    setIsStreaming(false);
                    setIsComplete(true);
                    // Save current messages for potential follow-up
                    setMessages((current) => {
                      lastRoundMessages.current = current;
                      return current;
                    });
                    break;

                  case 'error':
                    throw new Error(event.error ?? 'Debate failed');
                }
              } catch (parseErr) {
                if (parseErr instanceof Error && parseErr.message !== 'Debate failed') {
                  console.warn('Failed to parse SSE event:', line);
                } else {
                  throw parseErr;
                }
              }
            }
          }

          // If we exited the loop without a 'done' event
          if (!controller.signal.aborted) {
            setIsStreaming(false);
            setIsComplete(true);
          }
        } catch (err) {
          if (controller.signal.aborted) return;
          setError(err instanceof Error ? err : new Error('Debate failed'));
          setIsStreaming(false);
        }
      })();
    },
    [],
  );

  const startDebate = useCallback(
    (cityId: string, mood?: MoodType) => {
      lastRoundMessages.current = [];
      setDebateId(null);
      streamDebate({ cityId, mood: mood ?? null });
    },
    [streamDebate],
  );

  const askFollowUp = useCallback(
    (cityId: string, question: string, mood?: MoodType) => {
      streamDebate({
        cityId,
        mood: mood ?? null,
        followUp: question,
        previousMessages: lastRoundMessages.current,
      });
    },
    [streamDebate],
  );

  return {
    messages,
    verdict,
    followUpPrompts,
    debateId,
    isStreaming,
    isComplete,
    error,
    startDebate,
    askFollowUp,
    reset,
  };
}
