import { test, expect } from '@playwright/test';
import { PageObjectManager } from '../pages';
import { OrderFlow } from '../flows/OrderFlow';
import { connecterCatalogue, utilisateurDuProjet } from '../fixtures/support';

const CLIENT = { firstName: 'Alice', lastName: 'Martin', postalCode: '75001' };

let pages: PageObjectManager;

test.beforeEach(async ({ page }, testInfo) => {
  pages = new PageObjectManager(page);
  await connecterCatalogue(pages, utilisateurDuProjet(testInfo));
});

test('une commande complète affiche la confirmation', async () => {
  const order = new OrderFlow(pages);
  await order.placeOrder('Sauce Labs Backpack', CLIENT);

  await expect(pages.confirmation.heading).toBeVisible();
  await expect(pages.confirmation.backHomeButton).toBeVisible();
});

test('le récapitulatif affiche le sous-total du produit', async () => {
  await pages.inventory.addToCart('Sauce Labs Bike Light');
  await pages.inventory.header.openCart();
  await pages.cart.checkout();
  await pages.checkoutInfo.fillAndContinue(CLIENT);

  await expect(pages.overview.subtotal).toHaveText('Item total: $9.99');
});

test('le formulaire de livraison refuse un prénom vide', async () => {
  await pages.inventory.addToCart('Sauce Labs Bike Light');
  await pages.inventory.header.openCart();
  await pages.cart.checkout();
  await pages.checkoutInfo.fillAndContinue({ firstName: '', lastName: 'Martin', postalCode: '75001' });

  await expect(pages.checkoutInfo.errorMessage).toContainText('First Name is required');
});
