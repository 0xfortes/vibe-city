import { NextResponse } from 'next/server';
import type { ApiErrorResponse } from '@/types';

export const ERROR_CODES = {
  AUTH_REQUIRED: { status: 401, message: 'Please sign in to continue.' },
  AUTH_FAILED: { status: 401, message: 'Unable to sign in. Please check your credentials.' },
  AUTH_EMAIL_EXISTS: { status: 409, message: 'An account with this email already exists.' },
  SUBSCRIPTION_REQUIRED: { status: 403, message: 'Subscribe to access The Council.' },
  TRIAL_EXHAUSTED: {
    status: 403,
    message: "You've used your free debate. Subscribe for unlimited access.",
  },
  RATE_LIMITED: { status: 429, message: "You're moving too fast. Please wait a moment." },
  CITY_NOT_FOUND: {
    status: 404,
    message: "We don't have that city yet. Try one of our featured cities.",
  },
  DEBATE_FAILED: {
    status: 503,
    message: 'The Council is taking a break. Try again in a moment.',
  },
  DEBATE_TIMEOUT: { status: 504, message: 'The Council took too long. Please try again.' },
  PAYMENT_FAILED: {
    status: 402,
    message: 'Unable to process payment. Please try again or use a different card.',
  },
  VALIDATION_ERROR: {
    status: 400,
    message: "Something doesn't look right. Please check your input.",
  },
  INTERNAL_ERROR: {
    status: 500,
    message: 'Something went wrong on our end. Please try again.',
  },
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly userMessage: string;

  constructor(code: ErrorCode, userMessage?: string, statusCode?: number) {
    const defaults = ERROR_CODES[code];
    const msg = userMessage ?? defaults.message;
    super(msg);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode ?? defaults.status;
    this.userMessage = msg;
  }
}

export function handleApiError(error: unknown, requestId?: string): NextResponse<ApiErrorResponse> {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.userMessage,
          requestId,
        },
      },
      { status: error.statusCode },
    );
  }

  // Unhandled error — log details server-side, return opaque message to client
  console.error('Unhandled error:', error);
  const defaults = ERROR_CODES.INTERNAL_ERROR;
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: defaults.message,
        requestId,
      },
    },
    { status: defaults.status },
  );
}
