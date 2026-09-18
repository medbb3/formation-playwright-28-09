import { test, expect } from '@playwright/test';
import { PageObjectManager } from '../pages';
import { connecterCatalogue, utilisateurDuProjet } from '../fixtures/support';

// Seed pour les agents : le beforeEach connecte (connecterCatalogue) et arrive sur le catalogue.
// Un test généré doit reprendre ce beforeEach tel quel dans son fichier, jamais réécrire la connexion.
test.describe('Seed', () => {
  let pages: PageObjectManager;

  test.beforeEach(async ({ page }, testInfo) => {
    pages = new PageObjectManager(page);
    await connecterCatalogue(pages, utilisateurDuProjet(testInfo));
  });

  test('seed', async () => {
    await expect(pages.inventory.title).toHaveText('Products');
    // generate code here.
  });
});
