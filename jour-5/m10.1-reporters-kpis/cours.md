# M10.1 — Reporters, KPIs QA et Definition of Done

## 1. Cours théorique

### 1.1 À qui parle un rapport ?

| Lecteur | Question | Support |
|---|---|---|
| Testeur | Pourquoi ce test a échoué ? | Rapport HTML Playwright, trace |
| Développeur | Qu'est-ce qui a cassé dans ma PR ? | Onglet Tests de la PR, annotation de build |
| PO / métier | Les critères sont-ils couverts et verts ? | Onglet Tests Azure DevOps, tableau de couverture des critères |
| Manager QA | La suite est-elle fiable, rapide, utile ? | KPIs, rapport hebdomadaire |

- Un reporter par lecteur, pas un rapport unique.
- Playwright accepte plusieurs reporters simultanés, mais chaque reporter en plus est un coût de génération et de lecture : on en garde le minimum utile.

### 1.2 Les reporters retenus

Un seul jeu de reporters actif, natif Playwright, sans reporter tiers à installer :

| Reporter | Type | Ce qu'il apporte | Coût |
|---|---|---|---|
| **`list`** | intégré, console | Retour immédiat en local et dans les logs CI | Nul |
| **`html`** | intégré | Diagnostic complet : étapes, erreurs, captures, traces, filtres, `test.step`, annotations, pièces jointes (axe, données) ; s'ouvre en local | Nul ; à publier en artefact |
| **`junit`** | intégré | Alimente les **résultats de tests Azure DevOps** : onglet Tests, historique, durée, tests instables, statut en PR | Nul |
| **`json`** | intégré | Base des scripts (gates, KPIs) | Nul |
| **Reporter personnalisé** (bonus) | classe TypeScript (`onTestEnd`, `onEnd`) | Tout format maison (CSV KPI, message Teams, ticket) | Quelques dizaines de lignes |

Configuration retenue (un seul jeu de reporters, pas de cumul avec un rapport tiers) :

```ts
reporter: [
  ['list'],
  ['html', { open: 'never' }],
  ['junit', { outputFile: 'test-results/junit.xml' }],   // Azure DevOps (onglet Tests)
  ['json', { outputFile: 'test-results/report.json' }],  // gates et KPIs
],
```

- Pas d'Allure ni de Monocart dans cette formation : le HTML natif suffit pour le diagnostic, JUnit pour Azure DevOps. Un reporter métier tiers reste une option en entreprise si le besoin (organisation par feature/story, historique multi-runs) le justifie, mais ce n'est pas le chemin enseigné ici.

Enrichir les rapports :

- `test.info().annotations` (type, description).
- `testInfo.attach` (captures, JSON).
- `test.step` (étapes nommées).
- Tags `@smoke` `@a11y` `@visual`.

### 1.3 Résultats de tests dans Azure DevOps

`PublishTestResults@2` (JUnit) alimente **Test Plans > Runs** et l'onglet **Tests** de chaque run et PR :

- Liste des tests avec statut, durée, message d'erreur, pièces jointes (si `publishRunAttachments`).
- **Historique** par test sur les derniers runs.
- « Flaky » : Azure DevOps marque un test instable quand il alterne sur le même code (Project settings > Test management > Flaky test detection).
  - Désactiver l'option « Flaky tests included in test pass percentage » : les instables ne comptent pas comme réussis.
- Filtres (échoués, nouveaux échecs, instables), regroupement par fichier.
- **Analyse** (Pipelines > Analytics > Test failures, Test duration trend) : source de plusieurs KPIs sans script.

### 1.4 Les 3 KPIs QA simples

Trois indicateurs, tous lisibles directement dans les résultats de tests Azure DevOps (onglet Tests, Analytics) ou dans `report.json`, sans outillage supplémentaire :

| # | KPI | Définition | Source | Cible indicative | Ce qu'il révèle |
|---|---|---|---|---|---|
| 1 | **Taux de réussite sur `main`** | Runs verts / runs sur `main` (nuit incluse), sur 4 semaines | Analytics Azure DevOps | > 95 % | Santé de la suite et de l'application |
| 2 | **Taux de flakiness** | Tests flaky / tests exécutés, par run et en tendance ; liste nominative des tests instables | `report.json` (gate 3), détection Azure DevOps | < 2 %, en baisse ; 0 test instable de plus de 5 jours | Confiance dans un rouge |
| 3 | **Durée du pipeline de PR** (P50, P90) | Temps entre déclenchement et verdict | Analytics > Pipeline duration | P90 < 10 min | Frein ou non à l'intégration continue |

