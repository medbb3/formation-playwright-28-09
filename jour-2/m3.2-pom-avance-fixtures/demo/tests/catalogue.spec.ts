import { test, expect } from '@playwright/test';
import { PageObjectManager } from '../pages';

test.describe('catalogue, connecté en standard_user', () => {
  let pages: PageObjectManager;

  test.beforeEach(async ({ page }) => {
    pages = new PageObjectManager(page);
    await pages.login.goto();
    await pages.login.login('standard_user', 'secret_sauce');
  });

  test('le tri par prix croissant place le moins cher en premier', async () => {
    await pages.inventory.sortBy('lohi');
    await expect(pages.inventory.prices.first()).toHaveText('$7.99');
  });

  test('le badge du panier reflète le nombre d\'articles ajoutés', async () => {
    await pages.inventory.addToCart('Sauce Labs Backpack');
    await expect(pages.inventory.header.cartBadge).toHaveText('1');
  });
});

test('avec problem_user, le tri par prix reste cassé (bug volontaire du site)', async ({ page }) => {
  // Connexion explicite, hors du beforeEach partagé : ce test change volontairement d'utilisateur.
  const pages = new PageObjectManager(page);
  await pages.login.goto();
  await pages.login.login('problem_user', 'secret_sauce');

  await pages.inventory.sortBy('lohi');
  await expect(pages.inventory.prices.first()).not.toHaveText('$7.99');
});
