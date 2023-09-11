import { expect, test } from '@playwright/test';

test('temporary placeholder', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('ekscss REPL');
});
