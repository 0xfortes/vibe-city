'use client';

import type { MoodType } from '@/types';
import { MOODS } from '@/config/moods';
import { Chip } from '@/components/ui';

interface MoodSelectorProps {
  selectedMood: MoodType | null;
  onMoodSelect: (mood: MoodType) => void;
  disabled?: boolean;
  prominent?: boolean;
}

export function MoodSelector({
  selectedMood,
  onMoodSelect,
  disabled = false,
  prominent = false,
}: MoodSelectorProps) {
  if (prominent) {
    return (
      <div className="flex flex-wrap justify-center gap-3">
        {MOODS.filter((m) => m.id !== 'surprise').map((mood) => (
          <button
            key={mood.id}
            type="button"
            onClick={() => onMoodSelect(mood.id)}
            className={`flex flex-col items-center gap-1.5 rounded-xl border px-5 py-4 text-center transition-all hover:border-white/[0.15] hover:bg-white/[0.06] ${
              selectedMood === mood.id
                ? 'border-[#00FFaa]/30 bg-[#00FFaa]/10'
                : 'border-white/[0.06] bg-white/[0.04]'
            }`}
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className="text-sm font-medium text-white/80">{mood.label}</span>
            <span className="max-w-[140px] text-xs text-white/30">{mood.description}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${disabled ? 'pointer-events-none opacity-50' : ''}`}>
      {MOODS.map((mood) => (
        <Chip
          key={mood.id}
          label={`${mood.emoji} ${mood.label}`}
          selected={selectedMood === mood.id}
          onClick={() => onMoodSelect(mood.id)}
        />
      ))}
    </div>
  );
}
