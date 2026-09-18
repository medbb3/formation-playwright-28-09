import { test, expect } from '@playwright/test';

test('le panier de standard_user n\'est pas visible par visual_user', async ({ page, browser }) => {
  // page = standard_user (storageState du projet)
  await page.goto('/inventory.html');
  await page.getByTestId('inventory-item').filter({ hasText: 'Sauce Labs Backpack' })
    .getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');

  // Second rôle dans le même test : un contexte à part, fermé à la fin
  const contexteVisual = await browser.newContext({ storageState: '.auth/visual.json' });
  const pageVisual = await contexteVisual.newPage();
  await pageVisual.goto('/inventory.html');
  await expect(pageVisual.getByTestId('title')).toHaveText('Products');
  await expect(pageVisual.getByTestId('shopping-cart-badge')).toBeHidden();
  await contexteVisual.close();
});
