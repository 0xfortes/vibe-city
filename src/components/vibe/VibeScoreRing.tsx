'use client';

import { useEffect, useState } from 'react';

type RingSize = 'sm' | 'md' | 'lg';

interface VibeScoreRingProps {
  score: number;
  size?: RingSize;
}

const SIZE_CONFIG: Record<RingSize, { dimension: number; stroke: number; fontSize: string }> = {
  sm: { dimension: 56, stroke: 3, fontSize: 'text-lg' },
  md: { dimension: 72, stroke: 4, fontSize: 'text-2xl' },
  lg: { dimension: 100, stroke: 5, fontSize: 'text-4xl' },
};

function tierColor(score: number): string {
  if (score >= 90) return '#00FFaa';
  if (score >= 85) return '#00d4ff';
  return '#a78bfa';
}

export function VibeScoreRing({ score, size = 'md' }: VibeScoreRingProps) {
  const [mounted, setMounted] = useState(false);
  const { dimension, stroke, fontSize } = SIZE_CONFIG[size];
  const color = tierColor(score);

  const radius = (dimension - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100) / 100;
  const dashOffset = circumference * (1 - progress);

  useEffect(() => {
    // Trigger animation after mount
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: dimension, height: dimension }}>
      <svg
        width={dimension}
        height={dimension}
        viewBox={`0 0 ${dimension} ${dimension}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background track */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        {/* Progress ring */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={mounted ? dashOffset : circumference}
          style={{
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 6px ${color}80)`,
          }}
        />
      </svg>
      {/* Score number centered */}
      <span className={`absolute font-mono font-bold text-white ${fontSize}`}>
        {score}
      </span>
    </div>
  );
}
