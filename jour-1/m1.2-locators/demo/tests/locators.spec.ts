import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory/);
});

test('niveaux de locators : un exemple par niveau', async ({ page }) => {
  // Niveau 1 : rôle + nom accessible
  await expect(page.getByRole('button', { name: 'Open Menu' })).toBeVisible();
  // Piège réel : le produit a DEUX liens portant ce nom (l'image via son alt, et le titre).
  // Un locator strict refuse de choisir : on le montre, puis on affine par le texte visible.
  await expect(page.getByRole('link', { name: 'Sauce Labs Backpack' })).toHaveCount(2);
  await expect(
    page.getByRole('link', { name: 'Sauce Labs Backpack' }).filter({ hasText: 'Sauce Labs Backpack' }),
  ).toBeVisible();

  // Niveau 2 : label / placeholder (utilisé dans le beforeEach : getByPlaceholder)

  // Niveau 3 : texte visible
  await expect(page.getByText('Products')).toBeVisible();

  // Niveau 4 : alt d'image
  await expect(page.getByAltText('Sauce Labs Backpack')).toBeVisible();

  // Niveau 5 : test id (attribut data-test configuré dans playwright.config.ts)
  await expect(page.getByTestId('inventory-list')).toBeVisible();

  // Niveau 6 : CSS, à éviter, montré pour comparaison
  await expect(page.locator('.inventory_item')).toHaveCount(6);
});

test('strict mode violation puis correction', async ({ page }) => {
  // Version 1 (à décommenter pour montrer l'erreur) : 6 boutons "Add to cart"
  // await page.getByRole('button', { name: 'Add to cart' }).click();

  // Version 2 : on part du conteneur produit, puis on descend
  const backpack = page.getByTestId('inventory-item').filter({ hasText: 'Sauce Labs Backpack' });
  await backpack.getByRole('button', { name: 'Add to cart' }).click();

  // Le bouton a changé de libellé : preuve que l'action a eu un effet
  await expect(backpack.getByRole('button', { name: 'Remove' })).toBeVisible();
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
});

test('assertion générique vs assertion web-first', async ({ page }) => {
  const backpack = page.getByTestId('inventory-item').filter({ hasText: 'Sauce Labs Backpack' });
  await backpack.getByRole('button', { name: 'Add to cart' }).click();

  // Générique : lit UNE fois. Fonctionne ici car le badge est rendu de façon synchrone,
  // mais échouera sur toute application qui appelle une API avant de mettre à jour.
  const texte = await page.getByTestId('shopping-cart-badge').textContent();
  expect(texte).toBe('1');

  // Web-first : réessaie jusqu'à 5 s. Toujours préférer cette forme.
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
});

test('tri des produits par prix croissant', async ({ page }) => {
  await page.getByTestId('product-sort-container').selectOption('lohi');

  const prix = page.getByTestId('inventory-item-price');
  await expect(prix).toHaveCount(6);
  await expect(prix.first()).toHaveText('$7.99');
  await expect(prix.last()).toHaveText('$49.99');

  // Vérification de l'ordre complet
  await expect(prix).toHaveText(['$7.99', '$9.99', '$15.99', '$15.99', '$29.99', '$49.99']);
});
