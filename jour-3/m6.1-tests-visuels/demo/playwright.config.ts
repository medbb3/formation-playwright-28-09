import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'html',
  // Baselines regroupées par projet et plateforme : __screenshots__/visuel/linux/<fichier>/<nom>.png
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{platform}/{testFileName}/{arg}{ext}',
  expect: {
    toHaveScreenshot: { maxDiffPixels: 0, threshold: 0.2 },
  },
  use: {
    baseURL: 'https://www.saucedemo.com',
    testIdAttribute: 'data-test',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'visuel',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 }, storageState: '.auth/standard.json' },
      dependencies: ['setup'],
    },
  ],
});
