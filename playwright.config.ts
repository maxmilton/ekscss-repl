import { defineConfig } from '@playwright/test';

export default defineConfig({
  testMatch: 'test/e2e/*.spec.ts',
  forbidOnly: !!process.env.CI,
  webServer: {
    command: 'bun run serve',
    port: 3000,
    reuseExistingServer: !process.env.CI, // in CI throw if port is taken
    // stdout: 'pipe',
  },
  use: {
    baseURL: 'http://localhost:3000',
    acceptDownloads: false,
    contextOptions: {
      strictSelectors: true,
    },
  },
});
