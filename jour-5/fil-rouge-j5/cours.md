# Fil rouge J5 — Industrialisation : Git, PR, pipeline Docker, gates, rapports (répartie dans la journée)

- Pas de créneau fil rouge dédié le Jour 5 : la fin de journée est réservée au QCM et à l'évaluation.
- Chaque module applique directement sa contribution sur la mini-banque, qui atteint son **état final**.

## Livrable final du projet

| Élément | Fichier(s) | Module |
|---|---|---|
| Hygiène du dépôt | `.gitignore`, `.gitattributes`, `.editorconfig`, hooks `scripts/pre-commit.sh` et `commit-msg.sh` (`npm run hooks:install`), `eslint.config.js` (`eslint-plugin-playwright`) | M8.1 |
| Revue | `.azuredevops/pull_request_template.md`, `docs/CHECKLIST-REVUE-QA.md`, branch policies sur `main` | M8.2 |
| Exécution Docker | `frontend/Dockerfile.tests` (image officielle Playwright, version alignée), `docker-compose.tests.yml` (front, back, tests ; `npm run test:docker`), `vite.config.ts` avec `allowedHosts` | M9.1 |
| Pipeline | `azure-pipelines.yml` (stages Verification, TestsUI, Nuit, Hebdo), `templates/tests-playwright.yml`, reporters `junit` et `json` | M9.1, M9.2 |
| Secrets et gates | `.env.example`, `USERS` lus depuis l'environnement, `quality-gates.json`, `scripts/quality-gate.mjs`, `scripts/coverage-criteres.mjs`, projets `firefox` / `webkit` (smoke) | M9.2 |
| Rapports et pilotage | reporters `html` (natif) et résultats de tests Azure DevOps, `scripts/kpi-hebdo.mjs`, `docs/DEFINITION-OF-DONE.md` | M10.1 |

Commandes de l'état final (`frontend/`) :

```powershell
npm run lint            # gate 1
npm run test:mock       # sans Docker
npm run test:real       # Docker : front + back
npm run test:docker     # tout dans Docker, comme la CI
npm run gates           # gates 2, 3 (PR) et 4
npm run kpi             # rapport hebdomadaire depuis report.json
```

## Ce qui a été vérifié

- Lint : 0 erreur (3 avertissements « expect conditionnel » assumés et commentés).
- Couverture des critères : 9 critères validés (SPEC-MB-03, MB-04), 9 couverts ; SPEC-MB-05 exclue (non livrée).
- Exécution dans Docker : voir `correction.md` pour le résultat de `npm run test:docker`.

## Piège rencontré et documenté

- Pourquoi un nom de service et pas `localhost` ? Docker Compose crée un réseau privé pour les conteneurs d'un même projet et y ajoute un DNS interne : chaque conteneur est joignable par le nom de son service (`frontend`, `backend`) depuis les autres conteneurs de ce réseau. `localhost`, lui, désigne toujours le conteneur courant, jamais un autre conteneur : un test qui appelle `http://localhost:5173` depuis le conteneur `tests` cherche un serveur dans sa propre boîte, pas dans celle du `frontend`.
- Dans Docker, le navigateur des tests appelle le front par son nom de service (`http://frontend:5173`).
- Vite (depuis 5.4.12) refuse les hôtes inconnus : tous les tests UI échouaient en 30 secondes avec une page « Blocked request ».
- Correction : `server.allowedHosts: ['frontend', 'localhost']` dans `vite.config.ts`.
- Leçon : lire la première erreur d'un run rouge en Docker avant de suspecter les tests.

## Déroulé sur la journée

| Créneau | Contribution |
|---|---|
| M8.1 | Vous initialisez le dépôt, poussez dans votre organisation, installez les hooks |
| M8.2 | Policies sur `main`, template de PR ; PR de la branche du M8.1 relue par un binôme |
| M9.1 | `npm run test:docker` en local ; création du pipeline ; policy Build validation |
| M9.2 | Variable group, stage Nuit lancé manuellement (`FORCE_NUIT=true`), gates lus |
| M10.1 | Reporters, `npm run kpi`, lecture de la DoD |
| Fin de journée | QCM (45 min) puis évaluation pratique (45 min) sur ce dépôt |
