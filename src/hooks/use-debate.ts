'use client';

import { useState, useCallback, useRef } from 'react';
import type { AgentMessage, VerdictCard, MoodType } from '@/types';
import { mockDebateStream, MOCK_DEBATES } from '@/lib/data';

interface UseDebateReturn {
  messages: AgentMessage[];
  verdict: VerdictCard | null;
  followUpPrompts: string[];
  isStreaming: boolean;
  isComplete: boolean;
  error: Error | null;
  startDebate: (cityId: string, mood?: MoodType) => void;
  reset: () => void;
}

export function useDebate(): UseDebateReturn {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [verdict, setVerdict] = useState<VerdictCard | null>(null);
  const [followUpPrompts, setFollowUpPrompts] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef(false);

  const reset = useCallback(() => {
    abortRef.current = true;
    setMessages([]);
    setVerdict(null);
    setFollowUpPrompts([]);
    setIsStreaming(false);
    setIsComplete(false);
    setError(null);
  }, []);

  const startDebate = useCallback((cityId: string, mood?: MoodType) => {
    // Reset state for new debate
    abortRef.current = false;
    setMessages([]);
    setVerdict(null);
    setFollowUpPrompts([]);
    setIsStreaming(true);
    setIsComplete(false);
    setError(null);

    (async () => {
      try {
        const stream = mockDebateStream(cityId, mood);
        for await (const message of stream) {
          if (abortRef.current) return;
          setMessages((prev) => [...prev, message]);
        }

        if (abortRef.current) return;

        // Pull verdict and follow-ups from mock data
        const debate = MOCK_DEBATES[cityId] ?? MOCK_DEBATES['tokyo'];
        if (debate) {
          setVerdict(debate.verdict);
          setFollowUpPrompts(debate.followUpPrompts);
        }

        setIsStreaming(false);
        setIsComplete(true);
      } catch (err) {
        if (abortRef.current) return;
        setError(err instanceof Error ? err : new Error('Debate failed'));
        setIsStreaming(false);
      }
    })();
  }, []);

  return {
    messages,
    verdict,
    followUpPrompts,
    isStreaming,
    isComplete,
    error,
    startDebate,
    reset,
  };
}
