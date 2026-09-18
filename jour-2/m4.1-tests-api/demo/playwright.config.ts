import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  projects: [
    {
      // Projet API : pas de navigateur, sa propre baseURL et ses en-têtes
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        baseURL: 'https://reqres.in',
        extraHTTPHeaders: {
          'x-api-key': 'reqres-free-v1',   // clé publique gratuite exigée par ReqRes
          Accept: 'application/json',
        },
      },
    },
  ],
});
