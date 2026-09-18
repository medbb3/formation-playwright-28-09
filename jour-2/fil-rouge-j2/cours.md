# Fil rouge J2 — POM complet, helpers de connexion, API et mocks

## Objectif de la séance

- Restructurer les 6 tests du J1 en Page Objects et helpers de connexion explicites, sans changer leur comportement.
- Ajouter 3 tests UI (bénéficiaires, virement refusé, virement vers un bénéficiaire enregistré), 2 fichiers de tests API (bénéficiaires, virements) et des tests avec mock (cours de change en panne et lent).
- Rendre la suite exécutable **sans backend** grâce à un faux backend.

Livrable : `fil-rouge/frontend/tests` restructuré, trois projets Playwright (`api`, `chromium`, `mocked`), tous verts.

## L'application au Jour 2

| Nouveauté | Où | Notion visée |
|---|---|---|
| Ressource **bénéficiaires** en CRUD (`/api/beneficiaries`), propre à chaque utilisateur, validations (IBAN FR de 27 caractères, doublon) | Backend | M4.1 : CRUD, codes 201/404/422, droits |
| Page **Bénéficiaires** (liste, ajout, suppression) | Front `/beneficiaires` | M3.1 : nouveau Page Object |
| Sélecteur **bénéficiaire enregistré** sur le virement, qui remplit l'IBAN | Front `/virement` | M3.2 : flow métier |
| **Cours de change** `/api/rates` (fournisseur externe simulé), affiché avec état de chargement et message d'erreur | Backend + tableau de bord | M4.2 : mock complet, 503, latence |
| **Télémétrie** `POST /api/analytics/event` envoyée par le front | Backend + front | M4.2 : `route.abort` global |

## Architecture des tests au Jour 2

```
frontend/tests/
├── fixtures/
│   └── data.ts              # utilisateurs, code MFA, API_URL, IBAN externe
├── support/
│   └── connexion.ts         # backendActif, preparerPage, apiLogin, commeRole (alice/bob), apiCommeAlice
├── pages/
│   ├── components/HeaderComponent.ts
│   ├── LoginPage.ts         # submitCredentials, submitCode, loginWithMfa
│   ├── DashboardPage.ts     # totalBalance (shadow DOM), ratesList, accountRow(label)
│   ├── TransferPage.ts      # conditions (FrameLocator), fillForm, acceptConditions
│   ├── BeneficiariesPage.ts # add, remove, row(name)
│   ├── PageObjectManager.ts
│   └── index.ts
├── flows/TransferFlow.ts    # transfer(input) : goto + fillForm + accept + submit
├── mocks/fake-backend.ts    # faux backend en mémoire (projet mocked)
├── ui/                      # authentification, tableau-de-bord, beneficiaires, virement
└── api/                     # beneficiaires.api, virements.api
```

Aucune fixture personnalisée : `support/connexion.ts` est un module de **fonctions explicites**, pas un `test.extend`. Chaque test appelle lui-même le helper dont il a besoin ; rien n'est injecté en silence (même principe que M3.2 §1.5, poussé un cran plus loin pour la connexion et le contexte API).

### Les trois projets

| Projet | `testDir` / filtre | Option `backend` | Prérequis |
|---|---|---|---|
| `api` | `*.api.spec.ts` | | Backend Docker |
| `chromium` | `tests/ui` | `real` | Front + backend Docker |
| `mocked` | `tests/ui`, sans `@real-backend` | `mock` | Rien : `webServer` lance le front |

- L'option `backend` est déclarée dans `playwright.config.ts` (`use: { backend: 'mock' }` par projet) ; `backendActif(testInfo)` la relit directement depuis `testInfo.project.use`, sans fixture.
- `preparerPage(page, backend, fake)` en tient compte : mode `mock`, elle installe `FakeBackend` sur `page.route('http://localhost:8000/**')` avant toute navigation ; mode `real`, elle ne fait rien.
- Les tests ne savent pas dans quel mode ils tournent : ils appellent les mêmes helpers de connexion, qui lisent l'option pour eux.

### Le faux backend

- `FakeBackend` : classe TypeScript de 150 lignes qui reproduit le contrat de l'API : mêmes chemins, mêmes codes, mêmes messages d'erreur (`Identifiants incorrects`, `Solde insuffisant`, `IBAN invalide`...).
- M4.2 appliqué à une application entière :
  - un seul `page.route` (glob sur l'origine du backend), aiguillage par chemin et méthode ;
  - un état en mémoire par instance, donc par test : le virement de Bob dans un test ne touche pas Alice dans un autre ;
  - la page `/legal` de l'iframe est aussi servie par le mock (HTML minimal avec la case à cocher et le `postMessage`).
- Le mode `mocked` teste le front : écrans, messages, gestion des erreurs.
- Il ne teste ni le backend réel ni le contrat entre les deux : rôle des projets `api` et `chromium`.
- Règle de la journée : **on ne mocke pas ce que l'on teste**.
- Le faux backend accélère le développement des tests et le poste sans Docker ; ce n'est pas un remplaçant.

### Helpers notables (`support/connexion.ts`)

- `preparerPage(page, backend, fake)` : `route.abort()` sur `/api/analytics/**`, appelé par chaque helper de connexion — pas une fixture globale, une fonction appelée explicitement avant de naviguer.
- `commeRole(browser, baseURL, testInfo, role, run)` : connexion par l'interface pour `'alice'` ou `'bob'` (au J3 : `storageState`, sans passer par l'écran, et un troisième rôle `'carol'`), ouvre un contexte, exécute `run({ page, pages })`, ferme le contexte.
- Reset des données : `test.beforeEach(async ({ request }) => { await request.post('/api/dev/reset'); })`, écrit directement dans le fichier de tests qui modifie des données — pas un mécanisme partagé, seuls les fichiers concernés l'appellent.
- `apiCommeAlice(playwright, testInfo)` : login + MFA par l'API, mémorisé par worker dans une `Map` indexée par `testInfo.parallelIndex` (un seul login par worker, pas par test — le même effet qu'une fixture worker-scoped, sans `test.extend`).

## Déroulé

| Durée | Étape |
|---|---|
| 5 min | `docker compose up --build -d`, tour des nouveautés (page Bénéficiaires, cours de change, Swagger) |
| 10 min | Présentation de `support/connexion.ts` et `mocks/fake-backend.ts`, puis `npm run test:mock` **Docker arrêté** |
| 30 min | Exercice (énoncé dans `exercice.md`) |
| 10 min | Correction, `npm run test:real` puis `npm run test:mock` |
| 5 min | Discussion : que détecte chaque projet ? Qu'est-ce qui échapperait au mode mock ? |

## Lien avec les modules du jour

| Module | Ce qui est appliqué |
|---|---|
| M3.1 | 4 Page Objects + composant en-tête + `PageObjectManager`, tests sans `getBy` |
| M3.2 | Composition (`HeaderComponent` dans les pages), `PageObjectManager`, flow `TransferFlow`, connexion explicite ou `beforeEach` local — aucune fixture personnalisée |
| M4.1 | Projet `api`, contexte authentifié mémorisé par worker (helper explicite, pas de fixture worker-scoped), cycle CRUD en `test.step`, droits (404 sur la ressource d'un autre, 401 sans token) |
| M4.2 | `fulfill` 503 et latence sur `/api/rates`, `abort` de la télémétrie via un helper explicite, faux backend complet |
