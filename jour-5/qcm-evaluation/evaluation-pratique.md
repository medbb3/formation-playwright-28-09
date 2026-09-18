# Évaluation pratique (45 minutes, solo) — grille de notation

## Sujet

Sur le dépôt `mini-banque` de votre organisation Azure DevOps, à partir de la spécification fictive `SPEC-MB-04-beneficiaires.md` :

1. Créez une branche `test/eval-<prenom>`.
2. Implémentez les critères **CA-1** (liste vide) et **CA-4** (suppression) en tests UI avec `commeUtilisateurWorker` et les Page Objects, en-têtes `// spec:`. Agent generator autorisé (journal et grille obligatoires) ou écriture à la main.
3. Ajoutez un test API pour CA-3 (doublon) avec `apiCommeAlice` (reset en `beforeEach`).
4. Ajoutez au CSV `virements-invalides.csv` le cas « libellé trop long » ; vérifiez que le test API data-driven le prend.
5. Lancez `npm run test:mock` et `npm run test:real` ; `--repeat-each 2` sur vos tests.
6. Ouvrez une PR avec le template rempli ; faites-la relire par votre binôme avec la checklist ; corrigez ; complétez en squash.

## Grille (sur 20)

| Critère | Points | Attendu |
|---|---|---|
| Tests CA-1 et CA-4 fidèles à la spec, assertions d'effet | 4 | Une assertion par « Alors », `commeUtilisateurWorker`, Page Objects, aucun `getBy` dans le spec |
| Test API CA-3 | 3 | Statut 422 et message exact, données préparées par l'API |
| CSV et data-driven | 2 | Ligne ajoutée, test généré automatiquement, message attendu correct |
| Qualité et robustesse | 3 | Lint vert, aucun interdit, `--repeat-each 2` passé, passe en mock et en réel |
| Git et PR | 3 | Commits conventionnels, template rempli, work item, PR complétée en squash |
| Revue du binôme | 2 | Au moins un commentaire pertinent donné et un reçu, tous résolus |
| Traçabilité (si agent) ou explication (si manuel) | 2 | Journal + grille, ou commentaire des choix de locators |
| Temps et autonomie | 1 | Livré dans les 45 minutes sans aide extérieure |

Validation de la formation : QCM ≥ 21/30 **et** pratique ≥ 12/20.

## Attestation

- Une attestation de formation est remise (durée, contenu, résultats).
- Elle vaut preuve de formation à l'usage des agents IA au sens de la politique interne (M7.4) et de l'obligation de maîtrise de l'IA.
