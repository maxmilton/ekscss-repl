import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "test/e2e",
  testMatch: "test/e2e/**/*.spec.ts",
  snapshotPathTemplate: "test/e2e/__snapshots__/{testFilePath}/{arg}{ext}",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://localhost:3000",
    acceptDownloads: false,
    contextOptions: { strictSelectors: true },
    locale: "en-US",
    timezoneId: "UTC",
    trace: "on-first-retry",
  },
  expect: {
    toHaveScreenshot: {
      scale: "device",
      stylePath: "test/e2e/screenshot.css",
      maxDiffPixelRatio: 0.02, // allow for font rendering variance
    },
  },
  webServer: {
    command: "bun run serve",
    port: 3000,
    reuseExistingServer: !process.env.CI, // throw in CI if port is taken
    // stdout: "pipe",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    // FIXME: Webkit is broken in both CI and on local dev machines. Create a
    // docker image for playwright to achieve a more consistent environment.
    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },
  ],
});
