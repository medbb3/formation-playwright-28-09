// APRÈS : les tests décrivent le scénario, les Page Objects connaissent le HTML.
import { test, expect } from '@playwright/test';
import { LoginPage, InventoryPage, CartPage } from '../pages';

const USER = { name: 'standard_user', password: 'secret_sauce' };

test('ajouter un produit met à jour le badge du panier', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventory = new InventoryPage(page);

  await loginPage.goto();
  await loginPage.login(USER.name, USER.password);
  await inventory.addToCart('Sauce Labs Backpack');

  await expect(inventory.header.cartBadge).toHaveText('1');
  await expect(inventory.productCard('Sauce Labs Backpack').getByRole('button', { name: 'Remove' })).toBeVisible();
});

test('retirer un produit depuis le panier vide le badge', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventory = new InventoryPage(page);
  const cart = new CartPage(page);

  await loginPage.goto();
  await loginPage.login(USER.name, USER.password);
  await inventory.addToCart('Sauce Labs Bike Light');
  await inventory.header.openCart();

  await expect(cart.item('Sauce Labs Bike Light')).toBeVisible();
  await cart.remove('Sauce Labs Bike Light');

  await expect(cart.items).toHaveCount(0);
  await expect(cart.header.cartBadge).toBeHidden();
});

test('un utilisateur bloqué voit une erreur', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('locked_out_user', USER.password);
  await loginPage.expectError(/locked out/);
});
