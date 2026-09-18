// Tests écrits sur une ancienne version de l'interface (libellés et classes d'alors). À réparer avec le healer.
import { test, expect } from '@playwright/test';
import { PageObjectManager } from '../../pages';
import { connecterCatalogue, utilisateurDuProjet } from '../../fixtures/support';

let pages: PageObjectManager;

test.beforeEach(async ({ page }, testInfo) => {
  pages = new PageObjectManager(page);
  await connecterCatalogue(pages, utilisateurDuProjet(testInfo));
});

test('ajouter un article met à jour le compteur', async ({ page }) => {
  await pages.inventory.productCard('Sauce Labs Backpack').getByRole('button', { name: 'Add to basket' }).click();
  await expect(page.locator('.cart-count')).toHaveText('1');
});

test('retirer un article vide le compteur', async ({ page }) => {
  await pages.inventory.productCard('Sauce Labs Bike Light').getByRole('button', { name: 'Add to basket' }).click();
  await pages.inventory.productCard('Sauce Labs Bike Light').getByRole('button', { name: 'Remove from basket' }).click();
  await expect(page.locator('.cart-count')).toBeHidden();
});
