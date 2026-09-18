# Fil rouge J3 — Données, isolation, visuel et accessibilité

## Objectif de la séance

- Suite de la mini-banque à l'état « professionnel » sur les données et l'authentification.
- Deux nouvelles familles de tests : visuel et accessibilité.

Livrable : projets `setup-real`, `setup-mock`, `api`, `chromium`, `mocked`, `visuel` tous verts ; un utilisateur par worker ; dataset CSV métier ; baselines visuelles ; audit d'accessibilité de l'écran de virement à zéro violation après correction des défauts détectés.

## L'application au Jour 3

| Nouveauté | Où | Notion visée |
|---|---|---|
| `POST /api/dev/users`, `DELETE /api/dev/users/{id}` : utilisateur de test jetable avec un compte et un solde | Backend | M5.2 : stratégie d'isolation n°3 |
| Messages métier du virement : montant positif, plafond 10 000 €, IBAN invalide, libellé obligatoire / 80 caractères, solde insuffisant | Backend | M5.1 : CSV avec message attendu |
| Vue **conseiller** : Carol voit tous les comptes avec le nom du client (`owner`) | Backend + tableau de bord | M5.2 : multi-rôles |
| Texte d'aide sous l'IBAN (`aria-describedby`), en-têtes de colonnes `scope="col"`, libellé masqué « Actions » | Front | M6.2 : accessibilité |
| Date des opérations dans un `data-testid="transaction-date"` | Front | M6.1 : masque |

## Architecture des tests au Jour 3

```
frontend/tests/
├── auth.setup.ts            # projets setup-real / setup-mock : .auth/<backend>/<rôle>.json par API
├── fixtures/
│   └── data.ts
├── support/
│   └── connexion.ts         # backendActif, preparerPage, apiLogin, commeRole (alice/bob/carol),
│                            #   commeUtilisateurWorker (+ utilisateurWorker), apiCommeAlice
├── utils/
│   ├── factories.ts         # Faker : unBeneficiaire, unVirement, unClientTest
│   ├── data.ts              # chargerVirementsInvalides() depuis data/virements-invalides.csv
│   └── a11y.ts              # scanA11y (axe, WCAG 2.2 AA, pièces jointes, résumé)
├── data/virements-invalides.csv
├── pages/, flows/, mocks/   # inchangés, + transferFlow exposé par le PageObjectManager
├── ui/                      # authentification, tableau-de-bord (+ conseiller), beneficiaires (Faker),
│   │                        #   virement (+ 3 cas CSV), a11y/virement (3 états + tabulation, inventaire)
├── api/                     # beneficiaires, virements (+ 7 cas CSV)
└── visuel/dashboard.spec.ts # baseline tableau de bord (date masquée), composant shadow DOM, aria snapshot
```

### Authentification durable

- `auth.setup.ts` : login + MFA **par l'API**, fichier `storageState` avec le jeton dans `localStorage` (clé lue par le front).
- Aucun écran de login dans un test qui appelle `commeRole` : la fonction ouvre un contexte avec le fichier `.auth/<backend>/<rôle>.json` et attend le titre du tableau de bord avant de rendre la main.
- `commeRole(browser, baseURL, testInfo, role, run)` (`tests/support/connexion.ts`) accepte `'alice' | 'bob' | 'carol'` : rien à ajouter pour un rôle qui existe déjà côté données de test, un appel `commeRole(..., 'carol', ...)` suffit.
- Mode mock : le setup écrit un jeton `mock-token-<id>` accepté par le faux backend.

Piège rencontré et documenté :

- Le test de **déconnexion** révoque le jeton côté serveur.
- Avec `commeRole(..., 'alice', ...)`, il invaliderait la session partagée par tous les tests suivants qui utilisent ce fichier (écran de connexion à la place du tableau de bord).
- Il ouvre donc sa propre session par l'écran, sans passer par `commeRole` (voir `authentification.spec.ts`, test de déconnexion : `new PageObjectManager(page)` + `loginWithMfa`).
- Règle : un test qui détruit un état partagé doit posséder cet état.

