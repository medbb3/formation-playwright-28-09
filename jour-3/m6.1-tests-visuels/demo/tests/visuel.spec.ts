import fs from 'node:fs';
import { test, expect } from '@playwright/test';

test.describe('Catalogue', { tag: '@visual' }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory.html');
    await expect(page.getByTestId('inventory-item')).toHaveCount(6);   // état stable avant capture
    await page.mouse.move(0, 0);                                         // pas d'état hover
  });

  test('le catalogue correspond à la baseline', async ({ page }) => {
    await expect(page).toHaveScreenshot('catalogue.png');
  });

  test('régression volontaire : prix en rouge', async ({ page }) => {
    // Ne pas écrire la baseline avec le CSS injecté : on saute tant qu'elle n'existe pas
    test.skip(!fs.existsSync(test.info().snapshotPath('catalogue.png')), 'Baseline catalogue.png à générer d\'abord');
    test.fail(true, 'Démo : le CSS injecté doit produire un diff sur la baseline catalogue.png');
    await page.addStyleTag({ content: '.inventory_item_price { color: red !important; }' });
    await expect(page).toHaveScreenshot('catalogue.png');
  });

  test('carte produit : composant isolé', async ({ page }) => {
    const carte = page.getByTestId('inventory-item').filter({ hasText: 'Sauce Labs Backpack' });
    await expect(carte).toHaveScreenshot('carte-backpack.png');
  });

  test('badge masqué : capture indépendante du contenu du panier', async ({ page }) => {
    await page.getByTestId('inventory-item').first().getByRole('button', { name: 'Add to cart' }).click();
    await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
    await expect(page.getByTestId('header-container')).toHaveScreenshot('entete.png', {
      mask: [page.getByTestId('shopping-cart-badge')],
    });
  });

  test("l'en-tête a la structure ARIA attendue", async ({ page }) => {
    // Correspondance partielle : les nœuds non listés sont ignorés, l'ordre compte
    await expect(page.getByTestId('header-container')).toMatchAriaSnapshot(`
      - button "Open Menu"
      - combobox:
        - option "Name (A to Z)" [selected]
        - option "Price (low to high)"
    `);
  });
});

test.describe('visual_user', { tag: '@visual' }, () => {
  test.use({ storageState: '.auth/visual.json' });

  test('le site décale volontairement des éléments pour cet utilisateur', async ({ page }) => {
    test.fail(true, 'SauceDemo casse le visuel pour visual_user : un seuil ne doit pas le masquer');
    await page.goto('/inventory.html');
    await expect(page.getByTestId('inventory-item')).toHaveCount(6);
    await page.mouse.move(0, 0);
    await expect(page).toHaveScreenshot('catalogue.png', { maxDiffPixels: 100 });
  });
});
