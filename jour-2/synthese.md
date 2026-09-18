# Jour 2 — Synthèse

## Ce que l'on retient

1. **POM** : une classe par page ou composant, locators publics `readonly` dans le constructeur, actions en verbes, pas de données ni d'assertions cachées. Locators paramétrés pour les listes.
2. **Actions métier et manager** : les flows traversent plusieurs pages ; le `PageObjectManager` construit à la demande.
3. **Helpers explicites** : pas de fixtures personnalisées (`test.extend`) dans ce parcours. Connexion et contexte API via des fonctions explicites (`support/connexion.ts`), appelées par chaque test ; mémorisation par worker avec une `Map` indexée par `testInfo.parallelIndex` quand un coût mérite d'être partagé (perf). Setup court : `test.beforeEach` local au fichier.
4. **API** : `request`, `page.request`, `newContext()`. Statut et corps, `toMatchObject`, réponses typées, CRUD en `test.step`, token mémorisé par worker (helper explicite), projet `api` sans navigateur.
5. **Réseau** : `fulfill` pour contrôler, `fetch` + `fulfill` pour modifier, `abort` pour bloquer, `on` / `waitForRequest` / `waitForResponse` pour observer. Mocker les tiers et les erreurs, jamais ce que l'on teste.

## Fil rouge

- La mini-banque a une page Bénéficiaires (CRUD API), des cours de change et une télémétrie.
- Suite de tests structurée : pages, flows, helpers de connexion (`support/connexion.ts`), mocks.
- Trois projets : `api`, `chromium` (réel) et `mocked` (front seul, faux backend en mémoire, sans Docker).

## Questions flash

1. Où vont les assertions : dans le Page Object ou dans le test ?
2. Comment mémoriser un contexte API coûteux à créer une seule fois par worker, sans fixture ?
3. Pourquoi un helper comme `commeRole` ferme-t-il son contexte dans un `finally` ?
4. Comment lancer les tests API sans ouvrir de navigateur ?
5. `route.fetch()` sert à quoi ?
6. Pourquoi ne pas mocker `/api/transfers` dans le test de virement ?

Réponses :

1. Dans le test (ou méthode `expectXxx` explicite).
2. Une `Map` au niveau du module, indexée par `testInfo.parallelIndex` : chaque worker Playwright est un process Node distinct, la `Map` se comporte déjà comme un scope « worker ».
3. Pour garantir la fermeture même si le test échoue à l'intérieur du callback `run` passé au helper.
4. Un projet avec `testMatch` sur `*.api.spec.ts` et des tests qui ne demandent pas `page`.
5. Exécuter la vraie requête pour modifier sa réponse avant `fulfill`.
6. C'est la fonctionnalité testée : mockée, le test ne prouve plus rien sur le virement.

## Préparer le Jour 3

- Lire https://playwright.dev/docs/test-parameterize et https://playwright.dev/docs/auth (15 min).
- `npm i -D @faker-js/faker` dans `fil-rouge/frontend` (utilisé dès M5.2).
- Vérifier que `npm run test:mock` passe sur votre poste sans Docker.

## Ressources du jour

- https://playwright.dev/docs/pom
- https://playwright.dev/docs/test-fixtures
- https://playwright.dev/docs/api-testing
- https://playwright.dev/docs/mock
- https://playwright.dev/docs/network
