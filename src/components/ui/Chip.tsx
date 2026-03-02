'use client';

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Chip({
  label,
  selected = false,
  onClick,
  className = '',
}: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
        selected
          ? 'bg-white text-zinc-900 shadow-sm'
          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
      } ${className}`}
    >
      {label}
    </button>
  );
}
