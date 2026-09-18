import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test.describe('Téléchargements', () => {
  test('récupérer un fichier et vérifier son contenu', async ({ page }, testInfo) => {
    await page.goto('/download');

    const lien = page.locator('#content a').first();
    const nomAffiche = (await lien.textContent())!.trim();

    // 1. On s'abonne AVANT le clic : sinon l'événement est déjà passé (même règle que dialog, M2.1).
    const telechargementPromis = page.waitForEvent('download');
    await lien.click();
    const telechargement = await telechargementPromis;

    // 2. Métadonnées disponibles sans attendre la fin du transfert.
    expect(telechargement.suggestedFilename()).toBe(nomAffiche);
    expect(telechargement.url()).toContain('/download/');

    // 3. path() attend la fin du transfert et rend le fichier temporaire.
    const chemin = await telechargement.path();
    expect(fs.statSync(chemin).size).toBeGreaterThan(0);

    // 4. On garde une preuve dans le rapport plutôt qu'un fichier perdu sur le disque.
    await testInfo.attach(nomAffiche, { path: chemin });
  });

  test('enregistrer sous un nom maîtrisé et lire le contenu', async ({ page }) => {
    await page.goto('/download');

    const telechargementPromis = page.waitForEvent('download');
    await page.locator('#content a', { hasText: /\.txt$/ }).first().click();
    const telechargement = await telechargementPromis;

    // saveAs déplace le fichier où l'on veut ; le dossier est créé si besoin.
    const destination = path.join('.telechargements', 'releve.txt');
    await telechargement.saveAs(destination);

    expect(fs.existsSync(destination)).toBe(true);
    const contenu = fs.readFileSync(destination, 'utf-8');
    expect(contenu.length).toBeGreaterThan(0);

    // Nettoyage : le fichier temporaire de Playwright est supprimé à la fermeture du contexte,
    // pas celui-ci.
    fs.rmSync('.telechargements', { recursive: true, force: true });
  });

  test('le contenu peut être lu en flux, sans passer par le disque', async ({ page }) => {
    await page.goto('/download');

    const telechargementPromis = page.waitForEvent('download');
    await page.locator('#content a', { hasText: /\.txt$/ }).first().click();
    const telechargement = await telechargementPromis;

    const flux = await telechargement.createReadStream();
    const morceaux: Buffer[] = [];
    for await (const morceau of flux) morceaux.push(morceau as Buffer);
    const texte = Buffer.concat(morceaux).toString('utf-8');

    expect(texte).not.toContain('<html');   // c'est bien un fichier, pas une page d'erreur
  });
});
