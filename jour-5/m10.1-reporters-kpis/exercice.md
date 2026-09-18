# Exercice M10.1 — Rapports et KPIs sur SauceDemo

**Difficulté** : moyenne
**Durée** : 20 minutes
**Dépôt** : `saucedemo-tests`

## Énoncé

1. Ajoutez le reporter `json` (en plus de `html` et `junit` déjà en place) ; lancez la suite ; ouvrez le rapport HTML.
2. Enrichissez trois tests : `test.step`, une annotation `{ type: 'critère', description: 'SPEC-SD-01 CA-1' }`, un tag `@smoke`. Vérifiez qu'ils apparaissent dans le rapport.
3. Copiez `scripts/kpi-hebdo.mjs`, générez `RAPPORT-HEBDO.md` depuis `report.json`, et complétez à la main les sections « trouvé » et « décisions » avec deux éléments fictifs plausibles.
4. Dans Azure DevOps, ouvrez Analytics du pipeline : notez la durée médiane des 5 derniers runs et le taux de réussite ; reportez-les dans le rapport.
5. Rédigez `DEFINITION-OF-DONE.md` pour ce projet en 5 points maximum, adaptés (pas de backend, pas de rôles).
6. Bonus : reporter personnalisé de 20 lignes qui écrit `kpi.csv` (date, total, passed, failed, flaky, durée) en fin de run, à ajouter à `reporter:`.

## Résultat attendu

- Rapport enrichi.
- `RAPPORT-HEBDO.md` d'une page.
- `DEFINITION-OF-DONE.md`.
- Bonus : `kpi.csv` alimenté à chaque run.

Question : parmi les 3 KPIs, lequel est le plus difficile à mesurer de façon fiable, et que proposez-vous ?
