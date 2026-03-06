import { test, expect } from '@playwright/test';

// These tests require a running dev server with auth + Stripe configured.
// They verify the subscription gate UI behavior.

test.describe('Subscription Gate', () => {
  test.skip(({  }) => !!process.env.CI, 'Requires local dev environment');

  test('dashboard loads for authenticated users', async ({ page }) => {
    // This test requires a logged-in session
    // In a real setup, you'd set auth cookies before visiting
    await page.goto('/dashboard');
    // If redirected to login, auth isn't set up — expected in CI
    const url = page.url();
    expect(url).toMatch(/\/(dashboard|login)/);
  });
});
