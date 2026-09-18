import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker/locale/fr';
import { unClient } from '../utils/factories';

faker.seed(2026);   // séquence reproductible : mêmes données à chaque exécution

test('commander avec des données de livraison générées', async ({ page }) => {
  const client = unClient();
  test.info().annotations.push({ type: 'données', description: JSON.stringify(client) });

  await page.goto('/inventory.html');
  await page.getByTestId('inventory-item').filter({ hasText: 'Sauce Labs Onesie' })
    .getByRole('button', { name: 'Add to cart' }).click();
  await page.getByTestId('shopping-cart-link').click();
  await page.getByRole('button', { name: 'Checkout' }).click();

  await page.getByPlaceholder('First Name').fill(client.firstName);
  await page.getByPlaceholder('Last Name').fill(client.lastName);
  await page.getByPlaceholder('Zip/Postal Code').fill(client.postalCode);
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByTestId('subtotal-label')).toHaveText('Item total: $7.99');
  await page.getByRole('button', { name: 'Finish' }).click();
  await expect(page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible();
});

test('un prénom vide généré volontairement est refusé', async ({ page }) => {
  const client = unClient({ firstName: '' });   // surcharge : cas d'erreur contrôlé

  await page.goto('/inventory.html');
  await page.getByTestId('inventory-item').first().getByRole('button', { name: 'Add to cart' }).click();
  await page.getByTestId('shopping-cart-link').click();
  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.getByPlaceholder('Last Name').fill(client.lastName);
  await page.getByPlaceholder('Zip/Postal Code').fill(client.postalCode);
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByTestId('error')).toContainText('First Name is required');
});
