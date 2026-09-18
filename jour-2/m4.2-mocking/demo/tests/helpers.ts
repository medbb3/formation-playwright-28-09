import { type Page, expect } from '@playwright/test';

export const API_URL = process.env.API_URL ?? 'http://localhost:8000';

/** Comptes de test de la mini-banque (voir README). */
export const USERS = {
  alice: { email: 'alice@bank.test', password: 'Alice123!', name: 'Alice Martin' },
  bob: { email: 'bob@bank.test', password: 'Bob123!', name: 'Bob Durand' },
};
export const MFA_CODE = '123456';

/**
 * Jour 1 : fonction utilitaire simple. Au Jour 2 elle deviendra un Page Object,
 * au Jour 3 une fixture avec storageState.
 */
export async function login(page: Page, user = USERS.alice) {
  await page.goto('/login');
  await page.getByLabel('Adresse e-mail').fill(user.email);
  await page.getByLabel('Mot de passe').fill(user.password);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.getByLabel('Code de vérification').fill(MFA_CODE);
  await page.getByRole('button', { name: 'Valider le code' }).click();
  await expect(page.getByRole('heading', { name: `Bonjour ${user.name}` })).toBeVisible();
}
