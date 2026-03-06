import { describe, it, expect, vi } from 'vitest';
import { AppError, handleApiError, ERROR_CODES, type ErrorCode } from '@/lib/errors';

describe('AppError', () => {
  it('uses defaults from ERROR_CODES when no overrides', () => {
    const err = new AppError('AUTH_REQUIRED');
    expect(err.code).toBe('AUTH_REQUIRED');
    expect(err.statusCode).toBe(401);
    expect(err.userMessage).toBe('Please sign in to continue.');
    expect(err.message).toBe('Please sign in to continue.');
  });

  it('accepts custom message override', () => {
    const err = new AppError('AUTH_REQUIRED', 'Custom message');
    expect(err.userMessage).toBe('Custom message');
    expect(err.statusCode).toBe(401); // still uses default status
  });

  it('accepts custom status override', () => {
    const err = new AppError('AUTH_REQUIRED', undefined, 403);
    expect(err.statusCode).toBe(403);
    expect(err.userMessage).toBe('Please sign in to continue.'); // still uses default message
  });

  it('accepts both custom message and status', () => {
    const err = new AppError('INTERNAL_ERROR', 'Custom', 502);
    expect(err.userMessage).toBe('Custom');
    expect(err.statusCode).toBe(502);
  });

  it('sets name to AppError', () => {
    const err = new AppError('VALIDATION_ERROR');
    expect(err.name).toBe('AppError');
  });
});

describe('handleApiError', () => {
  it('returns correct JSON shape for AppError', async () => {
    const err = new AppError('CITY_NOT_FOUND');
    const response = handleApiError(err);

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error.code).toBe('CITY_NOT_FOUND');
    expect(body.error.message).toBe("We don't have that city yet. Try one of our featured cities.");
  });

  it('includes requestId when provided', async () => {
    const err = new AppError('AUTH_REQUIRED');
    const response = handleApiError(err, 'req-123');
    const body = await response.json();
    expect(body.error.requestId).toBe('req-123');
  });

  it('returns opaque 500 for unknown errors', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = handleApiError(new Error('Database connection failed'));
    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(body.error.message).toBe('Something went wrong on our end. Please try again.');
    // Must NOT leak internal details
    expect(body.error.message).not.toContain('Database');
    expect(body.error.message).not.toContain('connection');

    spy.mockRestore();
  });

  it('returns opaque 500 for string errors', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = handleApiError('something broke');
    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body.error.code).toBe('INTERNAL_ERROR');

    spy.mockRestore();
  });

  it('includes requestId for unknown errors too', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = handleApiError(new Error('boom'), 'req-456');
    const body = await response.json();
    expect(body.error.requestId).toBe('req-456');

    spy.mockRestore();
  });
});

describe('ERROR_CODES', () => {
  it('all codes map to valid HTTP status codes', () => {
    for (const [code, def] of Object.entries(ERROR_CODES)) {
      expect(def.status, `${code} should have a valid HTTP status`).toBeGreaterThanOrEqual(400);
      expect(def.status, `${code} should have a valid HTTP status`).toBeLessThan(600);
      expect(def.message, `${code} should have a non-empty message`).toBeTruthy();
    }
  });

  it('has all expected error codes', () => {
    const expectedCodes: ErrorCode[] = [
      'AUTH_REQUIRED',
      'AUTH_FAILED',
      'AUTH_EMAIL_EXISTS',
      'SUBSCRIPTION_REQUIRED',
      'TRIAL_EXHAUSTED',
      'RATE_LIMITED',
      'CITY_NOT_FOUND',
      'DEBATE_FAILED',
      'DEBATE_TIMEOUT',
      'PAYMENT_FAILED',
      'VALIDATION_ERROR',
      'INTERNAL_ERROR',
    ];
    for (const code of expectedCodes) {
      expect(ERROR_CODES).toHaveProperty(code);
    }
  });
});
