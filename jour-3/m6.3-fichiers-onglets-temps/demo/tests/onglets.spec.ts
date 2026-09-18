import { test, expect } from '@playwright/test';

test.describe('Nouveaux onglets et fenêtres', () => {
  test('un lien target="_blank" ouvre un onglet que l\'on récupère', async ({ page }) => {
    await page.goto('/windows');

    // page.waitForEvent('popup') : l'onglet est ouvert PAR cette page.
    const ongletPromis = page.waitForEvent('popup');
    await page.getByRole('link', { name: 'Click Here' }).click();
    const onglet = await ongletPromis;

    // Le nouvel onglet est une Page comme une autre : mêmes locators, mêmes assertions.
    await onglet.waitForLoadState();
    await expect(onglet.getByRole('heading', { name: 'New Window' })).toBeVisible();
    expect(onglet.url()).toContain('/windows/new');

    // L'onglet d'origine n'a pas bougé : les deux Page coexistent.
    await expect(page.getByRole('heading', { name: 'Opening a new window' })).toBeVisible();

    await onglet.close();
    // Après fermeture, on retravaille sur `page` sans rien « réactiver » :
    // il n'y a pas de switchTo() en Playwright.
    await expect(page.getByRole('link', { name: 'Click Here' })).toBeVisible();
  });

  test('context.waitForEvent quand on ne sait pas qui ouvre l\'onglet', async ({ page, context }) => {
    await page.goto('/windows');

    // Variante : on écoute le CONTEXTE. Utile si l'onglet est ouvert par un iframe,
    // un worker, ou une page qu'on ne connaît pas.
    const ongletPromis = context.waitForEvent('page');
    await page.getByRole('link', { name: 'Click Here' }).click();
    const onglet = await ongletPromis;

    await onglet.waitForLoadState();
    expect(context.pages()).toHaveLength(2);
    await expect(onglet.getByRole('heading')).toHaveText('New Window');
  });

  test('window.open vers un site tiers : vérifier l\'URL demandée sans attendre son chargement', async ({ page }) => {
    // Site tiers non maîtrisé (CGU hébergées ailleurs, page 3-D Secure d'un partenaire) :
    // on récupère quand même le popup avec l'idiome natif, mais on n'attend pas son
    // chargement et on le referme aussitôt. On teste que NOTRE page appelle bien le tiers,
    // pas que le tiers répond.
    await page.setContent(`
      <button onclick="window.open('https://exemple.invalid/cgu', '_blank')">Conditions générales</button>
    `);

    const ongletPromis = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Conditions générales' }).click();
    const onglet = await ongletPromis;

    expect(onglet.url()).toContain('exemple.invalid/cgu');
    await onglet.close();
    expect(page.context().pages()).toHaveLength(1);   // l'onglet tiers a été refermé aussitôt
  });
});
