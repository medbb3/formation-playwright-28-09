# Fil rouge J4 — Énoncé

**Difficulté** : difficile
**Durée** : 35 minutes
**Prérequis** : `docker compose up -d`, `secrets.env` créé depuis l'exemple, serveurs MCP démarrés, `npx playwright test --project=setup-real` exécuté une fois (fichiers `.auth/`).

## Fourni

Tout le dossier `fil-rouge/frontend` à l'état J4, **sans** le contenu de `tests/ui/generes/`.

## À faire

1. **Générer** avec `/generer-ca` (agent `playwright-test-generator`, une nouvelle session par critère) :
   - SPEC-MB-03 : CA-1, CA-2, CA-3, CA-5 ;
   - SPEC-MB-04 : CA-3.
2. **Relire** chaque test avec `GRILLE-QUALITE.md` (grille copiée dans `revues/<critere>.md` ou en commentaire dans le journal). Corriger **dans le sens du projet** (import, flow, fixture) ; régénérer plutôt que patcher si le résultat est loin.
3. **Journaliser** dans `JOURNAL-GENERATION.md` : une ligne par génération (prompt, modèle, durée, écarts, décision).
4. **Fonctionnalité absente** : générer SPEC-MB-05 CA-1. Attendu : un `test.fixme()` avec le constat. Si l'agent produit un test vert : le noter dans le journal (hallucination), regarder ce qu'il a testé, régénérer en rappelant la règle.
5. **Vérifier** : `npm run test:real` puis `npm run test:mock`. Tout doit être vert (les `fixme` comptent comme sautés).
6. **Bonus** : convertir SPEC-MB-06 CA-1 et CA-3 (critères de la correction M7.3) avec `/gherkin-vers-test` sur un seed utilisant `commeRole(..., 'carol', ...)` (créer `tests/seed-carol.spec.ts`).

## Consignes

- Le mot de passe n'apparaît jamais dans le chat : le seed démarre connecté.
- Aucun `getBy` dans les tests générés quand un Page Object existe ; si l'agent en produit, corriger ou régénérer, et le noter.
- CA-3 (SPEC-MB-03) contient une phrase non vérifiable à l'écran (« aucune opération créée ») : décidez comment la vérifier (API) et notez-le.
- Un test généré n'est committé qu'après la grille ; le commit est à votre nom.

## Résultat attendu

| Commande | Résultat |
|---|---|
| `npm run test:real` | 47 verts, 2 sautés (MB-05, MB-06 CA-4) |
| `npm run test:mock` | 35 verts, 2 sautés |

- Journal : 6 lignes minimum (5 générations + MB-05).
- Grille remplie pour chaque test.

## Questions de réflexion

1. Quel écart la grille a-t-elle trouvé le plus souvent ? Comment l'éviter à la source (instructions, seed, prompt) ?
2. Que serait-il arrivé si le seed avait utilisé `commeRole(..., 'alice', ...)` au lieu de `commeUtilisateurWorker` pour CA-2 et CA-3 ?
3. Dans quelle case de la policy (A à E) rangez-vous chacun des garde-fous que vous avez utilisés aujourd'hui ?
