import { test, expect } from '@playwright/test';
import { scanA11y, bloquantes } from '../utils/a11y';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 4 }).first()).toBeVisible();   // catalogue rendu
});

test('inventaire : home, sans assertion bloquante', async ({ page }, testInfo) => {
  const r = await scanA11y(page, testInfo, { nom: 'home' });
  console.log(r.resume);
  expect(r.violations.length).toBeGreaterThanOrEqual(0);   // inventaire : on documente, on ne bloque pas
});

test('modale de connexion : scan ciblé après ouverture', async ({ page }, testInfo) => {
  await page.getByRole('link', { name: 'Log in' }).click();
  await expect(page.locator('#logInModal')).toBeVisible();

  const r = await scanA11y(page, testInfo, { include: '#logInModal', nom: 'login-modal' });
  // Constat : les champs de la modale n'ont pas de label associé (règle "label"),
  // ce qui explique l'échec de getByLabel en M5.2. Accessibilité et testabilité vont ensemble.
  const regles = r.violations.map((v) => v.id);
  expect(regles).toContain('label');
});

test('exclure une zone et désactiver une règle, avec justification', async ({ page }, testInfo) => {
  const complet = await scanA11y(page, testInfo, { nom: 'complet' });
  const reduit = await scanA11y(page, testInfo, {
    nom: 'reduit',
    exclude: ['#tbodyid'],                 // catalogue dynamique : couvert par un autre test
    disableRules: ['color-contrast'],      // ticket DEM-12 : charte graphique en cours de refonte
  });
  expect(reduit.violations.length).toBeLessThanOrEqual(complet.violations.length);
});

test('filet : aucune violation critical ou serious', async ({ page }, testInfo) => {
  test.fail(true, 'Demoblaze a des violations serious/critical connues ; sur la mini-banque ce test est bloquant');
  const r = await scanA11y(page, testInfo, { nom: 'filet' });
  expect(bloquantes(r.violations), r.resume).toEqual([]);
});

test('clavier : ordre de tabulation de la modale de connexion', async ({ page }) => {
  await page.getByRole('link', { name: 'Log in' }).click();
  const modale = page.locator('#logInModal');
  const username = modale.locator('#loginusername');
  const password = modale.locator('#loginpassword');

  await username.click();   // clic (et non focus()) : la modale Bootstrap termine son animation avant
  await page.keyboard.press('Tab');
  await expect(password).toBeFocused();
  await page.keyboard.press('Tab');
  // Deux boutons « Close » (croix et pied de modale) : on précise le conteneur
  await expect(modale.locator('.modal-footer').getByRole('button', { name: 'Close' })).toBeFocused();
});
