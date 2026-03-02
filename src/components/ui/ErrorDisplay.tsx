'use client';

import { AppError, type ErrorCode, ERROR_CODES } from '@/lib/errors';

interface ErrorDisplayProps {
  error: AppError | Error | string;
  onRetry?: () => void;
  className?: string;
}

const ERROR_ICONS: Partial<Record<ErrorCode, string>> = {
  CITY_NOT_FOUND: '🗺️',
  DEBATE_FAILED: '💬',
  DEBATE_TIMEOUT: '⏱️',
  RATE_LIMITED: '🐌',
  AUTH_REQUIRED: '🔒',
  SUBSCRIPTION_REQUIRED: '✨',
  PAYMENT_FAILED: '💳',
};

export function ErrorDisplay({ error, onRetry, className = '' }: ErrorDisplayProps) {
  let message: string;
  let icon = '⚠️';

  if (error instanceof AppError) {
    message = error.userMessage;
    icon = ERROR_ICONS[error.code] ?? '⚠️';
  } else if (error instanceof Error) {
    message = ERROR_CODES.INTERNAL_ERROR.message;
  } else {
    message = error;
  }

  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center ${className}`}
      role="alert"
    >
      <span className="text-3xl">{icon}</span>
      <p className="text-sm text-zinc-300">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-700"
        >
          Try again
        </button>
      )}
    </div>
  );
}
