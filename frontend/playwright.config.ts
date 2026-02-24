import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000, // Increased to 60s for slower environments
  expect: {
    timeout: 10_000, // Increased to 10s
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Reduced to 1 for environments with limited resources
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'e2e-results/results.json' }],
    ['./e2e/reporters/flow-coverage-reporter.mjs', { outputDir: 'e2e-results' }],
  ],
  webServer: [
    {
      command: '../backend/venv/bin/python ../backend/manage.py runserver 127.0.0.1:8000',
      url: 'http://127.0.0.1:8000/api/blogs-data/',
      reuseExistingServer: !process.env.CI,
      timeout: 180_000, // 3 minutes for server startup
      stdout: 'ignore',
      stderr: 'ignore',
    },
    {
      command: 'npm run dev -- --port 3000',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 180_000, // 3 minutes for server startup
    },
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Tablet',
    //   use: {
    //     ...devices['iPad Mini'],
    //     browserName: 'chromium',
    //   },
    // },
  ],
});