### Un utilisateur par worker

- `utilisateurWorker(playwright, backend, testInfo)` : création d'un client via `POST /api/dev/users` avec un e-mail unique (`qa-w<parallelIndex>-<horodatage>@bank.test`), connexion par l'API. Le résultat est mémorisé dans une `Map` au niveau du module, clé `parallelIndex`, donc créé une seule fois par worker et réutilisé par tous ses tests.
- `commeUtilisateurWorker(browser, baseURL, testInfo, playwright, run)` : appelle `utilisateurWorker`, ouvre un contexte avec un `storageState` **en ligne** (objet, pas fichier) contenant ce jeton, exécute `run({ page, pages, workerUser })`, ferme le contexte.
- Mode mock : l'utilisateur est ajouté à l'instance `FakeBackend` du test.
- Aucune suppression de l'utilisateur en fin de worker : l'espace de données est propre à ce worker jetable, donc aucun reset n'est nécessaire (voir le commentaire dans `connexion.ts`).

Conséquences :

- Les tests de bénéficiaires et de virement ne demandent plus `resetData` et ne choisissent plus « Bob plutôt qu'Alice ».
- Ils vérifient des effets relatifs (message de confirmation), pas des soldes absolus partagés.
- `resetData` ne subsiste que dans les tests API, sur les comptes de référence.

### Données

- `factories.ts` : Faker en locale fr, IBAN FR valides. Pas de graine dans les fabriques (unicité) ; annotation des données dans chaque test.
- `virements-invalides.csv` (7 lignes, séparateur `;`, montant avec virgule) : **toutes** les lignes en test API (un test par ligne, 3 secondes), **trois** lignes en test UI.
- Deux lignes ne sont pas testables en UI : le champ montant a `min=0.01`, le navigateur bloque la soumission. Résultat d'analyse à noter : la règle serveur existe, l'interface empêche de l'atteindre, l'API la couvre.

### Visuel

- Projet `visuel` en **mode mock** : soldes, opérations et cours déterministes.
- Seule la date des opérations dépend du jour : masquée par `data-testid`.
- Baselines dans `tests/visuel/__screenshots__/visuel/<plateforme>/`.
- Sur Windows, vous générez les vôtres ; la version Linux (Docker, J5) sera la référence.

### Accessibilité

- L'écran de virement livré pour la séance contient des défauts d'accessibilité : les tests `a11y/virement.spec.ts` échouent.
- Lisez le rapport, identifiez les règles en cause, corrigez le front, obtenez zéro violation.

## Déroulé

| Durée | Étape |
|---|---|
| 5 min | `docker compose up --build -d`, `npm install` (Faker, csv-parse, axe), tour des nouveautés (Swagger : `/api/dev/users`) |
| 10 min | Présentation de `auth.setup.ts` et `workerUser`, puis `npm run test:real` : 40 tests |
| 30 min | Exercice (`exercice.md`) : défauts a11y à trouver et corriger, cas CSV à compléter, test conseiller, baseline visuelle |
| 10 min | Correction, `npm run test:mock` et `npm run test:visuel` sans Docker |
| 5 min | Discussion : pourquoi le test de déconnexion ne peut pas utiliser `commeRole(..., 'alice', ...)` |

## Lien avec les modules du jour

| Module | Ce qui est appliqué |
|---|---|
| M5.1 | CSV métier + chargeur typé, data-driven API (7 cas) et UI (3 cas), annotations |
| M5.2 | Faker et fabriques, stratégie 3 (utilisateur par worker), `storageState` par API multi-rôles, conseiller |
| M6.1 | Projet visuel déterministe (mock), masque de date, composant shadow DOM, aria snapshot |
| M6.2 | Helper axe, scans par état (vide, erreur), tabulation, défauts détectés puis corrigés |
