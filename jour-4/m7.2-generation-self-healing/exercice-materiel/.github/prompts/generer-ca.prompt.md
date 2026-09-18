---
agent: playwright-test-generator
description: Générer un test à partir d'un critère d'acceptation Gherkin
---

Génère un test Playwright pour le critère ${input:critere:Identifiant du critère (ex. CA-1)} de la spécification ${input:spec:Chemin de la spec (ex. specs/SPEC-SD-01-commande.md)}.

- Exécute chaque étape Gherkin dans le navigateur avant d'écrire le code ; n'invente aucun élément.
- Point de départ : reprends tel quel le `beforeEach` de `tests/seed.spec.ts` (connexion via `connecterCatalogue`) dans le nouveau fichier. Ne réécris pas la connexion à la main.
- Utilise les Page Objects de `pages/` (`InventoryPage`, `CartPage`, `CheckoutInfoPage`, `OverviewPage`, `ConfirmationPage`) ; s'il manque une méthode, propose-la dans le Page Object, pas dans le test.
- Un commentaire par ligne Gherkin ; titre du test = identifiant + libellé du critère ; fichier `tests/generes/<critere en minuscules>.spec.ts` ; `import { test, expect } from '@playwright/test'`.
- Si une étape est impossible ou ambiguë, écris `test.fixme()` avec la raison et arrête-toi.

Termine par un résumé : locators choisis et pourquoi, points à revoir par un humain.
