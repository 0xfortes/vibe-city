import { test, expect } from '@playwright/test';

// These tests require a running dev server with auth + Supabase configured.
// They are designed to be run manually during development.

test.describe('Debate Flow', () => {
  // Skip in CI — requires real auth session
  test.skip(({  }) => !!process.env.CI, 'Requires local dev environment');

  test('landing page loads with city options', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/VibeCITY/i);
  });

  test('debate page shows mood selector', async ({ page }) => {
    // Navigate to a city page
    await page.goto('/city/tokyo');
    // Should see mood options
    const moodButtons = page.locator('[data-mood]');
    await expect(moodButtons.first()).toBeVisible({ timeout: 10000 });
  });
});
