'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CityInfo, VibeScore, MoodType } from '@/types';
import { useDebate } from '@/hooks';
import { ErrorDisplay } from '@/components/ui';
import { GateModal } from '@/components/payment';
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
  const [hasStarted, setHasStarted] = useState(false);
  // User-toggled state for collapsible debate section (only relevant post-debate)
  const [debateExpanded, setDebateExpanded] = useState(false);
  // Tracks a pending debate request — useEffect fires the debate when this changes
  const [debateRequest, setDebateRequest] = useState<{ mood?: MoodType } | null>(null);

  const {
    messages,
    verdict,
    followUpPrompts,
    isStreaming,
    isComplete,
    error,
    errorCode,
    startDebate,
    reset,
  } = useDebate();

  // Fire debate when debateRequest changes
  const debateRequestRef = useRef(debateRequest);
  useEffect(() => {
    if (debateRequest && debateRequest !== debateRequestRef.current) {
      debateRequestRef.current = debateRequest;
      startDebate(city.id, debateRequest.mood);
    }
  }, [debateRequest, city.id, startDebate]);

  const handleMoodSelect = useCallback(
    (mood: MoodType) => {
      setSelectedMood(mood);
      setHasStarted(true);
      setDebateExpanded(false);
      reset();
      setDebateRequest({ mood });
    },
    [reset],
  );

  const handleSurpriseMe = useCallback(() => {
    setSelectedMood(null);
    setHasStarted(true);
    setDebateExpanded(false);
    reset();
    setDebateRequest({});
  }, [reset]);

  const handleFollowUp = useCallback(() => {
    setDebateExpanded(false);
    reset();
    setDebateRequest({ mood: selectedMood ?? undefined });
  }, [selectedMood, reset]);

  // Pre-debate: mood gate
  if (!hasStarted) {
    return (
      <div className="flex flex-col gap-8 py-8">
        <motion.div
          className="flex flex-col items-center gap-2 text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-4xl font-bold text-white sm:text-5xl">{city.name}</h1>
          <p className="text-lg text-zinc-400">{city.tagline}</p>
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <h2 className="text-lg font-semibold text-zinc-200">Set the mood</h2>
          <MoodSelector
            selectedMood={selectedMood}
            onMoodSelect={handleMoodSelect}
            prominent
          />
          <button
            type="button"
            onClick={handleSurpriseMe}
            className="mt-2 rounded-full border border-zinc-700 bg-zinc-800/50 px-6 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            ✨ Surprise me
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <VibeScoreCard vibeScore={vibeScore} cityName={city.name} />
        </motion.div>
      </div>
    );
  }

  // During & post-debate
  return (
    <div className="flex flex-col gap-6 py-8">
      {/* Compact header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{city.name}</h1>
        {selectedMood && (
          <div className="mt-2">
            <MoodSelector
              selectedMood={selectedMood}
              onMoodSelect={() => {}}
              disabled
            />
          </div>
        )}
      </div>

      {error && errorCode === 'AUTH_REQUIRED' && (
        <GateModal type="auth" onClose={reset} />
      )}
      {error && errorCode === 'TRIAL_EXHAUSTED' && (
        <GateModal type="paywall" onClose={reset} />
      )}
      {error && errorCode !== 'AUTH_REQUIRED' && errorCode !== 'TRIAL_EXHAUSTED' && (
        <ErrorDisplay error={error} onRetry={() => startDebate(city.id, selectedMood ?? undefined)} />
      )}

      {/* Verdict — prominent, at the top of results */}
      <AnimatePresence>
        {isComplete && verdict && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            <VerdictCardDisplay verdict={verdict} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* During streaming: show debate + placeholder */}
      {isStreaming && !error && (
        <>
          <DebateStream messages={messages} isStreaming={isStreaming} />
          <div className="flex items-center justify-center py-4">
            <motion.p
              className="text-sm text-zinc-500"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              The verdict is coming...
            </motion.p>
          </div>
        </>
      )}

      {/* Post-debate: collapsible debate */}
      {isComplete && !error && (
        <div>
          <button
            type="button"
            onClick={() => setDebateExpanded((prev) => !prev)}
            className="flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-200"
          >
            <motion.span
              animate={{ rotate: debateExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              &#9654;
            </motion.span>
            {debateExpanded ? 'Hide the full debate' : 'Show the full debate'}
          </button>

          <AnimatePresence>
            {debateExpanded && (
              <motion.div
                className="mt-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <DebateStream messages={messages} isStreaming={false} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Follow-up prompts */}
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
