// Aperçu playwright-bdd (BONUS, non exécuté dans ce module) : chaque phrase Gherkin est implémentée une fois,
// réutilisable par tous les scénarios. Le chemin d'apprentissage principal du M7.3 reste le Gherkin comme
// spécification (cours.md §1.4) ; ceci illustre l'alternative Gherkin exécutable si l'équipe la choisit un jour.
// Installation : npm i -D playwright-bdd ; config : defineBddConfig({ features: 'features/**/*.feature', steps: 'steps/**/*.ts' }).
import { createBdd } from 'playwright-bdd';
import { test, expect, type Page } from '@playwright/test';

const { Given, When, Then } = createBdd(test);

// Pas de fixture personnalisée (cf. cours.md M3.2/M7.2) : un helper explicite, appelé depuis le pas "Given".
async function connecterClient(page: Page): Promise<void> {
  await page.goto('/auth/login');
  await page.getByLabel('Email address').fill('customer@practicesoftwaretesting.com');
  await page.getByLabel('Password').fill(process.env.PST_PASSWORD ?? 'welcome01');
  await page.getByRole('button', { name: 'Login' }).click();
}

Given('que je suis connecté en tant que client', async ({ page }) => {
  await connecterClient(page);
});

When('j\'ouvre la fiche du produit {string}', async ({ page }, nom: string) => {
  await page.getByRole('link', { name: nom }).click();
});

When('que je clique sur {string}', async ({ page }, bouton: string) => {
  await page.getByRole('button', { name: bouton }).click();
});

Then('la page {string} liste {string}', async ({ page }, nomPage: string, produit: string) => {
  await page.getByRole('link', { name: nomPage }).click();
  await expect(page.getByText(produit)).toBeVisible();
});
