import { test, expect } from '@playwright/test';

test.describe('SauceDemo - connexion', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('la page de login affiche le formulaire', async ({ page }) => {
    await expect(page).toHaveTitle('Swag Labs');
    await expect(page.getByPlaceholder('Username')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('un utilisateur standard peut se connecter', async ({ page }) => {
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.getByText('Products')).toBeVisible();
  });

  test("un utilisateur bloqué voit un message d'erreur", async ({ page }) => {
    await page.getByPlaceholder('Username').fill('locked_out_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('heading', { name: /locked out/i })).toBeVisible();
    await expect(page).toHaveURL('/');
  });
});
