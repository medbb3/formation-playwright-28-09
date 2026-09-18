---
agent: playwright-test-generator
description: Générer un test à partir d'un critère d'acceptation d'une spec de la mini-banque
---

Génère un test Playwright pour le critère ${input:critere:Identifiant (ex. CA-2)} de ${input:spec:Chemin de la spec (ex. specs/SPEC-MB-03-virement.md)}.

- Exécute chaque étape Gherkin dans le navigateur avant d'écrire ; n'invente aucun élément.
- Point de départ : le seed `tests/seed.spec.ts` (`commeUtilisateurWorker` de `tests/support/connexion.ts`, client isolé avec 500 €). Ne réécris pas la connexion.
- Utilise les Page Objects et le flow de virement exposés par `pages` (reçu de `commeUtilisateurWorker`) ; propose toute méthode manquante dans le Page Object.
- Fichier `tests/ui/generes/<spec>-<critere>.spec.ts`, import `test`/`expect` depuis `@playwright/test` et les helpers depuis `../../support/connexion`, un commentaire par phrase Gherkin, titre = identifiant + libellé.
- Si une étape est impossible ou si la fonctionnalité n'existe pas, écris `test.fixme()` avec la raison et arrête-toi.

Termine par le résumé de tes choix de locators et des points à vérifier par un humain.
