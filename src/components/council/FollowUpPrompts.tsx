'use client';

import { motion } from 'framer-motion';
import { Chip } from '@/components/ui';

interface FollowUpPromptsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function FollowUpPrompts({
  prompts,
  onSelect,
  disabled = false,
}: FollowUpPromptsProps) {
  return (
    <motion.div
      className="flex flex-col gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <h3 className="text-sm font-semibold text-zinc-400">Your Turn</h3>
      <div className={`flex flex-wrap gap-2 ${disabled ? 'pointer-events-none opacity-50' : ''}`}>
        {prompts.map((prompt) => (
          <Chip
            key={prompt}
            label={prompt}
            onClick={() => onSelect(prompt)}
          />
        ))}
      </div>
    </motion.div>
  );
}
