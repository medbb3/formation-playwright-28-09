---
agent: playwright-test-generator
description: Convertir un scénario Gherkin en test Playwright
---

Convertis le scénario Gherkin suivant en test Playwright, en respectant les instructions du projet :

${input:scenario:Colle le scénario Gherkin complet}

- Étant donné → fixture ou préparation par API (dis laquelle) ; Quand → actions via les Page Objects de `pages/` ; Alors / Et → une assertion web-first par phrase.
- Exécute le scénario dans le navigateur avant d'écrire le code ; signale toute phrase que tu ne peux pas réaliser et arrête-toi dans ce cas (`test.fixme()` avec la raison).
- Un commentaire par phrase Gherkin ; titre du test = libellé du scénario ; fichier `tests/generes/<nom-du-scenario>.spec.ts`.
- Termine par le résumé de tes choix et des points à faire vérifier par un humain.
