import { test, expect } from '@playwright/test';
import path from 'node:path';

test.describe('Upload de fichiers', () => {
  test('déposer un fichier du disque dans un input file', async ({ page }) => {
    await page.goto('/upload');

    // L'input de cette page n'a ni label ni rôle exploitable : CSS justifié (niveau 6, M1.2).
    // Dans une application maîtrisée, on exige un <label for> et on écrit getByLabel.
    const fichier = path.join('fixtures', 'beneficiaires.csv');
    await page.locator('#file-upload').setInputFiles(fichier);
    await page.getByRole('button', { name: 'Upload' }).click();

    await expect(page.getByRole('heading', { name: 'File Uploaded!' })).toBeVisible();
    await expect(page.getByText('beneficiaires.csv')).toBeVisible();
  });

  test('fabriquer le fichier en mémoire, sans fixture sur le disque', async ({ page }) => {
    await page.goto('/upload');

    // Aucun fichier à versionner : le test décrit sa donnée, comme une fabrique Faker (M5.2).
    await page.locator('#file-upload').setInputFiles({
      name: 'virements.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('iban;montant\nFR7630006000011234567890189;150,00\n', 'utf-8'),
    });
    await page.getByRole('button', { name: 'Upload' }).click();

    await expect(page.getByRole('heading', { name: 'File Uploaded!' })).toBeVisible();
    await expect(page.getByText('virements.csv')).toBeVisible();
  });

  test('bouton personnalisé : intercepter le sélecteur de fichiers', async ({ page }) => {
    // Beaucoup d'applications cachent l'input et affichent un bouton stylé : il n'y a rien
    // sur quoi appeler setInputFiles. On intercepte alors l'ouverture du sélecteur.
    await page.setContent(`
      <input id="reel" type="file" style="display:none">
      <button onclick="document.getElementById('reel').click()">Joindre un justificatif</button>
      <p id="resultat"></p>
      <script>
        document.getElementById('reel').addEventListener('change', (e) => {
          document.getElementById('resultat').textContent = 'Reçu : ' + e.target.files[0].name;
        });
      </script>
    `);

    const selecteurPromis = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Joindre un justificatif' }).click();
    const selecteur = await selecteurPromis;

    expect(selecteur.isMultiple()).toBe(false);
    await selecteur.setFiles({ name: 'justificatif.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') });

    await expect(page.locator('#resultat')).toHaveText('Reçu : justificatif.pdf');
  });

  test('plusieurs fichiers, puis vider la sélection', async ({ page }) => {
    await page.setContent(`
      <input id="pieces" type="file" multiple aria-label="Pièces jointes">
      <p id="compte"></p>
      <script>
        document.getElementById('pieces').addEventListener('change', (e) => {
          document.getElementById('compte').textContent = e.target.files.length + ' fichier(s)';
        });
      </script>
    `);

    const champ = page.getByLabel('Pièces jointes');
    await champ.setInputFiles([
      { name: 'rib.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') },
      { name: 'contrat.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') },
    ]);
    await expect(page.locator('#compte')).toHaveText('2 fichier(s)');

    // Un tableau vide vide la sélection (utile pour tester le message « aucun fichier »).
    await champ.setInputFiles([]);
    await expect(page.locator('#compte')).toHaveText('0 fichier(s)');
  });
});
