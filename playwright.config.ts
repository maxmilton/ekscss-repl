import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'test/e2e',
  testMatch: 'test/e2e/**/*.spec.ts',
  snapshotPathTemplate: 'test/e2e/__snapshots__/{testFilePath}/{arg}{ext}',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  webServer: {
    command: 'bun run serve',
    port: 3000,
    reuseExistingServer: !process.env.CI, // in CI throw if port is taken
    // stdout: 'pipe',
  },
  use: {
    baseURL: 'http://localhost:3000',
    acceptDownloads: false,
    contextOptions: { strictSelectors: true },
    locale: 'en-US',
    // offline: true,
    timezoneId: 'UTC',
    trace: 'on-first-retry',
  },
  expect: {
    toHaveScreenshot: {
      scale: 'device',
      stylePath: 'test/e2e/screenshot.css',
    },
  },
});
