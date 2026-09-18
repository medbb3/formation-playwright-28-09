import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'html',
  use: { trace: 'retain-on-failure' },
  projects: [
    {
      name: 'standard',
      testIgnore: /casse/,
      use: { ...devices['Desktop Chrome'], baseURL: 'https://www.saucedemo.com', testIdAttribute: 'data-test', defaultUser: 'standard_user' },
    },
    {
      name: 'the-internet',
      testMatch: /casse/,
      use: { ...devices['Desktop Chrome'], baseURL: 'https://the-internet.herokuapp.com' },
    },
  ],
});
