# Fil rouge J2 — Énoncé

**Difficulté** : difficile
**Durée** : 30 minutes
**Prérequis** : `docker compose up --build -d` dans `fil-rouge/` (l'application a évolué : reconstruire), `npm install` dans `frontend/`.

## Fourni

- `fixtures/data.ts`, `mocks/fake-backend.ts`, `playwright.config.ts` avec les trois projets.
- Les Page Objects `LoginPage`, `DashboardPage`, `HeaderComponent`, `PageObjectManager`.
- Les 6 tests du J1, dans leur forme d'origine (`tests/j1-*.spec.ts`, avec `helpers.ts`).

## À faire

### Partie A — Page Objects manquants (10 min)

1. `pages/TransferPage.ts` : locators du formulaire (compte, bénéficiaire enregistré, IBAN, montant, libellé, bouton), `conditions` (FrameLocator de l'iframe), `acceptConditionsCheckbox`, `alert`, `status` ; actions `goto`, `fillForm(input)`, `acceptConditions`, `submit`.
2. `pages/BeneficiariesPage.ts` : `rows`, `row(name)`, formulaire d'ajout (nom, IBAN, bouton), `alert`, `status` ; actions `goto`, `add(name, iban)`, `remove(name)` (le bouton a un `aria-label` « Supprimer <nom> »).
3. `flows/TransferFlow.ts` : `transfer(input)` = goto, fillForm, acceptConditions, submit.
4. Compléter `PageObjectManager` et `pages/index.ts`.

### Partie B — Helpers de connexion (10 min)

Dans `support/connexion.ts` (squelette fourni avec `backendActif` et `preparerPage`), ajouter, sous forme de **fonctions explicites** (aucun `test.extend`) :

1. `apiLogin(playwright, user)` : login + MFA par l'API, renvoie un `APIRequestContext` avec le token en en-tête `Authorization`. Fonction pure, exportée, réutilisable telle quelle.
2. `commeRole(browser, baseURL, testInfo, role, run)` pour `role: 'alice' | 'bob'` : ouvre un contexte connecté par l'interface (attente du titre « Bonjour ... »), construit le `PageObjectManager`, exécute `run({ page, pages })`, puis ferme le contexte dans un `finally`. Remplace les anciennes fixtures `asAlice`/`asBob` : chaque test appelle `commeRole(...)` lui-même.
3. `apiCommeAlice(playwright, testInfo)` : contexte API d'Alice obtenu via `apiLogin`, mémorisé dans une `Map` au niveau du module indexée par `testInfo.parallelIndex`, pour ne se connecter qu'une fois par worker (même résultat qu'une fixture worker-scoped, sans fixture).

Le reset des données reste explicite, au plus près du test : dans le fichier de tests concerné, `test.beforeEach(async ({ request }) => { await request.post('/api/dev/reset'); })`, uniquement pour les tests qui modifient des données. Pas de mécanisme partagé pour ça : un `beforeEach` par fichier suffit et reste visible.

### Partie C — Tests (10 min)

1. Réécrire les 6 tests du J1 dans `tests/ui/` avec les helpers de connexion et Page Objects (mêmes noms de tests, mêmes assertions). Supprimer `j1-*.spec.ts` et `helpers.ts`.
2. `tests/ui/beneficiaires.spec.ts` : liste initiale (2 lignes), ajout avec message de statut, IBAN invalide refusé, suppression.
3. `tests/ui/virement.spec.ts` : virement supérieur au solde refusé (« Solde insuffisant »), virement vers un bénéficiaire enregistré (l'IBAN se remplit seul, puis flow complet).
4. `tests/ui/tableau-de-bord.spec.ts` : `/api/rates` en 503 (alerte « Cours indisponibles », comptes toujours affichés), `/api/rates` lent (message « Chargement des cours… » puis liste).
5. `tests/api/beneficiaires.api.spec.ts` : cycle de vie CRUD en étapes ; validations 422 (IBAN invalide, doublon) ; droits (Bob ne voit pas, ne supprime pas ; 401 sans token).
6. `tests/api/virements.api.spec.ts` : virement nominal (nouveau solde, opération créée) ; solde insuffisant, montant négatif, compte d'un autre utilisateur.

## Consignes

- Aucun `getBy` dans `tests/ui/*.spec.ts`.
- Les tests qui modifient des données appellent le reset (`test.beforeEach` → `POST /api/dev/reset`) et utilisent des données sans collision entre tests parallèles (Bob pour les virements ; Alice avec reset pour les bénéficiaires).
- Ne mockez pas `/api/transfers` ni `/api/beneficiaries` dans les tests UI : ce sont les fonctionnalités testées. Seul `/api/rates` (tiers) se mocke.
- Vérifiez les trois commandes :

```powershell
npm run test:real     # Docker démarré
docker compose down   # dans fil-rouge/
npm run test:mock     # le front démarre seul
```

## Résultat attendu

| Commande | Résultat |
|---|---|
| `npm run test:real` | 21 tests (16 UI + 5 API) verts |
| `npm run test:mock` | 16 tests UI verts, sans Docker, Vite lancé par Playwright |

## Questions de réflexion

1. Un bug dans la validation d'IBAN du backend serait-il détecté en mode `mocked` ? Par quel projet l'est-il ?
2. Pourquoi le reset (`POST /api/dev/reset`) n'est-il appelé que dans les fichiers de tests qui modifient des données, et jamais dans un `beforeEach` global pour toute la suite ?
3. Pourquoi le faux backend doit-il aussi servir `/legal` ?