- La couverture des critères d'acceptation reste mesurée (gate 4 de M9.2, `coverage-criteres.mjs`) mais comme condition de revue, pas comme quatrième KPI hebdomadaire : trois chiffres suffisent pour une page lue chaque lundi.

Indicateurs à **ne pas** piloter :

- Nombre de tests : incite au volume.
- Pourcentage de couverture de code : les tests E2E ne sont pas là pour ça.
- Nombre de tests générés par IA : activité, pas valeur.

### 1.5 Détecter et traiter la flakiness

**Détecter** :

- `retries: 2` en CI marque `flaky` ce qui échoue puis passe ; le gate 3 le compte.
- Azure DevOps le détecte sur l'historique.
- `--repeat-each 5` en local sur un test suspect.
- Une exécution planifiée `always: true` révèle les dérives d'environnement.

**Traiter**, dans cet ordre :

1. Lire la trace de l'échec (pas du succès).
2. Classer la cause : attente, isolation, locator, données, environnement, application.
3. Corriger avec les règles de M2.2 et J3.
4. Si non corrigeable dans la journée : `test.fixme('QA-123 : instable, cause ...')` et ticket.
5. **Jamais** `retries: 5` ni suppression silencieuse.

**Rendre visible** : une section « tests instables » dans le rapport hebdomadaire, avec l'âge de chaque instabilité.

### 1.6 Le rapport hebdomadaire

