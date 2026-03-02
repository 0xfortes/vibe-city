'use client';

import { useEffect, useState, useCallback } from 'react';
import type { CityInfo, VibeScore, MoodType } from '@/types';
import { useDebate } from '@/hooks';
import { ErrorDisplay } from '@/components/ui';
import { VibeScoreCard } from '@/components/vibe';
import {
  MoodSelector,
  DebateStream,
  VerdictCardDisplay,
  FollowUpPrompts,
} from '@/components/council';

interface CityViewClientProps {
  city: CityInfo;
  vibeScore: VibeScore;
}

export function CityViewClient({ city, vibeScore }: CityViewClientProps) {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const {
    messages,
    verdict,
    followUpPrompts,
    isStreaming,
    isComplete,
    error,
    startDebate,
    reset,
  } = useDebate();

  useEffect(() => {
    startDebate(city.id);
  }, [city.id, startDebate]);

  const handleMoodSelect = useCallback(
    (mood: MoodType) => {
      setSelectedMood(mood);
      reset();
      // Small delay to let state clear before starting new debate
      setTimeout(() => startDebate(city.id, mood), 50);
    },
    [city.id, reset, startDebate],
  );

  const handleFollowUp = useCallback(() => {
    // Phase 1: just restart the debate
    reset();
    setTimeout(() => startDebate(city.id, selectedMood ?? undefined), 50);
  }, [city.id, selectedMood, reset, startDebate]);

  return (
    <div className="flex flex-col gap-8 py-8">
      <div>
        <h1 className="text-4xl font-bold text-white">{city.name}</h1>
        <p className="mt-2 text-lg text-zinc-400">{city.tagline}</p>
      </div>

      <MoodSelector
        selectedMood={selectedMood}
        onMoodSelect={handleMoodSelect}
        disabled={isStreaming}
      />

      <VibeScoreCard vibeScore={vibeScore} cityName={city.name} />

      {error ? (
        <ErrorDisplay error={error} onRetry={() => startDebate(city.id, selectedMood ?? undefined)} />
      ) : (
        <DebateStream messages={messages} isStreaming={isStreaming} />
      )}

      {isComplete && verdict && <VerdictCardDisplay verdict={verdict} />}

      {isComplete && followUpPrompts.length > 0 && (
        <FollowUpPrompts
          prompts={followUpPrompts}
          onSelect={handleFollowUp}
          disabled={isStreaming}
        />
      )}
    </div>
  );
}
