'use client';

import type { MoodType } from '@/types';
import { MOODS } from '@/config/moods';
import { Chip } from '@/components/ui';

interface MoodSelectorProps {
  selectedMood: MoodType | null;
  onMoodSelect: (mood: MoodType) => void;
  disabled?: boolean;
}

export function MoodSelector({
  selectedMood,
  onMoodSelect,
  disabled = false,
}: MoodSelectorProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${disabled ? 'pointer-events-none opacity-50' : ''}`}>
      {MOODS.map((mood) => (
        <Chip
          key={mood.id}
          label={mood.label}
          selected={selectedMood === mood.id}
          onClick={() => onMoodSelect(mood.id)}
        />
      ))}
    </div>
  );
}
