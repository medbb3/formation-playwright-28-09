import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'https://www.saucedemo.com',
    testIdAttribute: 'data-test',
    trace: 'retain-on-failure',
  },
  projects: [
    // L'option defaultUser (fixture option) est fixée par projet
    { name: 'standard', use: { ...devices['Desktop Chrome'], defaultUser: 'standard_user' } },
    { name: 'problem', use: { ...devices['Desktop Chrome'], defaultUser: 'problem_user' } },
  ],
});
