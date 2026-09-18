import { test, expect } from '@playwright/test';

// Ce fichier teste l'écran de login : il doit démarrer NON connecté
test.use({ storageState: { cookies: [], origins: [] } });

test('un mauvais mot de passe est refusé', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('mauvais');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByTestId('error')).toContainText('do not match');
  await expect(page).toHaveURL('/');
});
