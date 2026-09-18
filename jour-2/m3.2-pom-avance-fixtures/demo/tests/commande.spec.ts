import { test, expect } from '@playwright/test';
import { PageObjectManager } from '../pages';
import { OrderFlow } from '../flows/OrderFlow';

const CLIENT = { firstName: 'Alice', lastName: 'Martin', postalCode: '75001' };

test('une commande complète affiche la confirmation', async ({ page }) => {
  const pages = new PageObjectManager(page);
  await pages.login.goto();
  await pages.login.login('standard_user', 'secret_sauce');

  const order = new OrderFlow(pages);
  await order.placeOrder('Sauce Labs Backpack', CLIENT);

  await expect(pages.confirmation.heading).toBeVisible();
  await expect(pages.confirmation.backHomeButton).toBeVisible();
});

test('le récapitulatif affiche le sous-total du produit', async ({ page }) => {
  const pages = new PageObjectManager(page);
  await pages.login.goto();
  await pages.login.login('standard_user', 'secret_sauce');

  // Cas de détail, pas répété tel quel ailleurs : page par page, sans flow.
  await pages.inventory.addToCart('Sauce Labs Bike Light');
  await pages.inventory.header.openCart();
  await pages.cart.checkout();
  await pages.checkoutInfo.fillAndContinue(CLIENT);

  await expect(pages.overview.subtotal).toHaveText('Item total: $9.99');
});

test('le formulaire de livraison refuse un prénom vide', async ({ page }) => {
  const pages = new PageObjectManager(page);
  await pages.login.goto();
  await pages.login.login('standard_user', 'secret_sauce');

  await pages.inventory.addToCart('Sauce Labs Bike Light');
  await pages.inventory.header.openCart();
  await pages.cart.checkout();
  await pages.checkoutInfo.fillAndContinue({ firstName: '', lastName: 'Martin', postalCode: '75001' });

  await expect(pages.checkoutInfo.errorMessage).toContainText('First Name is required');
});
