# M9.2 — Secrets, matrice et shards, exécutions planifiées, quality gates

## 1. Cours théorique

### 1.1 Secrets et variables

Du plus local au plus gouverné :

| Niveau | Où | Usage | Limite |
|---|---|---|---|
| **Variables YAML** | `variables:` du fichier | Valeurs non sensibles (versions, URL de recette) | Visibles dans le dépôt |
| **Variables de pipeline (UI)** | Pipeline > Edit > Variables, case « Keep this value secret » | Un secret propre à un pipeline | Non partagé, saisi à la main |
| **Variable groups** (Library) | Pipelines > Library > Variable group ; secrets masqués | Partagé entre pipelines ; autorisations par groupe ; audit | À référencer dans le YAML : `- group: mini-banque-tests` |

**Mention orale — Azure Key Vault** : en production, un variable group peut importer ses secrets depuis un coffre Azure Key Vault (rotation centralisée, journal d'accès, RBAC), ou une task `AzureKeyVault@2` peut les lire directement. C'est l'option à connaître pour une vraie organisation, mais elle demande un abonnement Azure et une connexion de service : elle n'est pas mise en œuvre dans cette formation, où le variable group seul (secrets saisis à la main) suffit pour l'exercice.

Règles d'usage dans le YAML :

- Un secret **n'est jamais** disponible comme variable d'environnement implicite : passez-le explicitement (`env: { ALICE_PASSWORD: $(ALICE_PASSWORD) }`). C'est volontaire : il n'apparaît ni dans un `env` global ni dans les forks.
- Les secrets sont **masqués** dans les logs (`***`), mais pas s'ils sont transformés (base64, découpage) : ne jamais les afficher.
- Les tests lisent `process.env.ALICE_PASSWORD` ; en local, un fichier `.env` ignoré par git (ou `dotenv`) fournit la même variable.
- Jamais de valeur par défaut « pour aller vite » dans le code.
- **Connexions de service** (Azure, ACR, registre) : créées par un administrateur, autorisées pipeline par pipeline.
- Les fichiers `.auth/*.json` (jetons de session) sont produits **dans** le pipeline par le projet `setup`, jamais versionnés ni transmis.

Rotation :

- Un secret exposé dans un log, une PR ou un chat est révoqué et régénéré (M7.4).
- Les variable groups permettent la mise à jour en un seul endroit.

### 1.2 Matrice : mêmes tests, plusieurs configurations

- `strategy: matrix` crée un job par entrée, en parallèle (selon le parallélisme disponible).
- Usages : navigateurs, tailles d'écran, environnements, versions de Node.

```yaml
- job: Navigateurs
  strategy:
    matrix:
      chromium: { PROJET: chromium }
      firefox:  { PROJET: firefox }
      webkit:   { PROJET: webkit }
  container: $(PLAYWRIGHT_IMAGE)
  steps:
  - script: npx playwright test --project=$(PROJET)
```

- Chaque job publie ses résultats avec un `testRunTitle` distinct.
- Une matrice multiplie le temps machine : la réserver à la suite nocturne ; Chromium seul en PR.

### 1.3 Shards : découper une suite longue

- Avec `--shard=i/n`, une suite de 40 minutes sur un agent devient 4 x 10 minutes sur quatre agents.
- Playwright répartit les **fichiers** (par défaut) entre les shards ; les résultats sont fusionnés ensuite.

```yaml
- job: Shards
  strategy:
    matrix:
      s1: { SHARD: 1 }
      s2: { SHARD: 2 }
      s3: { SHARD: 3 }
      s4: { SHARD: 4 }
  steps:
  - script: npx playwright test --shard=$(SHARD)/4 --reporter=blob
  - task: PublishPipelineArtifact@1
    inputs: { targetPath: frontend/blob-report, artifact: blob-$(SHARD) }

- job: Fusion
  dependsOn: Shards
  steps:
  - task: DownloadPipelineArtifact@2
    inputs: { patterns: 'blob-*/**', path: $(Pipeline.Workspace)/blobs }
  - script: |
      mkdir -p all-blob && find $(Pipeline.Workspace)/blobs -name '*.zip' -exec cp {} all-blob/ \;
      npx playwright merge-reports --reporter html,junit all-blob
  - task: PublishTestResults@2 ...
```

- Le reporter `blob` produit un zip par shard ; `merge-reports` reconstruit un rapport HTML et un JUnit uniques.
- Les shards exigent des tests **indépendants** (J3).
- Le projet `setup` s'exécute dans chaque shard (dépendance de projet).
- `fullyParallel: true` améliore l'équilibrage.
- Nombre de shards : viser 8 à 12 minutes par shard ; au-delà de 6 shards, le coût de démarrage domine.

**Pour adapter ce squelette à votre projet** : le YAML ci-dessus (repris intégralement dans `demo/azure-pipelines.nuit.yml`, job `Shards` + job `Fusion`) est prêt à copier-coller. Deux points à ajuster, rien d'autre :

- **Le nombre de shards** : dupliquer/retirer des entrées `sN: { SHARD: N }` dans la `matrix` du job `Shards`, et changer le `N` dans `--shard=$(SHARD)/N` en conséquence (les deux doivent rester cohérents).
- **Le job `Fusion`** : il n'a besoin d'aucune adaptation liée au nombre de shards (il télécharge tous les artefacts `blob-*` quel que soit leur nombre) ; adaptez seulement la commande de test dans le job `Shards` (projets, `--grep`) et le nom du reporter de sortie si votre `playwright.config.ts` diffère.

### 1.4 Exécutions planifiées

```yaml
schedules:
- cron: '0 2 * * 1-5'
  displayName: Nocturne
  branches: { include: [main] }
  always: true
- cron: '0 6 * * 1'
  displayName: Hebdomadaire complète (matrice navigateurs, visuel, a11y)
  branches: { include: [main] }
  always: true
```

- `always: true` lance le run même sans nouveau commit, pour détecter les dérives d'environnement et la flakiness.
- Le cron est en UTC.
- Le contenu dépend de `Build.Reason == 'Schedule'` : suite complète, matrice, visuel, a11y, production des KPIs (M10.1).
- Un run planifié rouge notifie l'équipe (Project settings > Notifications, ou intégration Teams/Slack).
- Un ticket est ouvert si l'échec persiste deux nuits.

### 1.5 Les 4 quality gates

Un **quality gate** est une condition mesurable qui bloque (PR) ou alerte (nuit). Quatre gates, dans l'ordre d'application :

| # | Gate | Mesure | Seuil recommandé | Où |
|---|---|---|---|---|
| 1 | **Hygiène du code de test** | Lint Playwright (`no-wait-for-timeout`, `no-focused-test`, `no-force-option`, `no-page-pause`), TypeScript, scan de secrets | 0 erreur, 0 secret | PR (bloquant) |
| 2 | **Réussite** | Tests échoués après retries | 0 en PR ; 0 sur `main` | PR (bloquant), nuit (alerte + ticket) |
| 3 | **Stabilité** | Tests **flaky** (échoués puis réussis en retry) | 0 en PR sur les nouveaux tests ; taux global < 2 % sur la nuit | PR (bloquant sur les fichiers modifiés), nuit (alerte) |
| 4 | **Couverture des critères et durée** | Critères d'acceptation avec au moins un test (`// spec:`), et durée du pipeline de PR | 100 % des critères « validés » couverts ou en `fixme` justifié ; PR < 10 min | Revue (checklist) et nuit (rapport) |

Mise en œuvre :

- Gate 3 : le reporter JSON de Playwright (`['json', { outputFile: 'test-results/report.json' }]`) contient `status: 'flaky'` par test ; `scripts/quality-gate.mjs` compte et échoue le job si le seuil est dépassé.
- Gate 4 : un script croise `specs/*.md` (identifiants CA-x) et les en-têtes `// spec:` des tests.
- Un gate est **visible** : le pipeline affiche le message (« 3 tests flaky > seuil 0 ») ; le rapport hebdomadaire reprend les tendances (M10.1).

### 1.6 Agent auto-hébergé en Docker : sécurité

L'agent Docker (M9.1) convient en formation. En entreprise, vérifiez :

- PAT d'enregistrement : portée minimale, rotation.
- Socket Docker monté : équivaut à root sur l'hôte ; réserver à une machine dédiée.
- Réseau : accès à la recette seulement.
- Mise à jour de l'image d'agent.
- Nettoyage entre jobs : `docker compose down -v`, `docker system prune` planifié.
- Alternative : Azure Container Instances ou un pool géré par la DSI.

### 1.7 Bonnes pratiques

1. Secrets dans un variable group, passés explicitement par `env:`, jamais en clair, jamais affichés (Key Vault : option de production, hors périmètre de cette formation).
2. PR : Chromium seul, smoke + API ; nuit : suite complète, shards, matrice, visuel, a11y.
3. Shards avec `blob` + `merge-reports` ; tests indépendants (J3) ; 8 à 12 minutes par shard.
4. Planification `always: true`, notifications, ticket au second échec consécutif.
5. Quatre gates codés (lint, réussite, flakiness, couverture/durée) avec des seuils écrits dans le dépôt.
6. Agent auto-hébergé : PAT minimal, machine dédiée, nettoyage, mise à jour.

### 1.8 Erreurs fréquentes

| Erreur | Symptôme | Correction |
|---|---|---|
| Secret lu par `process.env` sans `env:` dans le step | `undefined` en CI | Mapper explicitement |
| `echo $(SECRET)` pour déboguer | Masqué en `***`, mais un `base64` le révèle | Ne jamais afficher |
| Shards avec tests dépendants | Échecs aléatoires selon la répartition | Isolation (J3) |
| `merge-reports` sans tous les blobs | Rapport partiel | `DownloadPipelineArtifact` avec `patterns: 'blob-*/**'` |
| Cron en heure locale | Run à la mauvaise heure | UTC |
| Gate flakiness à 0 sur la nuit dès le premier jour | Toujours rouge, ignoré | Seuil réaliste puis décroissant ; 0 sur les nouveaux tests |
| `retries: 3` « pour stabiliser » | Flakiness masquée | `retries: 2` et gate 3 |
| PAT d'agent avec portée « Full access » | Compromission = tout le compte | Agent Pools (Read & manage) seulement |

### 1.9 Points à retenir

- Variable groups pour les secrets ; `env:` explicite ; jamais d'affichage (Key Vault : mention, option de production).
- Matrice pour les configurations, shards pour la durée, `blob` + `merge-reports`.
- Planifié `always: true`, PR courte, nuit complète.
- Quatre gates : hygiène, réussite, stabilité, couverture et durée, avec seuils versionnés.

---

## 2. Démonstration

**Objectif** : compléter le pipeline de la mini-banque : variable group avec les mots de passe de test, shards sur la suite nocturne avec fusion, matrice navigateurs hebdomadaire, et les quatre gates (lint, réussite, script de flakiness, script de couverture des critères).

### Étapes

1. Library > Variable group `mini-banque-tests` : `ALICE_PASSWORD`, `BOB_PASSWORD`, `CAROL_PASSWORD` (secrets), `API_URL`. Mentionner à l'oral l'option « Link secrets from an Azure key vault » (production, hors formation, pas d'abonnement requis ici). Autoriser le pipeline.
2. `azure-pipelines.yml` : `- group: mini-banque-tests`, step de test avec `env:` explicite ; le log est masqué.
3. Stage `Nuit` conditionné à `Schedule` : matrice de 3 shards avec `--reporter=blob`, job de fusion `merge-reports`, publication. Lancer manuellement avec « Run pipeline » > variable `FORCE_NUIT=true` pour ne pas attendre 2 h du matin.
4. Stage `Hebdo` : matrice `chromium/firefox/webkit` sur `tests/ui/authentification.spec.ts` uniquement (projets ajoutés dans la config, testMatch restreint) : trois runs de tests dans l'onglet Tests.
5. Gates : `scripts/quality-gate.mjs` lit `report.json`, compte failed/flaky, applique les seuils de `quality-gates.json` (`{ "flakyMaxPr": 0, "flakyMaxNightlyPct": 2, "durationMaxPrMin": 10 }`) ; `scripts/coverage-criteres.mjs` liste les critères sans test. Les deux steps échouent le job avec un message explicite. Faire échouer le gate flakiness en rendant un test instable (`Math.random()`), lire le message, retirer.
6. Notifications : Project settings > Notifications > « A build fails » vers l'e-mail de l'équipe ; intégration Teams.

### Fichiers de la démo

`demo/azure-pipelines.nuit.yml` (stages Nuit et Hebdo à fusionner dans le pipeline), `demo/scripts/quality-gate.mjs`, `demo/scripts/coverage-criteres.mjs`, `demo/quality-gates.json`, `demo/variable-group.md`.

### Résultat attendu

Run manuel « nuit » : 3 shards fusionnés en un rapport, gates verts ; run hebdo : 3 navigateurs ; gate flakiness rouge avec le test instable, vert après retrait.

---

## 3. Exercice (25 minutes)

Voir `exercice.md`.

## 4. Correction

Voir `correction/`.

## 5. Contribution au projet fil rouge

**Ce qui est ajouté dans `fil-rouge/`** :

- Stages `Nuit` (shards + fusion) et `Hebdo` (matrice) dans `azure-pipelines.yml`.
- `scripts/quality-gate.mjs`, `scripts/coverage-criteres.mjs`, `quality-gates.json`.
- Reporter `json` dans la config.
- Projets `firefox` et `webkit` restreints au smoke.
- Variable group référencé, `.env.example`.

**Lien avec la notion** :

- Les quatre gates rendent mesurables les règles des jours précédents (pas de `waitForTimeout`, isolation, critères couverts).
- Les shards ne fonctionnent que parce que les tests sont indépendants (J3).

## Ressources externes

- Variables et secrets : https://learn.microsoft.com/azure/devops/pipelines/process/variables
- Variable groups et Key Vault : https://learn.microsoft.com/azure/devops/pipelines/library/variable-groups
- Matrice et parallélisme : https://learn.microsoft.com/azure/devops/pipelines/process/phases#multi-job-configuration
- Shards Playwright : https://playwright.dev/docs/test-sharding
- merge-reports : https://playwright.dev/docs/test-sharding#merging-reports-from-multiple-shards
- Schedules : https://learn.microsoft.com/azure/devops/pipelines/process/scheduled-triggers
- Agents auto-hébergés Docker : https://learn.microsoft.com/azure/devops/pipelines/agents/docker
