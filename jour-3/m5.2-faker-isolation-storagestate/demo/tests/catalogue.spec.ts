import { test, expect } from '@playwright/test';

test('le catalogue est accessible directement, sans écran de login', async ({ page }) => {
  await page.goto('/inventory.html');   // storageState du projet : déjà connecté

  await expect(page.getByTestId('title')).toHaveText('Products');
  await expect(page.getByTestId('inventory-item')).toHaveCount(6);
});
