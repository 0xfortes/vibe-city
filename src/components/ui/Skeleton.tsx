'use client';

type SkeletonVariant = 'text' | 'card' | 'avatar' | 'score-bar';

interface SkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
}

const VARIANT_CLASSES: Record<SkeletonVariant, string> = {
  text: 'h-4 w-3/4 rounded',
  card: 'h-32 w-full rounded-xl',
  avatar: 'h-10 w-10 rounded-full',
  'score-bar': 'h-3 w-full rounded-full',
};

export function Skeleton({ variant = 'text', className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-white/[0.05] ${VARIANT_CLASSES[variant]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
