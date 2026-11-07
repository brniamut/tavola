import { defineConfig, devices } from '@playwright/test';

/** Port of the playground while the browser tests run; next to the dev server's 5190. */
const PORT = 5191;

/** Running in CI: stricter, with a retry and GitHub annotations. */
const CI = Boolean(process.env['CI']);

/**
 * Browser tests against the playground, in the three engines users have: Chromium, Firefox and
 * WebKit (Safari). They cover what jsdom cannot: drag and drop, resizing, sticky pinning and
 * layout at a narrow width.
 */
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? 'github' : 'list',
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: `pnpm exec vite --port ${PORT} --strictPort`,
    port: PORT,
    reuseExistingServer: !CI,
  },
});
