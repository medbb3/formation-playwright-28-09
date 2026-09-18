# Jour 5 — Synthèse et clôture

## Ce que l'on retient

1. **Git**
   - Branches courtes, commits conventionnels, `pull --rebase`.
   - `force-with-lease` seulement sur sa branche.
   - `.gitignore` et `.gitattributes` dès le début ; scan de secrets en pre-commit.
2. **PR**
   - Petite, template rempli, work item lié.
   - Checklist QA : intention, preuve, robustesse, architecture, sécurité, CI, lisibilité.
   - Policies sur `main` : relecteur, commentaires, squash, build validation obligatoire, pas de bypass.
3. **Pipeline**
   - Stages, jobs, steps.
   - Docker avec version alignée ; même commande en local et en CI.
   - PR courte (lint, API, smoke), nuit complète.
   - JUnit et artefacts toujours publiés.
4. **Secrets et échelle**
   - Variable groups, `env:` explicite (Key Vault : mention, option de production).
   - Matrice pour les configurations ; shards + `merge-reports` pour la durée.
   - Planification `always: true` ; quatre gates versionnés.
5. **Pilotage**
   - Un seul jeu de reporters actif : `html`, `junit`, `json` ; pas de reporter tiers en plus.
   - Trois KPIs : réussite `main`, flakiness, durée PR.
   - Flakiness tracée et traitée.
   - Rapport hebdomadaire d'une page ; DoD avec volet test.

## Bilan de la semaine

| Jour | Acquis | État du fil rouge |
|---|---|---|
| 1 | Installation, locators, assertions, debug, iframes, shadow DOM, anti-flaky | Mini-banque en Docker, 6 tests |
| 2 | POM, fixtures, API, mocking | Pages, flows, fixtures, faux backend, 3 projets |
| 3 | Data-driven, Faker, isolation, storageState, visuel, accessibilité | Utilisateur par worker, CSV, baselines, audit axe, 6 projets |
| 4 | MCP, agents, génération, exploratoire, encadrement bancaire | Config MCP, agents, specs, 7 tests générés relus, journal, grille, policy |
| 5 | Git, PR, pipeline Docker, secrets, shards, gates, rapports, KPIs | Dépôt Azure Repos, pipeline, gates, rapports, DoD |

## Évaluation

- QCM : `qcm-evaluation/qcm.md` (30 questions, seuil 21 ; 35 et seuil 24 avec le module M6.3).
- Pratique : `qcm-evaluation/evaluation-pratique.md` (45 minutes, grille sur 20, seuil 12).

## Pour continuer après la formation

- Semaine 1 : appliquer la DoD sur une fonctionnalité réelle ; mettre en place le rapport hebdomadaire.
- Mois 1 : suite nocturne shardée, gates actifs, flakiness sous 2 %.
- Mois 3 : policy IA validée par le RSSI, agents en mode assistance, journal tenu ; revue trimestrielle.
- Veille : notes de version Playwright (mensuelles), `@playwright/mcp`, politiques Copilot de l'entreprise.

## Ressources de clôture

- https://playwright.dev/docs/release-notes
- https://learn.microsoft.com/azure/devops/pipelines
- https://playwright.dev/docs/best-practices
- https://github.com/microsoft/playwright/discussions (communauté), https://aka.ms/playwright/discord
