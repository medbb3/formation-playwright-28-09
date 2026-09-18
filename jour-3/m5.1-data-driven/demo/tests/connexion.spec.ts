import { test, expect } from '@playwright/test';
import cas from '../data/connexions.json';

for (const c of cas) {
  test(`connexion de "${c.user || '(vide)'}" : ${c.attendu}`, async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Username').fill(c.user);
    await page.getByPlaceholder('Password').fill(c.password);
    await page.getByRole('button', { name: 'Login' }).click();

    if (c.attendu === 'catalogue') {
      await expect(page).toHaveURL(/inventory/);
    } else {
      await expect(page.getByTestId('error')).toContainText(c.attendu);
    }
  });
}
