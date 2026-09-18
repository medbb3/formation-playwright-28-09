import { test, expect } from '@playwright/test';

// Complément de la section 1.6 : expect.soft.
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory/);
});

test('expect.soft : vérifier toute une carte produit d\'un coup', async ({ page }) => {
  const carte = page.getByTestId('inventory-item').filter({ hasText: 'Sauce Labs Backpack' });

  // Assertion DURE : si la carte n'est pas là, inutile de vérifier son contenu.
  await expect(carte).toBeVisible();

  // Assertions SOUPLES : indépendantes entre elles. Un écart n'empêche pas de voir les autres.
  await expect.soft(carte.getByTestId('inventory-item-name')).toHaveText('Sauce Labs Backpack');
  await expect.soft(carte.getByTestId('inventory-item-price')).toHaveText('$29.99');
  await expect.soft(carte.getByRole('button')).toHaveText('Add to cart');

  // Si l'un des trois avait échoué, le test aurait continué puis serait rouge à la fin,
  // avec les trois écarts listés dans le rapport.
});

test('ajout au panier : le badge reflète le nombre d\'articles', async ({ page }) => {
  await page.getByTestId('inventory-item').first().getByRole('button').click();

  // Assertion web-first standard : réessaie jusqu'à ce que le badge affiche la bonne valeur.
  await expect(page.getByTestId('shopping-cart-badge')).toBeVisible();
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
});
