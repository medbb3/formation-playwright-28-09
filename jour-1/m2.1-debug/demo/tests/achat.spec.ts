import { test, expect } from '@playwright/test';

const PRODUIT = 'Samsung galaxy s6';
const CLIENT = { nom: 'Alice Martin', carte: '4111111111111111' };

test('un visiteur peut acheter un produit et voir la confirmation', async ({ page }) => {
  await test.step('Ouvrir la fiche produit', async () => {
    await page.goto('/');
    await page.getByRole('link', { name: PRODUIT }).click();
    await expect(page.getByRole('heading', { name: PRODUIT })).toBeVisible();
  });

  await test.step('Ajouter au panier (le site confirme par une alerte)', async () => {
    // On accepte l'alerte ET on vérifie son message : c'est une assertion, pas un contournement
    const alerte = page.waitForEvent('dialog');
    await page.getByRole('link', { name: 'Add to cart' }).click();
    const dialog = await alerte;
    expect(dialog.message()).toContain('Product added');
    await dialog.accept();
  });

  await test.step('Vérifier le panier', async () => {
    await page.getByRole('link', { name: 'Cart', exact: true }).click();
    const ligne = page.getByRole('row').filter({ hasText: PRODUIT });
    await expect(ligne).toBeVisible();
    // Le montant est un titre <h3> séparé du libellé « Total » : on cible le montant lui-même
    await expect(page.getByRole('heading', { name: '360' })).toBeVisible();
  });

  await test.step('Passer la commande', async () => {
    await page.getByRole('button', { name: 'Place Order' }).click();
    await page.getByRole('textbox', { name: 'Name:' }).fill(CLIENT.nom);
    await page.getByRole('textbox', { name: 'Credit card:' }).fill(CLIENT.carte);
    await page.getByRole('button', { name: 'Purchase' }).click();
  });

  await test.step('Lire la confirmation', async () => {
    const confirmation = page.getByText('Thank you for your purchase!');
    await expect(confirmation).toBeVisible();
    await expect(page.getByText(`Name: ${CLIENT.nom}`)).toBeVisible();
    await page.getByRole('button', { name: 'OK' }).click();
    await expect(confirmation).toBeHidden();
  });
});
