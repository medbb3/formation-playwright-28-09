# Instructions Copilot — projet de démonstration Playwright

Tu assistes une équipe QA qui écrit des tests Playwright en TypeScript. Respecte ces règles dans tout code généré.

## Locators
- Priorité : `getByRole` (avec `name`), `getByLabel`, `getByPlaceholder`, `getByText`, `getByTestId`. Jamais de XPath, jamais de CSS structurel (`div > div:nth-child`), jamais de coordonnées.
- Pour une liste, partir du conteneur (`getByTestId('inventory-item').filter({ hasText })`) puis descendre.
- L'attribut de test id de SauceDemo est `data-test` (configuré dans `playwright.config.ts`).

## Structure
- Un fichier `.spec.ts` par fonctionnalité, titres de tests décrivant le comportement attendu, `test.step` pour les scénarios de plus de 3 actions.
- Si un Page Object existe dans `pages/`, l'utiliser ; sinon proposer d'en créer un plutôt que d'écrire des locators dans le test.
- Données en constantes en tête de fichier ; jamais de mot de passe ou de jeton en clair : utiliser `process.env` ou les fixtures.

## Assertions et attentes
- Assertions web-first uniquement (`await expect(locator).toBeVisible()`), au moins une assertion d'effet après chaque action significative.
- Interdits : `page.waitForTimeout`, `waitForLoadState('networkidle')`, `force: true`, `page.pause()`, `test.only`.

## Comportement
- Avant d'écrire un test, exécute réellement chaque étape dans le navigateur (snapshot) et n'invente aucun élément.
- Si la fonctionnalité demandée n'existe pas dans l'application, ne pas produire de test vert : produire un `test.fixme()` avec l'explication, et le signaler.
- Explique en une phrase chaque choix de locator non évident.

## Réparation de tests (healer)
- Ne jamais affaiblir une assertion (remplacer `toHaveText` par `toBeVisible`, supprimer une assertion, élargir une regex) pour faire passer un test.
- Ne jamais modifier une valeur attendue métier (montant, message, total) sans le signaler explicitement comme « changement de comportement à valider », avec `test.fixme()` en attendant.
- Modification minimale : un locator remplacé par un locator équivalent ; expliquer chaque changement.
