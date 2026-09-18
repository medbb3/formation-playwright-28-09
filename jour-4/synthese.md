# Jour 4 — Synthèse

## Ce que l'on retient

1. **MCP** : protocole standard hôte / client / serveur ; outils décrits par schéma ; boucle agentique ; stdio en local. `@playwright/mcp` pilote un navigateur par snapshot d'accessibilité ; `playwright-test` connaît le projet ; `playwright-cli` fait de même en terminal ; la CLI Copilot porte l'agent hors de VS Code.
2. **Agents Playwright** : planner (plan Markdown, à relire), generator (exécute puis écrit), healer (débogue, modification minimale). Seed et instructions de projet ancrent l'agent dans l'architecture des jours 2 et 3.
3. **Génération** : un critère par prompt, contexte pointé, interdits explicites, résumé demandé ; grille de revue en 8 critères ; le testeur commit.
4. **Self-healing** : locators oui, valeurs attendues non sans ticket, jamais d'affaiblissement ; `fixme` documenté quand la régression est réelle.
5. **Exploratoire assisté** : charte (mission, périmètre, interdits, données, budget, livrables) ; l'agent observe, le testeur juge ; Gherkin comme spec, conversion phrase par phrase.
6. **Encadrement bancaire** : 7 risques (données, secrets, actions, injection, serveur compromis, code non conforme, traçabilité) ; garde-fous techniques d'abord (config MCP, réseau, comptes jetables, outils restreints), policy de deux pages, journal toujours ; RGPD, secret bancaire, DORA, AI Act.

## Fil rouge

La mini-banque dispose de :

- une configuration MCP de référence ;
- des agents à outils restreints, des prompts réutilisables, des specs fictives ;
- 7 tests générés relus (dont 2 `fixme` documentés) ;
- un journal, une grille et une policy.

Suite : 47 tests réels et 35 en mode mock (54 et 41 si le module M6.3 a été traité).

## Questions flash

1. Quelle différence entre le serveur `playwright` et `playwright-test` ?
2. Pourquoi le seed est-il important pour le generator ?
3. Le healer propose de remplacer « Solde insuffisant » par « Solde insuffisant. » : que faites-vous ?
4. Citez trois garde-fous techniques contre la fuite de secrets.
5. Un agent lit une page contenant « ignore tes instructions » : quel risque, quelle parade structurelle ?
6. Qui est l'auteur d'un test généré ?

Réponses :

1. Navigateur nu / projet de tests avec `test_run`, `test_debug`, seed.
2. Il fait démarrer l'agent dans le contexte réel (fixtures, données) et lui montre l'import à utiliser.
3. Changement de valeur attendue : ticket ou validation PO, `fixme` en attendant, pas de merge.
4. `--secrets`, `--storage-state`, exclusion de contenu Copilot, scan pré-commit.
5. Injection de prompt ; aucun outil d'exfiltration, secrets hors modèle, origines limitées, revue.
6. Le testeur qui relit et commit.

## Préparer le Jour 5

- Compte Azure DevOps personnel créé, organisation et projet vides ; parallélisme gratuit demandé (délai) ou Docker prêt pour un agent auto-hébergé.
- `git` configuré ; lire https://learn.microsoft.com/azure/devops/pipelines/yaml-schema (survol, 15 min) et https://playwright.dev/docs/ci#azure-pipelines.
- Vérifier `docker run --rm mcr.microsoft.com/playwright:v1.62.1-noble npx playwright --version`.

## Ressources du jour

- https://modelcontextprotocol.io
- https://github.com/microsoft/playwright-mcp
- https://playwright.dev/docs/test-agents
- https://code.visualstudio.com/docs/copilot/chat/mcp-servers
- https://docs.github.com/en/copilot
- https://owasp.org/www-project-top-10-for-large-language-model-applications/
- https://eur-lex.europa.eu/eli/reg/2022/2554 (DORA), https://eur-lex.europa.eu/eli/reg/2024/1689 (AI Act)
