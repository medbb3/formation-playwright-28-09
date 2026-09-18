// Brouillon enregistré avec Codegen par un collègue, puis "légèrement adapté".
// Il échoue. À vous de trouver pourquoi avec la trace et l'Inspector, puis de le refactorer.
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await page.getByTestId('shopping-cart-link').click();
  await page.getByRole('button', { name: 'Checkout' }).click();
  await page.getByPlaceholder('First Name').fill('Alice');
  await page.getByPlaceholder('Last Name').fill('Martin');
  await page.getByPlaceholder('Zip/Postal Code').fill('75001');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Finish' }).click();
  expect(page.getByText('Thank you for your order')).toBeVisible();
  await page.getByRole('button', { name: 'Back to Products' }).click();
  await expect(page.getByText('Products')).toBeVisible();
});
