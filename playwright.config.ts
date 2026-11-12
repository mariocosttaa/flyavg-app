import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
// Point E2E_BASE_URL at a running deployment (e.g. the nginx image) to skip the local server.
const externalBaseUrl = process.env.E2E_BASE_URL;
// PLAYWRIGHT_CHANNEL=chrome uses the installed Chrome instead of downloaded browsers.
const channel = process.env.PLAYWRIGHT_CHANNEL;

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  use: {
    baseURL: externalBaseUrl ?? `http://127.0.0.1:${PORT}`,
    locale: 'pt-PT',
    timezoneId: 'UTC',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  // Chromium only until CI installs the WebKit and mobile browsers.
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], channel } }],
  webServer: externalBaseUrl
    ? undefined
    : {
        command: `npm run build && npm run preview -- --host 127.0.0.1 --port ${PORT} --strictPort`,
        url: `http://127.0.0.1:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        // The build validates these at startup; e2e uses safe local placeholders.
        env: {
          VITE_API_URL: 'http://127.0.0.1:3000',
          VITE_APP_ENV: 'development',
          VITE_SITE_URL: `http://127.0.0.1:${PORT}`,
        },
      },
});
