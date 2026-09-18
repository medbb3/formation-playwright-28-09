// AVANT : trois tests presque identiques
import { test, expect } from '@playwright/test';

test('standard_user accède au catalogue', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory/);
});

test('locked_out_user est bloqué', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill('locked_out_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByTestId('error')).toContainText('locked out');
});

test('un mauvais mot de passe est refusé', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('mauvais');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByTestId('error')).toContainText('do not match');
});
