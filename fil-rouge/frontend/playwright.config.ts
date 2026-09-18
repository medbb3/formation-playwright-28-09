import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';   // .env local (ignoré par git) ; en CI : variables de pipeline

/**
 * Configuration Playwright de la mini-banque (fil rouge, état Jour 3).
 *
 * Projets :
 *  - setup-real / setup-mock : produisent .auth/<backend>/<rôle>.json (auth.setup.ts)
 *  - api      : tests API purs (backend FastAPI via docker compose)
 *  - chromium : tests UI + a11y contre front + backend réels
 *  - mocked   : mêmes tests UI, backend simulé (page.route), aucun docker
 *  - mobile   : smoke en émulation Pixel 5, backend simulé
 *  - visuel   : comparaisons d'images, backend simulé (données déterministes), viewport fixe
 *
 * webServer lance le front (Vite) s'il ne tourne pas déjà.
 */
const API_URL = process.env.API_URL ?? 'http://localhost:8000';
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173';

type Options = { backend: 'real' | 'mock' };

export default defineConfig<Options>({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],           // Azure DevOps : onglet Tests (M9.1)
    ['json', { outputFile: 'test-results/report.json' }],           // quality gates et KPIs (M9.2, M10.1)
    ['allure-playwright', { resultsDir: 'allure-results', detail: true, suiteTitle: false }],   // rapport métier (M10.1)
    ['monocart-reporter', { name: 'Mini-banque', outputFile: 'monocart-report/index.html' }],
  ],
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{platform}/{testFileName}/{arg}{ext}',
  expect: { toHaveScreenshot: { maxDiffPixels: 0 } },
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup-real', testMatch: /auth\.setup\.ts/, use: { backend: 'real' } },
    { name: 'setup-mock', testMatch: /auth\.setup\.ts/, use: { backend: 'mock' } },
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      use: { baseURL: API_URL, backend: 'real' },
    },
    {
      name: 'chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'], backend: 'real' },
      dependencies: ['setup-real'],
    },
    {
      name: 'mocked',
      testDir: './tests/ui',
      grepInvert: /@real-backend/,
      use: { ...devices['Desktop Chrome'], backend: 'mock' },
      dependencies: ['setup-mock'],
    },
    // Matrice navigateurs hebdomadaire (M9.2) : smoke seulement
    {
      name: 'firefox',
      testDir: './tests/ui',
      grep: /@smoke/,
      use: { ...devices['Desktop Firefox'], backend: 'real' },
      dependencies: ['setup-real'],
    },
    {
      name: 'webkit',
      testDir: './tests/ui',
      grep: /@smoke/,
      use: { ...devices['Desktop Safari'], backend: 'real' },
      dependencies: ['setup-real'],
    },
    // Émulation mobile : la majorité du trafic d'une banque est sur téléphone.
    // Smoke seulement, backend simulé (aucun Docker requis).
    {
      name: 'mobile',
      testDir: './tests/ui',
      grep: /@smoke/,
      grepInvert: /@real-backend/,
      use: { ...devices['Pixel 5'], backend: 'mock' },
      dependencies: ['setup-mock'],
    },
    {
      name: 'visuel',
      testDir: './tests/visuel',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 }, backend: 'mock' },
      dependencies: ['setup-mock'],
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
