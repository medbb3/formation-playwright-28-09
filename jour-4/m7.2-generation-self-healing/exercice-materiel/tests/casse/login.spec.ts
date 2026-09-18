// Écrit sur une ancienne version du site. Référence fonctionnelle : specs/SPEC-TI-02-authentification.md
import { test, expect } from '@playwright/test';

test('connexion réussie', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill('tomsmith');
  await page.getByLabel('Password').fill('SuperSecretPassword!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Secure Zone' })).toBeVisible();
});

test('mot de passe invalide', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill('tomsmith');
  await page.getByLabel('Password').fill('faux');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('#message')).toContainText('Your password is invalid!');
});

test('message de succès', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill('tomsmith');
  await page.getByLabel('Password').fill('SuperSecretPassword!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('#message')).toContainText('You logged in successfully!');
});