- Une page, envoyée le lundi.
- Produite en partie automatiquement (script sur `report.json` et l'API Azure DevOps), complétée par le QA lead.

Modèle :

```
# Suite Playwright mini-banque — semaine 36

## En un coup d'œil
Réussite main : 97 % (▲ +2)   Flakiness : 1,4 % (▼)   PR P90 : 8 min

## Ce qui a été trouvé
- QA-51 : le conseiller peut initier un virement (SPEC-MB-06 RM-4), en attente PO
- BUG-207 : message d'erreur absent quand le fournisseur de cours est en panne (détecté par test mock)

## Tests instables (âge)
- tableau-de-bord › cours de change réels (3 j) : dépend du backend simulé lent → ticket QA-58

## Évolution de la suite
+7 tests (5 générés via MCP, relus), 2 critères non couverts : SPEC-MB-04 CA-1, CA-4 (planifiés sprint 12)

## Décisions attendues
- Confirmer RM-4 (PO)
- Activer Key Vault pour le variable group (DSI)
```

### 1.7 Definition of Done d'une fonctionnalité (volet test)

Une fonctionnalité est « Done » quand :

1. Les critères d'acceptation validés ont chacun au moins un test automatisé (API et/ou UI) référencé `// spec:`, ou un `fixme` justifié par un ticket.
2. Les tests sont dans la PR de la fonctionnalité (même dépôt), relus avec la checklist, verts en PR et sur `main`.
3. Aucun nouveau test instable ; `--repeat-each 2` passé.
4. Les tests critiques sont tagués `@smoke` ; le pipeline de PR reste sous 10 minutes.
5. Écran nouveau ou modifié : scan d'accessibilité à zéro violation critical/serious, baseline visuelle validée si l'écran est dans le périmètre visuel.
6. Données de test synthétiques ; aucun secret ; si génération par agent : journal et grille remplis.
7. Le rapport hebdomadaire reflète la nouvelle couverture.

- La DoD est courte et affichée.
- Le relecteur la vérifie, pas la personne qui déclare « done ».

### 1.8 Bonnes pratiques

1. `html` + `junit` + `json` partout ; pas de reporter tiers en plus, un seul jeu de reporters actif.
2. Enrichir les tests (steps, annotations, tags, pièces jointes) : c'est ce que les rapports affichent.
3. Trois KPIs, un tableau de bord, une page hebdomadaire ; tendances plutôt que valeurs.
4. Flakiness : traçabilité nominative et âge ; correction ou `fixme` avec ticket, jamais des retries en plus.
5. DoD écrite avec les développeurs et le PO, appliquée par le relecteur.
6. Conserver l'historique (Analytics Azure DevOps) pour lire des tendances sur 3 mois.

### 1.9 Erreurs fréquentes

| Erreur | Conséquence | Correction |
|---|---|---|
| Rapport HTML seul | Personne d'autre que le testeur ne le lit | JUnit vers les résultats de tests Azure DevOps |
| Flaky comptés comme réussis | Taux de réussite flatteur | Désactiver l'option Azure DevOps, gate 3 |
| KPI « nombre de tests » | Tests inutiles | Se limiter aux 3 KPIs retenus |
| Rapport hebdo de 10 pages | Non lu | Une page, chiffres puis décisions |
| DoD sans volet test | Fonctionnalités « done » sans preuve | DoD versionnée dans le dépôt |
| Cumul de reporters tiers « au cas où » | Rapports non lus, maintenance inutile | Un seul jeu de reporters (html + junit + json) |

### 1.10 Points à retenir

- Un seul jeu de reporters actif : `html` (diagnostic), `junit` (résultats Azure DevOps), `json` (scripts) ; pas de cumul avec un reporter tiers.
- Trois KPIs : réussite `main`, flakiness, durée PR.
- Flakiness : détecter, tracer, corriger ou `fixme` avec ticket.
- Rapport hebdomadaire d'une page ; DoD avec volet test.

---

## 2. Démonstration

**Objectif** : sur la mini-banque, configurer le jeu de reporters `html` + `junit` + `json`, lire l'onglet Tests et Analytics d'Azure DevOps, produire le rapport hebdomadaire à partir du script.

### Étapes

1. Vérifier la config (`playwright.reporters.ts` fourni) : `list`, `html`, `junit`, `json`, rien d'autre. Lancer `npm run test:mock`, ouvrir `playwright-report/index.html` en local.
2. Enrichir `virement.spec.ts` : `test.step`, une annotation `{ type: 'critère', description: 'SPEC-MB-03 CA-3' }`, un tag `@smoke` ; relancer ; les repérer dans le rapport HTML.
3. Azure DevOps : un run récent > Tests : filtres, historique d'un test, « Flaky » ; Analytics > Test failures et Pipeline duration : les KPIs 1, 2, 3 sans script.
4. `scripts/kpi-hebdo.mjs` : lit `report.json`, produit `RAPPORT-HEBDO.md` avec les chiffres du run ; le QA lead complète les sections « trouvé » et « décisions ». Lire la sortie.
5. Lire `DEFINITION-OF-DONE.md` et la relier à la checklist de PR : le relecteur coche la DoD.

### Fichiers de la démo

`demo/playwright.reporters.ts` (extrait de config), `demo/scripts/kpi-hebdo.mjs`, `demo/RAPPORT-HEBDO.exemple.md`, `demo/DEFINITION-OF-DONE.md`, `demo/rapport-html-azure.md` (publication du rapport HTML et des résultats JUnit comme artefacts Azure Pipelines).

### Résultat attendu

Rapport HTML enrichi lu en local ; onglet Tests Azure DevOps lu ; `RAPPORT-HEBDO.md` produit avec les chiffres du run.

---

## 3. Exercice (20 minutes)

Voir `exercice.md`.

## 4. Correction

Voir `correction/`.

## 5. Contribution au projet fil rouge

**Ce qui est ajouté dans `fil-rouge/`** :

- Reporters `junit` et `json` dans la config (avec `html` déjà présent depuis M9.1).
- Annotations et tags sur les tests de virement.
- `scripts/kpi-hebdo.mjs`, `docs/DEFINITION-OF-DONE.md`.
- Publication du rapport HTML en artefact dans le stage `Nuit`.
- C'est l'état final du projet.

## Ressources externes

- Reporters Playwright : https://playwright.dev/docs/test-reporters
- Reporter personnalisé : https://playwright.dev/docs/test-reporters#custom-reporters
- Résultats de tests Azure DevOps : https://learn.microsoft.com/azure/devops/pipelines/test/review-continuous-test-results-after-build
- Détection des tests instables : https://learn.microsoft.com/azure/devops/pipelines/test/flaky-test-management
- Analytics : https://learn.microsoft.com/azure/devops/pipelines/test/test-analytics
