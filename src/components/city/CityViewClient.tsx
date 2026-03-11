'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CityInfo, VibeScore, MoodType, WeatherInfo } from '@/types';
import { useDebate } from '@/hooks';
import { ErrorDisplay, Chip } from '@/components/ui';
import { GateModal } from '@/components/payment';
import { VibeScoreCard } from '@/components/vibe';
import {
  MoodSelector,
  DebateStream,
  VerdictCardDisplay,
  FollowUpPrompts,
} from '@/components/council';
import { MOODS } from '@/config/moods';

interface CityViewClientProps {
  city: CityInfo;
  vibeScore: VibeScore;
  weather: WeatherInfo;
}

const REVEAL_DELAY_MS = 1800;

export function CityViewClient({ city, vibeScore, weather }: CityViewClientProps) {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  // Tracks a pending debate request — useEffect fires the debate when this changes
  const [debateRequest, setDebateRequest] = useState<{ mood?: MoodType } | null>(null);

  // Progressive reveal state
  const [revealedCount, setRevealedCount] = useState(0);
  const [expandedAgent, setExpandedAgent] = useState<number | null>(null);
  const [skippedToVerdict, setSkippedToVerdict] = useState(false);

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

  // Progressive reveal timer — reveal one agent at a time
  useEffect(() => {
    if (skippedToVerdict) return;
    if (revealedCount >= messages.length) return;

    const timer = setTimeout(() => {
      setRevealedCount((prev) => {
        const next = prev + 1;
        setExpandedAgent(next - 1); // auto-expand the newly revealed agent
        return next;
      });
    }, REVEAL_DELAY_MS);

    return () => clearTimeout(timer);
  }, [revealedCount, messages.length, skippedToVerdict]);

  const handleMoodSelect = useCallback(
    (mood: MoodType) => {
      setSelectedMood(mood);
      setHasStarted(true);
      setRevealedCount(0);
      setExpandedAgent(null);
      setSkippedToVerdict(false);
      reset();
      setDebateRequest({ mood });
    },
    [reset],
  );

  const handleSurpriseMe = useCallback(() => {
    setSelectedMood('surprise');
    setHasStarted(true);
    setRevealedCount(0);
    setExpandedAgent(null);
    setSkippedToVerdict(false);
    reset();
    setDebateRequest({ mood: 'surprise' });
  }, [reset]);

  const handleFollowUp = useCallback(() => {
    setRevealedCount(0);
    setExpandedAgent(null);
    setSkippedToVerdict(false);
    reset();
    setDebateRequest({ mood: selectedMood ?? undefined });
  }, [selectedMood, reset]);

  const handleSkipToVerdict = useCallback(() => {
    setRevealedCount(messages.length);
    setExpandedAgent(null);
    setSkippedToVerdict(true);
  }, [messages.length]);

  const handleNewDebate = useCallback(() => {
    setHasStarted(false);
    setRevealedCount(0);
    setExpandedAgent(null);
    setSkippedToVerdict(false);
    reset();
  }, [reset]);

  const handleToggleAgent = useCallback((index: number) => {
    setExpandedAgent((prev) => (prev === index ? null : index));
  }, []);

  // Pre-debate: mood gate
  if (!hasStarted) {
    return (
      <div className="relative z-[1] flex flex-col gap-8 py-8">
        <motion.div
          className="flex flex-col items-center gap-2 text-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-4xl font-bold text-white sm:text-5xl">{city.name}</h1>
          <p className="text-lg text-white/40">{city.tagline}</p>
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <h2 className="text-lg font-semibold text-white/70">Set the mood</h2>
          <MoodSelector
            selectedMood={selectedMood}
            onMoodSelect={handleMoodSelect}
            prominent
          />
          <button
            type="button"
            onClick={handleSurpriseMe}
            className="mt-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-6 py-2.5 text-sm font-medium text-white/60 transition-all hover:border-white/[0.15] hover:bg-white/[0.06]"
          >
            Surprise me
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

  const allRevealed = revealedCount >= messages.length && messages.length > 0;
  const showVerdict = verdict && (allRevealed || skippedToVerdict);
  const showFollowUps = isComplete && followUpPrompts.length > 0 && (allRevealed || skippedToVerdict);

  // During & post-debate
  return (
    <div className="relative z-[1] flex flex-col gap-6 py-8">
      {/* Debate header */}
      <div className="flex flex-col gap-3">
        {/* COUNCIL DEBATE label */}
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00FFaa] animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-mono font-semibold text-white/40">
            Council Debate
          </span>
        </div>

        {/* City name with flag */}
        <h1 className="text-[40px] font-bold leading-tight tracking-tight text-white">
          {city.flag} {city.name}
        </h1>

        {/* Context row: local time, weather, day */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-white/35">
          <span>
            {new Intl.DateTimeFormat('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
              timeZone: city.timezone,
            }).format(new Date())}{' '}
            local
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {weather.current.icon} {weather.current.description}, {weather.current.temp}°C
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {new Intl.DateTimeFormat('en-US', {
              weekday: 'long',
              timeZone: city.timezone,
            }).format(new Date())}{' '}
            night
          </span>
        </div>

        {/* Mood pills */}
        <div className="pointer-events-none mt-1 flex flex-wrap gap-2">
          {MOODS.map((mood) => (
            <Chip
              key={mood.id}
              label={`${mood.emoji} ${mood.label}`}
              selected={selectedMood === mood.id}
            />
          ))}
        </div>
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

      {/* Verdict — shown above the debate once complete */}
      <AnimatePresence>
        {isComplete && showVerdict && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            <VerdictCardDisplay
              verdict={verdict}
              agentEmojis={messages.map((m) => m.agentEmoji)}
              onNewDebate={handleNewDebate}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debate stream with progressive reveal */}
      {!error && (isStreaming || messages.length > 0) && (
        <DebateStream
          messages={messages}
          isStreaming={isStreaming}
          revealedCount={revealedCount}
          expandedAgent={expandedAgent}
          onToggleAgent={handleToggleAgent}
          onSkipToVerdict={handleSkipToVerdict}
        />
      )}

      {/* Follow-up prompts */}
      {showFollowUps && (
        <FollowUpPrompts
          prompts={followUpPrompts}
          onSelect={handleFollowUp}
          disabled={isStreaming}
        />
      )}
    </div>
  );
}
