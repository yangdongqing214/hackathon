import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/specs',

  fullyParallel: true,

  retries: process.env.CI ? 2 : 0,

  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],

  use: {
    baseURL: 'http://localhost:5175',

    screenshot: 'only-on-failure',

    video: 'retain-on-failure',

    trace: 'on-first-retry'
  },

  webServer: {
    command: 'npm run dev --prefix ../frontend -- --host 0.0.0.0',
    url: 'http://localhost:5175',
    reuseExistingServer: !process.env.CI
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome']
      }
    }
  ]
});