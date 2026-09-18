import { defineConfig, devices } from '@playwright/test';

/** Démo M4.2 : cible la mini-banque locale (docker compose up -d dans fil-rouge/). */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
