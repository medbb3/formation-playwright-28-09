# Exercice M2.2 — Iframe, contrôles dynamiques et chasse au flaky

**Difficulté** : moyenne à difficile
**Durée** : 25 minutes
**Site** : https://the-internet.herokuapp.com

## Objectif

Manipuler une iframe combinée à des contrôles de la page parente, écrire des attentes d'état sur des éléments dynamiques, et corriger un test flaky en appliquant les 5 règles.

## Énoncé

### Partie A — Frames de demoqa (`https://demoqa.com/frames` et `/nestedframes`)

Écrivez deux tests dans `tests/iframe-demoqa.spec.ts` :

1. Sur `/frames`, la page contient deux iframes (`#frame1`, `#frame2`) affichant chacune le titre `This is a sample page`. Vérifiez que ce titre n'est **pas** trouvable depuis la page parente, puis qu'il est visible dans chacune des deux iframes. Attachez au rapport une capture de la page où la grande iframe est masquée.
2. Sur `/nestedframes`, l'iframe `#frame1` contient le texte `Parent frame` et une iframe enfant contenant `Child Iframe`. Vérifiez les deux textes en chaînant les `frameLocator`, puis vérifiez que `Child Iframe` n'est trouvable ni depuis le parent ni depuis la page.

Taguez le premier test `@smoke`.

### Partie B — Contrôles dynamiques (`/dynamic_controls`)

Écrivez un test qui :

1. Clique sur **Remove**, vérifie que le message `It's gone!` apparaît et que la case à cocher a disparu.
2. Clique sur **Add**, vérifie que `It's back!` apparaît et que la case est de nouveau présente.
3. Clique sur **Enable**, vérifie que le champ de saisie devient activé et que `It's enabled!` apparaît.
4. Saisit `Playwright` dans le champ et vérifie sa valeur.
5. Clique sur **Disable**, vérifie que le champ est désactivé.

Chaque transition dure environ 1 à 2 secondes, avec un indicateur de chargement.

### Partie C — Corriger un test flaky

Le test suivant, écrit par un collègue, passe « souvent ». Copiez-le dans `tests/flaky.spec.ts`, identifiez **au moins 5 violations** des règles anti-flaky, et réécrivez-le proprement dans le même fichier.

```ts
import { test, expect } from '@playwright/test';

let compteur = 0;

test('ajout d\'éléments', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/add_remove_elements/');
  await page.locator('button').nth(0).click();
  compteur++;
  await page.waitForTimeout(500);
  expect(await page.locator('.added-manually').count()).toBe(compteur);
});

test('suppression', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/add_remove_elements/');
  await page.locator('.added-manually').first().click({ force: true });
  await page.waitForTimeout(500);
  expect(await page.locator('.added-manually').count()).toBe(compteur - 1);
});
```

Listez les violations en commentaire en tête du fichier, avec le numéro de la règle.

## Consignes

- Locators de niveau 1 à 3 en priorité. CSS autorisé uniquement pour désigner les iframes (`#frame1`) sans titre ni nom, avec un commentaire.
- Aucun `waitForTimeout`, aucun `force: true`, aucune variable partagée entre tests.
- Vérifiez avec `--grep @smoke` que seul le test de la partie A est sélectionné.
- Lancez la suite trois fois de suite pour vérifier la stabilité : `npx playwright test --repeat-each 3`.

## Résultat attendu

```
Running 15 tests using N workers   (5 tests x 3 répétitions)
  15 passed
```

Aucune trace dans `test-results/`. Le rapport montre la capture masquée dans les pièces jointes du premier test de la partie A.
