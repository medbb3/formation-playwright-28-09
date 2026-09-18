import { test, expect } from '@playwright/test';
import { chargerProduits } from '../utils/data';

const produits = chargerProduits();

test.describe('Catalogue : prix conformes au référentiel métier', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();
  });

  for (const p of produits) {
    test(`${p.nom} est affiché à $${p.prix.toFixed(2)}`, async ({ page }) => {
      test.info().annotations.push({ type: 'donnée', description: JSON.stringify(p) });
      const carte = page.getByTestId('inventory-item').filter({ hasText: p.nom });
      await expect(carte).toHaveCount(1);
      await expect(carte.getByTestId('inventory-item-price')).toHaveText(`$${p.prix.toFixed(2)}`);
    });
  }
});
