import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: 'https://www.saucedemo.com',
    testIdAttribute: 'data-test',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'standard',
      use: { ...devices['Desktop Chrome'], storageState: '.auth/standard.json' },
      dependencies: ['setup'],
    },
    {
      name: 'visual',
      use: { ...devices['Desktop Chrome'], storageState: '.auth/visual.json' },
      dependencies: ['setup'],
      testIgnore: /deux-roles|login|commande/,   // ces tests n'ont de sens que sous 'standard'
    },
  ],
});
