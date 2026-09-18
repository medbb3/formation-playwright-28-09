# Exercice M7.1 — Configurer MCP pour un projet existant et l'explorer

**Difficulté** : moyenne
**Durée** : 25 minutes
**Site** : https://practicesoftwaretesting.com

## Objectif

- Configurer `@playwright/mcp` avec des options sûres pour un projet de tests existant.
- Écrire les instructions de projet.
- Utiliser l'agent pour **explorer** (pas encore générer) et produire une fiche de repérage.

## Énoncé

1. Créez un projet Playwright (`npm init playwright@latest`, TypeScript, chromium) avec `baseURL` sur Practice Software Testing et `testIdAttribute: 'data-test'`.
2. Écrivez `.vscode/mcp.json` avec un serveur `playwright` : stdio, `--isolated`, viewport 1280x720, `--allowed-origins` limité à `https://practicesoftwaretesting.com;https://api.practicesoftwaretesting.com`, `--test-id-attribute data-test`, `--output-dir .mcp-output`. Ajoutez `.mcp-output/` au `.gitignore`.
3. Écrivez `.github/copilot-instructions.md` en adaptant celui de la démo (locators, structure, interdits). Ajoutez une règle : « toute donnée saisie dans un formulaire doit être visiblement fictive ».
4. Démarrez le serveur, mode Agent, et demandez à l'agent :
   - de lister les catégories de produits et le nombre de produits affichés sur la première page ;
   - de rechercher « hammer » et de donner le nom et le prix du produit le moins cher ;
   - d'ouvrir la fiche de ce produit et de décrire les éléments interactifs (rôle, nom accessible) ;
   - d'indiquer, pour chaque élément, quel locator Playwright il utiliserait.
5. Copiez les réponses dans `REPERAGE.md`. Pour chaque locator proposé, votre verdict : conforme aux règles M1.2 ou non, et pourquoi.
6. Lancez `npx playwright init-agents --loop vscode --prompts` et lisez `playwright-test-generator.agent.md`. Notez dans `REPERAGE.md` les trois outils les plus importants pour la génération selon vous, et pourquoi.

## Consignes

- Aucune génération de test dans cet exercice : exploration et lecture seulement.
- Confirmez chaque appel d'outil manuellement au moins pour la première tâche, puis observez la séquence.
- Si l'agent propose un locator CSS ou XPath, demandez-lui de le reformuler par rôle ; notez le premier et le second.

## Résultat attendu

- `REPERAGE.md` complété : catégories, produit le moins cher, éléments de la fiche avec locators et verdicts, trois outils.
- `mcp.json` et `copilot-instructions.md` versionnables.

Question : quelle différence entre le serveur `playwright` et le serveur `playwright-test` ajouté par `init-agents` ? Quand utiliser l'un ou l'autre ?
