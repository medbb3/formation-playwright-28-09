# Exercice M9.1 — Le pipeline de PR du projet SauceDemo

**Difficulté** : moyenne
**Durée** : 25 minutes
**Dépôt** : `saucedemo-tests` (M8.1, M8.2)

## Énoncé

1. Ajoutez le reporter `junit` à `playwright.config.ts` (fichier `test-results/junit.xml`).
2. Écrivez `azure-pipelines.yml` : déclencheurs `main` et PR ; un job `Tests` exécuté dans le conteneur `mcr.microsoft.com/playwright:v<version>-noble` (version = celle de votre `package.json`) ; cache npm ; `npm ci` ; `npx playwright test --project=standard` (le site est public, pas de service à démarrer) ; publication JUnit et de `playwright-report` (toujours), de `test-results` (sur échec).
3. Créez le pipeline dans Azure Pipelines, exécutez-le. Si le parallélisme hébergé manque, installez l'agent Docker (`demo/agent-docker.md`) et utilisez `pool: { name: docker-local }`.
4. Ouvrez l'onglet Tests du run : combien de tests, lesquels ? Téléchargez le rapport HTML et ouvrez-le.
5. Attachez le pipeline en Build validation (Required) sur `main`. Ouvrez une PR qui casse un test (`toHaveText('$0.00')`), constatez le blocage, réparez, complétez.
6. Bonus : ajoutez une variable `TESTS_GREP` valant `@smoke` en PR et vide sinon (expression `${{ if }}`), et taguez deux tests `@smoke`.

## Résultat attendu

- Pipeline vert en moins de 5 minutes.
- Onglet Tests peuplé.
- PR bloquée puis débloquée par le build.
- Artefacts présents.

Question : pourquoi publier les résultats JUnit alors que le rapport HTML contient déjà tout ?
