// Contre-exemple : ce test échoue sur une VALEUR. Le healer ne doit pas la "corriger" sans validation.
import { test, expect } from '@playwright/test';
import { PageObjectManager } from '../../pages';
import { connecterCatalogue, utilisateurDuProjet } from '../../fixtures/support';

let pages: PageObjectManager;

test.beforeEach(async ({ page }, testInfo) => {
  pages = new PageObjectManager(page);
  await connecterCatalogue(pages, utilisateurDuProjet(testInfo));
});

test('le Backpack est affiché au prix catalogue', async () => {
  const carte = pages.inventory.productCard('Sauce Labs Backpack');
  await expect(carte.getByTestId('inventory-item-price')).toHaveText('$30.99');
});
