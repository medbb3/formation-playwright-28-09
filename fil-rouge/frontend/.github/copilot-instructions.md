# Instructions Copilot — mini-banque (tests Playwright)

Projet de tests end-to-end en TypeScript pour la mini-banque (React + FastAPI). Respecte ces règles dans tout ce que tu proposes.

## Architecture (ne pas contourner)
- `test` et `expect` s'importent depuis `@playwright/test`, jamais de fixture personnalisée.
- `tests/support/connexion.ts` : helpers explicites de connexion. `commeRole(browser, baseURL, testInfo, 'alice'|'bob'|'carol', run)` pour un rôle fixe (storageState), `commeUtilisateurWorker(browser, baseURL, testInfo, playwright, run)` pour un client jetable isolé par worker (solde 500 €) — `run` reçoit `{ page, pages, workerUser }` et fait le test. Tout test qui modifie des données utilise `commeUtilisateurWorker`. Aucun test ne se connecte par l'écran sauf ceux de `tests/ui/authentification.spec.ts`.
- Page Objects dans `tests/pages/` (`LoginPage`, `DashboardPage`, `TransferPage`, `BeneficiariesPage`, `HeaderComponent`) et flow `transferFlow` exposé par le `PageObjectManager`. Aucun `getBy` dans un fichier `.spec.ts` si la page a un Page Object ; si une méthode manque, la proposer dans le Page Object.
- Données : fabriques `tests/utils/factories.ts` (Faker), CSV dans `tests/data/`. Aucun mot de passe, jeton ou donnée réelle dans le code ou dans le chat : les secrets viennent de `secrets.env` (MCP) ou de `.auth/`.

## Locators et assertions
- `getByRole` avec `name`, `getByLabel`, `getByText`, `getByTestId` ; jamais de CSS structurel, jamais de XPath, jamais de `nth()` sans justification.
- Assertions web-first uniquement, au moins une assertion d'effet après chaque action significative.
- Interdits : `waitForTimeout`, `networkidle`, `force: true`, `page.pause()`, `test.only`.

## Génération de tests
- Exécute chaque étape dans le navigateur (snapshot) avant d'écrire ; n'invente aucun élément.
- Un test par critère d'acceptation, fichier `tests/ui/generes/<spec>-<critere>.spec.ts`, titre = identifiant + libellé, un commentaire par phrase Gherkin, en-tête `// spec: ...`.
- Si une fonctionnalité ou une étape n'existe pas dans l'application (ex. SPEC-MB-05), produire `test.fixme()` avec la raison, ne pas produire de test vert.

## Réparation de tests (healer)
- Ne jamais affaiblir une assertion ni supprimer une vérification pour faire passer un test.
- Ne jamais modifier une valeur attendue métier (montant, message) : signaler comme « changement de comportement à valider » avec `test.fixme()`.
- Modification minimale (un locator pour un locator), expliquée.

## Actions interdites à l'agent
- Modifier `playwright.config.ts`, `package.json`, la CI, les fichiers de `src/` (application) ; commandes git ; suppression de fichiers ou de données.
