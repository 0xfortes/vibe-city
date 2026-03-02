'use client';

import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  header?: ReactNode;
  padding?: boolean;
  hover?: boolean;
  className?: string;
}

export function Card({
  children,
  header,
  padding = true,
  hover = false,
  className = '',
}: CardProps) {
  return (
    <div
      className={`rounded-xl border border-zinc-800 bg-zinc-900 ${hover ? 'transition-colors hover:border-zinc-600 hover:bg-zinc-800/80' : ''} ${className}`}
    >
      {header && (
        <div className="border-b border-zinc-800 px-4 py-3 text-sm font-medium text-zinc-300">
          {header}
        </div>
      )}
      <div className={padding ? 'p-4' : ''}>{children}</div>
    </div>
  );
}
