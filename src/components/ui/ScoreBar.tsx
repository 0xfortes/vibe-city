'use client';

import { motion } from 'framer-motion';

interface ScoreBarProps {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
  className?: string;
}

export function ScoreBar({
  label,
  value,
  maxValue = 100,
  color,
  className = '',
}: ScoreBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-white/35">{label}</span>
        <span className="font-medium text-white/80">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color ?? '#ffffff' }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
