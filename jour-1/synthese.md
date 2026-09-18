# Jour 1 — Synthèse (fin de journée)

## Ce que l'on retient

1. **Installation** : `npm init playwright@latest`, un `playwright.config.ts` qui pilote tout (`baseURL`, projets, `trace`, `retries`), `npx playwright test` et `show-report`.
2. **Locators** : rôle, label/placeholder, texte, alt/title, test id, CSS. Un locator est une recette réévaluée à chaque usage, et stricte. `filter` et le chaînage avant `nth`.
3. **Actions et assertions** : les actions attendent l'actionnabilité ; `await expect(locator).toXxx()` réessaie, `expect(valeur)` non.
4. **Debug** : lire l'erreur et le call log, UI Mode et Inspector en local, Trace Viewer pour la CI. Codegen est un brouillon à refactorer en 6 étapes, avec `test.step`.
5. **Iframes et shadow DOM** : `frameLocator` / `contentFrame()` chaînables ; le shadow DOM est transparent sauf XPath.
6. **Anti-flaky** : attendre un état, isoler chaque test, assertions web-first, locators stables, contrôler l'extérieur. `--repeat-each` pour vérifier.
7. **Tags** : `{ tag: '@smoke' }` et `--grep`.

## Fil rouge

- La mini-banque tourne en Docker.
- 6 tests verts couvrent login MFA, erreurs, shadow DOM, iframe et déconnexion.
- Demain : restructuration en Page Objects et fixtures, ajout de tests API et d'un test avec mock.

## Questions flash

1. Quelle différence entre `getByText('Login')` et `getByRole('button', { name: 'Login' })` ?
2. Pourquoi `expect(await locator.isVisible()).toBe(true)` est-il déconseillé ?
3. Quelle option de config produit une trace uniquement pour les tests échoués ?
4. Un bouton « Bold » d'un éditeur riche est dans la page, la zone de texte dans une iframe : sur quel objet cherche-t-on chacun ?
5. Citez deux moyens d'empêcher qu'un test dépende d'un autre.
6. Comment lancer uniquement les tests tagués `@smoke` ?

Réponses attendues :

1. Le rôle filtre par type d'élément et valide l'accessibilité ; le texte peut matcher un titre.
2. Lecture unique sans retry, flaky.
3. `trace: 'retain-on-failure'`.
4. `page` pour Bold, `frameLocator`/`contentFrame()` pour la zone.
5. Données propres par test, reset via API, pas de variable partagée, `storageState` pour partager un état sans ordre.
6. `--grep @smoke`.

## Parking (questions reportées)

Questions notées pendant la journée et traitées ici.

## Préparer le Jour 2

- Laisser `fil-rouge/` cloné et fonctionnel (`docker compose up -d` doit marcher).
- Lire https://playwright.dev/docs/pom et https://playwright.dev/docs/test-fixtures (15 minutes).
- Compte ReqRes non nécessaire ; vérifier l'accès à https://reqres.in/api/users.

## Ressources du jour

- https://playwright.dev/docs/intro
- https://playwright.dev/docs/locators
- https://playwright.dev/docs/test-assertions
- https://playwright.dev/docs/debug
- https://playwright.dev/docs/trace-viewer
- https://playwright.dev/docs/frames
- https://playwright.dev/docs/best-practices
- https://playwright.dev/docs/test-annotations
