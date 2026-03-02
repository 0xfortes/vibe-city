import type { AgentMessage, MoodType } from '@/types';
import { MOCK_DEBATES } from './mock-debates';

const DELAY_MS = 1500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Yields pre-written debate messages one at a time with delays,
 * simulating SSE streaming from the real Council API.
 */
export async function* mockDebateStream(
  cityId: string,
  _mood?: MoodType,
): AsyncGenerator<AgentMessage> {
  const debate = MOCK_DEBATES[cityId];
  if (!debate) {
    // Fall back to Tokyo if city has no mock debate
    const fallback = MOCK_DEBATES['tokyo'];
    if (!fallback) return;
    for (const message of fallback.messages) {
      await delay(DELAY_MS);
      yield message;
    }
    return;
  }

  for (const message of debate.messages) {
    await delay(DELAY_MS);
    yield message;
  }
}
