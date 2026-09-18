// AVANT : chaque test répète la connexion et connaît le HTML de trois pages.
import { test, expect } from '@playwright/test';

test('ajouter un produit met à jour le badge du panier', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  const carte = page.getByTestId('inventory-item').filter({ hasText: 'Sauce Labs Backpack' });
  await carte.getByRole('button', { name: 'Add to cart' }).click();

  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
  await expect(carte.getByRole('button', { name: 'Remove' })).toBeVisible();
});

test('retirer un produit depuis le panier vide le badge', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByTestId('inventory-item').filter({ hasText: 'Sauce Labs Bike Light' })
    .getByRole('button', { name: 'Add to cart' }).click();
  await page.getByTestId('shopping-cart-link').click();

  const ligne = page.getByTestId('inventory-item').filter({ hasText: 'Sauce Labs Bike Light' });
  await expect(ligne).toBeVisible();
  await ligne.getByRole('button', { name: 'Remove' }).click();

  await expect(page.getByTestId('inventory-item')).toHaveCount(0);
  await expect(page.getByTestId('shopping-cart-badge')).toBeHidden();
});
