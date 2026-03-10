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
      className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FFaa]/40 ${
        selected
          ? 'bg-[#00FFaa]/[0.06] text-[#00FFaa]/80 border border-[#00FFaa]/20'
          : 'bg-transparent text-white/40 border border-white/[0.08] hover:bg-white/[0.04] hover:text-white/55'
      } ${className}`}
    >
      {label}
    </button>
  );
}
