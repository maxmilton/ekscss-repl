import { type ConsoleMessage, expect, test } from '@playwright/test';

// TODO: Write tests to verify each feature of the app works:
//  - source code in vs output
//  - on-screen virtual console
//  - "Auto compile on input"
//  - "Compile" button
//  - "Clear Output" button
//  - editor text is correct default text
//  - editor has line numbers
//  - editor works as expected
//  - view looks correct on desktop screen size
//  - view looks correct on mobile screen size
//  - view looks correct on tablet screen size
//  - headings are visible

test.beforeEach(async ({ context }) => {
  // Mock CDN script with empty file
  await context.route(/^https:\/\/io\.bugbox\.app\/v0\/bugbox\.js/, (route) =>
    route.fulfill({ status: 200 }),
  );
});

test('repl app', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('ekscss REPL');
  await expect(page).toHaveURL('http://localhost:3000/'); // didn't redirect

  await expect(page.locator('#alert')).toBeAttached();
  await expect(page.locator('#app')).toBeAttached();
  await expect(page.locator('#nav')).toBeAttached();
  await expect(page.locator('#in')).toBeAttached();
  await expect(page.locator('#out')).toBeAttached();
  await expect(page.locator('#con')).toBeAttached();
  await expect(page.locator('#foot')).toBeAttached();
  await expect(page.locator('a[href="https://ekscss.js.org"]')).toBeAttached(); // link to the ekscss docs

  // TODO: Footer contains ekscss version
  // TODO: Footer contains REPL version
  // TODO: Footer contains link to maxmilton.com
  // TODO: Footer contains link to ekscss repo
  // TODO: Footer contains link to ekscss repl repo
  // TODO: Footer contains link to report bug
});

test('matches screenshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('repl.png', {
    fullPage: true,
    mask: [
      page.locator('#con .console>div'), // mask compile time log entry
      page.locator('#foot'), // mask footer which contains version numbers
    ],
  });
});

test('has no console calls (except 2 known calls) or unhandled errors', async ({ page }) => {
  const unhandledErrors: Error[] = [];
  const consoleMessages: ConsoleMessage[] = [];
  page.on('pageerror', (err) => unhandledErrors.push(err));
  page.on('console', (msg) => consoleMessages.push(msg));
  await page.goto('/');

  expect(unhandledErrors).toHaveLength(0);
  expect(consoleMessages).toHaveLength(2);
  expect(consoleMessages[0].type()).toBe('log');
  // Firefox prints "Array" instead of "[...]"
  expect(consoleMessages[0].text()).toMatch(/^AST: (\[.*]|Array)$/);

  expect(consoleMessages[1].type()).toBe('log');
  expect(consoleMessages[1].text()).toMatch(/^Compile time: \d+\.\d\dms$/);
});
