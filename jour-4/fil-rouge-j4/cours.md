# Fil rouge J4 — 5 tests générés via MCP, journal de génération, grille de qualité

## Objectif de la séance

Appliquer la chaîne complète du jour sur la mini-banque : configuration MCP sûre, agents Playwright, génération critère par critère depuis les specs fictives, relecture avec la grille, journal, et un cas de fonctionnalité absente. Résultat : une **suite enrichie de tests générés, tous relus et committés par un humain**.

Livrable :

- `tests/ui/generes/` : au moins 5 tests verts (SPEC-MB-03 CA-1, CA-2, CA-3, CA-5 ; SPEC-MB-04 CA-3) ;
- un `fixme` documenté pour SPEC-MB-05 ;
- les tests conseiller issus de M7.3 ;
- `JOURNAL-GENERATION.md` et `GRILLE-QUALITE.md` remplis ;
- `POLICY-IA.md` lue.

## Ce qui est ajouté au projet (fourni)

| Élément | Fichier | Module |
|---|---|---|
| Configuration MCP de référence : `@playwright/mcp@0.0.80`, `--isolated`, origines `localhost:5173;8000`, `--secrets secrets.env`, `--storage-state .auth/real/alice.json`, `--save-session`, `--image-responses omit` ; serveur `playwright-test` | `.vscode/mcp.json`, `secrets.env.example` | M7.1, M7.4 |
| Instructions de projet : architecture (fixtures, POM, flow), locators, interdits, règles de génération et de réparation, actions interdites | `.github/copilot-instructions.md` | M7.1, M7.2, M7.4 |
| Agents Playwright (planner, generator, healer) avec outils restreints (`browser_evaluate` et `run_code_unsafe` retirés) | `.github/agents/` (via `init-agents --loop vscode --prompts`) | M7.1, M7.4 |
| Prompts : `/generer-ca`, `/gherkin-vers-test`, `/explorer`, plus ceux de Playwright | `.github/prompts/` | M7.2, M7.3 |
| Seed avec `commeUtilisateurWorker` (client jetable, 500 €) | `tests/seed.spec.ts` | M7.2, J3 |
| Spécifications fictives MB-03 à MB-06 et charte conseiller | `specs/` | Matériel J4 |
| Grille, journal, policy | `GRILLE-QUALITE.md`, `JOURNAL-GENERATION.md`, `POLICY-IA.md` | M7.2, M7.4 |

Aucun changement dans l'application.

## Déroulé

| Durée | Étape |
|---|---|
| 5 min | `docker compose up -d`, `copy secrets.env.example secrets.env`, `npm install`, démarrage des serveurs MCP dans VS Code |
| 5 min | Présentation du seed et de `copilot-instructions.md`, génération de CA-1 en direct, relecture avec la grille |
| 35 min | Exercice : génération, relecture, journal (énoncé dans `exercice.md`) |
| 10 min | Correction collective : comparaison avec `tests/ui/generes/` de référence, lecture des journaux, discussion sur SPEC-MB-05 |
| 5 min | `npm run test:real` (47 tests + 2 fixme ; 54 si M6.3 a été traité) et `npm run test:mock` (35 + 2 ; 41 avec M6.3) |

## Lien avec les modules du jour

| Module | Ce qui est appliqué |
|---|---|
| M7.1 | `mcp.json` de référence, deux serveurs, instructions, agents initialisés |
| M7.2 | Génération critère par critère avec `/generer-ca`, grille en 8 points, journal ; healer non utilisé ici (les tests sont neufs) |
| M7.3 | Conversion Gherkin (les specs sont en Gherkin), exploration conseiller (SPEC-MB-06) et `fixme` sur RM-4 |
| M7.4 | Secrets hors prompt, origines locales, outils restreints, versions épinglées, journal et policy |

## Ce que la séance démontre

- Les tests générés respectent l'architecture parce que le seed et les instructions la portent (`commeUtilisateurWorker`, Page Objects, flow). Sans J2 et J3 : tests plats, mot de passe inclus.
- La relecture trouve systématiquement des écarts (import, flow réécrit, vérification hors interface ignorée) : la grille n'est pas une formalité.
- SPEC-MB-05 : avec « n'invente rien », l'agent produit un `fixme` ; sans, il a produit un test vert sur le virement simple lors de la préparation. C'est le risque n°6 (code non conforme) rendu visible.
- Le journal dit, pour chaque test, qui l'a généré, avec quoi, et qui l'a validé : exigence de traçabilité de M7.4.
