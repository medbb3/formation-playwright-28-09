import { test, expect } from '@playwright/test';

// Page de test minimale : une session bancaire qui expire au bout de 5 minutes,
// avec un compte à rebours et l'affichage de la date du jour.
const PAGE_SESSION = `
  <h1>Espace client</h1>
  <p>Nous sommes le <span id="date"></span></p>
  <p>Session expirée dans <span id="restant"></span> s</p>
  <p id="message"></p>
  <script>
    document.getElementById('date').textContent = new Date().toLocaleDateString('fr-FR');
    let restant = 300;
    document.getElementById('restant').textContent = restant;
    setInterval(() => {
      restant -= 1;
      document.getElementById('restant').textContent = Math.max(restant, 0);
      if (restant <= 0) document.getElementById('message').textContent = 'Votre session a expiré';
    }, 1000);
  </script>
`;

test.describe('Horloge du navigateur', () => {
  test('setFixedTime : figer la date affichée', async ({ page }) => {
    // À installer AVANT le chargement de la page : le script lit l'heure au démarrage.
    await page.clock.setFixedTime(new Date('2026-01-15T10:00:00'));
    await page.setContent(PAGE_SESSION);

    await expect(page.locator('#date')).toHaveText('15/01/2026');
    // setFixedTime fige : Date.now() ne bouge plus, mais les timers continuent de tourner.
  });

  test('install + fastForward : atteindre l\'expiration sans attendre 5 minutes', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-01-15T10:00:00') });
    await page.setContent(PAGE_SESSION);

    // Après install, l'horloge avance encore au rythme réel : on l'arrête pour rendre
    // le test déterministe. pauseAt saute à l'instant donné PUIS arrête l'horloge. Un timer répétitif n'est
    // déclenché qu'une fois par saut : 5 secondes sautées ne retirent qu'une seconde.
    await page.clock.pauseAt(new Date('2026-01-15T10:00:05'));
    await expect(page.locator('#restant')).toHaveText('299');

    // runFor déroule le temps : TOUS les déclenchements de l'intervalle ont lieu.
    await page.clock.runFor(3000);
    await expect(page.locator('#restant')).toHaveText('296');

    // fastForward SAUTE le temps : la date avance de 5 minutes, mais un timer répétitif
    // n'est déclenché qu'UNE fois. Le compteur ne perd donc qu'une seconde.
    await page.clock.fastForward('05:00');
    await expect(page.locator('#restant')).toHaveText('295');

    // Pour atteindre réellement l'expiration, c'est runFor qu'il faut.
    await page.clock.runFor('05:00');
    await expect(page.locator('#restant')).toHaveText('0');
    await expect(page.locator('#message')).toHaveText('Votre session a expiré');
  });

  test('pauseAt : arrêter le temps à un instant précis puis reprendre', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-01-15T09:59:00') });
    await page.setContent(PAGE_SESSION);

    // Le temps avance jusqu'à 10:00 puis s'arrête : l'interface est figée,
    // on peut inspecter, capturer (M6.1), sans course.
    await page.clock.pauseAt(new Date('2026-01-15T10:00:00'));
    const fige = await page.locator('#restant').textContent();
    await expect(page.locator('#restant')).toHaveText(fige!);

    await page.clock.resume();
    await expect(page.locator('#restant')).not.toHaveText(fige!, { timeout: 5000 });
  });
});
