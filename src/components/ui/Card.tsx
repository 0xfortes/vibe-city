'use client';

import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  header?: ReactNode;
  padding?: boolean;
  hover?: boolean;
  gradientBorder?: boolean;
  className?: string;
}

export function Card({
  children,
  header,
  padding = true,
  hover = false,
  gradientBorder = false,
  className = '',
}: CardProps) {
  if (gradientBorder) {
    return (
      <div className={`rounded-2xl bg-white/[0.06] p-px transition-all duration-500 hover:bg-gradient-to-br hover:from-[#00FFaa]/20 hover:via-[#a78bfa]/10 hover:to-[#06b6d4]/20 ${className}`}>
        <div className="rounded-[15px] bg-[--card-bg]">
          {header && (
            <div className="border-b border-white/[0.06] px-4 py-3 text-sm font-medium text-white/60">
              {header}
            </div>
          )}
          <div className={padding ? 'p-4' : ''}>{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-white/[0.06] bg-[--card-bg] ${hover ? 'transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.03]' : ''} ${className}`}
    >
      {header && (
        <div className="border-b border-white/[0.06] px-4 py-3 text-sm font-medium text-white/60">
          {header}
        </div>
      )}
      <div className={padding ? 'p-4' : ''}>{children}</div>
    </div>
  );
}
